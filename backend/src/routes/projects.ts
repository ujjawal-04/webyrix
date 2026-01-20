import express, { Request, Response } from 'express';
import { db } from '../config/db';
import { chatTable, frameTable, projectTable, usersTable } from '../config/schema';
import { requireAuth } from '../middleware/auth';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { eq, desc, inArray } from 'drizzle-orm';

const router = express.Router();

// Helper to get user email
async function getUserEmail(userId: string) {
    const user = await clerkClient.users.getUser(userId);
    return user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;
}

// POST /api/projects (Create Project)
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { projectId, frameId, messages, credits } = req.body;
        const { userId } = req.auth;
        const email = await getUserEmail(userId);

        if (!email) {
            res.status(400).json({ error: 'User email not found' });
            return;
        }

        // Check if user has unlimited plan (Need to verify how 'has' works in Clerk Node SDK or store in DB)
        // For now, let's assume standard credits logic or check metadata if available
        // The original code used `auth().has({ plan: 'unlimited' })`. 
        // In Node SDK, we might check `req.auth.sessionClaims` or user metadata.
        // Simplified: Check if user metadata has plan?? For now, sticking to credit deduction.
        const hasUnlimitedAccess = false; // TODO: Implement Plan Verification

        // Create project
        await db.insert(projectTable).values({
            projectId: projectId,
            createdBy: email
        });

        // Create frame
        await db.insert(frameTable).values({
            frameId: frameId,
            projectId: projectId,
        });

        // Save user messages
        await db.insert(chatTable).values({
            chatMessage: messages,
            createdBy: email,
            frameId: frameId,
        });

        // Update user credits
        if (!hasUnlimitedAccess) {
            await db.update(usersTable).set({
                credits: credits - 1
                //@ts-ignore
            }).where(eq(usersTable.email, email));
        }

        res.json({ projectId, frameId, messages });
    } catch (error) {
        console.error('Error in POST /api/projects:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/projects (Get All Projects) - Migrated from get-all-projects
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth;
        const email = await getUserEmail(userId);

        if (!email) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const projects = await db
            .select()
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.createdBy, email))
            .orderBy(desc(projectTable.id));

        let results: any[] = [];

        for (const project of projects) {
            const frames = await db
                .select({ frameId: frameTable.frameId })
                .from(frameTable)
                // @ts-ignore
                .where(eq(frameTable.projectId, project.projectId));

            const frameIds = frames.map((f: any) => f.frameId);
            let chats: any[] = [];

            if (frameIds.length > 0) {
                chats = await db
                    .select()
                    .from(chatTable)
                    .where(inArray(chatTable.frameId, frameIds));
            }

            for (const frame of frames) {
                results.push({
                    projectId: project.projectId ?? "",
                    frameId: frame.frameId ?? "",
                    chats: chats.filter((c) => c.frameId === frame.frameId),
                });
            }
        }

        res.json(results);

    } catch (error) {
        console.error('Error in GET /api/projects:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
