import { ClerkExpressRequireAuth, StrictAuthProp } from '@clerk/clerk-sdk-node';
import express from 'express';

// Middleware to require authentication
export const requireAuth = ClerkExpressRequireAuth({
    // Add any specific options here if needed
});

// Helper type for authenticated requests
declare global {
    namespace Express {
        interface Request extends StrictAuthProp { }
    }
}
