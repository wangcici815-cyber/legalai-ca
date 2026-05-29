// CalculatorAIPrompt — AI assistant prompt shown after calculation results
// Shows pre-filled questions and a CTA to ask the AI assistant

interface Props {
  calculatorType: 'child-support' | 'alimony';
  inputValues: Record<string, number | boolean | string>;
}

const questions: Record<string, { label: string; question: string }[]> = {
  'child-support': [
    {
      label: 'Modify support amount',
      question: 'What circumstances allow me to modify a child support order in California?',
    },
    {
      label: 'Self-employment income',
      question: 'How is self-employment income treated for California child support calculations?',
    },
    {
      label: 'Parent hiding income',
      question: "What can I do if the other parent is hiding their income for child support in California?",
    },
  ],
  alimony: [
    {
      label: 'Support duration',
      question: 'How long does spousal support last in California for a marriage of 10+ years?',
    },
    {
      label: 'Modify support',
      question: 'What circumstances allow modification of spousal support in California?',
    },
    {
      label: 'Cohabitation effect',
      question: 'Does cohabitation with a new partner affect spousal support in California?',
    },
  ],
};

export default function CalculatorAIPrompt({ calculatorType }: Props) {
  const items = questions[calculatorType] || [];

  if (items.length === 0) return null;

  return (
    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-5">
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">🤖</span>
        <div>
          <h4 className="text-sm font-semibold text-primary mb-1">
            Ask the AI Legal Assistant
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Your estimate gives you a general idea. State laws are complex — ask
            our AI assistant about specific factors that might affect your case:
          </p>
          <div className="space-y-2">
            {items.map((item, i) => (
              <a
                key={i}
                href={`/ai-assistant?q=${encodeURIComponent(item.question)}`}
                className="flex items-center gap-2 w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-xs text-gray-700 hover:border-accent hover:text-accent transition-all no-underline"
              >
                <span className="font-medium whitespace-nowrap">{item.label}</span>
                <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-gray-500 truncate">{item.question}</span>
              </a>
            ))}
          </div>
          <a
            href="/ai-assistant"
            className="inline-block mt-3 text-xs font-medium text-accent hover:text-blue-700 transition-colors"
          >
            Ask your own question →
          </a>
        </div>
      </div>
    </div>
  );
}
