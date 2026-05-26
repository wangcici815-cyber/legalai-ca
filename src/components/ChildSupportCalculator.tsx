import { useState, type FormEvent } from 'react';
import { calculateChildSupport, type ChildSupportInput, type ChildSupportResult } from '../tools/child-support';

const defaultInput: ChildSupportInput = {
  parent1MonthlyGross: 8000,
  parent2MonthlyGross: 4000,
  parent1TimesharePercent: 50,
  numChildren: 2,
  healthInsuranceMonthly: 200,
  childcareMonthly: 500,
  parent1TaxDeductions: 500,
  parent2TaxDeductions: 200,
};

export default function ChildSupportCalculator() {
  const [input, setInput] = useState<ChildSupportInput>(defaultInput);
  const [result, setResult] = useState<ChildSupportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (input.parent1MonthlyGross < 0 || input.parent2MonthlyGross < 0) {
      setError('Income values cannot be negative.');
      return;
    }
    if (input.parent1TimesharePercent < 0 || input.parent1TimesharePercent > 100) {
      setError('Timeshare must be between 0 and 100%.');
      return;
    }
    if (input.numChildren < 1 || input.numChildren > 10) {
      setError('Number of children must be between 1 and 10.');
      return;
    }

    const calcResult = calculateChildSupport(input);
    setResult(calcResult);
  }

  function formatUSD(amount: number): string {
    return `$${amount.toLocaleString('en-US')}`;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parent 1 Income */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-primary px-2">Parent 1 (you can assign either parent)</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="calc-label" htmlFor="p1Gross">Monthly Gross Income ($)</label>
              <input
                id="p1Gross"
                className="calc-input"
                type="number"
                min="0"
                step="100"
                value={input.parent1MonthlyGross}
                onChange={(e) => setInput({ ...input, parent1MonthlyGross: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="calc-label" htmlFor="p1Deductions">Monthly Tax & Deductions ($)</label>
              <input
                id="p1Deductions"
                className="calc-input"
                type="number"
                min="0"
                step="100"
                value={input.parent1TaxDeductions}
                onChange={(e) => setInput({ ...input, parent1TaxDeductions: Number(e.target.value) })}
              />
            </div>
          </div>
        </fieldset>

        {/* Parent 2 Income */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-primary px-2">Parent 2</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="calc-label" htmlFor="p2Gross">Monthly Gross Income ($)</label>
              <input
                id="p2Gross"
                className="calc-input"
                type="number"
                min="0"
                step="100"
                value={input.parent2MonthlyGross}
                onChange={(e) => setInput({ ...input, parent2MonthlyGross: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="calc-label" htmlFor="p2Deductions">Monthly Tax & Deductions ($)</label>
              <input
                id="p2Deductions"
                className="calc-input"
                type="number"
                min="0"
                step="100"
                value={input.parent2TaxDeductions}
                onChange={(e) => setInput({ ...input, parent2TaxDeductions: Number(e.target.value) })}
              />
            </div>
          </div>
        </fieldset>

        {/* Other inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="calc-label" htmlFor="timeshare">Parent 1 Timeshare (%)</label>
            <input
              id="timeshare"
              className="calc-input"
              type="number"
              min="0"
              max="100"
              step="5"
              value={input.parent1TimesharePercent}
              onChange={(e) => setInput({ ...input, parent1TimesharePercent: Number(e.target.value) })}
            />
            <p className="text-xs text-gray-500 mt-1">% of time child spends with Parent 1</p>
          </div>
          <div>
            <label className="calc-label" htmlFor="numChildren">Number of Children</label>
            <select
              id="numChildren"
              className="calc-input"
              value={input.numChildren}
              onChange={(e) => setInput({ ...input, numChildren: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="calc-label" htmlFor="childcare">Monthly Childcare ($)</label>
            <input
              id="childcare"
              className="calc-input"
              type="number"
              min="0"
              step="50"
              value={input.childcareMonthly}
              onChange={(e) => setInput({ ...input, childcareMonthly: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="text-center">
          <button type="submit" className="btn-primary text-lg px-10">
            Calculate Child Support
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </form>

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-primary">Estimated Child Support</h3>

          <div className="calc-result">
            <p className="text-3xl font-bold text-accent">
              {formatUSD(result.totalPayment)}<span className="text-base font-normal text-gray-500">/month</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Estimated total payment from higher earner to lower earner
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="calc-result">
              <p className="text-sm text-gray-500">Parent 1 Net Monthly Income</p>
              <p className="text-xl font-semibold">{formatUSD(result.parent1NetIncome)}</p>
            </div>
            <div className="calc-result">
              <p className="text-sm text-gray-500">Parent 2 Net Monthly Income</p>
              <p className="text-xl font-semibold">{formatUSD(result.parent2NetIncome)}</p>
            </div>
            <div className="calc-result">
              <p className="text-sm text-gray-500">Combined Net Income</p>
              <p className="text-xl font-semibold">{formatUSD(result.combinedNetIncome)}</p>
            </div>
            <div className="calc-result">
              <p className="text-sm text-gray-500">Income Share (P1 / P2)</p>
              <p className="text-xl font-semibold">{result.parent1IncomeShare}% / {result.parent2IncomeShare}%</p>
            </div>
          </div>

          <div className="calc-result">
            <h4 className="font-semibold text-primary mb-3">Detailed Breakdown</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">Base Monthly Support (Guideline)</td>
                  <td className="py-2 text-right font-medium">{formatUSD(result.baseMonthlySupport)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">Parent 1 Share</td>
                  <td className="py-2 text-right font-medium">{formatUSD(result.parent1Share)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">Parent 2 Share</td>
                  <td className="py-2 text-right font-medium">{formatUSD(result.parent2Share)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">Health Insurance (monthly)</td>
                  <td className="py-2 text-right font-medium">{formatUSD(result.addonHealthInsurance)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Childcare (monthly)</td>
                  <td className="py-2 text-right font-medium">{formatUSD(result.addonChildcare)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 italic">
            This is an estimate based on the California Guideline formula (Family Code §4055).
            Actual support ordered by a court may differ. Consult a licensed attorney for your specific case.
          </p>
        </div>
      )}
    </div>
  );
}
