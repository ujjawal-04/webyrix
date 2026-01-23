import express, { Request, Response } from 'express';
import { db } from '../config/db';
import { chatTable, frameTable, projectTable } from '../config/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { requireAuth, requireFrameOwnership } from '../middleware/auth';
import { formatErrorResponse, formatSuccessResponse, getUserEmail } from '../utils/helpers';

const router = express.Router();

// POST /api/frames (Create New Frame)
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { frameId, projectId, name } = req.body;
        const { userId } = req.auth;

        if (!frameId || !projectId) {
            res.status(400).json(formatErrorResponse('frameId and projectId are required', 'VALIDATION_ERROR'));
            return;
        }

        const email = await getUserEmail(userId);
        if (!email) {
            res.status(401).json(formatErrorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        // Verify user owns the project
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

        if (project[0].createdBy !== email) {
            res.status(403).json(formatErrorResponse('You do not have permission to add frames to this project', 'FORBIDDEN'));
            return;
        }

        // Create frame
        await db.insert(frameTable).values({
            frameId,
            projectId,
            name: name || null,
        });

        // Get created frame
        const newFrame = await db
            .select()
            .from(frameTable)
            // @ts-ignore
            .where(eq(frameTable.frameId, frameId))
            .limit(1);

        res.json(formatSuccessResponse(newFrame[0], 'Frame created successfully'));
    } catch (error) {
        console.error('Error in POST /api/frames:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// GET /api/frames?frameId=...&projectId=...
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { frameId, projectId } = req.query;

        if (!frameId || !projectId) {
            res.status(400).json(formatErrorResponse('Missing frameId or projectId', 'VALIDATION_ERROR'));
            return;
        }

        const userEmail = await getUserEmail(req.auth.userId);

        // fetch frame
        const frameResult = await db.select().from(frameTable)
            // @ts-ignore
            .where(eq(frameTable.frameId, frameId as string));

        if (!frameResult[0]) {
            res.status(404).json(formatErrorResponse('Frame not found', 'NOT_FOUND'));
            return;
        }

        // Verify project ownership
        const project = await db
            .select()
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, frameResult[0].projectId))
            .limit(1);

        if (project.length === 0 || project[0].createdBy !== userEmail) {
            res.status(403).json(formatErrorResponse('You do not have permission to access this frame', 'FORBIDDEN'));
            return;
        }

        // fetch chat messages
        const chatResult = await db.select().from(chatTable)
            // @ts-ignore
            .where(eq(chatTable.frameId, frameId as string));

        // Flatten messages
        const chatMessages = chatResult
            .flatMap((msg) => Array.isArray(msg.chatMessage) ? msg.chatMessage : [msg.chatMessage])
            .filter((msg) => msg && msg.role && msg.content);

        const finalResult = {
            ...frameResult[0],
            chatMessages,
        };

        res.json(formatSuccessResponse(finalResult, 'Frame retrieved successfully'));
    } catch (error) {
        console.error('Error in GET /api/frames:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// GET /api/frames/:frameId (Get Single Frame)
router.get('/:frameId', requireAuth, requireFrameOwnership, async (req: Request, res: Response) => {
    try {
        const { frameId } = req.params;

        // fetch frame
        const frameResult = await db.select().from(frameTable)
            // @ts-ignore
            .where(eq(frameTable.frameId, frameId))
            .limit(1);

        if (frameResult.length === 0) {
            res.status(404).json(formatErrorResponse('Frame not found', 'NOT_FOUND'));
            return;
        }

        // fetch chat messages
        const chatResult = await db.select().from(chatTable)
            // @ts-ignore
            .where(eq(chatTable.frameId, frameId));

        // Flatten messages
        const chatMessages = chatResult
            .flatMap((msg) => Array.isArray(msg.chatMessage) ? msg.chatMessage : [msg.chatMessage])
            .filter((msg) => msg && msg.role && msg.content);

        const finalResult = {
            ...frameResult[0],
            chatMessages,
        };

        res.json(formatSuccessResponse(finalResult, 'Frame retrieved successfully'));
    } catch (error) {
        console.error('Error in GET /api/frames/:frameId:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// PUT /api/frames (Update Design Code) - Legacy
router.put('/', requireAuth, requireFrameOwnership, async (req: Request, res: Response) => {
    try {
        const { designCode, frameId, projectId } = req.body;

        await db.update(frameTable).set({
            designCode: designCode
        }).where(and(eq(frameTable.frameId, frameId), eq(frameTable.projectId, projectId)));

        res.json(formatSuccessResponse(null, 'Frame updated successfully'));
    } catch (error) {
        console.error('Error in PUT /api/frames:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// PUT /api/frames/chats (Update Chats) - Migrated from /api/chats
router.put('/chats', requireAuth, requireFrameOwnership, async (req: Request, res: Response) => {
    try {
        const { messages, frameId } = req.body;

        await db.update(chatTable).set({
            chatMessage: messages
        }).where(eq(chatTable.frameId, frameId));

        res.json(formatSuccessResponse(null, 'Chats updated successfully'));
    } catch (error) {
        console.error('Error in PUT /api/frames/chats:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// PUT /api/frames/:frameId (Update Frame)
router.put('/:frameId', requireAuth, requireFrameOwnership, async (req: Request, res: Response) => {
    try {
        const { frameId } = req.params;
        const { designCode, name } = req.body;

        const updateData: any = {};
        if (designCode !== undefined) updateData.designCode = designCode;
        if (name !== undefined) updateData.name = name;

        if (Object.keys(updateData).length === 0) {
            res.status(400).json(formatErrorResponse('No fields to update', 'VALIDATION_ERROR'));
            return;
        }

        await db.update(frameTable)
            .set(updateData)
            // @ts-ignore
            .where(eq(frameTable.frameId, frameId));

        // Get updated frame
        const updatedFrame = await db
            .select()
            .from(frameTable)
            // @ts-ignore
            .where(eq(frameTable.frameId, frameId))
            .limit(1);

        res.json(formatSuccessResponse(updatedFrame[0], 'Frame updated successfully'));
    } catch (error) {
        console.error('Error in PUT /api/frames/:frameId:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// DELETE /api/frames/:frameId (Delete Frame and Associated Chats)
router.delete('/:frameId', requireAuth, requireFrameOwnership, async (req: Request, res: Response) => {
    try {
        const { frameId } = req.params;

        // Delete all chats for this frame
        await db.delete(chatTable)
            // @ts-ignore
            .where(eq(chatTable.frameId, frameId));

        // Delete frame
        await db.delete(frameTable)
            // @ts-ignore
            .where(eq(frameTable.frameId, frameId));

        res.json(formatSuccessResponse(null, 'Frame and associated chats deleted successfully'));
    } catch (error) {
        console.error('Error in DELETE /api/frames/:frameId:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

export default router;

