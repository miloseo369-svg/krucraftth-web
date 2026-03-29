const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeOptions {
  system?: string;
  maxTokens?: number;
}

export async function askClaude(messages: ClaudeMessage[], options: ClaudeOptions = {}): Promise<string> {
  if (!CLAUDE_API_KEY) throw new Error("CLAUDE_API_KEY not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CLAUDE_API_KEY,
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
  const text = data.content?.[0]?.text || "";
  return text;
}

export function parseClaudeJSON<T>(text: string): T {
  // Strip markdown code blocks if present
  let clean = text.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(clean);
}
