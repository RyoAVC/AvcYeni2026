let singleton;

class NodeD1PreparedStatement {
  constructor(database, sql, values = []) {
    this.database = database;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) {
    return new NodeD1PreparedStatement(this.database, this.sql, values);
  }

  async all() {
    const rows = this.database.prepare(this.sql).all(...this.values);
    return { results: rows, success: true, meta: {} };
  }

  async first(column) {
    const row = this.database.prepare(this.sql).get(...this.values);
    if (!row) return null;
    return column ? row[column] ?? null : row;
  }

  async raw() {
    const rows = this.database.prepare(this.sql).all(...this.values);
    return rows.map((row) => Object.values(row));
  }

  async run() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return {
      success: true,
      results: [],
      meta: {
        changes: Number(result.changes ?? 0),
        last_row_id: Number(result.lastInsertRowid ?? 0),
      },
    };
  }
}

class NodeD1Database {
  constructor(database) {
    this.database = database;
  }

  prepare(sql) {
    return new NodeD1PreparedStatement(this.database, sql);
  }

  async batch(statements) {
    this.database.exec("BEGIN");
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.all());
      this.database.exec("COMMIT");
      return results;
    } catch (cause) {
      this.database.exec("ROLLBACK");
      throw cause;
    }
  }

  async exec(sql) {
    this.database.exec(sql);
    return { count: 0, duration: 0 };
  }
}

export async function createNodeD1Database(filePath) {
  if (singleton) return singleton;
  const { DatabaseSync } = await import(/* @vite-ignore */ "node:sqlite");
  const database = new DatabaseSync(filePath);
  database.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
  singleton = new NodeD1Database(database);
  return singleton;
}
