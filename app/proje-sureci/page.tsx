import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proje Süreci, Sözleşme ve Fatura Rehberi | Avcı E-Ticaret",
  description: "İhtiyaç analizinden canlı geçişe proje aşamalarını; kapsam, değişiklik, kabul, sözleşme ve fatura kayıtlarıyla birlikte inceleyin.",
  alternates: { canonical: "/proje-sureci" },
};

const stages = [
  { number: "01", title: "Keşif ve ihtiyaç", text: "İş hedefi, kullanıcılar, mevcut sistemler, veri kaynakları ve başarı ölçütleri netleştirilir.", output: "İhtiyaç ve öncelik özeti" },
  { number: "02", title: "Kapsam ve plan", text: "Ürün, modül, entegrasyon, sorumluluk, takvim varsayımı ve kabul ölçütleri yazılı kapsama dönüştürülür.", output: "Teklif ve proje kapsamı" },
  { number: "03", title: "Tasarım ve geliştirme", text: "Onaylı kapsam küçük teslim parçalarına ayrılır; kararlar ve bağımlılıklar proje iletişiminde kayıt altına alınır.", output: "İncelenebilir ara teslimler" },
  { number: "04", title: "Test ve kabul", text: "Kapsamdaki işlevler, veri akışları ve kritik senaryolar test edilir; eksikler sınıflandırılıp yeniden doğrulanır.", output: "Kabul veya eksik listesi" },
  { number: "05", title: "Canlıya geçiş", text: "Yayın, DNS, veri aktarımı, geri dönüş ve sorumluluk planı kontrollü bir geçiş penceresinde uygulanır.", output: "Canlı geçiş kaydı" },
  { number: "06", title: "Bakım ve gelişim", text: "Hata, kullanım desteği, bakım ve yeni geliştirme talepleri sözleşmedeki kapsama göre ayrı yürütülür.", output: "Destek veya yeni kapsam" },
];

const records = [
  ["Teklif", "Ürün, hizmet, varsayım, hariç tutulan işler, ticari model ve geçerlilik süresini açıklar."],
  ["Sözleşme", "Taraflar, sorumluluklar, ödeme, veri, fikrî hak, destek ve sona erme koşullarını bağlar."],
  ["Kapsam eki", "Teslim edilecek işlevleri, entegrasyonları, kabul ölçütlerini ve bağımlılıkları ayrıntılandırır."],
  ["Değişiklik kaydı", "İlk kapsam dışındaki talebin etki, bedel, süre ve onay durumunu izler."],
  ["Kabul kaydı", "Teslimin hangi ölçütlerle incelendiğini, açık maddeleri ve onay sonucunu belgeler."],
  ["Fatura / tahakkuk", "Sözleşmedeki ticari aşamaya bağlı tutar, durum ve vade bilgisini gösterir."],
];

const changeSteps = [
  ["Talep", "İstenen değişiklik ve iş gerekçesi tek cümleyle değil, beklenen sonuçla birlikte yazılır."],
  ["Etki analizi", "Kapsam, güvenlik, veri, entegrasyon, süre ve maliyet etkisi değerlendirilir."],
  ["Karar", "Mevcut kapsama dahil, sonraki faza alınacak veya ayrı teklif gerektiren iş olarak sınıflandırılır."],
  ["Onay", "Uygulama ancak sorumlu tarafların yazılı onayı ve gerekli bağımlılıkların tamamlanmasıyla başlar."],
];

