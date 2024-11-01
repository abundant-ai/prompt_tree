import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Improvement {
  text: string;
  analysis: string;
}

export async function POST(request: Request) {
  try {
    const {
      initialPrompt,
      improvements,
    }: {
      initialPrompt: string;
      improvements: Improvement[];
    } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Generate a 2-5 word title that captures what this prompt chain accomplishes. Return only the title in title case. Do not include any other text or quotes.",
        },
        {
          role: "user",
          content: `Generate a name for a prompt improvement chain. The initial prompt is: "${initialPrompt}". The chain has ${
            improvements.length
          } improvements focusing on: ${improvements
            .map((imp) => imp.analysis)
            .join(", ")}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 30,
    });

    const name = completion.choices[0].message.content?.trim();
    return NextResponse.json({ name });
  } catch (error) {
    console.error("Error generating chain name:", error);
    return NextResponse.json(
      { error: "Failed to generate chain name" },
      { status: 500 }
    );
  }
}
