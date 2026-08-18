export const MAX_LEAD_EXPORT_ROWS = 5_000;

export const LEAD_EXPORT_HEADERS = [
  "Başvuru No",
  "Başvuru Tarihi",
  "Son Güncelleme",
  "İletişim İzni Tarihi",
  "Ad Soyad",
  "Firma",
  "E-posta",
  "Telefon",
  "Çözüm",
  "Durum",
  "Kaynak",
  "UTM Kaynak",
  "UTM Ortam",
  "UTM Kampanya",
  "Yönlendiren Alan",
  "Açılış Yolu",
  "Mesaj",
];

export function canExportLeadRows(totalRows) {
  return Number.isSafeInteger(totalRows) && totalRows >= 0 && totalRows <= MAX_LEAD_EXPORT_ROWS;
}

export function toLeadExportRow(lead, statusLabel) {
  return [
    lead.id,
    lead.createdAt,
    lead.updatedAt,
    lead.consentAt,
    lead.name,
    lead.company,
    lead.email,
    lead.phone,
    lead.interest,
    statusLabel,
    lead.source,
    lead.utmSource,
    lead.utmMedium,
    lead.utmCampaign,
    lead.referrerHost,
    lead.landingPath,
    lead.message,
  ];
}
