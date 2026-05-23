import { NextRequest, NextResponse } from "next/server";

function getEndpoint(apiKey: string) {
  if (apiKey.startsWith("sk-or-")) {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      model: "openai/gpt-4o-mini",
      extraHeaders: { "HTTP-Referer": "https://ceo-dashboard-sep-thuan.vercel.app", "X-Title": "CEO Dashboard" } as Record<string, string>,
    };
  }
  return { url: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini", extraHeaders: {} as Record<string, string> };
}

export async function POST(req: NextRequest) {
  try {
    const { message, context, locale, history } = await req.json();

    const apiKey = req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "no_key" }, { status: 503 });
    }

    const { url, model, extraHeaders } = getEndpoint(apiKey);

    const systemPrompt = `You are a personal AI assistant for Sếp Thuần (Boss Thuan), a CEO who is also a student.
${context}

Your role:
- Help manage HR tasks, study plans, and financial analysis
- Provide TOEIC study tips and vocabulary help
- Give smart business and investment advice
- Be concise, practical, and friendly
- Respond in ${locale === "vi" ? "Vietnamese (Tiếng Việt)" : "English"}
- Address the user as "Sếp" or "Boss Thuan"
- Use emojis sparingly for friendliness`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message },
    ];

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify({ model, messages, stream: true, temperature: 0.7, max_tokens: 1000 }),
    });

    if (!response.ok) {
      if (response.status === 401) return NextResponse.json({ error: "invalid_key" }, { status: 401 });
      if (response.status === 429) return NextResponse.json({ error: "quota_exceeded" }, { status: 429 });
      return NextResponse.json({ error: "api_error" }, { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) { controller.close(); return; }

        while (true) {
          const { done, value } = await reader.read();
          if (done) { controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n")); break; }
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                const text = data.choices?.[0]?.delta?.content || "";
                if (text) controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
              } catch {}
            }
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch {
    return NextResponse.json({ error: "api_error" }, { status: 500 });
  }
}
