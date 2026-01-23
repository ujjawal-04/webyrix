import express, { Request, Response } from 'express';
import { db } from '../config/db'; // Relative path to config
import { usersTable } from '../config/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { requireAuth } from '../middleware/auth';
import { getUserEmail, formatErrorResponse, formatSuccessResponse } from '../utils/helpers';
import { validateBody } from '../middleware/validation';

const router = express.Router();

// POST /api/users (Create or Get User)
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth;
        const user = await clerkClient.users.getUser(userId);

        const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;

        if (!email) {
            res.status(400).json(formatErrorResponse('User has no email address', 'VALIDATION_ERROR'));
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
            res.json(formatSuccessResponse(data, 'User created successfully'));
            return;
        }

        res.json(formatSuccessResponse(userResult[0], 'User retrieved successfully'));
    } catch (error) {
        console.error('Error in POST /api/users:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// GET /api/users (Get Current User Profile)
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth;
        const email = await getUserEmail(userId);

        if (!email) {
            res.status(401).json(formatErrorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        const userResult = await db.select().from(usersTable)
            // @ts-ignore
            .where(eq(usersTable.email, email))
            .limit(1);

        if (userResult.length === 0) {
            res.status(404).json(formatErrorResponse('User not found', 'NOT_FOUND'));
            return;
        }

        res.json(formatSuccessResponse(userResult[0], 'User profile retrieved'));
    } catch (error) {
        console.error('Error in GET /api/users:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// PUT /api/users (Update User Profile)
router.put('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth;
        const { name } = req.body;
        const email = await getUserEmail(userId);

        if (!email) {
            res.status(401).json(formatErrorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        if (!name) {
            res.status(400).json(formatErrorResponse('Name is required', 'VALIDATION_ERROR'));
            return;
        }

        // Update user
        await db.update(usersTable)
            .set({ name: name.trim() })
            // @ts-ignore
            .where(eq(usersTable.email, email));

        // Get updated user
        const updatedUser = await db.select().from(usersTable)
            // @ts-ignore
            .where(eq(usersTable.email, email))
            .limit(1);

        res.json(formatSuccessResponse(updatedUser[0], 'User profile updated successfully'));
    } catch (error) {
        console.error('Error in PUT /api/users:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// DELETE /api/users (Soft Delete User Account)
router.delete('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth;
        const email = await getUserEmail(userId);

        if (!email) {
            res.status(401).json(formatErrorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        // Delete user from database
        await db.delete(usersTable)
            // @ts-ignore
            .where(eq(usersTable.email, email));

        res.json(formatSuccessResponse(null, 'User account deleted successfully'));
    } catch (error) {
        console.error('Error in DELETE /api/users:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

// GET /api/users/credits (Get User Credits)
router.get('/credits', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth;
        const email = await getUserEmail(userId);

        if (!email) {
            res.status(401).json(formatErrorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        const userResult = await db.select({ credits: usersTable.credits }).from(usersTable)
            // @ts-ignore
            .where(eq(usersTable.email, email))
            .limit(1);

        if (userResult.length === 0) {
            res.status(404).json(formatErrorResponse('User not found', 'NOT_FOUND'));
            return;
        }

        res.json(formatSuccessResponse({ credits: userResult[0].credits }, 'Credits retrieved'));
    } catch (error) {
        console.error('Error in GET /api/users/credits:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
});

export default router;

