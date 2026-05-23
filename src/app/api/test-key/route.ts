import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "no_key" });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 5,
      }),
    });

    if (res.status === 401) return NextResponse.json({ ok: false, error: "invalid_key" });
    if (res.status === 429) return NextResponse.json({ ok: false, error: "quota_exceeded" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json({ ok: false, error: body?.error?.message || "api_error" });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "network_error" });
  }
}
