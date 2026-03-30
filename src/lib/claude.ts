import { createServiceClient } from "@/lib/supabase/admin";

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeOptions {
  system?: string;
  maxTokens?: number;
}

async function getClaudeApiKey(): Promise<string> {
  // Try DB settings first, then env var
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "claude_api_key")
      .maybeSingle();
    if (data?.value) return data.value;
  } catch {
    // DB not available, fall through
  }

  if (process.env.CLAUDE_API_KEY) return process.env.CLAUDE_API_KEY;

  throw new Error("กรุณาตั้งค่า Claude API Key ในหน้า Admin > ตั้งค่า");
}

export async function askClaude(messages: ClaudeMessage[], options: ClaudeOptions = {}): Promise<string> {
  const apiKey = await getClaudeApiKey();

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: options.maxTokens || 4096,
      system: options.system || "คุณเป็นผู้เชี่ยวชาญด้านการศึกษาและธุรกิจ EdTech ไทย ตอบเป็นภาษาไทยเสมอ ตอบเป็น JSON เท่านั้น ไม่ต้องมี markdown code block",
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `Claude API error: ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

export function parseClaudeJSON<T>(text: string): T {
  let clean = text.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(clean);
}
