import { ClerkExpressRequireAuth, ClerkExpressWithAuth, StrictAuthProp, WithAuthProp } from '@clerk/clerk-sdk-node';
import express, { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { usersTable, projectTable, frameTable, chatTable } from '../config/schema';
import { eq } from 'drizzle-orm';
import { getUserEmail, formatErrorResponse } from '../utils/helpers';

// Middleware to require authentication
const clerkAuth = ClerkExpressRequireAuth({});

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    console.log(`[AUTH] Incoming request: ${req.method} ${req.path}`);
    return clerkAuth(req, res, (err?: any) => {
        if (err) {
            console.error(`[AUTH] Clerk authentication error:`, err);
            return next(err);
        }
        console.log(`[AUTH] Authenticated successfully: ${req.auth?.userId}`);
        next();
    });
}

declare global {
    namespace Express {
        interface Request extends WithAuthProp<StrictAuthProp> { }
    }
}

// Middleware for optional authentication (populates req.auth but doesn't block)
export const optionalAuth = ClerkExpressWithAuth();

/**
 * Middleware to verify project ownership
 */
export async function requireProjectOwnership(req: Request, res: Response, next: NextFunction) {
    try {
        const projectId = req.params.projectId || req.body.projectId;

        if (!projectId) {
            res.status(400).json(formatErrorResponse('Project ID is required', 'VALIDATION_ERROR'));
            return;
        }

        // Check project visibility and ownership
        const projects = await db
            .select()
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, projectId))
            .limit(1);

        if (projects.length === 0) {
            res.status(404).json(formatErrorResponse('Project not found', 'NOT_FOUND'));
            return;
        }

        const project = projects[0];

        // If project is public and it's a GET request, allow access
        if (Boolean(project.isPublic) && req.method === 'GET') {
            return next();
        }

        // Otherwise, require authentication and ownership
        const userId = req.auth?.userId;
        if (!userId) {
            res.status(401).json(formatErrorResponse('Authentication required', 'UNAUTHORIZED'));
            return;
        }

        const userEmail = await getUserEmail(userId);
        if (!userEmail || project.createdBy !== userEmail) {
            res.status(403).json(formatErrorResponse('You do not have permission to access this project', 'FORBIDDEN'));
            return;
        }

        next();
    } catch (error) {
        console.error('Error in requireProjectOwnership:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
}

/**
 * Middleware to verify frame ownership (via project)
 */
export async function requireFrameOwnership(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.auth;
        const frameId = req.params.frameId || req.body.frameId;

        if (!frameId) {
            res.status(400).json(formatErrorResponse('Frame ID is required', 'VALIDATION_ERROR'));
            return;
        }

        const userEmail = await getUserEmail(userId);
        if (!userEmail) {
            res.status(401).json(formatErrorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        // Get frame and its project
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

        // Check project ownership
        const project = await db
            .select()
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, frame[0].projectId))
            .limit(1);

        if (project.length === 0 || project[0].createdBy !== userEmail) {
            res.status(403).json(formatErrorResponse('You do not have permission to access this frame', 'FORBIDDEN'));
            return;
        }

        next();
    } catch (error) {
        console.error('Error in requireFrameOwnership:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
}

/**
 * Middleware to verify chat ownership
 */
export async function requireChatOwnership(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.auth;
        const chatId = req.params.chatId || req.body.chatId;

        if (!chatId) {
            res.status(400).json(formatErrorResponse('Chat ID is required', 'VALIDATION_ERROR'));
            return;
        }

        const userEmail = await getUserEmail(userId);
        if (!userEmail) {
            res.status(401).json(formatErrorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        // Check if user owns the chat
        const chat = await db
            .select()
            .from(chatTable)
            .where(eq(chatTable.id, parseInt(chatId)))
            .limit(1);

        if (chat.length === 0) {
            res.status(404).json(formatErrorResponse('Chat not found', 'NOT_FOUND'));
            return;
        }

        if (chat[0].createdBy !== userEmail) {
            res.status(403).json(formatErrorResponse('You do not have permission to access this chat', 'FORBIDDEN'));
            return;
        }

        next();
    } catch (error) {
        console.error('Error in requireChatOwnership:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.auth;
        const userEmail = await getUserEmail(userId);

        if (!userEmail) {
            res.status(401).json(formatErrorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        // Check user role
        const user = await db
            .select()
            .from(usersTable)
            // @ts-ignore
            .where(eq(usersTable.email, userEmail))
            .limit(1);

        if (user.length === 0 || user[0].role !== 'admin') {
            res.status(403).json(formatErrorResponse('Admin access required', 'FORBIDDEN'));
            return;
        }

        next();
    } catch (error) {
        console.error('Error in requireAdmin:', error);
        res.status(500).json(formatErrorResponse('Internal Server Error', 'INTERNAL_ERROR'));
    }
}

