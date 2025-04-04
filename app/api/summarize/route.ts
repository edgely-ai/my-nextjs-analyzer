import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { text, systemPrompt } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt || "Summarize the text." },
        { role: "user", content: text },
      ],
      temperature: 0.2,
    });

    const fullText = completion.choices?.[0]?.message?.content ?? "";

    // Extract JSON block from inside triple backticks
    const regex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = regex.exec(fullText);
    const extractedJson = match ? match[1] : "{}";

    const summary = fullText.replace(/```(?:json)?[\s\S]*?```/i, "").trim();

    let structured = {};
    try {
      structured = JSON.parse(extractedJson);
    } catch (err) {
      console.error("❌ Failed to parse extracted JSON:", err);
    }

    return NextResponse.json({ summary, structured });
  } catch (err) {
    console.error("❌ Summarization failed:", err);
    return NextResponse.json(
      { error: "Summarization failed" },
      { status: 500 }
    );
  }
}
