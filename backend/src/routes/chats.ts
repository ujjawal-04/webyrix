import express, { Request, Response } from 'express';
import { db } from '../config/db';
import { chatTable, frameTable, projectTable } from '../config/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireChatOwnership } from '../middleware/auth';
import { formatErrorResponse, formatSuccessResponse, getUserEmail } from '../utils/helpers';

const router = express.Router();

// POST /api/chats (Create New Chat Message)
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { frameId, projectId, messages } = req.body;
        const { userId } = req.auth;

        if (!projectId || !messages) {
            res.status(400).json(formatErrorResponse('projectId and messages are required', 'VALIDATION_ERROR'));
            return;
        }

        const email = await getUserEmail(userId);
        if (!email) {
            res.status(401).json(formatErrorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        // Verify frame exists and user has access
        const frame = await db
            .select()
            .from(frameTable)
            // @ts-ignore
            .where(eq(frameTable.frameId, frameId))
            .limit(1);

        if (frame.length === 0) {
            res.status(404).json(formatErrorResponse('Frame not found', 'NOT_FOUND'));
            return;
        }

        // Verify user owns the project
        const project = await db
            .select()
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, frame[0].projectId))
            .limit(1);

        if (project.length === 0 || project[0].createdBy !== email) {
            res.status(403).json(formatErrorResponse('You do not have permission to add chats to this frame', 'FORBIDDEN'));
            return;
        }

        // Create chat
        await db.insert(chatTable).values({
            chatMessage: messages,
            createdBy: email,
            projectId: projectId,
            frameId: frameId || null,
        });

        res.json(formatSuccessResponse({ frameId, messages }, 'Chat created successfully'));
    } catch (error) {
        console.error('Error in POST /api/chats:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// GET /api/chats/:frameId (Get All Chats for a Frame)
router.get('/:frameId', requireAuth, async (req: Request, res: Response) => {
    try {
        const { frameId } = req.params;
        const { userId } = req.auth;

        const email = await getUserEmail(userId);
        if (!email) {
            res.status(401).json(formatErrorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        // Verify frame exists and user has access
        const frame = await db
            .select()
            .from(frameTable)
            // @ts-ignore
            .where(eq(frameTable.frameId, frameId))
            .limit(1);

        if (frame.length === 0) {
            res.status(404).json(formatErrorResponse('Frame not found', 'NOT_FOUND'));
            return;
        }

        // Verify user owns the project
        const project = await db
            .select()
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, frame[0].projectId))
            .limit(1);

        if (project.length === 0 || project[0].createdBy !== email) {
            res.status(403).json(formatErrorResponse('You do not have permission to view chats for this frame', 'FORBIDDEN'));
            return;
        }

        // Get all chats for this project
        const chats = await db
            .select()
            .from(chatTable)
            // @ts-ignore
            .where(eq(chatTable.projectId, frame[0].projectId));

        res.json(formatSuccessResponse(chats, 'Chats retrieved successfully'));
    } catch (error) {
        console.error('Error in GET /api/chats/:frameId:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// DELETE /api/chats/:chatId (Delete Specific Chat Message)
router.delete('/:chatId', requireAuth, requireChatOwnership, async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;

        // Delete chat
        await db.delete(chatTable)
            .where(eq(chatTable.id, parseInt(chatId)));

        res.json(formatSuccessResponse(null, 'Chat deleted successfully'));
    } catch (error) {
        console.error('Error in DELETE /api/chats/:chatId:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// DELETE /api/chats/frame/:frameId (Delete All Chats in a Frame)
router.delete('/frame/:frameId', requireAuth, async (req: Request, res: Response) => {
    try {
        const { frameId } = req.params;
        const { userId } = req.auth;

        const email = await getUserEmail(userId);
        if (!email) {
            res.status(401).json(formatErrorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        // Verify frame exists and user has access
        const frame = await db
            .select()
            .from(frameTable)
            // @ts-ignore
            .where(eq(frameTable.frameId, frameId))
            .limit(1);

        if (frame.length === 0) {
            res.status(404).json(formatErrorResponse('Frame not found', 'NOT_FOUND'));
            return;
        }

        // Verify user owns the project
        const project = await db
            .select()
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, frame[0].projectId))
            .limit(1);

        if (project.length === 0 || project[0].createdBy !== email) {
            res.status(403).json(formatErrorResponse('You do not have permission to delete chats for this frame', 'FORBIDDEN'));
            return;
        }

        // Delete all chats for this project
        await db.delete(chatTable)
            // @ts-ignore
            .where(eq(chatTable.projectId, frame[0].projectId));

        res.json(formatSuccessResponse(null, 'All chats deleted successfully'));
    } catch (error) {
        console.error('Error in DELETE /api/chats/frame/:frameId:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

export default router;
