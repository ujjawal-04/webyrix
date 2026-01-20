import express, { Request, Response } from 'express';
import { db } from '../config/db'; // Relative path to config
import { usersTable } from '../config/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth;
        const user = await clerkClient.users.getUser(userId);

        const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;

        if (!email) {
            res.status(400).json({ error: 'User has no email address' });
            return;
        }

        // Check if user exists
        const userResult = await db.select().from(usersTable)
            // @ts-ignore
            .where(eq(usersTable.email, email));

        // If not, insert new user
        if (userResult.length === 0) {
            const data = {
                name: `${user.firstName} ${user.lastName}`.trim() || 'NA',
                email: email,
                credits: 2
            };
            await db.insert(usersTable).values({
                ...data
            });
            res.json({ user: data });
            return;
        }

        res.json({ user: userResult[0] });
    } catch (error) {
        console.error('Error in POST /api/users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
