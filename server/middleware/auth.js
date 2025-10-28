import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/index.js';

// Protect routes - Verify JWT token
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authorized, no token provided' 
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authorized, invalid or expired token' 
      });
    }

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User no longer exists' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        error: 'Your account is inactive. Please contact support.' 
      });
    }

    // Attach user to request object
    req.user = decoded;
    req.userDetails = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
};

// Role-based authorization
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authenticated' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        currentRole: req.user.role
      });
    }

    next();
  };
};

// Optional authentication - doesn't block if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
        const user = await User.findById(decoded.userId).select('-password');
        if (user && user.isActive) {
          req.userDetails = user;
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user owns the resource
export const checkOwnership = (model, paramName = 'id', ownerField = 'userId') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ 
          success: false,
          error: 'Resource not found' 
        });
      }

      const ownerId = resource[ownerField]?.toString() || resource[ownerField];
      const currentUserId = req.user.userId;

      // Allow admin to access everything
      if (req.user.role === 'admin') {
        return next();
      }

      if (ownerId !== currentUserId) {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied. You do not own this resource.' 
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to verify ownership' 
      });
    }
  };
};

// Ensure student has a profile before accessing certain routes
export const requireProfile = async (req, res, next) => {
  try {
    const { StudentProfile } = await import('../models/index.js');
    const profile = await StudentProfile.findOne({ userId: req.user.userId });

    if (!profile) {
      return res.status(403).json({ 
        success: false,
        error: 'Please complete your profile first',
        redirect: '/student/profile'
      });
    }

    req.profile = profile;
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Failed to check profile' 
    });
  }
};
