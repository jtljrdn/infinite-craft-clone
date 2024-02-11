import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const element1 = params.get("element1");
  const element2 = params.get("element2");
  if (!element1 || !element2) {
    return NextResponse.json(
      { erorr: "Missing element1 or element2" },
      { status: 400 }
    );
  }
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
  });
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `TASK: Combine ${element1} and ${element2} to create a new element. Try to keep the element as simple and realistic as possible and only 1 word if possible as well. If two basic elements are combined, you should prioritize making a new thing out of that, rather than simply combining the words. Example: Earth + Earth = Solar System. You are allowed to use one of the inputs as the output, but only if there are no realistic elements. Two of the same item should output a larger version of that item if applicable. Your response should be the name of the new element and MUST contain one and only one emoji to represent the element. The response should never have less than or more than 1 emoji. Example: Fire + Water = 💨 Steam. Your output should be in json format to be parsed. Format: {new_element: "name", emoji: "emoji"}`,
      },
    ],
  });
  console.log(chatCompletion.choices[0].message.content);
  const response = chatCompletion.choices[0].message.content;
  if (response) {
    const { new_element, emoji } = JSON.parse(response);
    return NextResponse.json(
      {
        emoji: emoji,
        name: new_element,
      },
      { status: 200 }
    );
  }
  return NextResponse.json(
    { error: "Failed to create new element" },
    { status: 500 }
  );
}
