import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, context, locale, history } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 503 });
    }

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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, stream: true, temperature: 0.7, max_tokens: 1000 }),
    });

    if (!response.ok) throw new Error("OpenAI API error");

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) { controller.close(); return; }

        while (true) {
          const { done, value } = await reader.read();
          if (done) { controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n")); break; }
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
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
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
