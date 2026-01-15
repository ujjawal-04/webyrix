import { db } from "@/config/db";
import { chatTable, frameTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

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

  // fetch chat messages
  const chatResult = await db.select().from(chatTable)
    // @ts-ignore
    .where(eq(chatTable.frameId, frameId));

  // safely handle empty chatResult
  const finalResult = {
    ...frameResult[0],
    chatMessages: chatResult.length > 0 ? chatResult[0].chatMessage : [], // fallback to empty array
  };

  return NextResponse.json(finalResult);
}
