import express, { Request, Response } from 'express';
import { db } from '../config/db';
import { chatTable, frameTable } from '../config/schema';
import { and, eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// GET /api/frames?frameId=...&projectId=...
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { frameId, projectId } = req.query;

        if (!frameId || !projectId) {
            res.status(400).json({ error: "Missing frameId or projectId" });
            return;
        }

        // fetch frame
        const frameResult = await db.select().from(frameTable)
            // @ts-ignore
            .where(eq(frameTable.frameId, frameId as string));

        if (!frameResult[0]) {
            res.status(404).json({ error: "Frame not found" });
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

        res.json(finalResult);
    } catch (error) {
        console.error('Error in GET /api/frames:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /api/frames (Update Design Code)
router.put('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { designCode, frameId, projectId } = req.body;

        await db.update(frameTable).set({
            designCode: designCode
        }).where(and(eq(frameTable.frameId, frameId), eq(frameTable.projectId, projectId)));

        res.json({ result: 'Updated!' });
    } catch (error) {
        console.error('Error in PUT /api/frames:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /api/frames/chats (Update Chats) - Migrated from /api/chats
router.put('/chats', requireAuth, async (req: Request, res: Response) => {
    try {
        const { messages, frameId } = req.body;

        await db.update(chatTable).set({
            chatMessage: messages
        }).where(eq(chatTable.frameId, frameId));

        res.json({ result: 'updated' });
    } catch (error) {
        console.error('Error in PUT /api/frames/chats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
