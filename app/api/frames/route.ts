import { db } from "@/config/db";
import { chatTable, frameTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const frameId = searchParams.get('frameId');
  const projectId = searchParams.get('projectId');

  if (!frameId || !projectId) {
    return NextResponse.json(
      { error: "Missing frameId or projectId" },
      { status: 400 }
    );
  }

  // fetch frame
  const frameResult = await db.select().from(frameTable)
    // @ts-ignore
    .where(eq(frameTable.frameId, frameId));

  if (!frameResult[0]) {
    return NextResponse.json(
      { error: "Frame not found" },
      { status: 404 }
    );
  }

  // fetch chat messages for this frame only
  const chatResult = await db.select().from(chatTable)
    // @ts-ignore
    .where(eq(chatTable.frameId, frameId));

  // chatMessage is an array in each row, flatten all arrays into one, and filter out null/undefined
  const chatMessages = chatResult
    .flatMap((msg) => Array.isArray(msg.chatMessage) ? msg.chatMessage : [msg.chatMessage])
    .filter((msg) => msg && msg.role && msg.content);

  const finalResult = {
    ...frameResult[0],
    chatMessages, // always an array
  };

  return NextResponse.json(finalResult);
}

export async function PUT(req:NextRequest) {
   const { designCode, frameId, projectId } = await req.json();

   const result = await db.update(frameTable).set({
    designCode: designCode
   }).where(and(eq(frameTable.frameId,frameId), eq(frameTable.projectId, projectId)));

   return NextResponse.json({ result: 'Updated!' });
}
