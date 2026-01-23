import { Request, Response, NextFunction } from 'express';
import { formatErrorResponse } from '../utils/helpers';

/**
 * Custom error class
 */
export class AppError extends Error {
    statusCode: number;
    code: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error handler middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('❌ Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Mongoose/Drizzle duplicate key error
    if (err.code === '23505') {
        const message = 'Duplicate field value entered';
        error = new AppError(message, 400, 'DUPLICATE_ERROR');
    }

    // Mongoose/Drizzle validation error
    if (err.name === 'ValidationError') {
        const message = 'Invalid input data';
        error = new AppError(message, 400, 'VALIDATION_ERROR');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new AppError(message, 401, 'INVALID_TOKEN');
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new AppError(message, 401, 'TOKEN_EXPIRED');
    }

    // Clerk authentication errors
    if (err.status === 401 || err.message?.includes('Unauthenticated')) {
        const message = 'Authentication required';
        error = new AppError(message, 401, 'UNAUTHENTICATED');
    }

    // Send error response
    res.status(error.statusCode || 500).json(
        formatErrorResponse(
            error.message || 'Internal Server Error',
            error.code || 'INTERNAL_ERROR'
        )
    );
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
    console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json(
        formatErrorResponse(
            `Route ${req.method} ${req.path} not found`,
            'NOT_FOUND'
        )
    );
}

/**
 * Async error wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
