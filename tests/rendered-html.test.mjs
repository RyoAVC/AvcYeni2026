import assert from "node:assert/strict";
import test from "node:test";
import { PACKAGE_OPTIONS } from "../app/package-options.ts";

test("renders the finished platform landing page", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  const html = await response.text();
  assert.match(html, /Avcı E-Ticaret/);
  assert.match(html, /E-ticaretin geleceğini/);
  assert.match(html, /tek panelden yönetin/);
  assert.match(html, /Mağaza ve katalog yönetimi/);
  assert.match(html, /AI, ana ürünün yerine geçmez/);
  assert.doesNotMatch(html, /Temel AI araçları|AI otomasyon paketi/);
  assert.match(html, /Temel raporlama/);
  assert.match(html, /Operasyon otomasyonları/);
  assert.match(html, /BİRBİRİNİ TAMAMLAYAN ÇÖZÜM KATMANLARI/);
  assert.match(html, /AVC E-Ticaret/);
  assert.match(html, /Adana360/);
  assert.match(html, /SEOEksper/);
  assert.match(html, /ortak API, ortak giriş veya otomatik veri paylaşımı anlamına gelmez/);
  assert.match(html, /href="\/platform"/);
  assert.match(html, /href="\/eticaret-altyapisi"/);
  assert.match(html, /<nav aria-label="Ana menü">[\s\S]*?href="\/eticaret-altyapisi"[\s\S]*?>E-Ticaret<\/a>/);
  assert.match(html, /href="\/mobil-sektorel#mobil"/);
  assert.match(html, /href="\/mobil-sektorel#sektorel"/);
  assert.match(html, /href="\/en" hrefLang="en"/);
  assert.match(html, /rel="alternate" hrefLang="en" href="https:\/\/avcieticaret\.com\/en"/);
  assert.match(html, /BİRLİKTE ÇALIŞMA MODELİ/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /property="og:url" content="https:\/\/avcieticaret\.com\/"/);
  assert.match(html, /\"@type\":\"WebSite\"/);
  assert.match(html, /Ana içeriğe geç/);
  assert.match(html, /<main id="top"/);
  assert.match(html, /rel="canonical" href="https:\/\/avcieticaret\.com\/?"/);
  assert.match(html, /rel="manifest" href="https:\/\/avcieticaret\.com\/manifest\.webmanifest"/);
  assert.match(html, /Menüyü aç/);
  assert.match(html, /name="interest"/);
  assert.match(html, /<optgroup label="E-ticaret çözümleri">/);
  assert.match(html, /<optgroup label="Modül ve özel yazılım">/);
  assert.match(html, /<optgroup label="Dijital hizmetler ve iş ortaklığı">/);
  assert.match(html, /Ücretsiz görüşme isteyin/);
  assert.match(html, /Yanıt süresi, talebin kapsamına/);
  assert.doesNotMatch(html, /Genellikle aynı iş günü içinde dönüş yaparız/);
  assert.match(html, /Temsili arayüz/);
  assert.match(html, /class="hero-slider" aria-roledescription="carousel" aria-label="Ürün görünümleri"/);
  assert.match(html, /class="hero-insight-card"/);
  assert.match(html, /3 fırsat önceliklendirildi/);
  assert.match(html, /Tutarlar ve kayıtlar örnek veridir/);
  assert.match(html, /Hazır bağlantı kapsamı/);
  assert.doesNotMatch(html, /AggregateOffer|"availability":"https:\/\/schema\.org\/InStock"/);
  assert.doesNotMatch(html, />Canlı<|EN ÇOK TERCİH EDİLEN|>ÖNERİLEN</);
  assert.doesNotMatch(html, /codex-preview/);

  const invalidLeadResponse = await worker.fetch(
    new Request("http://localhost/api/teklif", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "", email: "hatalı" }),
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(invalidLeadResponse.status, 400);
  assert.equal(invalidLeadResponse.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(invalidLeadResponse.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  assert.deepEqual(await invalidLeadResponse.json(), {
    ok: false,
    error: "Adınızı ve soyadınızı yazın.",
  });

  const unsupportedLeadResponse = await worker.fetch(
    new Request("http://localhost/api/teklif", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "not-json",
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(unsupportedLeadResponse.status, 415);

  const crossOriginLeadResponse = await worker.fetch(
    new Request("https://localhost/api/teklif", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://evil.example" },
      body: JSON.stringify({ name: "Cross Origin" }),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(crossOriginLeadResponse.status, 403);

  const oversizedLeadResponse = await worker.fetch(
    new Request("http://localhost/api/teklif", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "x".repeat(17_000) }),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(oversizedLeadResponse.status, 413);

  const invalidShapeLeadResponse = await worker.fetch(
    new Request("http://localhost/api/teklif", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "[]",
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(invalidShapeLeadResponse.status, 400);

  const honeypotLeadResponse = await worker.fetch(
    new Request("http://localhost/api/teklif", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ website: "https://spam.example" }),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(honeypotLeadResponse.status, 201);
  assert.equal(honeypotLeadResponse.headers.get("cache-control"), "no-store");

  const partnerLeadValidationResponse = await worker.fetch(
    new Request("http://localhost/api/teklif", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Partner Adayı",
        email: "partner@example.com",
        phone: "+90 555 555 55 55",
        interest: "Bayi / partner iş birliği",
        consent: false,
      }),
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
  assert.equal(partnerLeadValidationResponse.status, 400);
  assert.deepEqual(await partnerLeadValidationResponse.json(), {
    ok: false,
    error: "İletişim izni gereklidir.",
  });

  const runtimeEnv = {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  };
  const runtimeContext = {
    waitUntil() {},
    passThroughOnException() {},
  };

  const privacyResponse = await worker.fetch(
    new Request("https://localhost/gizlilik", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(privacyResponse.status, 200);
  assert.match(privacyResponse.headers.get("strict-transport-security") ?? "", /max-age=31536000/);
  assert.match(await privacyResponse.text(), /Bilgilerinizi neden aldığımızı/);

  const softwareResponse = await worker.fetch(
    new Request("https://localhost/yazilimlar", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(softwareResponse.status, 200);
  const softwareHtml = await softwareResponse.text();
  assert.match(softwareHtml, /E-Ticaret Altyap/);
  assert.match(softwareHtml, /href="\/eticaret-altyapisi"/);
  assert.match(softwareHtml, /<nav aria-label="Sayfa menüsü">[\s\S]*?href="\/eticaret-altyapisi"[\s\S]*?>E-Ticaret<\/a>/);
  assert.doesNotMatch(softwareHtml, /<nav aria-label="Sayfa menüsü">[\s\S]*?href="\/yapay-zeka"/);
  assert.match(softwareHtml, /C2C Pazaryeri/);
  assert.match(softwareHtml, /AVCI PLATFORM/);
  assert.match(softwareHtml, /Platform mimarisini inceleyin/);
  assert.match(softwareHtml, /href="\/b2b-c2c"/);
  assert.match(softwareHtml, /href="\/e-ihracat"/);
  assert.match(softwareHtml, /Mobil Uygulama/);
  assert.match(softwareHtml, /Sektörel Yazılım/);
  assert.match(softwareHtml, /href="\/mobil-sektorel#mobil"/);
  assert.match(softwareHtml, /href="\/mobil-sektorel#sektorel"/);

  const commerceInfrastructureResponse = await worker.fetch(
    new Request("https://localhost/eticaret-altyapisi", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(commerceInfrastructureResponse.status, 200);
  const commerceInfrastructureHtml = await commerceInfrastructureResponse.text();
  assert.match(commerceInfrastructureHtml, /MODÜLER E-TİCARET ALTYAPISI/);
  assert.match(commerceInfrastructureHtml, /Mağazadan teslimata/);
  assert.match(commerceInfrastructureHtml, /Ürün ve katalog/);
  assert.match(commerceInfrastructureHtml, /Sepet ve sipariş/);
  assert.match(commerceInfrastructureHtml, /Ödeme ve tahsilat/);
  assert.match(commerceInfrastructureHtml, /İsteğe bağlı AI/);
  assert.match(commerceInfrastructureHtml, /otomatik olarak dahil olduğu anlamına gelmez/);
  assert.doesNotMatch(commerceInfrastructureHtml, /property="og:url" content="https:\/\/avcieticaret\.com\/"/);
  assert.match(commerceInfrastructureHtml, /href="\/cozum-senaryolari\/peynir"/);
  assert.match(commerceInfrastructureHtml, /Peynir mağazası örneğini görün/);
  assert.match(commerceInfrastructureHtml, /canonical" href="https:\/\/avcieticaret\.com\/eticaret-altyapisi/);

  const b2bC2cResponse = await worker.fetch(
    new Request("https://localhost/b2b-c2c", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(b2bC2cResponse.status, 200);
  const b2bC2cHtml = await b2bC2cResponse.text();
  assert.match(b2bC2cHtml, /KURUMSAL &amp; ÇOK SATICILI TİCARET/);
  assert.match(b2bC2cHtml, /B2B \/ Bayi/);
  assert.match(b2bC2cHtml, /C2C \/ Pazaryeri/);
  assert.match(b2bC2cHtml, /Kapsam notu/);
  assert.match(b2bC2cHtml, /canonical" href="https:\/\/avcieticaret\.com\/b2b-c2c/);

  const exportResponse = await worker.fetch(
    new Request("https://localhost/e-ihracat", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(exportResponse.status, 200);
  const exportHtml = await exportResponse.text();
  assert.match(exportHtml, /SINIR ÖTESİ DİJİTAL TİCARET/);
  assert.match(exportHtml, /Çoklu dil ve para birimi/);
  assert.match(exportHtml, /Mevzuat ve operasyon notu/);
  assert.match(exportHtml, /hukuki veya mali danışmanlık vermez/);
  assert.match(exportHtml, /canonical" href="https:\/\/avcieticaret\.com\/e-ihracat/);

  const mobileVerticalResponse = await worker.fetch(
    new Request("https://localhost/mobil-sektorel", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(mobileVerticalResponse.status, 200);
  const mobileVerticalHtml = await mobileVerticalResponse.text();
  assert.match(mobileVerticalHtml, /MOBİL &amp; SEKTÖREL ÇÖZÜMLER/);
  assert.match(mobileVerticalHtml, /İKİ ÇÖZÜM AİLESİ/);
  assert.match(mobileVerticalHtml, /hazır modül, mağaza onayı, belirli entegrasyon veya teslim süresi taahhüdü değildir/);
  assert.match(mobileVerticalHtml, /yayın onayı garanti edilemez/);
  assert.match(mobileVerticalHtml, /href="\/teklif\?cozum=mobil"/);
  assert.match(mobileVerticalHtml, /href="\/teklif\?cozum=sektorel"/);
  assert.match(mobileVerticalHtml, /canonical" href="https:\/\/avcieticaret\.com\/mobil-sektorel/);

  const mobileQuoteResponse = await worker.fetch(
    new Request("https://localhost/teklif?cozum=mobil", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(mobileQuoteResponse.status, 200);
  assert.match(await mobileQuoteResponse.text(), /Mobil uygulama/);

  const verticalQuoteResponse = await worker.fetch(
    new Request("https://localhost/teklif?cozum=sektorel", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(verticalQuoteResponse.status, 200);
  assert.match(await verticalQuoteResponse.text(), /Sektörel yazılım/);

  const platformResponse = await worker.fetch(
    new Request("https://localhost/platform", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(platformResponse.status, 200);
  const platformHtml = await platformResponse.text();
  assert.match(platformHtml, /MERKEZİ E-TİCARET &amp; ÜRÜN OMURGASI/);
  assert.match(platformHtml, /Mağaza · Katalog · Sipariş · Ödeme/);
  assert.match(platformHtml, /Web, mobil, B2B &amp; C2C/);
  assert.match(platformHtml, /Ed25519 lisans imzası/);
  assert.match(platformHtml, /SHA-256 \+ paket imzası/);
  assert.match(platformHtml, /Fail-closed modül yetkisi/);
  assert.match(platformHtml, /Müşteri sınırı/);
  assert.match(platformHtml, /herhangi bir özelliğin belirli bir müşteri kurulumunda otomatik olarak etkin olduğu anlamına gelmez/);
  assert.match(platformHtml, /canonical" href="https:\/\/avcieticaret\.com\/platform/);

  const packagesResponse = await worker.fetch(
    new Request("https://localhost/paketler", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(packagesResponse.status, 200);
  const packagesHtml = await packagesResponse.text();
  assert.match(packagesHtml, /Start/);
  assert.match(packagesHtml, /Scale/);
  assert.match(packagesHtml, /Enterprise/);
  assert.match(packagesHtml, /Kuruma/);
  assert.match(packagesHtml, /BÜYÜME ODAĞI/);
  assert.match(packagesHtml, /KAPSAMI GENİŞ/);
  assert.match(packagesHtml, /Mağaza ve katalog başlangıç yapısı/);
  assert.match(packagesHtml, /AI modülleri/);
  assert.match(packagesHtml, /İsteğe bağlı/);
  assert.match(packagesHtml, /yalnızca teklifte açıkça adı ve kapsamı yazıldığında dahil kabul edilir/);
  assert.match(packagesHtml, /MÜŞTERİ YOLCULUĞU/);
  assert.match(packagesHtml, /Laravel odaklı özel ekran, iş kuralı ve proje kapsamı/);
  assert.match(packagesHtml, /WordPress, SEO ve içerik ihtiyaçları/);
  assert.match(packagesHtml, /otomatik dahil veya teknik olarak bağlı hizmetler değildir/);
  assert.doesNotMatch(packagesHtml, /AI otomasyon paketi/);
  assert.doesNotMatch(packagesHtml, /EN ÇOK TERCİH EDİLEN|>ÖNERİLEN</);
  for (const { id, name } of PACKAGE_OPTIONS) {
    const packageQuotePath = `/teklif?cozum=eticaret&amp;paket=${id}`;
    assert.match(html, new RegExp(packageQuotePath.replace(/[?]/g, "\\?")), `home should link the ${name} package`);
    assert.match(packagesHtml, new RegExp(packageQuotePath.replace(/[?]/g, "\\?")), `packages should link the ${name} package`);
  }
  assert.match(packagesHtml, /href="\/fiyatlandirma"/);
  assert.match(packagesHtml, /href="\/teklif\?cozum=eticaret"/);
  assert.match(packagesHtml, /49\.999 TL/);
  assert.match(packagesHtml, /74\.999 TL/);
  assert.match(packagesHtml, /119\.999 TL/);
  assert.match(packagesHtml, /örnek fiyat bandıdır/);

  const pricingResponse = await worker.fetch(
    new Request("https://localhost/fiyatlandirma", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(pricingResponse.status, 200);
  const pricingHtml = await pricingResponse.text();
  assert.match(pricingHtml, /ŞEFFAF FİYATLANDIRMA/);
  assert.match(pricingHtml, /ÖRNEK FİYAT BANDI/);
  assert.match(pricingHtml, /49\.999 TL/);
  assert.match(pricingHtml, /74\.999 TL/);
  assert.match(pricingHtml, /119\.999 TL/);
  assert.match(pricingHtml, /örnek fiyat bandıdır/);
  assert.match(pricingHtml, /href="\/paketler#kapsam-scale"/);
  assert.match(pricingHtml, /TEKLİF ANATOMİSİ/);
  assert.match(pricingHtml, /Ticaret ürünü ve lisans/);
  assert.match(pricingHtml, /Mağaza, katalog ve sipariş kapsamı/);
  assert.match(pricingHtml, /Üçüncü taraf sağlayıcı ücretleri/);
  assert.match(pricingHtml, /İçerik ve görünürlük/);
  assert.match(pricingHtml, /TEKLİFTE EKOSİSTEM SINIRI/);
  assert.match(pricingHtml, /teknik entegrasyon, ortak kullanıcı hesabı veya veri paylaşımı vaadi değildir/);
  assert.match(pricingHtml, /href="\/teklif\?cozum=eticaret"/);
  assert.match(pricingHtml, /fiyat taahhüdü veya sözleşme yerine geçmez/);
  assert.match(pricingHtml, /canonical" href="https:\/\/avcieticaret\.com\/fiyatlandirma/);

  const quoteResponse = await worker.fetch(
    new Request("https://localhost/teklif?cozum=ai&paket=scale", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(quoteResponse.status, 200);
  const quoteHtml = await quoteResponse.text();
  assert.match(quoteHtml, /Doğru kapsamı/);
  assert.match(quoteHtml, /Yapay zekâ modülleri/);
  assert.match(quoteHtml, /Scale paketi/);
  assert.match(quoteHtml, /name="interest"/);
  assert.match(quoteHtml, /Scale paketi ve Yapay zekâ modülleri hakkında görüşmek istiyorum/);
  assert.match(quoteHtml, /href="tel:\+908503086837">0850 308 68 37/);
  assert.doesNotMatch(quoteHtml, /536 599 50 40/);

  const unsafeQuoteResponse = await worker.fetch(
    new Request("https://localhost/teklif?cozum=INJECTED_MARKER&paket=UNSAFE_PACKAGE", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(unsafeQuoteResponse.status, 200);
  const unsafeQuoteHtml = await unsafeQuoteResponse.text();
  const unsafeQuoteBody = unsafeQuoteHtml.split("<body")[1]?.split('<script id="_R_">')[0] ?? "";
  assert.doesNotMatch(unsafeQuoteBody, /INJECTED_MARKER|UNSAFE_PACKAGE/);
  assert.match(unsafeQuoteBody, /Bir çözüm seçin/);

  const aiResponse = await worker.fetch(
    new Request("https://localhost/yapay-zeka", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(aiResponse.status, 200);
  const aiHtml = await aiResponse.text();
  assert.match(aiHtml, /E-TİCARET İÇİN AVCI AI KATMANI/);
  assert.match(aiHtml, /bağımsız bir model veya ayrı bir ana ürün değildir/);
  assert.match(aiHtml, /<nav aria-label="Sayfa menüsü">[\s\S]*?href="\/eticaret-altyapisi"[\s\S]*?>E-Ticaret<\/a>/);
  assert.match(aiHtml, /peynir satan bir marka/);
  assert.match(aiHtml, /Katalog, sipariş ve ödeme altyapısının yerini almaz/);
  assert.match(aiHtml, /Stok ve talep tahmini/);
  assert.match(aiHtml, /Kurumsal/);
  assert.match(aiHtml, /href="\/avcai"/);
  assert.match(aiHtml, /Tofy’ye sorun/);

  const avcaiResponse = await worker.fetch(
    new Request("https://localhost/avcai", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(avcaiResponse.status, 200);
  const avcaiHtml = await avcaiResponse.text();
  assert.match(avcaiHtml, /TOFY · SESLİ ASİSTAN/);
  assert.match(avcaiHtml, /Tofy’yi Avcı E-Ticaret geliştirdi/);
  assert.match(avcaiHtml, /id="avcai-sohbet"/);
  assert.match(avcaiHtml, /canonical" href="https:\/\/avcieticaret\.com\/avcai/);

  const integrationsResponse = await worker.fetch(
    new Request("https://localhost/entegrasyonlar", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(integrationsResponse.status, 200);
  const integrationsHtml = await integrationsResponse.text();
  assert.match(integrationsHtml, /Pazaryerleri/);
  assert.match(integrationsHtml, /PayTR/);
  assert.match(integrationsHtml, /partnerlik/);
  assert.match(integrationsHtml, /TİCARET ÇEKİRDEĞİNE BAĞLI AKIŞLAR/);
  assert.match(integrationsHtml, /hangi sistemde ana kayıt olduğu/);
  assert.match(integrationsHtml, /AI bağlantıları da yalnızca açıkça kapsamlandırıldığında isteğe bağlı modül/);
  assert.match(integrationsHtml, /href="\/eticaret-altyapisi"/);
  assert.match(integrationsHtml, /href="\/teklif\?cozum=entegrasyon"/);

  const scenariosResponse = await worker.fetch(
    new Request("https://localhost/cozum-senaryolari", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(scenariosResponse.status, 200);
  const scenariosHtml = await scenariosResponse.text();
  assert.match(scenariosHtml, /ÖRNEK SENARYO/);
  assert.match(scenariosHtml, /GIDA MARKASI &amp; SOĞUK ZİNCİR/);
  assert.match(scenariosHtml, /Peynir markasının mağaza, sipariş ve teslimatını/);
  assert.match(scenariosHtml, /Gramaj ve varyant kataloğu/);
  assert.match(scenariosHtml, /İsteğe bağlı içerik\/öneri AI modülü/);
  assert.match(scenariosHtml, /href="\/teklif\?cozum=eticaret"/);
  assert.match(scenariosHtml, /href="\/cozum-senaryolari\/peynir"/);
  assert.match(scenariosHtml, /Demo mağazayı gez/);
  assert.match(scenariosHtml, /HATAY360/);
  assert.match(scenariosHtml, /ADANA360/);
  assert.match(scenariosHtml, /SEOEKSPER/);
  assert.match(scenariosHtml, /müşteri referansı/);
  assert.match(scenariosHtml, /href="\/referanslar"/);

  const cheeseDraftResponse = await worker.fetch(
    new Request("https://localhost/cozum-senaryolari/peynir", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(cheeseDraftResponse.status, 200);
  const cheeseDraftHtml = await cheeseDraftResponse.text();
  assert.match(cheeseDraftHtml, /CANLI TASLAK/);
  assert.match(cheeseDraftHtml, /Avcı peynir satmaz/);
  assert.match(cheeseDraftHtml, /PYN-104/);
  assert.match(cheeseDraftHtml, /AVCI REHBER/);
  assert.match(cheeseDraftHtml, /Sepete ekle/);
  assert.match(cheeseDraftHtml, /Tofy’ye sor/);
  assert.match(cheeseDraftHtml, /İSTEĞE BAĞLI AI/);
  assert.match(cheeseDraftHtml, /Soğuk kutu/);
  assert.match(cheeseDraftHtml, /canonical" href="https:\/\/avcieticaret\.com\/cozum-senaryolari\/peynir/);

  const referencesResponse = await worker.fetch(
    new Request("https://localhost/referanslar", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(referencesResponse.status, 200);
  const referencesHtml = await referencesResponse.text();
  assert.match(referencesHtml, /MARKA EKOSİSTEMİ &amp; KANIT/);
  assert.match(referencesHtml, /HATAY360/);
  assert.match(referencesHtml, /ADANA360/);
  assert.match(referencesHtml, /SEOEKSPER/);
  assert.match(referencesHtml, /müşteri referansı veya performans kanıtı sayılmaz/);
  assert.match(referencesHtml, /VAKA ÇALIŞMASI STANDARDI/);
  assert.match(referencesHtml, /"@type":"ItemList"/);
  assert.match(referencesHtml, /canonical" href="https:\/\/avcieticaret\.com\/referanslar/);

  const partnerResponse = await worker.fetch(
    new Request("https://localhost/bayi-partner", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(partnerResponse.status, 200);
  const partnerHtml = await partnerResponse.text();
  assert.match(partnerHtml, /BAYİ &amp; ÇÖZÜM PARTNERİ/);
  assert.match(partnerHtml, /Partnerlik otomatik onay/);
  assert.match(partnerHtml, /AVC SORUMLULUĞU/);
  assert.match(partnerHtml, /PARTNER SORUMLULUĞU/);
  assert.match(partnerHtml, /\/teklif\?cozum=partner/);
  assert.match(partnerHtml, /canonical" href="https:\/\/avcieticaret\.com\/bayi-partner/);

  const partnerQuoteResponse = await worker.fetch(
    new Request("https://localhost/teklif?cozum=partner", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(partnerQuoteResponse.status, 200);
  assert.match(await partnerQuoteResponse.text(), /Bayi \/ partner iş birliği/);

  const customerLoginResponse = await worker.fetch(
    new Request("https://localhost/musteri-girisi?durum=hazirlaniyor", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(customerLoginResponse.status, 200);
  assert.equal(customerLoginResponse.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  const customerLoginHtml = await customerLoginResponse.text();
  assert.match(customerLoginHtml, /MÜŞTERİ PORTALI/);
  assert.match(customerLoginHtml, /parola toplamaz/);
  assert.match(customerLoginHtml, /Portal bağlantısı hazırlanıyor/);
  assert.match(customerLoginHtml, /href="\/musteri-merkezi"/);
  assert.match(customerLoginHtml, /href="\/demo-portal"/);

  const demoPortalResponse = await worker.fetch(
    new Request("https://localhost/demo-portal", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(demoPortalResponse.status, 200);
  assert.equal(demoPortalResponse.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  const demoPortalHtml = await demoPortalResponse.text();
  assert.match(demoPortalHtml, /GÜVENLİ DEMO OTURUMU/);
  assert.match(demoPortalHtml, /Örnek Yazılım Müşterisi/);
  assert.match(demoPortalHtml, /Start/);
  assert.match(demoPortalHtml, /Scale/);
  assert.match(demoPortalHtml, /Enterprise/);
  assert.match(demoPortalHtml, /49\.999 TL/);
  assert.match(demoPortalHtml, /href="\/paketler"/);
  assert.match(demoPortalHtml, /Gerçek müşteri, lisans, fatura, parola veya ödeme bilgisi içermez/);
  assert.match(demoPortalHtml, /İşlem yetkisi/);
  assert.match(demoPortalHtml, /salt demo/);
  assert.match(demoPortalHtml, /Gerçek müşteri girişi/);
  assert.match(demoPortalHtml, /name="robots" content="noindex, nofollow"/);

  const customerCenterResponse = await worker.fetch(
    new Request("https://localhost/musteri-merkezi", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(customerCenterResponse.status, 200);
  const customerCenterHtml = await customerCenterResponse.text();
  assert.match(customerCenterHtml, /BUGÜN PORTALDA/);
  assert.match(customerCenterHtml, /Demo ayrı durur/);
  assert.match(customerCenterHtml, /Şu anda proje iletişimiyle yürütülür/);
  assert.match(customerCenterHtml, /ham lisans anahtarını göstermez/);
  assert.match(customerCenterHtml, /href="\/demo-portal"/);
  assert.match(customerCenterHtml, /Şifre bu sitede yazılmaz/);
  assert.match(customerCenterHtml, /href="\/destek"/);
  assert.match(customerCenterHtml, /href="\/alan-adi-hosting"/);
  assert.match(customerCenterHtml, /href="\/proje-sureci"/);
  assert.match(customerCenterHtml, /canonical" href="https:\/\/avcieticaret\.com\/musteri-merkezi/);

  const supportResponse = await worker.fetch(
    new Request("https://localhost/destek", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(supportResponse.status, 200);
  const supportHtml = await supportResponse.text();
  assert.match(supportHtml, /DESTEK MERKEZİ/);
  assert.match(supportHtml, /Müşteri portalında henüz ayrı ticket ekranı bulunmuyor/);
  assert.match(supportHtml, /Ham lisans anahtarı/);
  assert.match(supportHtml, /yanıt süresi ve öncelik hizmet sözleşmesine bağlıdır/);
  assert.match(supportHtml, /canonical" href="https:\/\/avcieticaret\.com\/destek/);

  const missingPortalResponse = await worker.fetch(
    new Request("https://localhost/musteri-portali"),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(missingPortalResponse.status, 302);
  assert.equal(missingPortalResponse.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  assert.equal(missingPortalResponse.headers.get("location"), "https://localhost/musteri-girisi?durum=hazirlaniyor");
  assert.equal(missingPortalResponse.headers.get("x-frame-options"), "DENY");
  assert.equal(missingPortalResponse.headers.get("cache-control"), "private, no-store");

  const configuredPortalResponse = await worker.fetch(
    new Request("https://localhost/musteri-portali"),
    { ...runtimeEnv, LICENSE_PORTAL_URL: "https://license.example.com/base?ignored=1" },
    runtimeContext,
  );
  assert.equal(configuredPortalResponse.status, 302);
  assert.equal(configuredPortalResponse.headers.get("location"), "https://license.example.com/giris");
  assert.equal(configuredPortalResponse.headers.get("cache-control"), "private, no-store");

  const unsafePortalResponse = await worker.fetch(
    new Request("https://localhost/musteri-portali"),
    { ...runtimeEnv, LICENSE_PORTAL_URL: "http://not-secure.example.com" },
    runtimeContext,
  );
  assert.equal(unsafePortalResponse.status, 302);
  assert.equal(unsafePortalResponse.headers.get("location"), "https://localhost/musteri-girisi?durum=hazirlaniyor");

  const portalPostResponse = await worker.fetch(
    new Request("https://localhost/musteri-portali", { method: "POST" }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(portalPostResponse.status, 405);
  assert.equal(portalPostResponse.headers.get("allow"), "GET, HEAD");

  const resourcesResponse = await worker.fetch(
    new Request("https://localhost/kaynaklar", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(resourcesResponse.status, 200);
  const resourcesHtml = await resourcesResponse.text();
  assert.match(resourcesHtml, /KARAR REHBERİ/);
  assert.match(resourcesHtml, /FAQPage/);
  assert.match(resourcesHtml, /Hazır paket mi, özel proje mi seçmeliyim/);
  assert.match(resourcesHtml, /AVC'nin ana ürünü yapay zekâ mı/);
  assert.match(resourcesHtml, /mağaza, katalog, sipariş, ödeme, teslimat, müşteri ve satış kanallarını kapsayan e-ticaret altyapısıdır/);
  assert.match(resourcesHtml, /Müşteri portalında neleri görebilirim/);
  assert.match(resourcesHtml, /Alan adı ve hosting yenilemesini kim takip eder/);
  assert.match(resourcesHtml, /Bir proje ne zaman tamamlanmış sayılır/);
  assert.match(resourcesHtml, /Mobil uygulama mı, mobil uyumlu web sitesi mi gerekir/);
  assert.match(resourcesHtml, /href="\/alan-adi-hosting"/);
  assert.match(resourcesHtml, /href="\/proje-sureci"/);
  assert.match(resourcesHtml, /href="\/mobil-sektorel"/);
  assert.match(resourcesHtml, /href="\/eticaret-altyapisi"/);
  assert.match(resourcesHtml, /İsteğe bağlı AI/);
  assert.equal((resourcesHtml.match(/<details/g) ?? []).length, 14);

  const servicesResponse = await worker.fetch(
    new Request("https://localhost/hizmetler", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(servicesResponse.status, 200);
  const servicesHtml = await servicesResponse.text();
  assert.match(servicesHtml, /E-ticaret altyapısı ve mağaza/);
  assert.match(servicesHtml, /Web mağazası ve katalog yapısı/);
  assert.match(servicesHtml, /Hosting ve alan adı/);
  assert.match(servicesHtml, /SORUMLULUK SINIRI/);
  assert.match(servicesHtml, /müşterinin ticari operasyonunu onun yerine yürütmez/);
  assert.match(servicesHtml, /Yönetilen hizmet/);
  assert.match(servicesHtml, /href="\/destek"/);
  assert.match(servicesHtml, /href="\/alan-adi-hosting"/);
  assert.match(servicesHtml, /href="\/proje-sureci"/);
  assert.match(servicesHtml, /href="\/teklif\?cozum=eticaret"/);
  assert.match(servicesHtml, /href="\/eticaret-altyapisi"/);
  assert.match(servicesHtml, /href="\/teklif\?cozum=seo"/);
  assert.match(servicesHtml, /href="\/teklif\?cozum=reklam"/);
  assert.match(servicesHtml, /href="\/teklif\?cozum=destek"/);

  for (const [slug, label] of [
    ["eticaret", "E-Ticaret altyapısı"],
    ["entegrasyon", "E-Ticaret entegrasyonları"],
    ["seo", "SEO ve görünürlük"],
    ["reklam", "Reklam ve büyüme"],
    ["destek", "Bakım ve teknik destek"],
  ]) {
    const serviceQuoteResponse = await worker.fetch(
      new Request(`https://localhost/teklif?cozum=${slug}`, { headers: { accept: "text/html" } }),
      runtimeEnv,
      runtimeContext,
    );
    assert.equal(serviceQuoteResponse.status, 200);
    assert.match(await serviceQuoteResponse.text(), new RegExp(label));
  }

  const hostingResponse = await worker.fetch(
    new Request("https://localhost/alan-adi-hosting", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(hostingResponse.status, 200);
  const hostingHtml = await hostingResponse.text();
  assert.match(hostingHtml, /YAYIN ALTYAPISI/);
  assert.match(hostingHtml, /ticari sahipliğin AVC’ye geçtiği anlamına gelmez/);
  assert.match(hostingHtml, /Otomatik yenileme/);
  assert.match(hostingHtml, /Parolaları e-postayla paylaşmayın/);
  assert.match(hostingHtml, /href="\/teklif\?cozum=hosting"/);
  assert.match(hostingHtml, /canonical" href="https:\/\/avcieticaret\.com\/alan-adi-hosting/);

  const hostingQuoteResponse = await worker.fetch(
    new Request("https://localhost/teklif?cozum=hosting", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(hostingQuoteResponse.status, 200);
  assert.match(await hostingQuoteResponse.text(), /Alan adı, hosting ve yenileme/);

  const projectProcessResponse = await worker.fetch(
    new Request("https://localhost/proje-sureci", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(projectProcessResponse.status, 200);
  const projectProcessHtml = await projectProcessResponse.text();
  assert.match(projectProcessHtml, /PROJE YOL HARİTASI/);
  assert.match(projectProcessHtml, /Müşteri portalı bugün lisans ve fatura özetini gösterir/);
  assert.match(projectProcessHtml, /TİCARİ VE PROJE KAYITLARI/);
  assert.match(projectProcessHtml, /Yeni talep, mevcut işin kabulünü/);
  assert.match(projectProcessHtml, /E-fatura veya resmî muhasebe belgesinin yerini aldığı varsayılmaz/);
  assert.match(projectProcessHtml, /canonical" href="https:\/\/avcieticaret\.com\/proje-sureci/);

  const englishResponse = await worker.fetch(
    new Request("https://localhost/en", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(englishResponse.status, 200);
  const englishHtml = await englishResponse.text();
  assert.match(englishHtml, /Build the commerce system/);
  assert.match(englishHtml, /AI is an optional module layer, not the product itself/);
  assert.match(englishHtml, /Catalogue/);
  assert.match(englishHtml, /Orders/);
  assert.match(englishHtml, /Payments/);
  assert.match(englishHtml, /SOLUTION FAMILIES/);
  assert.match(englishHtml, /This page presents solution families, not a promise/);
  assert.match(englishHtml, /Catalogue to fulfilment/);
  assert.match(englishHtml, /Web, mobile, B2B and marketplace/);
  assert.match(englishHtml, /Integrations and optional AI/);
  assert.match(englishHtml, /Solution of interest \*/);
  assert.match(englishHtml, /<optgroup label="Commerce solutions">/);
  assert.match(englishHtml, /<optgroup label="Modules and custom software">/);
  assert.match(englishHtml, /<optgroup label="Digital services and partnerships">/);
  assert.match(englishHtml, /Request a consultation/);
  assert.match(englishHtml, /href="\/en\/privacy"/);
  assert.match(englishHtml, /value="Mobil uygulama">Mobile application/);
  assert.match(englishHtml, /value="E-Ticaret entegrasyonları">E-commerce integrations/);
  assert.match(englishHtml, /href="\/" hrefLang="tr"/);
  assert.match(englishHtml, /canonical" href="https:\/\/avcieticaret\.com\/en/);
  assert.match(englishHtml, /rel="alternate" hrefLang="tr-TR" href="https:\/\/avcieticaret\.com\/"/);
  assert.match(englishHtml, /href="mailto:info@avcieticaret\.com"/);
  assert.match(englishHtml, /href="tel:\+908503086837"/);

  const englishPrivacyResponse = await worker.fetch(
    new Request("https://localhost/en/privacy", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(englishPrivacyResponse.status, 200);
  const englishPrivacyHtml = await englishPrivacyResponse.text();
  assert.match(englishPrivacyHtml, /PRIVACY AND PERSONAL DATA/);
  assert.match(englishPrivacyHtml, /We do not sell your information/);
  assert.match(englishPrivacyHtml, /href="mailto:info@avcieticaret\.com"/);
  assert.match(englishPrivacyHtml, /href="tel:\+908503086837"/);
  assert.match(englishPrivacyHtml, /canonical" href="https:\/\/avcieticaret\.com\/en\/privacy/);
  assert.match(englishPrivacyHtml, /rel="alternate" hrefLang="tr-TR" href="https:\/\/avcieticaret\.com\/gizlilik"/);

  const robotsResponse = await worker.fetch(
    new Request("http://localhost/robots.txt"),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(robotsResponse.status, 200);
  const robotsText = await robotsResponse.text();
  assert.match(robotsText, /Sitemap: https:\/\/avcieticaret\.com\/sitemap\.xml/);
  assert.match(robotsText, /Disallow: \/api\//);
  assert.match(robotsText, /Disallow: \/yonetim\//);
  assert.match(robotsText, /Disallow: \/musteri-girisi/);
  assert.match(robotsText, /Disallow: \/musteri-portali/);
  assert.match(robotsText, /Disallow: \/signin-with-chatgpt/);
  assert.match(robotsText, /Disallow: \/signout-with-chatgpt/);
  assert.match(robotsText, /Disallow: \/callback/);

  const manifestResponse = await worker.fetch(
    new Request("http://localhost/manifest.webmanifest"),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(manifestResponse.status, 200);
  const manifestJson = await manifestResponse.json();
  assert.equal(manifestJson.name, "Avcı E-Ticaret");
  assert.equal(manifestJson.lang, "tr");
  assert.equal(manifestJson.start_url, "/");

  const sitemapResponse = await worker.fetch(
    new Request("http://localhost/sitemap.xml"),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(sitemapResponse.status, 200);
  const sitemapXml = await sitemapResponse.text();
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/en<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/en\/privacy<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/platform<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/yazilimlar<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/eticaret-altyapisi<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/b2b-c2c<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/e-ihracat<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/mobil-sektorel<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/paketler<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/fiyatlandirma<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/yapay-zeka<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/avcai<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/entegrasyonlar<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/cozum-senaryolari<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/cozum-senaryolari\/peynir<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/referanslar<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/bayi-partner<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/kaynaklar<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/musteri-merkezi<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/hizmetler<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/destek<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/alan-adi-hosting<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/proje-sureci<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/teklif<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/guvenlik<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/ozel-yazilim<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/veri-gecisi<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/teslim-egitim<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/vitrin-tasarim<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/seo-gorunurluk<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/pazaryeri-kanallari<\/loc>/);
  assert.match(sitemapXml, /https:\/\/avcieticaret\.com\/gizlilik<\/loc>/);

  const notFoundResponse = await worker.fetch(
    new Request("http://localhost/burada-bir-sayfa-yok", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(notFoundResponse.status, 404);
  assert.match(await notFoundResponse.text(), /Aradığınız sayfa taşınmış/);

  const protectedAdminResponse = await worker.fetch(
    new Request("https://localhost/yonetim/basvurular", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(protectedAdminResponse.status, 307);
  assert.match(protectedAdminResponse.headers.get("location") ?? "", /\/yonetim\/giris\?next=%2Fyonetim%2Fbasvurular/);
  assert.equal(protectedAdminResponse.headers.get("x-frame-options"), "DENY");
  assert.equal(protectedAdminResponse.headers.get("cache-control"), "private, no-store");

  const protectedDetailResponse = await worker.fetch(
    new Request("https://localhost/yonetim/basvurular/1", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(protectedDetailResponse.status, 307);
  assert.match(protectedDetailResponse.headers.get("location") ?? "", /\/yonetim\/giris\?next=%2Fyonetim%2Fbasvurular%2F1/);
  assert.equal(protectedDetailResponse.headers.get("cache-control"), "private, no-store");

  const unauthorizedUpdateResponse = await worker.fetch(
    new Request("https://localhost/api/yonetim/basvurular/1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "qualified" }),
    }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(unauthorizedUpdateResponse.status, 401);
  assert.equal(unauthorizedUpdateResponse.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  assert.deepEqual(await unauthorizedUpdateResponse.json(), {
    ok: false,
    error: "Oturum açmanız gerekiyor.",
  });

  const unauthorizedNoteResponse = await worker.fetch(
    new Request("https://localhost/api/yonetim/basvurular/1/notlar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "Takip notu" }),
    }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(unauthorizedNoteResponse.status, 401);
  assert.equal(unauthorizedNoteResponse.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  assert.deepEqual(await unauthorizedNoteResponse.json(), {
    ok: false,
    error: "Oturum açmanız gerekiyor.",
  });

  const unauthorizedExportResponse = await worker.fetch(
    new Request("https://localhost/api/yonetim/basvurular/export?status=new"),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(unauthorizedExportResponse.status, 401);
  assert.equal(unauthorizedExportResponse.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  assert.deepEqual(await unauthorizedExportResponse.json(), {
    ok: false,
    error: "Oturum açmanız gerekiyor.",
  });

  const publicPagePaths = [
    "/",
    "/en",
    "/en/privacy",
    "/platform",
    "/yazilimlar",
    "/eticaret-altyapisi",
    "/b2b-c2c",
    "/e-ihracat",
    "/mobil-sektorel",
    "/paketler",
    "/fiyatlandirma",
    "/yapay-zeka",
    "/avcai",
    "/entegrasyonlar",
    "/cozum-senaryolari",
    "/cozum-senaryolari/peynir",
    "/referanslar",
    "/bayi-partner",
    "/kaynaklar",
    "/hizmetler",
    "/destek",
    "/alan-adi-hosting",
    "/proje-sureci",
    "/teklif",
    "/musteri-girisi",
    "/demo-portal",
    "/musteri-merkezi",
    "/guvenlik",
    "/ozel-yazilim",
    "/veri-gecisi",
    "/teslim-egitim",
    "/vitrin-tasarim",
    "/seo-gorunurluk",
    "/pazaryeri-kanallari",
    "/gizlilik",
  ];
  const internalLinks = new Set();

  for (const path of publicPagePaths) {
    const pageResponse = await worker.fetch(
      new Request(`https://localhost${path}`, { headers: { accept: "text/html" } }),
      runtimeEnv,
      runtimeContext,
    );
    assert.equal(pageResponse.status, 200, `${path} should render successfully`);
    const pageHtml = await pageResponse.text();
    const bodyHtml = pageHtml.split("<body")[1]?.split('<script id="_R_">')[0] ?? "";

    assert.equal((bodyHtml.match(/<main\b/g) ?? []).length, 1, `${path} should contain exactly one main landmark`);
    assert.equal((bodyHtml.match(/<h1\b/g) ?? []).length, 1, `${path} should contain exactly one h1`);
    assert.match(pageHtml, /<title>[^<]+<\/title>/, `${path} should have a non-empty title`);
    assert.match(pageHtml, /rel="canonical" href="https:\/\/avcieticaret\.com\//, `${path} should have a canonical URL`);
    if (path !== "/") {
      assert.doesNotMatch(
        pageHtml,
        /property="og:url" content="https:\/\/avcieticaret\.com\/"/,
        `${path} should not inherit the home page Open Graph URL`,
      );
    }

    const skipLink = bodyHtml.match(/class="skip-link" href="#([^"]+)"/);
    assert.ok(skipLink, `${path} should have a skip link`);
    assert.match(bodyHtml, new RegExp(`\\bid="${skipLink[1]}"`), `${path} skip link should point to an existing target`);

    const ids = [...bodyHtml.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${path} should not contain duplicate ids`);

    if (path === "/en" || path.startsWith("/en/")) {
      assert.match(bodyHtml, /<main\b[^>]*\blang="en"/, `${path} should identify its English content`);
    } else {
      assert.match(pageHtml, /<html\b[^>]*\blang="tr"/, `${path} should use the Turkish document language`);
    }

    for (const match of bodyHtml.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const href = match[1].replaceAll("&amp;", "&");
      if (href.startsWith("/")) internalLinks.add(href);
    }
  }

  for (const href of internalLinks) {
    const linkedUrl = new URL(href, "https://localhost");
    const linkedResponse = await worker.fetch(
      new Request(linkedUrl, { headers: { accept: "text/html" } }),
      runtimeEnv,
      runtimeContext,
    );
    assert.ok(
      linkedResponse.status >= 200 && linkedResponse.status < 400,
      `${href} returned ${linkedResponse.status}`,
    );
  }
});
