"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../config/db");
const schema_1 = require("../config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// GET /api/frames?frameId=...&projectId=...
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { frameId, projectId } = req.query;
        if (!frameId || !projectId) {
            res.status(400).json({ error: "Missing frameId or projectId" });
            return;
        }
        // fetch frame
        const frameResult = await db_1.db.select().from(schema_1.frameTable)
            // @ts-ignore
            .where((0, drizzle_orm_1.eq)(schema_1.frameTable.frameId, frameId));
        if (!frameResult[0]) {
            res.status(404).json({ error: "Frame not found" });
            return;
        }
        // fetch chat messages
        const chatResult = await db_1.db.select().from(schema_1.chatTable)
            // @ts-ignore
            .where((0, drizzle_orm_1.eq)(schema_1.chatTable.frameId, frameId));
        // Flatten messages
        const chatMessages = chatResult
            .flatMap((msg) => Array.isArray(msg.chatMessage) ? msg.chatMessage : [msg.chatMessage])
            .filter((msg) => msg && msg.role && msg.content);
        const finalResult = {
            ...frameResult[0],
            chatMessages,
        };
        res.json(finalResult);
    }
    catch (error) {
        console.error('Error in GET /api/frames:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PUT /api/frames (Update Design Code)
router.put('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { designCode, frameId, projectId } = req.body;
        await db_1.db.update(schema_1.frameTable).set({
            designCode: designCode
        }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.frameTable.frameId, frameId), (0, drizzle_orm_1.eq)(schema_1.frameTable.projectId, projectId)));
        res.json({ result: 'Updated!' });
    }
    catch (error) {
        console.error('Error in PUT /api/frames:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PUT /api/frames/chats (Update Chats) - Migrated from /api/chats
router.put('/chats', auth_1.requireAuth, async (req, res) => {
    try {
        const { messages, frameId } = req.body;
        await db_1.db.update(schema_1.chatTable).set({
            chatMessage: messages
        }).where((0, drizzle_orm_1.eq)(schema_1.chatTable.frameId, frameId));
        res.json({ result: 'updated' });
    }
    catch (error) {
        console.error('Error in PUT /api/frames/chats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
