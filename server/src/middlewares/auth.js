import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

/**
 * Middleware to verify Clerk JWT tokens
 * Attaches the authenticated user's Clerk data to req.auth
 */
const requireAuth = ClerkExpressRequireAuth({
  // Optional: customize error handling
  onError: (error) => {
    console.error('Clerk authentication error:', error);
  }
});

/**
 * Middleware to optionally verify Clerk JWT tokens
 * Does not throw error if no token is present
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token present, continue without auth
    return next();
  }

  // Token present, verify it
  return requireAuth(req, res, next);
};

export default {
  requireAuth,
  optionalAuth
};