export default function ProjectProcessPage() {
  return (
    <main className="catalog-page project-process-page">
      <a className="skip-link" href="#proje-asamalari">Proje aşamalarına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/hizmetler">Hizmetler</Link><Link className="active" href="/proje-sureci">Proje Süreci</Link><Link href="/musteri-merkezi">Müşteri Merkezi</Link><Link href="/destek">Destek</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=ozel">Projenizi anlatın</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero project-hero">
        <div><span className="kicker kicker-light">PROJE YOL HARİTASI</span><h1>Fikirden canlı sisteme<br /><em>kanıtlı ve kontrollü ilerleyin.</em></h1></div>
        <p>Kapsam, teslim, değişiklik ve ticari kayıtları aynı proje akışında görün; neyin tamamlandığını varsayımla değil kabul ölçütüyle belirleyin.</p>
      </section>

      <aside className="project-disclosure"><strong>Mevcut portal kapsamı</strong><p>Müşteri portalı bugün lisans ve fatura özetini gösterir. Proje aşaması, sözleşme dosyası, değişiklik ve kabul kayıtları henüz portalda ayrı ekranlar değildir; yetkili proje iletişimi üzerinden yürütülür.</p></aside>

      <section className="project-stages" id="proje-asamalari">
        <div><span className="kicker">ALTI AŞAMA</span><h2>Her aşamanın<br />bir çıktısı olsun.</h2><p>Takvim, kapsam ve bağımlılıklara göre değişebilir. Aşamanın tamamlanması yalnızca çalışılmış olmasına değil, tanımlı çıktının doğrulanmasına bağlıdır.</p></div>
        <div>{stages.map((stage) => <article key={stage.number}><span>{stage.number}</span><h3>{stage.title}</h3><p>{stage.text}</p><small>ÇIKTI · {stage.output}</small></article>)}</div>
      </section>

      <section className="project-records">
        <div><span className="kicker kicker-light">TİCARİ VE PROJE KAYITLARI</span><h2>Her belgenin<br />farklı bir görevi var.</h2><p>Teklif, sözleşme, kapsam, kabul ve fatura birbirinin yerine geçmez. Birlikte okunduklarında teslim ve ödeme ilişkisinin izlenebilir olmasını sağlarlar.</p></div>
        <div>{records.map(([title, text]) => <article key={title}><strong>{title}</strong><span>{text}</span></article>)}</div>
      </section>

      <section className="change-control">
        <div><span className="kicker">DEĞİŞİKLİK YÖNETİMİ</span><h2>“Küçük değişiklik”<br />etkisi ölçülmeden küçük değildir.</h2><p>Yeni talep, mevcut işin kabulünü belirsizleştirmeden ayrı bir karar akışına alınır.</p></div>
        <div>{changeSteps.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="project-acceptance">
        <div><span className="kicker">KABUL KONTROLÜ</span><h2>Teslimi “bitti” sözüyle<br />değil ölçütle kapatın.</h2></div>
        <ol>
          <li><span>01</span><div><strong>Kapsam eşleşmesi</strong><p>Teslim edilen işlevin onaylı kapsam ve senaryolarla eşleştiği kontrol edilir.</p></div></li>
          <li><span>02</span><div><strong>Kanıt ve sonuç</strong><p>Test sonucu, açık hata ve varsa geçici çözüm ilgili kayıtla ilişkilendirilir.</p></div></li>
          <li><span>03</span><div><strong>Açık maddeler</strong><p>Kabulü engelleyen eksik ile sonraki faz iyileştirmesi birbirinden ayrılır.</p></div></li>
          <li><span>04</span><div><strong>Yetkili onayı</strong><p>Sonuç, kararlaştırılan yetkili kişiler ve iletişim kanalı üzerinden kayıt altına alınır.</p></div></li>
        </ol>
      </section>

      <aside className="scope-note"><strong>Fatura sınırı</strong><p>Portalda görünen fatura numarası, tutar, durum ve vade bilgisi finansal bir özettir. E-fatura veya resmî muhasebe belgesinin yerini aldığı varsayılmaz; geçerli belgenin paylaşım ve saklama yöntemi sözleşme ve mevzuata göre belirlenir.</p></aside>

      <section className="decision-cta"><span className="kicker">SONRAKİ ADIM</span><h2>Yeni proje mi, mevcut kayıt mı?</h2><p>Yeni bir çalışma için kapsam görüşmesine başlayın; devam eden proje, sözleşme veya fatura sorusu için yetkili kanaldan destek isteyin.</p><div><Link className="button button-primary" href="/teklif?cozum=ozel">Proje görüşmesi isteyin</Link><Link className="button button-ghost" href="/veri-gecisi">Veri geçişini inceleyin</Link><Link className="button button-ghost" href="/musteri-merkezi">Müşteri merkezine gidin</Link></div></section>
    </main>
  );
}
