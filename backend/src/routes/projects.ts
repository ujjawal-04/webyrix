import express, { Request, Response } from 'express';
import { db } from '../config/db';
import { chatTable, frameTable, projectTable, usersTable } from '../config/schema';
import { requireAuth, requireProjectOwnership, optionalAuth } from '../middleware/auth';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { eq, desc, inArray } from 'drizzle-orm';
import { getUserEmail, formatErrorResponse, formatSuccessResponse } from '../utils/helpers';
import { validateProjectId } from '../middleware/validation';

const router = express.Router();

// Helper to get user email
async function getEmailFromUserId(userId: string) {
    const user = await clerkClient.users.getUser(userId);
    return user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;
}

// POST /api/projects (Create Project)
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { projectId, frameId, messages, credits, description } = req.body;
        const { userId } = req.auth;
        const email = await getEmailFromUserId(userId);

        if (!email) {
            res.status(400).json(formatErrorResponse('User email not found', 'VALIDATION_ERROR'));
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
            description: description || null,
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

        res.json(formatSuccessResponse({ projectId, frameId, messages }, 'Project created successfully'));
    } catch (error) {
        console.error('Error in POST /api/projects:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// GET /api/projects (Get All Projects) - Migrated from get-all-projects
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth;
        const email = await getEmailFromUserId(userId);

        if (!email) {
            res.status(401).json(formatErrorResponse('Unauthorized', 'UNAUTHORIZED'));
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

        res.json(formatSuccessResponse(results, 'Projects retrieved successfully'));

    } catch (error) {
        console.error('Error in GET /api/projects:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// GET /api/projects/:projectId (Get Single Project)
router.get('/:projectId', optionalAuth, requireProjectOwnership, async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        // Get project
        const project = await db
            .select()
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, projectId))
            .limit(1);

        if (project.length === 0) {
            res.status(404).json(formatErrorResponse('Project not found', 'NOT_FOUND'));
            return;
        }

        // Get all frames for this project
        const frames = await db
            .select()
            .from(frameTable)
            // @ts-ignore
            .where(eq(frameTable.projectId, projectId));

        // Get all chats for these frames
        const frameIds = frames.map(f => f.frameId).filter((id): id is string => id !== null);
        let chats: any[] = [];

        if (frameIds.length > 0) {
            chats = await db
                .select()
                .from(chatTable)
                .where(inArray(chatTable.frameId, frameIds));
        }

        const result = {
            ...project[0],
            frames: frames.map(frame => ({
                ...frame,
                chats: chats.filter(c => c.frameId === frame.frameId)
            }))
        };

        res.json(formatSuccessResponse(result, 'Project retrieved successfully'));
    } catch (error) {
        console.error('Error in GET /api/projects/:projectId:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// PUT /api/projects/:projectId (Update Project)
router.put('/:projectId', requireAuth, requireProjectOwnership, async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { description, isPublic } = req.body;

        const updateData: any = {};
        if (description !== undefined) updateData.description = description;
        if (isPublic !== undefined) updateData.isPublic = isPublic;

        if (Object.keys(updateData).length === 0) {
            res.status(400).json(formatErrorResponse('No fields to update', 'VALIDATION_ERROR'));
            return;
        }

        // Update project
        await db.update(projectTable)
            .set(updateData)
            // @ts-ignore
            .where(eq(projectTable.projectId, projectId));

        // Get updated project
        const updatedProject = await db
            .select()
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, projectId))
            .limit(1);

        res.json(formatSuccessResponse(updatedProject[0], 'Project updated successfully'));
    } catch (error) {
        console.error('Error in PUT /api/projects/:projectId:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// DELETE /api/projects/:projectId (Delete Project with Cascade)
router.delete('/:projectId', requireAuth, requireProjectOwnership, async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        // Get all frames for this project
        const frames = await db
            .select({ frameId: frameTable.frameId })
            .from(frameTable)
            // @ts-ignore
            .where(eq(frameTable.projectId, projectId));

        const frameIds = frames.map(f => f.frameId).filter((id): id is string => id !== null);

        // Delete all chats for these frames
        if (frameIds.length > 0) {
            await db.delete(chatTable)
                .where(inArray(chatTable.frameId, frameIds));
        }

        // Delete all frames
        await db.delete(frameTable)
            // @ts-ignore
            .where(eq(frameTable.projectId, projectId));

        // Delete project
        await db.delete(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, projectId));

        res.json(formatSuccessResponse(null, 'Project and all associated data deleted successfully'));
    } catch (error) {
        console.error('Error in DELETE /api/projects/:projectId:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// GET /api/projects/:projectId/stats (Get Project Statistics)
router.get('/:projectId/stats', requireAuth, requireProjectOwnership, async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        // Get project
        const project = await db
            .select()
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, projectId))
            .limit(1);

        if (project.length === 0) {
            res.status(404).json(formatErrorResponse('Project not found', 'NOT_FOUND'));
            return;
        }

        // Count frames
        const frames = await db
            .select({ frameId: frameTable.frameId })
            .from(frameTable)
            // @ts-ignore
            .where(eq(frameTable.projectId, projectId));

        const frameCount = frames.length;
        const frameIds = frames.map(f => f.frameId).filter((id): id is string => id !== null);

        // Count chats
        let userMessageCount = 0;
        let aiMessageCount = 0;
        if (frameIds.length > 0) {
            const chats = await db
                .select()
                .from(chatTable)
                .where(inArray(chatTable.frameId, frameIds));

            chats.forEach((chat: any) => {
                if (Array.isArray(chat.chatMessage)) {
                    chat.chatMessage.forEach((msg: any) => {
                        if (msg.role === 'user') userMessageCount++;
                        else if (msg.role === 'assistant') aiMessageCount++;
                    });
                }
            });
        }

        const stats = {
            projectId,
            frameCount,
            userMessageCount,
            aiMessageCount,
            totalMessages: userMessageCount + aiMessageCount,
            createdOn: project[0].createdOn,
            updatedAt: project[0].updatedAt,
        };

        res.json(formatSuccessResponse(stats, 'Project statistics retrieved'));
    } catch (error) {
        console.error('Error in GET /api/projects/:projectId/stats:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

export default router;

