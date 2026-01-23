import { Request, Response, NextFunction } from 'express';
import { formatErrorResponse } from '../utils/helpers';

/**
 * Validation schemas
 */
export const schemas = {
    projectId: /^[a-zA-Z0-9_-]+$/,
    frameId: /^[a-zA-Z0-9_-]+$/,
    chatId: /^[0-9]+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

/**
 * Validate request body fields
 */
export function validateBody(requiredFields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            res.status(400).json(
                formatErrorResponse(
                    `Missing required fields: ${missingFields.join(', ')}`,
                    'VALIDATION_ERROR'
                )
            );
            return;
        }

        next();
    };
}

/**
 * Validate query parameters
 */
export function validateQuery(requiredParams: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const missingParams = requiredParams.filter(param => !req.query[param]);

        if (missingParams.length > 0) {
            res.status(400).json(
                formatErrorResponse(
                    `Missing required query parameters: ${missingParams.join(', ')}`,
                    'VALIDATION_ERROR'
                )
            );
            return;
        }

        next();
    };
}

/**
 * Validate project ID format
 */
export function validateProjectId(req: Request, res: Response, next: NextFunction) {
    const projectId = req.params.projectId || req.body.projectId || req.query.projectId;

    if (!projectId) {
        res.status(400).json(formatErrorResponse('Project ID is required', 'VALIDATION_ERROR'));
        return;
    }

    if (!schemas.projectId.test(projectId as string)) {
        res.status(400).json(formatErrorResponse('Invalid project ID format', 'VALIDATION_ERROR'));
        return;
    }

    next();
}

/**
 * Validate frame ID format
 */
export function validateFrameId(req: Request, res: Response, next: NextFunction) {
    const frameId = req.params.frameId || req.body.frameId || req.query.frameId;

    if (!frameId) {
        res.status(400).json(formatErrorResponse('Frame ID is required', 'VALIDATION_ERROR'));
        return;
    }

    if (!schemas.frameId.test(frameId as string)) {
        res.status(400).json(formatErrorResponse('Invalid frame ID format', 'VALIDATION_ERROR'));
        return;
    }

    next();
}

/**
 * Validate email format
 */
export function validateEmail(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email;

    if (!email) {
        res.status(400).json(formatErrorResponse('Email is required', 'VALIDATION_ERROR'));
        return;
    }

    if (!schemas.email.test(email)) {
        res.status(400).json(formatErrorResponse('Invalid email format', 'VALIDATION_ERROR'));
        return;
    }

    next();
}

/**
 * Sanitize input fields
 */
export function sanitizeInputs(fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        fields.forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                req.body[field] = req.body[field].trim();
            }
        });
        next();
    };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(req: Request, res: Response, next: NextFunction) {
    const { limit, offset } = req.query;

    if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
        res.status(400).json(
            formatErrorResponse('Limit must be between 1 and 100', 'VALIDATION_ERROR')
        );
        return;
    }

    if (offset && (isNaN(Number(offset)) || Number(offset) < 0)) {
        res.status(400).json(
            formatErrorResponse('Offset must be a non-negative number', 'VALIDATION_ERROR')
        );
        return;
    }

    next();
}
