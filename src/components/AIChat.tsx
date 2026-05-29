import { useState, useRef, useEffect, type FormEvent } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DAILY_LIMIT = 20;

const EXAMPLE_QUESTIONS = [
  'How is child support calculated in California?',
  'What are the residency requirements for divorce in CA?',
  'How long does spousal support last in California?',
  'What are my rights as a tenant in California?',
  'How do I file for divorce without a lawyer in CA?',
  'What is the difference between community property and separate property?',
];

function getDailyCount(): number {
  try {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('legalai-chat-count');
    if (stored) {
      const { date, count } = JSON.parse(stored);
      if (date === today) return count;
    }
  } catch { /* ignore */ }
  return 0;
}

function setDailyCount(count: number) {
  try {
    localStorage.setItem('legalai-chat-count', JSON.stringify({
      date: new Date().toDateString(),
      count,
    }));
  } catch { /* ignore */ }
}

function formatMessage(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyCount, setDailyCountState] = useState(getDailyCount);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialQuestionSet = useRef(false);

  useEffect(() => {
    // Auto-fill question from URL ?q= parameter (once on mount)
    if (!initialQuestionSet.current) {
      initialQuestionSet.current = true;
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        setInput(q);
        inputRef.current?.focus();
      }
    }
  }, []);

  useEffect(() => {
    // Scroll messages container only (not the whole page)
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  function fillExample(question: string) {
    setInput(question);
    inputRef.current?.focus();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (dailyCount >= DAILY_LIMIT) {
      setError(`You've used ${DAILY_LIMIT} free questions today. Come back tomorrow for more!`);
      return;
    }

    const userMessage: Message = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setDailyCountState((c) => {
        const newCount = c + 1;
        setDailyCount(newCount);
        return newCount;
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[600px] border border-gray-200 rounded-xl bg-white shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <h3 className="font-semibold text-[#1B3A5C]">AI Legal Assistant</h3>
        <p className="text-xs text-gray-500 mt-1">
          Ask questions about California law. {dailyCount}/{DAILY_LIMIT} questions used today.
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !error && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-4xl mb-3">⚖️</p>
            <p className="text-sm font-medium text-gray-600">Ask a question about California law</p>
            <p className="text-xs mt-1 mb-6">Choose an example below or type your own question.</p>
            <div className="flex flex-wrap justify-center gap-2 px-4">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => fillExample(q)}
                  className="px-3 py-2 text-xs text-left text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-[#2E86DE] hover:text-[#2E86DE] transition-colors cursor-pointer max-w-[280px]"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#2E86DE] text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 text-sm text-gray-500">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about California law..."
            disabled={isLoading || dailyCount >= DAILY_LIMIT}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86DE] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || dailyCount >= DAILY_LIMIT}
            className="px-6 py-3 bg-[#2E86DE] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
