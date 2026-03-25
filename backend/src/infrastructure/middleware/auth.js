/**
 * =====================================================
 * AUTHENTICATION MIDDLEWARE
 * =====================================================
 * 
 * JWT-based authentication and role-based authorization
 * middleware for protecting API routes.
 * 
 * =====================================================
 * USAGE:
 * 
 * // Protect a route (requires authentication)
 * router.get('/profile', auth, (req, res) => { ... });
 * 
 * // Protect with role check
 * router.delete('/users/:id', auth, authorize('admin'), (req, res) => { ... });
 * 
 * =====================================================
 */

const jwt = require('jsonwebtoken');
const User = require('../../domain/entities/User');

/**
 * Authentication Middleware
 * 
 * Verifies the JWT token from the Authorization header
 * and attaches the authenticated user to the request object.
 * 
 * Token format: "Bearer <token>"
 * 
 * @middleware auth
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {401} If no token provided or token is invalid
 * @returns {401} If user not found in database
 */
const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'No token provided. Authorization denied.'
      });
    }
    
    // Remove "Bearer " prefix to get the actual token
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided. Authorization denied.'
      });
    }
    
    // Verify the JWT token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user associated with this token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found. Token may be invalid.'
      });
    }
    
    // Attach user and token to request for use in route handlers
    req.user = user;
    req.token = token;
    
    next();
    
  } catch (error) {
    // Handle specific JWT errors with appropriate messages
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token. Please provide a valid token.',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Generic unauthorized response
    res.status(401).json({ 
      message: 'Authorization denied.'
    });
  }
};

/**
 * Authorization Middleware (Role-based Access Control)
 * 
 * Restricts access to routes based on user roles.
 * Must be used AFTER the auth middleware.
 * 
 * @middleware authorize
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'doctor')
 * @returns {403} If user role is not in the allowed roles list
 * 
 * @example
 * // Only allow admins to access
 * router.delete('/users/:id', auth, authorize('admin'), handler);
 * 
 * // Allow admins and doctors
 * router.post('/appointments', auth, authorize('admin', 'doctor'), handler);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.'
      });
    }
    
    // Check if user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Optional Authentication Middleware
 * 
 * Attempts to authenticate the user if a token is provided,
 * but allows the request to continue even without authentication.
 * Useful for routes that behave differently for authenticated
 * vs anonymous users.
 * 
 * @middleware optionalAuth
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
    
    // No token provided - continue without authentication
    if (!authHeader) {
      return next();
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    // Attach user if found
    if (user) {
      req.user = user;
      req.token = token;
    }
    
    next();
    
  } catch (error) {
    // Ignore authentication errors and continue without user
    next();
  }
};

module.exports = { auth, authorize, optionalAuth };
