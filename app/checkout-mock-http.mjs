import { readFileSync } from "node:fs";
import { createMockOrder, completeMockPayment, deliverMockMail, setCheckoutPassword, mockAuthorization } from "./checkout-mock.mjs";
import { sendTestPasswordSetupMail } from "./checkout-smtp.mjs";
import { checkoutView, passwordView, resultView, isTestView } from "./checkout-views.mjs";
const json = (body, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
const html = body => new Response(body,{headers:{"content-type":"text/html;charset=utf-8","cache-control":"no-store","referrer-policy":"no-referrer"}});
const assets = {
 "/checkout-assets/style.css":["./checkout-ui.css","text/css"],
 "/checkout-assets/ui.js":["./checkout-ui.js","text/javascript"],
 "/checkout-assets/logo.png":["../public/brand/avci-logo-dark-transparent.png","image/png"],
 "/checkout-assets/geist.woff2":["../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2","font/woff2"],
 "/checkout-assets/geist-ext.woff2":["../node_modules/next/dist/next-devtools/server/font/geist-latin-ext.woff2","font/woff2"],
};
export function createMockHttpHandler({ db, env, authorization, sendMail }) {
 return async request => {
  if (env.CHECKOUT_MOCK_MODE !== "1" || !isTestView(env)) return json({error:"Mock test kapalı."},404);
  const url=new URL(request.url);
  if (!["localhost","127.0.0.1"].includes(url.hostname)) return json({error:"Yalnız yerel test."},403);
  if(request.method==="GET"){
   if(Object.hasOwn(assets,url.pathname)){const [path,type]=assets[url.pathname];return new Response(readFileSync(new URL(path,import.meta.url)),{headers:{"content-type":type,"cache-control":"no-store"}});}
   if(url.pathname==="/checkout"){const options=db.prepare("SELECT slug,name,price_amount_kurus,license_duration_days FROM packages WHERE sales_type='otomatik' AND status='live'").all().filter(x=>["start","scale"].includes(x.slug));return html(checkoutView(options,env));}
   if(url.pathname==="/checkout/parola") return html(passwordView(env));
   if(url.pathname==="/checkout/sonuc"){const id=url.searchParams.get("siparis")||"";const order=/^MOCK[a-f0-9]{32}$/.test(id)?db.prepare("SELECT status FROM checkout_orders WHERE id=?").get(id):null;return html(resultView(order?.status||"missing",env));}
   if(url.pathname==="/checkout/onizleme") return html(resultView(url.searchParams.get("durum"),env,true));
  }
    if (request.method !== "POST") return json({ error: "Bulunamadı." },404);
    if (request.headers.get("origin") !== url.origin) return json({ error: "İstek kaynağı geçersiz." },403);
    if (!(request.headers.get("content-type") ?? "").startsWith("application/json")) return json({ error: "JSON gerekli." },415);
    const raw = await request.text();
    if (raw.length > 8192) return json({error:"İstek çok büyük."},413);
    try {
      const body = JSON.parse(raw);
      if (!body || typeof body !== "object" || Array.isArray(body)) return json({error:"Geçersiz istek."},400);
      if (url.pathname === "/api/checkout/mock/orders") return json(createMockOrder(db, body, env.CHECKOUT_TEST_EMAIL),201);
      if (url.pathname === "/api/checkout/mock/password") return json(await setCheckoutPassword(db,body.token,body.password));
      if (url.pathname === "/api/checkout/mock/payment") {
        if (!mockAuthorization(request.headers.get("authorization"), authorization)) return json({ error: "Mock onayı yetkisiz." },403);
        const result = await completeMockPayment(db,body);
        const mail = result.status === "paid" ? await deliverMockMail(db,result.id,{ publicUrl: env.CHECKOUT_PUBLIC_URL, send: sendMail ?? (message => sendTestPasswordSetupMail(message,{env})) }) : null;
        return json({...result,mail});
      }
      return json({error:"Bulunamadı."},404);
    } catch (error) {
      // Database errors may embed PII or SQL: never return/log raw messages.
      const message = String(error.message ?? "");
      const allowed = ["Yalnız test alıcısı kullanılabilir.","Ad soyad gerekli.","Domain zaten lisanslı.","Sipariş veya tutar uyuşmuyor.","Çelişkili ödeme sonucu.","Bağlantı geçersiz veya süresi dolmuş.","Hesap parolası zaten belirlenmiş.","Test e-postası gönderilemedi; sipariş korundu, e-posta yeniden denenebilir."];
      return json({error:allowed.includes(message)?message:"İşlem reddedildi; alanları ve test yapılandırmasını kontrol edin."},400);
    }
  };
}
