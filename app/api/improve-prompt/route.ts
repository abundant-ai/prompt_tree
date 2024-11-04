import { NextResponse } from "next/server";
import OpenAI from "openai";
import { PromptNode, GPTOption, Change } from "@/app/types/types";
import { XMLParser } from "fast-xml-parser";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 300;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const parser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
});

interface GPTResult {
  options: {
    option: {
      text?: string;
      analysis?: string;
      changes?: {
        change: Change[] | Change;
      };
    };
  };
}

function parseGPTResponse(xmlContent: string): PromptNode[] {
  console.info("Starting to parse GPT response", {
    preview: xmlContent.substring(0, 200) + "...",
  });
  try {
    const wrappedContent = xmlContent.includes("<result>")
      ? xmlContent
      : `<result>${xmlContent}</result>`;

    console.log("Attempting to parse XML content");
    const parsed = parser.parse(wrappedContent);
    console.log("Parsed XML structure:", JSON.stringify(parsed, null, 2));

    // Handle both array and single result cases
    const results = Array.isArray(parsed.result)
      ? parsed.result
      : [parsed.result];

    // Collect all options from all results
    const allOptions = results.flatMap((result: GPTResult) => {
      const options = result.options.option;
      return Array.isArray(options) ? options : [options];
    });

    console.log("Extracted options:", allOptions);

    const improvements = allOptions.filter(
      (opt: GPTOption) =>
        opt.id !== "original" &&
        opt.id !== "implementation" &&
        opt.id !== "verification"
    );

    console.log("Filtered improvements:", improvements);

    const result = improvements.map((improvement: GPTOption) => ({
      id: uuidv4(),
      parentId: null,
      text: improvement.text || "",
      analysis: improvement.analysis || "",
      changes: improvement.changes?.change
        ? Array.isArray(improvement.changes.change)
          ? improvement.changes.change
          : [improvement.changes.change]
        : [],
      feedback: [], // Start with empty feedback for new nodes
      createdAt: new Date(),
    }));

    console.log("Final parsed improvements:", result);
    return result;
  } catch (error) {
    console.error("Error parsing GPT response:", { error, xmlContent });
    return [];
  }
}

export async function POST(request: Request) {
  console.info("Received improve prompt request");
  try {
    const { prompt, feedback, metaprompt } = await request.json();
    console.log("Request data:", {
      prompt: prompt,
      feedbackCount: feedback?.length,
      metapromptLength: metaprompt.length,
    });

    console.log("Calling OpenAI API...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: metaprompt,
        },
        {
          role: "user",
          content: `Please improve the following prompt based on this feedback: ${JSON.stringify(
            feedback
          )}\n\nPrompt: ${prompt}\n\nProvide exactly 3 different improved versions.`,
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    console.log("Received GPT response:", response);

    if (!response) {
      throw new Error("No response from GPT");
    }

    const improvements = parseGPTResponse(response);
    console.log("Sending back improvements:", improvements);

    return NextResponse.json(improvements);
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "Failed to improve prompt" },
      { status: 500 }
    );
  }
}
