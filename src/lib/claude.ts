import { createServiceClient } from "@/lib/supabase/admin";

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIOptions {
  system?: string;
  maxTokens?: number;
}

interface AIConfig {
  provider: string;
  model: string;
  apiKey: string;
}

async function getAIConfig(): Promise<AIConfig> {
  const supabase = createServiceClient();
  const { data: rows } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["ai_provider", "ai_model", "ai_api_key", "claude_api_key"]);

  const settings: Record<string, string> = {};
  rows?.forEach((r) => { settings[r.key] = r.value; });

  const provider = settings.ai_provider || "claude";
  const apiKey = settings.ai_api_key || settings.claude_api_key || process.env.CLAUDE_API_KEY || "";
  const model = settings.ai_model || (provider === "claude" ? "claude-sonnet-4-20250514" : provider === "openai" ? "gpt-4o" : "gemini-2.5-flash");

  if (!apiKey) throw new Error("กรุณาตั้งค่า API Key ในหน้า Admin > ตั้งค่า");

  return { provider, model, apiKey };
}

export async function askClaude(messages: AIMessage[], options: AIOptions = {}): Promise<string> {
  const config = await getAIConfig();
  const systemPrompt = options.system || "คุณเป็นผู้เชี่ยวชาญด้านการศึกษาและธุรกิจ EdTech ไทย ตอบเป็นภาษาไทยเสมอ ตอบเป็น JSON เท่านั้น ไม่ต้องมี markdown code block";

  if (config.provider === "openai") {
    return callOpenAI(config, messages, systemPrompt, options.maxTokens || 4096);
  } else if (config.provider === "gemini") {
    return callGemini(config, messages, systemPrompt, options.maxTokens || 4096);
  } else {
    return callClaude(config, messages, systemPrompt, options.maxTokens || 4096);
  }
}

async function callClaude(config: AIConfig, messages: AIMessage[], system: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: config.model, max_tokens: maxTokens, system, messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `Claude API error: ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function callOpenAI(config: AIConfig, messages: AIMessage[], system: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGemini(config: AIConfig, messages: AIMessage[], system: string, _maxTokens: number): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export function parseClaudeJSON<T>(text: string): T {
  let clean = text.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(clean);
}
