# Checkout mock workflow — no live payment integration enabled

## Implemented locally

- `0048_package_checkout_terms.sql`: additive catalogue migration. Start/Scale automatic; all others remain quote-only.
- Temporary prices copied from the visible `package-scope-details.ts` sale prices: Start 4,999,900 kurus, Scale 7,499,900 kurus. Existing priceNote contains no numeric price. No runtime text-price parsing.
- Admin `/yonetim/paketler/{id}` edits sales type, integer kurus price, VAT inclusion and license duration. Initial duration 0 blocks checkout until configured; VAT-inclusive flag is a temporary explicit setting, not a claim about the historical example prices.
- VAT-exclusive entries are saved but not chargeable until converted by the administrator to an inclusive final amount. No tax rate is guessed.
- PayTR server primitives force test_mode=1, use HMAC-SHA256 and constant-time callback verification. No endpoint invokes them yet.
- Node SMTP adapter uses authenticated TLS and an allowlisted test recipient; missing configuration fails gracefully. The explicit `--smtp` test sent two real test messages, both accepted by SMTP.

## Still required before accepting even a sandbox payment

The domain is collected before payment. The mock implementation now persists immutable price/duration/rights snapshots, provisions the existing customers/software_orders/commerce_license_installations tables atomically, creates domain/license-scoped commercial rights, and queues mail. Password setup uses hash-only tokens, 30-minute expiry and atomic one-use consumption. Existing account passwords cannot be reset by this flow. SMTP failure leaves provisioning intact with a retryable mail job.

This is a separate loopback-only test server, NOT an enabled public checkout or production webhook. Provider adapter wiring into the main site, signed PayTR webhook acceptance and real Commerce resolver/store-side activation remain a later sandbox integration step. No PayTR request was made. Module activation here means central entitlement rows, not external provider synchronization or store installation.

## Independent rights and technical scopes

- Start: shipping, Paraşüt, Trendyol/Hepsiburada, WhatsApp Support (4 commercial rights).
- Scale: Pro Page Builder, Tofy, WhatsApp Support, Design Studio, Trendyol/Hepsiburada, Paraşüt, shipping, PrintCommerce (8 independently declared commercial rights).
- The combined marketplace right resolves to two technical scopes. Required `core.catalog` and `core.integrations` dependencies are included separately. Exact manifest scopes are in `app/checkout-entitlements.mjs`. No Commerce application source was copied or changed.
- New `0049_checkout_mock_workflow.sql` stores mock orders, license-scoped rights, hashed setup tokens and mail jobs. No production migration was applied.

## Run locally

`node scripts/run-checkout-mock.mjs --keep` runs isolated HTTP E2E with fake mail. Add `--smtp` only to explicitly send two emails to CHECKOUT_TEST_EMAIL. Each invocation creates a fresh database under `outputs/checkout-mock-*`; it never reads AVCI_SQLITE_PATH or merchant keys. It prints the loopback `/checkout` URL with a domain form. Mock payment POST requires a process-private bearer credential, same-origin header, correct order amount and an isolated DB marker. It is not mounted in production Next routes.

`POST /api/checkout/mock/orders` creates the pending snapshot; `POST /api/checkout/mock/payment` tests success/failure and dispatches mail; `/checkout/parola` and `POST /api/checkout/mock/password` perform password setup. The test runner exercises the HTTP routes, not merely stub functions. Real SMTP test links are consumed by the automated verification; they are not customer access links.

## Local configuration (do not paste values into chat)

Use ignored `C:\Users\User\Desktop\lisans ön yüz\.env.local` with the names shown in `.env.example`: PAYTR_MERCHANT_ID/KEY/SALT, PAYTR_TEST_MODE=1, SMTP_HOST/PORT/USER/PASS, SMTP_FROM (if different from SMTP_USER), CHECKOUT_TEST_EMAIL and CHECKOUT_PUBLIC_URL.

