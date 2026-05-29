// California Legal Cases data
// ============================
// To add a new case:
//   1. Add a new entry to the `cases` array below
//   2. Push to GitHub — homepage automatically shows latest 4
//
// Case fields:
//   - name: full case name
//   - court: which court issued the ruling
//   - date: decision date
//   - topic: legal area tag
//   - summary: 2-4 sentence plain English summary
//   - takeaway: one-sentence key takeaway
//   - question: sample question for AI assistant
//   - links: external resources (opinion, news, analysis)

export interface CaseItem {
  name: string;
  court: string;
  date: string;
  topic: string;
  summary: string;
  takeaway: string;
  question: string;
  links: { label: string; url: string }[];
}

export const cases: CaseItem[] = [
  {
    name: "Reasin v. Reasin (In re Susan D.)",
    court: "California Court of Appeal, 4th District",
    date: "January 16, 2026",
    topic: "Child Support",
    summary: `A divorce judgment ordered $1,750/month in child support for three children with no allocation between them. When each child reached adulthood, the father unilaterally reduced payments. The Court of Appeal ruled that retroactively allocating the lump sum among children after one ages out is not a prohibited retroactive modification — it is simply calculating arrears after a support obligation has legally terminated.`,
    takeaway: `California courts can allocate a lump-sum child support order among multiple children retroactively when one child emancipates, without running afoul of the ban on retroactive modifications.`,
    question: `Under Reasin v. Reasin, can a court allocate child support arrears among children after one turns 18?`,
    links: [
      { label: "Full opinion on VLEX", url: "https://case-law.vlex.com/vid/reasin-v-reasin-in-1102847958" },
    ],
  },
  {
    name: "Eshagian v. Cepeda",
    court: "California Court of Appeal, 2nd District",
    date: "June 26, 2025",
    topic: "Landlord-Tenant",
    summary: `A landlord served a 3-day notice to pay rent or quit that had three defects: it didn't clearly state the tenant would lose possession if rent wasn't paid, it didn't specify when the notice period began or ended, and it listed the tenant's own residence as the payment address. The Court of Appeal held the notice was invalid under CCP § 1161(2), and the default judgment for eviction could not stand.`,
    takeaway: `Eviction notices in California must strictly comply with all technical requirements — even a small error can invalidate the entire eviction.`,
    question: `What are the requirements for a valid 3-day notice to pay rent or quit in California?`,
    links: [
      { label: "Weintraub Tobin — Law firm analysis", url: "https://www.weintraub.com/2025/07/cre-alert-california-case-law-changes-requirements-for-three-day-notices/" },
      { label: "NAA — Landlord practice alert", url: "https://naahq.org/news/invalid-3-day-notice-vacates-possession-only-judgment-california" },
      { label: "Tenant-side analysis", url: "https://jacobfights.com/what-does-the-eshagian-v-cepeda-ruling-mean-for-three-day-notices/" },
    ],
  },
  {
    name: "In re Marriage of Carter",
    court: "California Court of Appeal, 4th District",
    date: "September 16, 2025",
    topic: "Divorce & Spousal Support",
    summary: `In this long-running divorce case (the fourth appeal), the court addressed how to calculate additional child support based on stock option income from a corporate merger. The trial court chose one accounting method for past arrears and another going forward to avoid a windfall. The Court of Appeal also denied modification of spousal support, reinforcing the limits on modifying support after judgment.`,
    takeaway: `Stock options and other complex assets require careful accounting in California support calculations — the method used can significantly change the support amount.`,
    question: `How are stock options treated for child and spousal support in California?`,
    links: [
      { label: "Full opinion on CourtListener", url: "https://www.courtlistener.com/opinion/10382019/marriage-of-carter-ca41/" },
    ],
  },
  {
    name: "Western Manufactured Housing Communities Ass'n v. City of Santa Rosa",
    court: "California Court of Appeal",
    date: "April 17, 2026",
    topic: "Tenant Rights / Rent Control",
    summary: `During a state of emergency, Penal Code § 396 caps rent increases at 10%. This case confirmed that the cap applies to rent-controlled spaces and refers to the amount authorized under local rent control at the time the emergency was declared. Importantly, landlords cannot "recoup" suppressed rent increases after the emergency ends.`,
    takeaway: `Rent increase caps during emergencies are permanent limits — landlords cannot later make up for increases they couldn't impose during the emergency period.`,
    question: `Can a California landlord recoup rent increases that were capped during a state of emergency?`,
    links: [
      { label: "California Lawyers Association — Case summary", url: "https://calawyers.org/real-property-law/california-case-summary-update-may-2026-real-property-case-summaries/" },
    ],
  },
];
