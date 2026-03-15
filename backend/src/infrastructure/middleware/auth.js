/**
 * =====================================================
 * AUTHENTICATION MIDDLEWARE
 * =====================================================
 * 
 * JWT authentication and authorization middleware.
 * Protects routes and handles role-based access control.
 * 
 * =====================================================
 * USAGE:
 * 
 * // Protect a route (requires authentication)
 * router.get('/profile', auth, (req, res) => {
 *   // req.user is available here
 * });
 * 
 * // Protect with role check
 * router.delete('/users/:id', auth, authorize('admin'), (req, res) => {
 *   // Only admins can access
 * });
 * 
 * =====================================================
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * 
 * Verifies JWT token and attaches user to request object.
 * 
 * @middleware auth
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {401} If no token provided
 * @returns {401} If token is invalid or expired
 * @returns {401} If user not found
 */
const auth = async (req, res, next) => {
  try {
    // ============================================
    // STEP 1: Extract token from header
    // ============================================
    
    // Get Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.log('[Auth Middleware] No Authorization header provided');
      return res.status(401).json({ 
        message: 'No token, authorization denied',
        hint: 'Include Authorization header: Bearer <token>'
      });
    }
    
    // Remove "Bearer " prefix to get just the token
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.log('[Auth Middleware] Empty token');
      return res.status(401).json({ 
        message: 'No token, authorization denied' 
      });
    }
    
    console.log('[Auth Middleware] Verifying token...');
    
    // ============================================
    // STEP 2: Verify JWT token
    // ============================================
    
    // Decode the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('[Auth Middleware] Token decoded successfully:', {
      userId: decoded.userId,
      iat: new Date(decoded.iat * 1000).toISOString(),
      exp: new Date(decoded.exp * 1000).toISOString()
    });
    
    // ============================================
    // STEP 3: Fetch user from database
    // ============================================
    
    // Find user by ID stored in token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('[Auth Middleware] User not found for ID:', decoded.userId);
      return res.status(401).json({ 
        message: 'Token is not valid',
        hint: 'User may have been deleted'
      });
    }
    
    // ============================================
    // STEP 4: Attach user to request
    // ============================================
    
    // Attach user to request object for use in routes
    req.user = user;
    req.token = token; // Also attach the raw token
    
    console.log('[Auth Middleware] User authenticated:', {
      id: user._id,
      email: user.email,
      role: user.role
    });
    
    // Continue to the next middleware/route handler
    next();
    
  } catch (error) {
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    console.error('[Auth Middleware] Authentication failed:', {
      name: error.name,
      message: error.message
    });
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired',
        hint: 'Please login again',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        hint: 'Please provide a valid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Generic unauthorized response
    res.status(401).json({ 
      message: 'Token is not valid',
      error: error.message 
    });
  }
};

/**
 * Authorization Middleware (Role-based Access Control)
 * 
 * Restricts access to specific user roles.
 * Must be used AFTER the auth middleware.
 * 
 * @middleware authorize
 * @param {...string} roles - Allowed roles
 * @returns {403} If user role is not authorized
 * 
 * @example
 * // Only allow admins
 * router.delete('/users/:id', auth, authorize('admin'), handler);
 * 
 * // Allow admins and doctors
 * router.post('/appointments', auth, authorize('admin', 'doctor'), handler);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      // ============================================
      // CHECK: User must be authenticated first
      // ============================================
      
      if (!req.user) {
        console.log('[Authorize Middleware] User not authenticated');
        return res.status(401).json({ 
          message: 'Authentication required',
          hint: 'Use auth middleware before authorize'
        });
      }
      
      console.log('[Authorize Middleware] Checking authorization:', {
        userRole: req.user.role,
        allowedRoles: roles
      });
      
      // ============================================
      // CHECK: User role authorization
      // ============================================
      
      // Check if user's role is in the allowed roles list
      if (!roles.includes(req.user.role)) {
        console.log('[Authorize Middleware] Access denied:', {
          userRole: req.user.role,
          requiredRoles: roles
        });
        
        return res.status(403).json({ 
          message: 'Access denied',
          hint: `This action requires ${roles.join(' or ')} role`,
          yourRole: req.user.role,
          requiredRoles: roles
        });
      }
      
      console.log('[Authorize Middleware] Access granted');
      
      // User is authorized, continue to next middleware
      next();
      
    } catch (error) {
      console.error('[Authorize Middleware] Error:', error.message);
      res.status(500).json({ 
        message: 'Authorization error',
        error: error.message 
      });
    }
  };
};

/**
 * Optional Authentication Middleware
 * 
 * Attaches user to request if token is provided,
 * but doesn't require authentication.
 * Useful for routes that behave differently
 * for authenticated vs anonymous users.
 * 
 * @middleware optionalAuth
 * 
 * @example
 * router.get('/articles', optionalAuth, (req, res) => {
 *   if (req.user) {
 *     // Return personalized content
 *   } else {
 *     // Return public content
 *   }
 * });
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      // No token provided, continue as unauthenticated
      return next();
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (user) {
      req.user = user;
      req.token = token;
    }
    
    next();
    
  } catch (error) {
    // Ignore errors, continue as unauthenticated
    next();
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = { auth, authorize, optionalAuth };

// ============================================
// DEBUG: Log middleware registration
// ============================================
console.log('[Auth Middleware] Authentication middleware loaded');
console.log('[Auth Middleware] Available exports: auth, authorize, optionalAuth');
