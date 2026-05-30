// Cloudflare Pages Function — AI Chat Proxy
// Handles requests from the frontend, calls DeepSeek API, returns response

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

interface ChatResponse {
  reply: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are a California legal information assistant. Your purpose is to provide general legal information about California state law only.

## Rules
1. ONLY answer questions about California state law (family law, divorce, child support, spousal support, landlord-tenant, wills & estates, workers' compensation, small claims).
2. If asked about other states' laws or federal law, politely explain you can only answer about California.
3. If asked for legal advice ("should I...", "what's best for me..."), explain you can only provide general information and recommend consulting a licensed California attorney.
4. Always cite relevant California code sections when possible (e.g., Family Code §4320).
5. Be clear, concise, and use plain language.
6. At the start of each response, include: "**Disclaimer**: This is general information, not legal advice."
7. At the end of each response, include: "For your specific situation, consult a licensed California attorney."
8. If you don't know the answer, say so — don't make up information.
9. Keep responses to 2-4 paragraphs unless more detail is specifically requested.
10. When applicable, suggest using the website's calculators (child support, alimony) or relevant guides.`;

async function callDeepSeek(messages: ChatMessage[], apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('DEEPSEEKKEY is not configured');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages,
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 1024,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${errText}`);
  }

  const data = await response.json() as any;
  return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}

// Extract rate limit info from localStorage on the client side
// Server-side: basic IP-based rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 50; // requests per window
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function onRequest(context: { request: Request; env: Record<string, string> }): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS (CORS preflight)
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Only accept POST
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers,
    });
  }

  try {
    const body = await context.request.json() as ChatRequest;

    if (!body.message || typeof body.message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers,
      });
    }

    // Simple rate limiting
    const clientIp = context.request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.',
      }), {
        status: 429,
        headers,
      });
    }

    // Build messages array
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(body.history || []).slice(-10), // Keep last 10 messages for context
      { role: 'user', content: body.message },
    ];

    // Read API key from Cloudflare env (context.env)
    const apiKey = context.env.DEEPSEEKKEY;
    const reply = await callDeepSeek(messages, apiKey);

    const response: ChatResponse = { reply };
    return new Response(JSON.stringify(response), { status: 200, headers });

  } catch (err: any) {
    console.error('AI Chat error:', err);

    const response: ChatResponse = {
      reply: '',
      error: err.message || 'An unexpected error occurred. Please try again.',
    };

    return new Response(JSON.stringify(response), {
      status: err.message?.includes('API key') ? 500 : 500,
      headers,
    });
  }
}
