const domainOf = (value) => String(value ?? "").trim().toLowerCase()
  .replace(/^https?:\/\//, "").split(/[/?#]/)[0].replace(/:\d+$/, "").replace(/\.$/, "");

export function buildActiveLicenseDomainIndex(licenses) {
  const index = new Map();
  for (const license of licenses) {
    const domain = domainOf(license.primaryDomain);
    if (!domain || !["active", "trial"].includes(String(license.status))) continue;
    const current = index.get(domain);
    if (current && Number(current.customerId) !== Number(license.customerId)) {
      index.set(domain, null);
      continue;
    }
    if (current !== null) index.set(domain, license);
  }
  return index;
}

export function reconcileHostingerWebsites(websites, licenses) {
  const licenseByDomain = buildActiveLicenseDomainIndex(licenses);
  const matched = [];
  const unmatched = [];
  const ambiguous = [];
  for (const website of websites) {
    const domain = domainOf(website?.domain);
    if (!domain) { unmatched.push({ domain: "", reason: "missing_domain" }); continue; }
    const license = licenseByDomain.get(domain);
    if (license === null) { ambiguous.push({ domain, reason: "multiple_customers" }); continue; }
    if (!license) { unmatched.push({ domain, reason: "no_active_license" }); continue; }
    matched.push({ website, domain, license });
  }
  return { matched, unmatched, ambiguous };
}

export { domainOf };
