import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { OfferForm } from "../offer-form";
import { loadSiteSettings } from "../site-settings.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-Commerce Infrastructure and Commerce Platform | AVC",
  description: "Explore AVC's storefront, mobile, catalogue, order, payment, B2B, marketplace, cross-border and modular commerce infrastructure.",
  alternates: { canonical: "/en", languages: { "tr-TR": "/", en: "/en", "x-default": "/" } },
};

const solutions = [
  { number: "01", title: "E-Commerce", text: "Product, order, campaign, payment and shipping operations designed around your sales model.", href: "/eticaret-altyapisi" },
  { number: "02", title: "B2B & Dealer Sales", text: "Customer-specific pricing, terms, approval and collection flows for wholesale networks.", href: "/b2b-c2c#b2b" },
  { number: "03", title: "C2C Marketplace", text: "Seller onboarding, catalog, commission, order split and settlement workflows.", href: "/b2b-c2c#c2c" },
  { number: "04", title: "Cross-Border Commerce", text: "Market-specific language, currency, pricing, payment and logistics planning.", href: "/e-ihracat" },
  { number: "05", title: "Mobile Applications", text: "Task-focused customer and workforce experiences connected to the systems that matter.", href: "/mobil-sektorel#mobil" },
  { number: "06", title: "Industry Software", text: "Role, record, approval and reporting flows shaped around sector-specific operations.", href: "/mobil-sektorel#sektorel" },
];

const services = [
  ["Product & software", "Discovery, architecture, interface, development, integration and controlled release."],
  ["Web & commerce", "Corporate websites, digital stores, landing experiences and technical SEO foundations."],
  ["Optional AI modules", "Catalogue, discovery, support and decision modules added to the commerce platform with defined data and human-review boundaries."],
  ["Operations", "Hosting, domain, maintenance and support services with explicit ownership and service scope."],
];

const process = [
  ["01", "Discover", "Define users, business goals, existing systems, data and success criteria."],
  ["02", "Scope", "Separate product, integration, implementation, licensing and support responsibilities."],
  ["03", "Build & verify", "Deliver in reviewable increments and validate against agreed acceptance criteria."],
  ["04", "Launch & evolve", "Plan release, ownership, maintenance and future change as one lifecycle."],
];

export default async function EnglishHomePage() {
  const settings = await loadSiteSettings();

  return (
    <main className="english-page" lang="en">
      <a className="skip-link" href="#english-solutions">Skip to solutions</a>
      <header className="catalog-header english-header">
        <SiteBrand href="/en" label="AVC English home" subtitle="E-COMMERCE" />
        <nav aria-label="English navigation"><a href="#english-solutions">Solutions</a><a href="#english-platform">Platform</a><a href="#english-services">Services</a><a href="#english-process">Process</a><a href="#english-contact">Contact</a></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/" hrefLang="tr">Türkçe</Link></HeaderCtaCluster>
      </header>

      <section className="english-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="english-hero-copy"><span className="kicker kicker-light">STOREFRONT · MOBILE · COMMERCE OPERATIONS</span><h1>Build the commerce system<br /><em>your business can grow on.</em></h1><p>AVC brings storefronts, mobile applications, catalogues, orders, payments, sales channels and managed operations into one modular e-commerce infrastructure. AI is an optional module layer, not the product itself.</p><div><a className="button button-primary" href={`mailto:${settings.contactEmail}?subject=English%20Project%20Enquiry`}>Discuss your project</a><a className="button button-ghost" href="#english-solutions">Explore solutions</a></div></div>
        <div className="english-hero-panel" aria-label="AVC platform capability overview"><small>AVC COMMERCE PLATFORM</small><strong>One operating layer for storefronts and commerce operations.</strong><div><span>Catalogue</span><span>Orders</span><span>Payments</span><span>Customers</span><span>Channels</span><span>Modules</span></div><p>Capabilities depend on the sales model, integrations, contract and environment configuration.</p></div>
      </section>

      <aside className="english-disclosure"><strong>Scope first</strong><p>This page presents solution families, not a promise that every module, integration or service is pre-built or included. Final scope, delivery assumptions and commercial terms are defined after discovery.</p></aside>

      <section className="english-solutions" id="english-solutions">
        <div className="english-section-heading"><span className="kicker">SOLUTION FAMILIES</span><h2>Choose the right model<br />before choosing modules.</h2><p>Start from the selling model, user roles and operational constraints. The technical architecture follows those decisions.</p></div>
        <div>{solutions.map((solution) => <article key={solution.number}><span>{solution.number}</span><h3>{solution.title}</h3><p>{solution.text}</p><Link href={solution.href}>View Turkish detail</Link></article>)}</div>
      </section>

      <section className="english-platform" id="english-platform">
        <div><span className="kicker kicker-light">CENTRAL COMMERCE PLATFORM</span><h2>Channels stay flexible.<br /><em>Commerce data stays connected.</em></h2><p>The AVC platform can connect catalogue, inventory, pricing, customers, orders, payments, fulfilment, storefronts, mobile applications and operational modules without treating every business as the same store.</p><Link href="/platform">View the technical platform in Turkish</Link></div>
        <div className="english-platform-grid"><article><small>COMMERCE CORE</small><strong>Catalogue to fulfilment</strong><p>Products, prices, stock, customers, orders, payments, shipping and returns share a controlled operational flow.</p></article><article><small>SALES CHANNELS</small><strong>Web, mobile, B2B and marketplace</strong><p>Each channel uses the required experience and business rules while connecting to the same commerce foundation.</p></article><article><small>MODULE BOUNDARIES</small><strong>Integrations and optional AI</strong><p>ERP, accounting, marketplace and AI modules are enabled only for the defined data, role and contract scope.</p></article></div>
      </section>

      <section className="english-services" id="english-services">
        <div className="english-section-heading"><span className="kicker">SERVICES</span><h2>One team from scope<br />to ongoing operation.</h2><p>Software, infrastructure and growth work are separated into explicit responsibilities instead of being hidden inside one vague package.</p></div>
        <div>{services.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="english-process" id="english-process">
        <div><span className="kicker kicker-light">DELIVERY MODEL</span><h2>Move with evidence,<br />not assumptions.</h2><p>Each phase has a defined output. Changes are assessed separately so acceptance and commercial scope remain clear.</p></div>
        <ol>{process.map(([number, title, text]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ol>
      </section>

      <section className="english-contact" id="english-contact">
        <div><span className="kicker kicker-light">START A CONVERSATION</span><h2>Tell us what must work,<br />who will use it and what it connects to.</h2><p>We will separate the right product, integration, implementation, licensing and support scope.</p><div className="english-direct-contact"><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a><a href={`tel:${settings.contactPhoneHref}`}>{settings.contactPhone}</a></div></div><OfferForm locale="en" />
      </section>

      <footer className="english-footer"><SiteBrand href="/en" className="brand footer-brand" subtitle="E-COMMERCE" /><p>Modular e-commerce infrastructure for storefront, mobile and commerce operations.</p><div className="footer-links"><Link href="/" hrefLang="tr">Türkçe site</Link><Link href="/en/privacy">Privacy</Link><a href={`mailto:${settings.contactEmail}`}>Contact</a></div><small>© 2026 AVC. All rights reserved.</small></footer>
    </main>
  );
}