Load explicitly into the Node runtime, for example `node --env-file=.env.local node_modules/vite/bin/vite.js`. Do not assume Vite exposes unprefixed variables as process.env without a launcher. This SMTP adapter targets Node, not Cloudflare Workers. Use 465 for TLS or 587 for required STARTTLS. Never disable certificate verification.

Do not run production migration/restart/deployment yet. The production env path must be verified against the active service before instructing a change there. Before production migration: confirm exact DB target, take and verify backup, rehearse on a copy, obtain explicit approval.

## Verification on 2026-08-31

`node --test tests/checkout-mock.test.mjs tests/package-checkout-terms.test.mjs tests/paytr-provider.test.mjs`: 13/13 passing. Tests cover exact rights, malformed domains, wrong recipient, quote-only rejection, failed payment, amount tampering, transactional rollback, immutable terms, email retry, token expiry/single-use, and existing-password preservation.

`outputs/checkout-mock-TtWnDj/report.json` records the real-SMTP HTTP run: Start domain `start.checkout-example.test`, 4 active rights; Scale domain `scale.checkout-example.test`, 8 active rights; 2 accepted emails matching configured recipient; hashed password verification and customer session signing passed. Test durations 30/90 days are fixtures only. No secret, raw token, password or recipient address is in the report. This is NOT PayTR provider sandbox or production E2E evidence.

`npm run build` completed successfully after this implementation (Worker artifact and hosting manifest verified). The earlier repository-wide `npx tsc --noEmit` failure, including cloudflare:workers types and nested copied project files, was not resolved by this task; build success is not a claim that the standalone TypeScript check is clean.

## Payment provider abstraction

`app/payment-provider.mjs` defines the provider-agnostic contract (`name`, `isConfigured(env)`, `createPaymentSession(order, { env, fetchImpl })`, `verifyCallback(body, env)`) and a registry keyed by `PAYMENT_PROVIDER` (default `paytr`). `app/payment-provider-paytr.mjs` adapts the existing `app/paytr-provider.mjs` primitives to that contract without changing them. `app/payment-provider-iyzico.mjs` is a skeleton: `isConfigured()` always returns `false` and both `createPaymentSession`/`verifyCallback` throw immediately — no iyzico account exists yet, so the adapter makes no HTTP requests. `tests/payment-provider.test.mjs` covers the registry and both adapters, including asserting the iyzico adapter never touches `fetch`.

To add real iyzico support later: implement the two throwing functions in `app/payment-provider-iyzico.mjs` against the real iyzico API, add its credential env vars, and switch `PAYMENT_PROVIDER=iyzico`. No other file needs to change since callers should go through `getPaymentProvider`/`activePaymentProvider`, not the PayTR module directly.

## Primary references

## Branded checkout screens

`app/checkout-views.mjs`, `checkout-ui.css` and `checkout-ui.js` provide the branded checkout, password, and payment result screens. They reuse the site's static Avcı logo and installed Geist fonts with the existing ink/cream/red palette. No new external font or logo requests are needed.

`/checkout/sonuc?siparis=...` derives status from the stored order, never a success query flag. Test-only `/checkout/onizleme?durum=paid` (or `failed`, `pending`) previews state designs without writing orders. All mock routes are unavailable outside explicit test/development, and renderers omit test labels in production even when the preview argument is supplied.

Responsive layouts switch to a single column at 720px, inputs stay at 16px on mobile, feedback uses accessible live regions, and password rules/confirmation prevent avoidable failures. Browser visual QA could not run because the browser tool failed to initialize its kernel; responsive implementation is not a claim of completed screenshot validation.

`node --test tests/checkout-views.test.mjs tests/checkout-mock.test.mjs` passes 9 tests including production label suppression and result authenticity. Re-running the HTTP mock flow sent no real mail or provider requests during the design task.

- https://dev.paytr.com/iframe-api/iframe-api-1-adim
- https://dev.paytr.com/iframe-api/iframe-api-2-adim
- https://nodemailer.com/smtp
