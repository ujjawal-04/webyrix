import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req:NextRequest) {
    const user = await currentUser();

    //if user already exists ?
    const userResult = await db.select().from(usersTable)
    // @ts-ignore
    .where(eq(usersTable.email,user?.primaryEmailAddress?.emailAddress));

    //if not then insert new user
     if(userResult?.length == 0) {
        const data = {
            name:user?.fullName??'NA',
             email:user?.primaryEmailAddress?.emailAddress??'',
             credits:2
        }
        const result = await db.insert(usersTable).values({
            ...data
     })
     return NextResponse.json({ user: data })
    }

    return NextResponse.json({ user: userResult[0] })
}