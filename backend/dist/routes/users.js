"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../config/db"); // Relative path to config
const schema_1 = require("../config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await clerk_sdk_node_1.clerkClient.users.getUser(userId);
        const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;
        if (!email) {
            res.status(400).json({ error: 'User has no email address' });
            return;
        }
        // Check if user exists
        const userResult = await db_1.db.select().from(schema_1.usersTable)
            // @ts-ignore
            .where((0, drizzle_orm_1.eq)(schema_1.usersTable.email, email));
        // If not, insert new user
        if (userResult.length === 0) {
            const data = {
                name: `${user.firstName} ${user.lastName}`.trim() || 'NA',
                email: email,
                credits: 2
            };
            await db_1.db.insert(schema_1.usersTable).values({
                ...data
            });
            res.json({ user: data });
            return;
        }
        res.json({ user: userResult[0] });
    }
    catch (error) {
        console.error('Error in POST /api/users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
