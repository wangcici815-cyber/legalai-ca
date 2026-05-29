import { useState, type FormEvent } from 'react';
import { calculateAlimony, type AlimonyInput, type AlimonyResult } from '../tools/alimony';
import CalculatorAIPrompt from './CalculatorAIPrompt';

const defaultInput: AlimonyInput = {
  marriageDurationYears: 10,
  higherEarnerMonthlyGross: 12000,
  lowerEarnerMonthlyGross: 3000,
  higherEarnerDeductions: 800,
  lowerEarnerDeductions: 200,
  hasChildren: true,
  custodyPercentHigherEarner: 50,
};

export default function AlimonyEstimator() {
  const [input, setInput] = useState<AlimonyInput>(defaultInput);
  const [result, setResult] = useState<AlimonyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (input.marriageDurationYears < 0 || input.marriageDurationYears > 60) {
      setError('Marriage duration must be between 0 and 60 years.');
      return;
    }

    const calcResult = calculateAlimony(input);
    setResult(calcResult);
  }

  function formatUSD(amount: number): string {
    return `$${amount.toLocaleString('en-US')}`;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="text-sm font-semibold text-primary px-2">Higher Earner</legend>
            <div className="space-y-3 mt-3">
              <div>
                <label className="calc-label" htmlFor="heGross">Monthly Gross Income ($)</label>
                <input
                  id="heGross"
                  className="calc-input"
                  type="number"
                  min="0"
                  step="100"
                  value={input.higherEarnerMonthlyGross}
                  onChange={(e) => setInput({ ...input, higherEarnerMonthlyGross: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="calc-label" htmlFor="heDeductions">Monthly Tax & Deductions ($)</label>
                <input
                  id="heDeductions"
                  className="calc-input"
                  type="number"
                  min="0"
                  step="100"
                  value={input.higherEarnerDeductions}
                  onChange={(e) => setInput({ ...input, higherEarnerDeductions: Number(e.target.value) })}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="text-sm font-semibold text-primary px-2">Lower Earner</legend>
            <div className="space-y-3 mt-3">
              <div>
                <label className="calc-label" htmlFor="leGross">Monthly Gross Income ($)</label>
                <input
                  id="leGross"
                  className="calc-input"
                  type="number"
                  min="0"
                  step="100"
                  value={input.lowerEarnerMonthlyGross}
                  onChange={(e) => setInput({ ...input, lowerEarnerMonthlyGross: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="calc-label" htmlFor="leDeductions">Monthly Tax & Deductions ($)</label>
                <input
                  id="leDeductions"
                  className="calc-input"
                  type="number"
                  min="0"
                  step="100"
                  value={input.lowerEarnerDeductions}
                  onChange={(e) => setInput({ ...input, lowerEarnerDeductions: Number(e.target.value) })}
                />
              </div>
            </div>
          </fieldset>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="calc-label" htmlFor="marriageYears">Duration of Marriage (years)</label>
            <input
              id="marriageYears"
              className="calc-input"
              type="number"
              min="0"
              max="60"
              step="0.5"
              value={input.marriageDurationYears}
              onChange={(e) => setInput({ ...input, marriageDurationYears: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="calc-label" htmlFor="custodyPct">Higher Earner's Custody (%)</label>
            <input
              id="custodyPct"
              className="calc-input"
              type="number"
              min="0"
              max="100"
              step="5"
              value={input.custodyPercentHigherEarner}
              onChange={(e) => setInput({ ...input, custodyPercentHigherEarner: Number(e.target.value) })}
            />
            <p className="text-xs text-gray-500 mt-1">Only relevant if children are involved</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="hasChildren"
            type="checkbox"
            checked={input.hasChildren}
            onChange={(e) => setInput({ ...input, hasChildren: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
          />
          <label htmlFor="hasChildren" className="text-sm text-gray-700">Minor children from this marriage</label>
        </div>

        <div className="text-center">
          <button type="submit" className="btn-primary text-lg px-10">
            Estimate Alimony
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
          <h3 className="text-xl font-semibold text-primary">Estimated Spousal Support</h3>

          <div className="calc-result">
            <p className="text-3xl font-bold text-accent">
              {formatUSD(result.estimatedMonthlySupport)}<span className="text-base font-normal text-gray-500">/month</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Estimated monthly spousal support (Santa Clara guideline)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="calc-result">
              <p className="text-sm text-gray-500">Higher Earner Net Income</p>
              <p className="text-xl font-semibold">{formatUSD(result.higherEarnerNet)}</p>
            </div>
            <div className="calc-result">
              <p className="text-sm text-gray-500">Lower Earner Net Income</p>
              <p className="text-xl font-semibold">{formatUSD(result.lowerEarnerNet)}</p>
            </div>
            <div className="calc-result">
              <p className="text-sm text-gray-500">Income Difference</p>
              <p className="text-xl font-semibold">{formatUSD(result.incomeDifference)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="calc-result">
              <p className="text-sm text-gray-500">Estimated Duration</p>
              <p className="text-xl font-semibold">{result.estimatedDurationLabel}</p>
            </div>
            <div className="calc-result">
              <p className="text-sm text-gray-500">Total Estimated (5-year reference)</p>
              <p className="text-xl font-semibold">{formatUSD(result.totalEstimatedPayment)}</p>
            </div>
          </div>

          {/* Note for long-term marriages */}
          {input.marriageDurationYears >= 10 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> For marriages of 10 years or more, the court retains
                jurisdiction for spousal support. This means support could continue beyond the
                estimated duration shown above, depending on the factors in Family Code §4320.
              </p>
            </div>
          )}

          {/* AI Prompt */}
          <CalculatorAIPrompt calculatorType="alimony" inputValues={{}} />

          <p className="text-xs text-gray-500 italic">
            This is an estimate based on common California county guidelines.
            Actual spousal support ordered by a court depends on the 12 factors in Family Code §4320.
            Consult a licensed attorney for your specific case.
          </p>
        </div>
      )}
    </div>
  );
}
