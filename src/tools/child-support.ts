// California Child Support Calculator
// Based on California Family Code §4055 Guideline Formula
// This is a simplified estimator — actual amounts may vary

export interface ChildSupportInput {
  parent1MonthlyGross: number;
  parent2MonthlyGross: number;
  parent1TimesharePercent: number; // 0-100, time with parent 1
  numChildren: number;
  healthInsuranceMonthly: number; // cost of child's health insurance
  childcareMonthly: number;
  parent1TaxDeductions: number; // monthly tax + deductions
  parent2TaxDeductions: number;
}

export interface ChildSupportResult {
  parent1NetIncome: number;
  parent2NetIncome: number;
  combinedNetIncome: number;
  parent1IncomeShare: number; // percentage 0-100
  parent2IncomeShare: number;
  baseMonthlySupport: number;
  parent1Share: number;
  parent2Share: number;
  netTransfer: number; // positive = parent 1 pays parent 2
  addonHealthInsurance: number;
  addonChildcare: number;
  totalPayment: number;
  lowEarnerReceives: number;
}

/**
 * Calculate net monthly income (simplified CA tax estimation)
 */
function estimateNetIncome(grossMonthly: number, deductions: number): number {
  // Simplified tax estimate for California
  const grossAnnual = grossMonthly * 12;

  // Federal tax (simplified 2026 rates)
  let fedTax = 0;
  if (grossAnnual > 0) {
    const stdDeduction = 14600;
    const taxable = Math.max(0, grossAnnual - stdDeduction);
    // Simplified bracket: ~12% effective for mid incomes
    fedTax = taxable * 0.12;
  }

  // CA state tax (simplified)
  let stateTax = 0;
  if (grossAnnual > 0) {
    stateTax = grossAnnual * 0.04; // ~4% effective rate
  }

  // FICA (Social Security + Medicare)
  const fica = Math.min(grossAnnual, 168800) * 0.0765;

  const totalTax = fedTax + stateTax + fica + deductions;
  const netMonthly = Math.max(0, (grossAnnual - totalTax) / 12);

  return Math.round(netMonthly);
}

/**
 * Calculate guideline base percentage based on number of children
 */
function basePercentage(numChildren: number): number {
  // Approximate percentages used in CA guideline
  const percentages: Record<number, number> = {
    1: 0.25,
    2: 0.40,
    3: 0.50,
    4: 0.55,
    5: 0.60,
  };
  return percentages[numChildren] ?? 0.60;
}

/**
 * Calculate timeshare adjustment factor
 */
function timeshareFactor(timesharePercent: number, incomeShare: number, numChildren: number): number {
  const H = incomeShare / 100; // high earner's share as decimal
  const N = numChildren;
  const lowTimeshare = Math.min(timesharePercent, 100 - timesharePercent);

  let K: number;
  if (lowTimeshare < 20) {
    // One parent has primary custody
    K = 1 + H * (0.12 * N);
  } else if (lowTimeshare < 50) {
    // Shared custody
    K = 2 - (1 + H) * (0.12 * N) / (H + 0.5);
  } else {
    // Equal custody
    K = 1 + H * (0.12 * N);
  }

  // K must be between 0 and 2
  return Math.max(0, Math.min(2, K));
}

/**
 * Calculate child support
 */
export function calculateChildSupport(input: ChildSupportInput): ChildSupportResult {
  const p1Net = estimateNetIncome(input.parent1MonthlyGross, input.parent1TaxDeductions);
  const p2Net = estimateNetIncome(input.parent2MonthlyGross, input.parent2TaxDeductions);
  const combinedNet = p1Net + p2Net;

  const p1Share = combinedNet > 0 ? (p1Net / combinedNet) * 100 : 50;
  const p2Share = combinedNet > 0 ? (p2Net / combinedNet) * 100 : 50;

  const basePct = basePercentage(input.numChildren);
  const baseSupport = Math.round(combinedNet * basePct);

  // Determine high earner
  const highEarnerIsP1 = p1Net >= p2Net;
  const highEarnerShare = highEarnerIsP1 ? p1Share : p2Share;
  const highEarnerTimeshare = highEarnerIsP1 ? input.parent1TimesharePercent : (100 - input.parent1TimesharePercent);

  // Apply timeshare adjustment
  const K = timeshareFactor(highEarnerTimeshare, highEarnerShare, input.numChildren);
  const adjustedSupport = Math.round(baseSupport * K);

  // Each parent's share
  const p1Obligation = Math.round(adjustedSupport * (p1Share / 100));
  const p2Obligation = Math.round(adjustedSupport * (p2Share / 100));

  // Net transfer (who pays whom)
  const netTransfer = p1Obligation - p2Obligation;

  // Add-ons
  const p1HealthShare = Math.round(input.healthInsuranceMonthly * (p1Share / 100));
  const p2HealthShare = Math.round(input.healthInsuranceMonthly * (p2Share / 100));
  const p1ChildcareShare = Math.round(input.childcareMonthly * (p1Share / 100));
  const p2ChildcareShare = Math.round(input.childcareMonthly * (p2Share / 100));

  // Total payment from higher earner to lower earner
  let totalPayment: number;
  let lowEarnerReceives: number;

  if (netTransfer > 0) {
    // Parent 1 owes Parent 2
    totalPayment = netTransfer + p2HealthShare + p2ChildcareShare;
    lowEarnerReceives = totalPayment;
  } else {
    // Parent 2 owes Parent 1
    totalPayment = Math.abs(netTransfer) + p1HealthShare + p1ChildcareShare;
    lowEarnerReceives = totalPayment;
  }

  return {
    parent1NetIncome: p1Net,
    parent2NetIncome: p2Net,
    combinedNetIncome: combinedNet,
    parent1IncomeShare: Math.round(p1Share * 10) / 10,
    parent2IncomeShare: Math.round(p2Share * 10) / 10,
    baseMonthlySupport: adjustedSupport,
    parent1Share: p1Obligation,
    parent2Share: p2Obligation,
    netTransfer,
    addonHealthInsurance: input.healthInsuranceMonthly,
    addonChildcare: input.childcareMonthly,
    totalPayment: Math.round(totalPayment),
    lowEarnerReceives: Math.round(lowEarnerReceives),
  };
}
