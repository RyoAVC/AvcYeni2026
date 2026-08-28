#!/usr/bin/env python3
"""Provision a domain-scoped Avcı Commerce installation without handling raw keys."""

import argparse
import json
import sqlite3
from datetime import datetime, timezone


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--database", required=True)
    parser.add_argument("--domain", required=True)
    parser.add_argument("--store-key", required=True)
    parser.add_argument("--installation-id", required=True)
    parser.add_argument("--token-hash", required=True)
    parser.add_argument("--valid-until", required=True)
    args = parser.parse_args()

    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    domain = args.domain.strip().lower().removeprefix("www.")
    connection = sqlite3.connect(args.database)
    connection.row_factory = sqlite3.Row

    customer = connection.execute(
        "SELECT id FROM customers WHERE lower(domain_name) IN (?, ?) ORDER BY id LIMIT 1",
        (domain, f"www.{domain}"),
    ).fetchone()
    if customer is None:
        cursor = connection.execute(
            """INSERT INTO customers
               (name,email,phone,phone_normalized,company,city,interest,note,domain_name,
                domain_expires_at,hosting_expires_at,status,created_by_email,created_at,updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                "BasBitir Beta", "beta@basbitir.com", "", "", "BasBitir", "", "Avcı Commerce",
                "Beta kurulum müşterisi", domain, args.valid_until, args.valid_until, "trial",
                "license-provisioner@avci.local", now, now,
            ),
        )
        customer_id = cursor.lastrowid
    else:
        customer_id = int(customer["id"])
        connection.execute(
            "UPDATE customers SET domain_name=?, status='trial', updated_at=? WHERE id=?",
            (domain, now, customer_id),
        )

    existing = connection.execute(
        "SELECT id FROM commerce_license_installations WHERE store_key=? AND installation_id=?",
        (args.store_key, args.installation_id),
    ).fetchone()
    values = (
        customer_id, domain, "scale", "1.0.0", json.dumps(["core.catalog", "core.orders", "addon.tofy"]),
        json.dumps({"products": 10000, "users": 10}), args.token_hash, "avci-commerce", "trial",
        args.valid_until, "annual", "paid", args.valid_until, now,
    )
    if existing:
        connection.execute(
            """UPDATE commerce_license_installations SET
               customer_id=?, primary_domain=?, plan=?, commerce_version=?, scopes_json=?, limits_json=?,
               activation_token_hash=?, product=?, status=?, valid_until=?, billing_cycle=?, payment_status=?,
               next_payment_at=?, penalty_status='none', penalty_note='', suspension_reason='', updated_at=?
               WHERE id=?""",
            values + (int(existing["id"]),),
        )
        license_id = int(existing["id"])
        action = "commerce_license_reprovisioned"
    else:
        cursor = connection.execute(
            """INSERT INTO commerce_license_installations
               (customer_id,store_key,installation_id,primary_domain,plan,commerce_version,scopes_json,
                limits_json,activation_token_hash,product,status,valid_until,activation_count,first_activated_at,
                billing_cycle,billing_amount,payment_status,next_payment_at,penalty_status,penalty_note,
                suspension_reason,last_seen_at,last_seen_version,created_at,updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,'',?,'',?,?, 'none','','','','',?,?)""",
            (customer_id, args.store_key, args.installation_id) + values[1:-1] + (now, now),
        )
        license_id = cursor.lastrowid
        action = "commerce_license_provisioned"

    connection.execute(
        """INSERT INTO audit_logs
           (user_email,action,entity,entity_id,details,ip_address,created_at)
           VALUES (?,?,?,?,?,'',?)""",
        (
            "license-provisioner@avci.local", action, "commerce_license", str(license_id),
            json.dumps({"customerId": customer_id, "domain": domain, "storeKey": args.store_key,
                        "installationId": args.installation_id, "validUntil": args.valid_until}), now,
        ),
    )
    connection.commit()
    print(json.dumps({"ok": True, "customer_id": customer_id, "license_id": license_id,
                      "domain": domain, "status": "trial", "valid_until": args.valid_until}))


if __name__ == "__main__":
    main()
