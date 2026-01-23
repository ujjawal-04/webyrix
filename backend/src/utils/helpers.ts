import { clerkClient } from '@clerk/clerk-sdk-node';
import { randomBytes } from 'crypto';

// Cache for user emails to reduce Clerk API calls
const emailCache = new Map<string, { email: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get user email from Clerk with caching
 */
export async function getUserEmail(userId: string): Promise<string | null> {
    // Check cache first
    const cached = emailCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.email;
    }

    try {
        const user = await clerkClient.users.getUser(userId);
        const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
            || user.emailAddresses[0]?.emailAddress;

        if (email) {
            // Cache the result
            emailCache.set(userId, { email, timestamp: Date.now() });
            return email;
        }

        return null;
    } catch (error) {
        console.error('Error fetching user email:', error);
        return null;
    }
}

/**
 * Verify if the user owns the resource
 */
export function verifyOwnership(userEmail: string, resourceEmail: string): boolean {
    return userEmail === resourceEmail;
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = ''): string {
    const random = randomBytes(8).toString('hex');
    return prefix ? `${prefix}_${random}` : random;
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .trim();
}

/**
 * Clear email cache (useful for testing or manual cache invalidation)
 */
export function clearEmailCache(): void {
    emailCache.clear();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Format error response
 */
export function formatErrorResponse(message: string, code?: string) {
    return {
        error: message,
        code: code || 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
    };
}

/**
 * Format success response
 */
export function formatSuccessResponse(data: any, message?: string) {
    return {
        success: true,
        data,
        message: message || 'Operation successful',
        timestamp: new Date().toISOString()
    };
}
