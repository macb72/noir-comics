const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

function getProvider() {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (openaiKey && openaiKey !== 'your_openai_api_key_here' && openaiKey.length > 10) {
    return { provider: 'openai', key: openaiKey };
  }
  if (openrouterKey && openrouterKey !== 'your_openrouter_api_key_here' && openrouterKey.length > 10) {
    return { provider: 'openrouter', key: openrouterKey };
  }
  return null;
}

export function isLLMAvailable() {
  return getProvider() !== null;
}

export async function callLLM(messages, { temperature = 0.7, maxTokens = 3000 } = {}) {
  const provider = getProvider();
  if (!provider) return null;

  try {
    if (provider.provider === 'openai') {
      return await callOpenAI(messages, provider.key, temperature, maxTokens);
    }
    return await callOpenRouter(messages, provider.key, temperature, maxTokens);
  } catch (err) {
    console.error(`LLM call failed (${provider.provider}):`, err.message);
    return null;
  }
}

async function callOpenAI(messages, key, temperature, maxTokens) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`OpenAI ${res.status}: ${err.substring(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

async function callOpenRouter(messages, key, temperature, maxTokens) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Noir Comics Generator',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-maverick:free',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${err.substring(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}
