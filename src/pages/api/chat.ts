import type { APIRoute } from 'astro';

export const prerender = false;

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

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers,
      });
    }

    // Build messages
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: 'user', content: message },
    ];

    // Call DeepSeek API
    const apiKey = import.meta.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'DEEPSEEK_API_KEY not configured' }), {
        status: 500,
        headers,
      });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.3,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `DeepSeek API error: ${errText}` }), {
        status: 502,
        headers,
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response generated.';

    return new Response(JSON.stringify({ reply }), { status: 200, headers });

  } catch (err: any) {
    console.error('Chat API error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers,
    });
  }
};
