import { findOrCreate } from '../models/User';
import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * Middleware to sync Clerk user with database
 * Creates or updates user record based on Clerk JWT data
 */
const syncUser = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.auth || !req.auth.userId) {
      return next();
    }

    const clerkId = req.auth.userId;

    // Fetch full user data from Clerk to get all available information
    let clerkUser;
    try {
      clerkUser = await clerkClient.users.getUser(clerkId);
    } catch (clerkError) {
      console.error('Error fetching Clerk user:', clerkError);
      // Fall back to JWT claims if Clerk API fails
      clerkUser = null;
    }

    // Extract user data from Clerk user object or JWT claims
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress 
      || req.auth.sessionClaims?.emailAddress 
      || req.auth.email;
    
    const firstName = clerkUser?.firstName 
      || req.auth.sessionClaims?.firstName 
      || null;
    
    const lastName = clerkUser?.lastName 
      || req.auth.sessionClaims?.lastName 
      || null;
    
    const imageUrl = clerkUser?.imageUrl 
      || req.auth.sessionClaims?.imageUrl 
      || null;

    // Find or create user in database
    const [user, created] = await findOrCreate({
      where: { clerkId },
      defaults: {
        clerkId,
        email,
        firstName,
        lastName,
        profileImageUrl: imageUrl,
        lastLoginAt: new Date()
      }
    });

    // Update user if already exists
    if (!created) {
      const updateData = {
        lastLoginAt: new Date()
      };

      // Only update fields if they have values (don't overwrite with null)
      if (email) updateData.email = email;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (imageUrl) updateData.profileImageUrl = imageUrl;

      await user.update(updateData);
    }

    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Error syncing user:', error);
    next(error);
  }
};

export default { syncUser };
