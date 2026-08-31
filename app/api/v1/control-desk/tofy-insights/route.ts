import { replyAvcai } from "../../../../avcai-llm.mjs";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../control-desk-auth.mjs";

export const dynamic = "force-dynamic";
const KEYS = ["offlineStores", "warningStores", "expiringLicenses", "failedInstalls", "openTickets"] as const;

function count(value: unknown) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 && number <= 100000 ? number : 0;
}

export async function POST(request: Request) {
  const auth = await authorizeControlDesk(request);
  if (!auth.ok) return controlDeskJson({ ok:false, error:auth.error }, auth.status, request);
  if (!hasControlDeskRole(auth,["platform_owner","support_operator","installer","customer_owner","customer_viewer"])) return controlDeskJson({ok:false,error:"Tofy önerilerini görme yetkiniz yok."},403,request);
  const input=await request.json().catch(()=>({})) as Record<string,unknown>;
  const summary=Object.fromEntries(KEYS.map((key)=>[key,count(input[key])])) as Record<(typeof KEYS)[number],number>;
  const prompt=[
    "Control Desk için aşağıdaki kimliksiz operasyon sayılarını değerlendir.",
    "En önemli tek aksiyonu doğal Türkçe ile, en fazla iki kısa cümlede belirt. Domain, kişi, müşteri veya mağaza adı uydurma.",
    `Çevrimdışı mağaza: ${summary.offlineStores}; uyarıdaki mağaza: ${summary.warningStores}; 30 gün içinde bitecek lisans: ${summary.expiringLicenses}; başarısız kurulum: ${summary.failedInstalls}; açık destek: ${summary.openTickets}.`,
  ].join(" ");
  const result=await replyAvcai(prompt,auth.env,[],"/yonetim","Control Desk operasyon özeti",true);
  if(!result.provider)return controlDeskJson({ok:false,error:"Tofy yapay zekâ sağlayıcısı şu anda yapılandırılmamış."},503,request);
  return controlDeskJson({ok:true,format:"avci-control-desk.tofy-insight.v1",insight:{title:"Tofy’nin önceliği",body:String(result.reply||"").slice(0,600),tone:summary.offlineStores||summary.failedInstalls?"danger":summary.expiringLicenses||summary.warningStores?"warning":"info"},provider:result.provider,model:result.model,privacy:{mode:"aggregate-only",fields:KEYS}},200,request);
}
