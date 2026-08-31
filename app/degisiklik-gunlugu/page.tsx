import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Değişiklik Günlüğü | Avcı E-Ticaret",
  description: "Avcı E-Ticaret ürününün kuruluşundan bugüne hangi aşamalardan geçerek geliştiğini gösteren, iç geliştirme kayıtlarından süzülmüş gerçek bir ilerleme günlüğü.",
  alternates: { canonical: "/degisiklik-gunlugu" },
};

const stages: Array<{ number: string; title: string; text: string }> = [
  {
    number: "01",
    title: "Kurumsal site ve teklif altyapısı",
    text: "Tanıtım sitesini, teklif alma akışını ve paket/fiyatlandırma yapısını temel olarak kurduk; ilk günden itibaren sabit rakam yerine kapsam netleştirmeye dayalı bir teklif modeli benimsedik.",
  },
  {
    number: "02",
    title: "Kalıcı görsel kimlik",
    text: "Deneme tasarımlarından sonra sabit bir marka kimliği belirledik ve ana sayfa ile ürün sahnelerini bu kimlik üzerinde sadeleştirdik.",
  },
  {
    number: "03",
    title: "Yönetim panelinde uçtan uca kayıt zinciri",
    text: "İç yönetim panelinde teklif, müşteri, sipariş, fatura ve destek kayıtlarını tek bir izlenebilir zincirde birleştirdik; hiçbir kayıt artık başka bir ekranda kaybolmuyor.",
  },
  {
    number: "04",
    title: "Uçtan uca örnek mağaza deneyimi",
    text: "Ürünün gerçek kullanımda nasıl çalıştığını göstermek için vitrin, sepet, ödeme ve müşteri paneline uzanan tam bir örnek mağaza akışı kurduk.",
  },
  {
    number: "05",
    title: "Tofy: sesli ve yazılı yapay zekâ asistanı",
    text: "Ziyaretçilere gerçek zamanlı yanıt veren yapay zekâ asistanını kademeli olarak geliştirdik: doğal konuşma, bağlam farkındalığı ve daha hızlı, daha kararlı yanıt süreleri.",
  },
  {
    number: "06",
    title: "Müşteri panelinde gerçek veri kartları",
    text: "Demo müşteri panelini; gerçek oturum altyapısı, finansal özet, bildirimler ve en çok satan ürünler gibi uydurma olmayan veri kartlarıyla genişlettik.",
  },
  {
    number: "07",
    title: "Mobil uygulama temelleri",
    text: "Avcı Commerce Mobile uygulaması için güvenli oturum açma (OAuth) akışını kurduk ve mobil tarafı ana platforma bağladık.",
  },
  {
    number: "08",
    title: "Sağlayıcıdan bağımsız ödeme katmanı",
    text: "Ödeme altyapısını tek bir sağlayıcıya bağımlı olmayacak şekilde soyutladık. PayTR entegrasyonu bu katmanın üzerine kuruldu; ileride ek sağlayıcılar aynı katmana eklenebilecek.",
  },
  {
    number: "09",
    title: "Lisans dayanıklılığı testleri",
    text: "Lisans doğrulamasını; alan adı değişimi, yeniden kurulum, cihaz değişimi ve geçici çevrimdışı durum gibi gerçek senaryolarda test ettik.",
  },
  {
    number: "10",
    title: "Modül dağıtımının uçtan uca doğrulanması",
    text: "Modül dağıtım ve geri alma (rollback) akışını gerçek bir uçtan uca senaryoyla doğruladık; müşteri panelindeki hizmet sağlığı kartı artık gerçek destek verisinden besleniyor.",
  },
];

export default function ChangelogPage() {
  return (
    <main className="catalog-page changelog-page">
      <a className="skip-link" href="#asamalar">Aşamalara geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/eticaret-altyapisi">E-Ticaret</Link><Link href="/yazilimlar">Yazılımlar</Link><Link href="/paketler">Paketler</Link><Link href="/kaynaklar">Kaynaklar</Link><Link href="/hizmetler">Hizmetler</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif">Projenizi anlatın</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero changelog-hero">
        <div><span className="kicker kicker-light">DEĞİŞİKLİK GÜNLÜĞÜ</span><h1>Duran değil,<br /><em>sürekli gelişen bir ürün.</em></h1></div>
        <p>Kuruluşundan bugüne ürünün hangi problemleri sırayla çözerek geliştiğini gösteren gerçek bir ilerleme kaydı.</p>
      </section>

      <aside className="scenario-disclosure"><strong>Şeffaflık notu</strong><p>Bu sayfa iç mühendislik günlüğümüzden derlenmiştir. Güvenlik, altyapı mimarisi veya operasyonel ayrıntı içeren maddeler kamuya açık bu sayfada paylaşılmaz; yalnızca ürünün müşteri açısından ne kazandırdığını anlatan aşamalar listelenmiştir.</p></aside>

      <section className="changelog-timeline" id="asamalar">
        <div><span className="kicker">GELİŞİM AŞAMALARI</span><h2>Adım adım<br />bugünkü ürüne.</h2><p>Her aşama bir öncekinin üzerine gerçekten kuruldu; sıralama iç geliştirme kayıtlarımızla birebir örtüşür.</p></div>
        <ol>
          {stages.map((stage) => <li key={stage.number}><span>{stage.number}</span><div><strong>{stage.title}</strong><p>{stage.text}</p></div></li>)}
          <li><span>11</span><div><strong>Bugün ve sonrası</strong><p>Kalite ve güvenilirlik çalışmaları sürüyor. Ödeme sağlayıcı bağlantısı canlıya alınmadan önce test ortamında doğrulanır; kontrol paneli sürümleri imzalı paketlerle dağıtılır. Bu sayfa yeni aşama tamamlandıkça güncellenir.</p></div></li>
        </ol>
      </section>

      <section className="decision-cta"><span className="kicker">YOL HARİTASINDA SIRADA NE VAR?</span><h2>Sıradaki aşamayı birlikte konuşalım.</h2><p>Projenizle örtüşen bir ihtiyacınız varsa veya yol haritasında önceliklendirmemizi istediğiniz bir konu varsa bize iletin.</p><div><Link className="button button-primary" href="/teklif">Projenizi anlatın</Link><Link className="button button-ghost" href="/kaynaklar">Karar rehberini inceleyin</Link></div></section>
    </main>
  );
}
