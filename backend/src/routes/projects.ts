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
            projectId: projectId, // Associated with project, not just frame
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

// GET /api/projects (Get All Projects) - Optimized with batching
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth;
        const email = await getEmailFromUserId(userId);

        if (!email) {
            res.status(401).json(formatErrorResponse('Unauthorized', 'UNAUTHORIZED'));
            return;
        }

        // 1. Fetch all projects for the user
        const projects = await db
            .select()
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.createdBy, email))
            .orderBy(desc(projectTable.id));

        if (projects.length === 0) {
            res.json(formatSuccessResponse([], 'No projects found'));
            return;
        }

        const projectIds = projects.map(p => p.projectId).filter((id): id is string => id !== null);

        // 2. Fetch all frames for these projects in one batch
        const allFrames = await db
            .select()
            .from(frameTable)
            .where(inArray(frameTable.projectId, projectIds));

        const frameIds = allFrames.map(f => f.frameId).filter((id): id is string => id !== null);

        // 3. Fetch all chats for these projects in one batch
        let allChats: any[] = [];
        if (projectIds.length > 0) {
            allChats = await db
                .select()
                .from(chatTable)
                .where(inArray(chatTable.projectId, projectIds));
        }

        // 4. Aggregate the data - One entry per project with the latest frameId
        const results = projects.map(project => {
            const projectFrames = allFrames
                .filter(f => f.projectId === project.projectId)
                .sort((a: any, b: any) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());

            const projectChats = allChats.filter(c => c.projectId === project.projectId);
            // Take the most recent chat entry for this project
            const latestChat = projectChats.length > 0 ? projectChats[projectChats.length - 1].chatMessage : [];

            return {
                projectId: project.projectId ?? "",
                frameId: projectFrames[0]?.frameId ?? "", // Latest frame ID
                chats: latestChat,
                description: project.description,
                createdOn: project.createdOn
            };
        });

        res.json(formatSuccessResponse(results, 'Projects retrieved successfully'));

    } catch (error) {
        console.error('Error in GET /api/projects:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// GET /api/projects/:projectId (Get Single Project) - Optimized with Promise.all
router.get('/:projectId', optionalAuth, requireProjectOwnership, async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        // Fetch project and frames in parallel
        const [projectResult, frames] = await Promise.all([
            db.select().from(projectTable).where(eq(projectTable.projectId, projectId)).limit(1),
            db.select().from(frameTable).where(eq(frameTable.projectId, projectId))
        ]);

        if (projectResult.length === 0) {
            res.status(404).json(formatErrorResponse('Project not found', 'NOT_FOUND'));
            return;
        }

        // Get all chats for this project (take the latest entry if multiple exist)
        const chats = await db
            .select()
            .from(chatTable)
            .where(eq(chatTable.projectId, projectId))
            .orderBy(desc(chatTable.id))
            .limit(1);

        const result = {
            ...projectResult[0],
            frames: frames,
            chats: chats[0]?.chatMessage || []
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

        // Delete all chats associated with this project's frames
        if (frameIds.length > 0) {
            await db.delete(chatTable)
                .where(inArray(chatTable.frameId, frameIds));
        }

        // Delete all chats associated with this project (using unified projectId)
        await db.delete(chatTable)
            // @ts-ignore
            .where(eq(chatTable.projectId, projectId));

        // Delete all frames
        await db.delete(frameTable)
            // @ts-ignore
            .where(eq(frameTable.projectId, projectId));

        // Delete project
        await db.delete(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, projectId));

        res.json(formatSuccessResponse(null, 'Project and all associated data deleted successfully'));
    } catch (error: any) {
        console.error('CRITICAL Error in DELETE /api/projects/:projectId:', error);
        res.status(500).json(formatErrorResponse(`Internal Server Error: ${error.message}`, 'INTERNAL_ERROR'));
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

        // Count chats from the latest unified chat entry
        let userMessageCount = 0;
        let aiMessageCount = 0;

        const projectChats = await db
            .select()
            .from(chatTable)
            // @ts-ignore
            .where(eq(chatTable.projectId, projectId))
            .orderBy(desc(chatTable.id))
            .limit(1);

        if (projectChats.length > 0 && Array.isArray(projectChats[0].chatMessage)) {
            projectChats[0].chatMessage.forEach((msg: any) => {
                if (msg.role === 'user') userMessageCount++;
                else if (msg.role === 'assistant') aiMessageCount++;
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

