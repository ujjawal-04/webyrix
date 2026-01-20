"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../config/db");
const schema_1 = require("../config/schema");
const auth_1 = require("../middleware/auth");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const drizzle_orm_1 = require("drizzle-orm");
const router = express_1.default.Router();
// Helper to get user email
async function getUserEmail(userId) {
    const user = await clerk_sdk_node_1.clerkClient.users.getUser(userId);
    return user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;
}
// POST /api/projects (Create Project)
router.post('/', auth_1.requireAuth, async (req, res) => {
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
        await db_1.db.insert(schema_1.projectTable).values({
            projectId: projectId,
            createdBy: email
        });
        // Create frame
        await db_1.db.insert(schema_1.frameTable).values({
            frameId: frameId,
            projectId: projectId,
        });
        // Save user messages
        await db_1.db.insert(schema_1.chatTable).values({
            chatMessage: messages,
            createdBy: email,
            frameId: frameId,
        });
        // Update user credits
        if (!hasUnlimitedAccess) {
            await db_1.db.update(schema_1.usersTable).set({
                credits: credits - 1
                //@ts-ignore
            }).where((0, drizzle_orm_1.eq)(schema_1.usersTable.email, email));
        }
        res.json({ projectId, frameId, messages });
    }
    catch (error) {
        console.error('Error in POST /api/projects:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// GET /api/projects (Get All Projects) - Migrated from get-all-projects
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { userId } = req.auth;
        const email = await getUserEmail(userId);
        if (!email) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const projects = await db_1.db
            .select()
            .from(schema_1.projectTable)
            // @ts-ignore
            .where((0, drizzle_orm_1.eq)(schema_1.projectTable.createdBy, email))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.projectTable.id));
        let results = [];
        for (const project of projects) {
            const frames = await db_1.db
                .select({ frameId: schema_1.frameTable.frameId })
                .from(schema_1.frameTable)
                // @ts-ignore
                .where((0, drizzle_orm_1.eq)(schema_1.frameTable.projectId, project.projectId));
            const frameIds = frames.map((f) => f.frameId);
            let chats = [];
            if (frameIds.length > 0) {
                chats = await db_1.db
                    .select()
                    .from(schema_1.chatTable)
                    .where((0, drizzle_orm_1.inArray)(schema_1.chatTable.frameId, frameIds));
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
    }
    catch (error) {
        console.error('Error in GET /api/projects:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
