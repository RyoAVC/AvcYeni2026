import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { domainToASCII } from "node:url";
import { checkoutTerms } from "./package-checkout-terms.mjs";
import { packageEntitlements } from "./checkout-entitlements.mjs";
import { hashCustomerPassword } from "./customer-password.mjs";
import { createActivationToken, sha256 } from "./commerce-license-control-plane.mjs";

const digest = value => createHash("sha256").update(value).digest("hex");
export function checkoutDomain(input) {
  const raw = String(input ?? "").trim().toLowerCase();
  if (/[\s/@:#?\\]/.test(raw)) throw new Error("Yalnız domain girin; protokol, port veya yol eklemeyin.");
  const domain = domainToASCII(raw).replace(/^www\./, "");
  if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) throw new Error("Geçerli bir domain girin.");
  return domain;
}
function transaction(db, callback) {
  db.exec("BEGIN IMMEDIATE");
  try { const result = callback(); db.exec("COMMIT"); return result; }
  catch (error) { db.exec("ROLLBACK"); throw error; }
}
export function assertMockDatabase(db) {
  if (db.prepare("SELECT value FROM checkout_test_guard WHERE key='purpose'").get()?.value !== "isolated-checkout-test") throw new Error("İzole test veritabanı gerekli.");
}
export function createMockOrder(db, input, testEmail) {
  assertMockDatabase(db);
  if (input.email !== testEmail || !/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(testEmail ?? "")) throw new Error("Yalnız test alıcısı kullanılabilir.");
  const name = String(input.name ?? "").trim();
  if (name.length < 2 || name.length > 60) throw new Error("Ad soyad gerekli.");
  const domain = checkoutDomain(input.domain);
  const item = db.prepare("SELECT * FROM packages WHERE slug=?").get(String(input.packageSlug));
  const terms = checkoutTerms(item && { status: item.status, salesType: item.sales_type, priceAmountKurus: item.price_amount_kurus, priceIncludesVat: item.price_includes_vat === 1, licenseDurationDays: item.license_duration_days });
  const rights = packageEntitlements(item.slug);
  return transaction(db, () => {
    if (db.prepare("SELECT id FROM commerce_license_installations WHERE primary_domain=? AND status IN ('active','trial')").get(domain)) throw new Error("Domain zaten lisanslı.");
    const id = `MOCK${randomBytes(16).toString("hex")}`;
    db.prepare("INSERT INTO checkout_orders(id,package_id,package_slug,email,name,domain,amount_kurus,duration_days,rights_json,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)").run(id,item.id,item.slug,testEmail,name,domain,terms.amountKurus,terms.durationDays,JSON.stringify(rights),new Date().toISOString());
    return { id, domain, ...terms, groups: rights.groups.map(x => x.label) };
  });
}
export async function completeMockPayment(db, body) {
  assertMockDatabase(db);
  if (!["success","failed"].includes(body.status)) throw new Error("Geçersiz ödeme sonucu.");
  const activationHash = await sha256(createActivationToken());
  // No raw activation credential is exposed by the mock callback.
  return transaction(db, () => {
    const order = db.prepare("SELECT * FROM checkout_orders WHERE id=?").get(body.id);
    if (!order || order.mode !== "mock" || !Number.isSafeInteger(body.amountKurus) || body.amountKurus !== order.amount_kurus) throw new Error("Sipariş veya tutar uyuşmuyor.");
    const target = body.status === "success" ? "paid" : "failed";
    if (order.status !== "pending") {
      if (order.status !== target) throw new Error("Çelişkili ödeme sonucu.");
      return { id: order.id, status: target, replay: true };
    }
    if (target === "failed") { db.prepare("UPDATE checkout_orders SET status='failed' WHERE id=?").run(order.id); return { id: order.id, status: target }; }
    const now = new Date().toISOString();
    const until = new Date(Date.now() + order.duration_days * 86400000).toISOString();
    let customer = db.prepare("SELECT id,status FROM customers WHERE email=?").get(order.email);
    if (customer && customer.status !== "active") throw new Error("Müşteri durumu uygun değil.");
    if (!customer) {
      const result = db.prepare("INSERT INTO customers(name,email,phone,domain_name,status,created_by_email) VALUES (?,?,'',?,'active','mock-checkout')").run(order.name,order.email,order.domain);
      customer = { id: Number(result.lastInsertRowid) };
    }
    const rights = JSON.parse(order.rights_json);
    const license = db.prepare("INSERT INTO commerce_license_installations(customer_id,store_key,installation_id,primary_domain,plan,activation_token_hash,scopes_json,limits_json,status,valid_until,payment_status,billing_cycle,billing_amount) VALUES (?,?,?,?,?,?,?,'{}','active',?,'paid','custom',?)").run(customer.id,`mock-${order.id.toLowerCase()}`,`install-${order.id.toLowerCase()}`,order.domain,order.package_slug,activationHash,JSON.stringify(rights.scopes),until,String(order.amount_kurus));
    const licenseId = Number(license.lastInsertRowid);
    for (const group of rights.groups) db.prepare("INSERT INTO checkout_license_rights VALUES (?,?,?,?, 'active')").run(licenseId,group.key,group.label,JSON.stringify(group.scopes));
    db.prepare("INSERT INTO software_orders(customer_id,kind,package_id,status,price_note,note,created_by_email) VALUES (?,'package',?,'active',?,'İzole mock ödeme','mock-checkout')").run(customer.id,order.package_id,`${(order.amount_kurus/100).toFixed(2)} TL KDV dahil`);
    db.prepare("UPDATE checkout_orders SET status='paid',customer_id=?,license_id=?,paid_at=? WHERE id=?").run(customer.id,licenseId,now,order.id);
    db.prepare("INSERT INTO checkout_mail_jobs(order_id) VALUES (?)").run(order.id);
    return { id: order.id, status: "paid", licenseId, domain: order.domain, rightCount: rights.groups.length };
  });
}
export async function deliverMockMail(db, orderId, { send, publicUrl, now = Date.now() }) {
  assertMockDatabase(db);
  const token = randomBytes(32).toString("base64url");
  const claim = transaction(db, () => {
    const order = db.prepare("SELECT * FROM checkout_orders WHERE id=? AND status='paid'").get(orderId);
    if (!order) throw new Error("Ödenmiş sipariş gerekli.");
    const claimed = db.prepare("UPDATE checkout_mail_jobs SET status='sending',lease_until=? WHERE order_id=? AND (status='pending' OR (status='sending' AND lease_until<?))").run(new Date(now+300000).toISOString(),orderId,new Date(now).toISOString());
    if (!claimed.changes) return null;
    const existing = db.prepare("SELECT customer_id FROM customer_portal_credentials WHERE customer_id=?").get(order.customer_id);
    if (!existing) db.prepare("INSERT INTO checkout_setup_tokens(token_hash,customer_id,expires_at) VALUES (?,?,?)").run(digest(token),order.customer_id,new Date(now+1800000).toISOString());
    return { to: order.email, existing: Boolean(existing) };
  });
  if (!claim) return { skipped: true };
  const setupUrl = `${publicUrl.replace(/\/$/, "")}/checkout/parola#${token}`;
  try {
    await send({ to: claim.to, setupUrl: claim.existing ? null : setupUrl, existingAccount: claim.existing });
    db.prepare("UPDATE checkout_mail_jobs SET status='sent',sent_at=?,lease_until=NULL WHERE order_id=?").run(new Date().toISOString(),orderId);
    return { accepted: true, recipientMatchesTest: true };
  } catch {
    transaction(db, () => {
      db.prepare("DELETE FROM checkout_setup_tokens WHERE token_hash=? AND used_at IS NULL").run(digest(token));
      db.prepare("UPDATE checkout_mail_jobs SET status='pending',lease_until=NULL WHERE order_id=?").run(orderId);
    });
    throw new Error("Test e-postası gönderilemedi; sipariş korundu, e-posta yeniden denenebilir.");
  }
}
export async function setCheckoutPassword(db, token, password, now = Date.now()) {
  assertMockDatabase(db);
  if (!/^[\w-]{43}$/.test(token ?? "")) throw new Error("Bağlantı geçersiz veya süresi dolmuş.");
  const hash = await hashCustomerPassword(password);
  return transaction(db, () => {
    const row = db.prepare("SELECT * FROM checkout_setup_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>?").get(digest(token),new Date(now).toISOString());
    if (!row) throw new Error("Bağlantı geçersiz veya süresi dolmuş.");
    if (db.prepare("SELECT customer_id FROM customer_portal_credentials WHERE customer_id=?").get(row.customer_id)) throw new Error("Hesap parolası zaten belirlenmiş.");
    const date = new Date(now).toISOString();
    db.prepare("INSERT INTO customer_portal_credentials(customer_id,password_hash,password_changed_at) VALUES (?,?,?)").run(row.customer_id,hash,date);
    db.prepare("UPDATE checkout_setup_tokens SET used_at=? WHERE customer_id=? AND used_at IS NULL").run(date,row.customer_id);
    return { ok: true, customerId: row.customer_id };
  });
}
export function mockAuthorization(supplied, expected) {
  if (!expected || expected.length < 32 || typeof supplied !== "string") return false;
  const a = Buffer.from(supplied), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a,b);
}
