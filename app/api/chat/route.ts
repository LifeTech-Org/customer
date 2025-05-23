// For App Router
// app/api/chat/route.ts
import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { getSupportBySessionId } from "@/app/func/support";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = (name: string) => `
Hey — welcome to Kali Supplements! I’m ${name}. Before we get started, what’s your name, age, and where are you from?
`;

export async function POST(req: Request) {
  const { message, sessionId } = await req.json();
  console.log("start");
  let threadId = sessionId;

  // If no sessionId, create a new thread and include system prompt
  if (!threadId) {
    const thread = await openai.beta.threads.create();
    threadId = thread.id;

    await openai.beta.threads.messages.create(threadId, {
      role: "assistant",
      content: SYSTEM_PROMPT(
        getSupportBySessionId(thread.id.split("_")[1]).name
      ),
    });

    return NextResponse.json({
      sessionId: threadId.split("_")[1],
    });
  }

  threadId = `thread_${sessionId}`;

  // Add user's message to the thread
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });
  console.log("thread create");
  // Run the assistant on this thread
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: process.env.OPENAI_ASSISTANT_ID!,
  });
  console.log("run start");
  // Wait for the assistant to finish
  let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  console.log(runStatus);
  while (runStatus.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }
  console.log("run finish");
  // Get the latest messages
  const messages = await openai.beta.threads.messages.list(threadId);

  const latestReply = messages.data.find((msg) => msg.role === "assistant")
    ?.content?.[0];

  // Assert that the message has a 'text' property
  const responseText =
    (latestReply as { text: { value: string } })?.text?.value ??
    "Sorry, something went wrong.";

  return NextResponse.json({
    reply: responseText,
    sessionId: threadId.split("_")[1],
  });
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  try {
    const messages = await openai.beta.threads.messages.list(
      `thread_${sessionId}`
    );

    const parsed = messages.data
      .reverse() // Chronological order
      .map((msg) => ({
        type: msg.role === "user" ? "user" : "assistant",
        text: msg.content[0]?.type === "text" ? msg.content[0].text.value : "",
      }));

    return NextResponse.json({ messages: parsed });
  } catch (err: any) {
    console.error("Error fetching messages:", err);
    return NextResponse.json(
      { error: "Could not fetch messages" },
      { status: 500 }
    );
  }
}
