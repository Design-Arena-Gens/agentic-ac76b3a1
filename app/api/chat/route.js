export const runtime = "edge";

function toOpenAIMessages(messages) {
  if (!Array.isArray(messages)) return [{ role: "system", content: "You are a helpful assistant." }];
  const hasSystem = messages.some(m => m.role === "system");
  const base = hasSystem ? [] : [{ role: "system", content: "You are a helpful assistant." }];
  return [
    ...base,
    ...messages
      .filter(m => m && typeof m.content === "string" && ["user","assistant","system"].includes(m.role))
      .map(m => ({ role: m.role, content: m.content }))
  ];
}

export async function POST(req) {
  try {
    const body = await req.json();
    const inputMessages = body?.messages || [];
    const messages = toOpenAIMessages(inputMessages);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          message: {
            role: "assistant",
            content: "Demo mode: set OPENAI_API_KEY to get real AI responses.",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = body?.model || "gpt-4o-mini";
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: body?.temperature ?? 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(`Upstream error: ${errText}`, { status: 500 });
    }

    const data = await response.json();
    const assistantMessage = data?.choices?.[0]?.message || { role: "assistant", content: "(no content)" };

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(`Bad request: ${err.message}`, { status: 400 });
  }
}
