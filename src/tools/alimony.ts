// California Alimony (Spousal Support) Estimator
// Based on common California county guidelines and Family Code §4320

export interface AlimonyInput {
  marriageDurationYears: number;
  higherEarnerMonthlyGross: number;
  lowerEarnerMonthlyGross: number;
  higherEarnerDeductions: number;
  lowerEarnerDeductions: number;
  hasChildren: boolean;
  custodyPercentHigherEarner: number; // 0-100
}

export interface AlimonyResult {
  higherEarnerNet: number;
  lowerEarnerNet: number;
  incomeDifference: number;
  estimatedMonthlySupport: number;
  estimatedDurationMonths: number;
  estimatedDurationLabel: string;
  totalEstimatedPayment: number;
  note: string;
}

/**
 * Estimate net monthly income
 */
function estimateNet(grossMonthly: number, deductions: number): number {
  const annual = grossMonthly * 12;
  const fedTax = Math.max(0, (annual - 14600)) * 0.12;
  const stateTax = annual * 0.04;
  const fica = Math.min(annual, 168800) * 0.0765;
  const totalTax = fedTax + stateTax + fica + deductions;
  return Math.round(Math.max(0, (annual - totalTax) / 12));
}

/**
 * Calculate estimated spousal support
 */
export function calculateAlimony(input: AlimonyInput): AlimonyResult {
  const higherNet = estimateNet(input.higherEarnerMonthlyGross, input.higherEarnerDeductions);
  const lowerNet = estimateNet(input.lowerEarnerMonthlyGross, input.lowerEarnerDeductions);
  const diff = higherNet - lowerNet;

  // Santa Clara guideline (commonly used): 40% of higher earner's net - 50% of lower earner's net
  const guidelineAmount = Math.round(higherNet * 0.40 - lowerNet * 0.50);

  // Cannot be negative — support can only flow from higher to lower earner
  const monthlySupport = Math.max(0, guidelineAmount);

  // Duration calculation
  // Short-term marriage (< 10 years): half the length of marriage
  // Long-term marriage (>= 10 years): indefinite (court retains jurisdiction)
  let durationMonths: number;
  let durationLabel: string;
  let note: string;

  if (input.marriageDurationYears < 10) {
    durationMonths = Math.round(input.marriageDurationYears * 6); // half the marriage in months
    durationLabel = `${Math.round(input.marriageDurationYears * 0.5 * 10) / 10} years`;
    note = 'For short-term marriages, support is typically limited to half the marriage duration.';
  } else {
    durationMonths = 120; // 10 years as a reference
    durationLabel = 'Indefinite (court retains jurisdiction)';
    note = 'For long-term marriages, the court retains jurisdiction for support. Duration depends on §4320 factors.';

    // Cap the "estimated" reference at 10 years for calculation purposes
    // The actual support may continue beyond this
  }

  const totalEstimated = monthlySupport * Math.min(durationMonths, 120); // cap display at 10 years

  return {
    higherEarnerNet: higherNet,
    lowerEarnerNet: lowerNet,
    incomeDifference: diff,
    estimatedMonthlySupport: monthlySupport,
    estimatedDurationMonths: durationMonths,
    estimatedDurationLabel: durationLabel,
    totalEstimatedPayment: totalEstimated,
    note,
  };
}
