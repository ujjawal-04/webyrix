import { db } from "@/config/db";
import { chatTable, frameTable, projectTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
   const {projectId, frameId,messages} = await req.json();
   const user = await currentUser();

   //create project
   const projectResult = await db.insert(projectTable).values({
    projectId: projectId,
    createdBy: user?.primaryEmailAddress?.emailAddress
   })

   //create frame
   const frameResult = await db.insert(frameTable).values({
    frameId: frameId,
    projectId: projectId,
   })

   //save user Messages
   const chatResult = await db.insert(chatTable).values({
    chatMessage: messages,
    createdBy: user?.primaryEmailAddress?.emailAddress,
    frameId: frameId, 
   })

   return NextResponse.json({projectId, frameId, messages});
}