import { NextRequest, NextResponse } from "next/server";
// IMPORTANT: Now we import the default OpenAI class:
import OpenAI from 'openai';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Create the OpenAI client:
    const openai = new OpenAI({ apiKey });

    // Call the Chat Completion endpoint:
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You summarize sanitized bank statements into a balance sheet.",
        },
        { role: "user", content: `Summarize the following text:\n${text}` },
      ],
      temperature: 0.7,
    });

    // Extract the result:
    const result = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ summary: result });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json(
      { error: "OpenAI request failed" },
      { status: 500 }
    );
  }
}