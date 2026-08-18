import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../../header-cta-cluster";
import { SiteBrand } from "../../site-brand";
import { loadSiteSettings } from "../../site-settings.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy and Personal Data | AVC",
  description: "How AVC uses and protects the information submitted through its project and quotation forms.",
  alternates: { canonical: "/en/privacy", languages: { "tr-TR": "/gizlilik", en: "/en/privacy", "x-default": "/gizlilik" } },
};

const sections = [
  ["What information do we collect?", "We collect the full name, phone number, email address, company, solution interest and project message you submit through the enquiry form. Submission time and limited technical error records may also be processed to protect the form."],
  ["Why do we use it?", "We use this information to assess your request, contact you, identify a suitable product or service, manage the quotation process and prevent misuse. We do not move it into unrelated marketing activity without permission or another valid legal basis."],
  ["How long do we keep it?", "Enquiry records are kept for the period needed to conclude the request and manage a possible commercial relationship, followed by applicable legal obligations and limitation periods. Expired records are deleted or anonymised."],
  ["Who may receive it?", "Information may be shared only with authorised team members who need to answer the request and service providers required to operate the infrastructure securely, limited to that purpose. It may be disclosed to competent authorities where legally required."],
  ["What are your rights?", "You may ask whether your personal data is processed, request information or correction, request deletion or destruction where the legal conditions apply, learn about relevant recipients and object where applicable."],
  ["What is the visit cookie?", "If you accept, we store a random first-party cookie (avci_vid) to count public pages. We do not store IP addresses. Admin pages are not counted. If you decline, this counter stays off. Enquiry-form details are separate and collected only with form consent."],
];

export default async function EnglishPrivacyPage() {
  const settings = await loadSiteSettings();

  return (
    <main className="legal-page" lang="en">
      <a className="skip-link" href="#legal-content">Skip to main content</a>
      <header className="legal-header"><SiteBrand href="/en" label="AVC English home" subtitle="E-COMMERCE" /><HeaderCtaCluster><Link className="legal-back" href="/en">Back to English home</Link></HeaderCtaCluster></header>
      <article className="legal-content" id="legal-content">
        <div className="legal-hero"><span className="kicker kicker-light">PRIVACY AND PERSONAL DATA</span><h1>Why we request your information and how we protect it.</h1><p>Last updated: 15 August 2026</p></div>
        <div className="legal-body"><section className="legal-summary"><h2>Short version</h2><p>We use the details in the enquiry form only to respond, plan a suitable solution and protect the submission process. We do not sell your information.</p></section>{sections.map(([title, content], index) => <section className="legal-section" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{content}</p></div></section>)}<section className="legal-contact"><span className="kicker">REQUESTS AND QUESTIONS</span><h2>Contact us about your information.</h2><p>Send your request with enough information to help us verify your identity.</p><div><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a><a href={`tel:${settings.contactPhoneHref}`}>{settings.contactPhone}</a></div></section></div>
      </article>
    </main>
  );
}
