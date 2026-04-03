/**
 * =====================================================
 * AUTHENTICATION ROUTES
 * =====================================================
 * 
 * HTTP endpoints for user authentication.
 * Handles registration, login, profile management,
 * password reset, and token refresh.
 * 
 * @layer Presentation/Routes
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const AuthService = require('../../application/services/AuthService');
const { auth } = require('../../infrastructure/middleware/auth');

// Cookie configuration for secure token storage
// httpOnly cookies prevent XSS attacks
// Cross-origin cookies require sameSite: 'none' and secure: true
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
  domain: undefined, // Let browser handle domain automatically
};

/**
 * Validation middleware for registration
 * Ensures required fields are provided and properly formatted
 */
const validateRegister = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').notEmpty().withMessage('Username is required')
];

/**
 * Validation middleware for login
 * Ensures email and password are provided
 */
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

/**
 * POST /api/auth/register
 * 
 * Creates a new user account with the provided information.
 * Automatically generates JWT tokens and sets them as cookies.
 * 
 * @route POST /api/auth/register
 * @body {string} username - Unique username
 * @body {string} email - User's email address
 * @body {string} password - User's password (min 6 characters)
 * @body {string} firstName - User's first name (optional)
 * @body {string} lastName - User's last name (optional)
 * @body {string} role - User role (optional, defaults to 'patient')
 * @returns {201} User created successfully with tokens
 * @returns {400} Validation errors or user already exists
 */
router.post('/register', validateRegister, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract user data from request body
    const { username, email, password, firstName, lastName, role } = req.body;
    
    // Register the user via AuthService
    const result = await AuthService.register({ 
      username, email, password, firstName, lastName, role 
    });
    
    // Set tokens in httpOnly cookies for security
    res.cookie('accessToken', result.token, { ...cookieOptions, maxAge: 60 * 60 * 1000 }); // 1 hour
    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    
    // Also set a readable cookie for cross-origin auth (non-httpOnly)
    res.cookie('auth_token', result.token, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 1000,
      path: '/'
    });
    
    // Return user data and token
    res.status(201).json({ 
      user: result.user,
      token: result.token,
      message: 'Registration successful'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * POST /api/auth/login
 * 
 * Authenticates a user with email and password.
 * Returns JWT tokens and sets them as cookies.
 * 
 * @route POST /api/auth/login
 * @body {string} email - User's email address
 * @body {string} password - User's password
 * @returns {200} Login successful with tokens
 * @returns {400} Invalid credentials
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    // Authenticate user via AuthService
    const result = await AuthService.login(email, password);
    
    // Set httpOnly cookies for secure token storage
    res.cookie('accessToken', result.token, { ...cookieOptions, maxAge: 60 * 60 * 1000 }); // 1 hour
    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    
    // Also set a readable cookie for cross-origin auth (non-httpOnly)
    res.cookie('auth_token', result.token, {
      httpOnly: false,
      secure: false,
      sameSite: 'none',
      maxAge: 60 * 60 * 1000,
      path: '/'
    });
    
    // Return user data and token
    res.status(201).json({ 
      user: result.user,
      token: result.token,
      message: 'Registration successful'
    });
    
    // Return user data AND token
    res.json({ 
      user: result.user,
      token: result.token,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /api/auth/me
 * 
 * Returns the currently authenticated user's profile.
 * Requires a valid JWT token.
 * 
 * @route GET /api/auth/me
 * @requires Authentication
 * @returns {200} Current user profile
 * @returns {401} Not authenticated
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await AuthService.getCurrentUser(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/auth/profile
 * 
 * Updates the authenticated user's profile information.
 * Only updates fields that are provided in the request body.
 * 
 * @route PUT /api/auth/profile
 * @requires Authentication
 * @body {string} first_name - New first name (optional)
 * @body {string} last_name - New last name (optional)
 * @body {string} phone - New phone number (optional)
 * @returns {200} Profile updated successfully
 * @returns {404} User not found
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;
    
    // Find and update the user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only update fields that are provided
    if (first_name) user.firstName = first_name;
    if (last_name) user.lastName = last_name;
    if (phone) user.phone = phone;

    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/auth/forgot-password
 * 
 * Initiates the password reset process by sending a
 * reset link to the user's email address.
 * 
 * @route POST /api/auth/forgot-password
 * @body {string} email - User's email address
 * @returns {200} Reset email sent (if account exists)
 * @returns {500} Server error
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/auth/reset-password/:token
 * 
 * Resets the user's password using a valid reset token.
 * The token is generated by the forgot-password endpoint.
 * 
 * @route POST /api/auth/reset-password/:token
 * @param {string} token - Password reset token from email
 * @body {string} password - New password (min 6 characters)
 * @returns {200} Password reset successful
 * @returns {400} Invalid or expired token
 */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const result = await AuthService.resetPassword(token, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * POST /api/auth/refresh-token
 * 
 * Issues a new access token using a valid refresh token.
 * The refresh token is stored in an httpOnly cookie.
 * 
 * @route POST /api/auth/refresh-token
 * @returns {200} New access token issued
 * @returns {401} Invalid or missing refresh token
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    
    const result = await AuthService.refreshToken(refreshToken);
    
    // Set new access token in httpOnly cookie
    res.cookie('accessToken', result.token, { 
      ...cookieOptions, 
      maxAge: 60 * 60 * 1000,
      secure: true,
      sameSite: 'none'
    });
    
    // Return new token for API interceptors
    res.json({ token: result.token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

/**
 * POST /api/auth/logout
 * 
 * Logs out the current user by clearing authentication cookies.
 * 
 * @route POST /api/auth/logout
 * @requires Authentication
 * @returns {200} Logout successful
 */
router.post('/logout', auth, async (req, res) => {
  try {
    // Clear authentication cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
