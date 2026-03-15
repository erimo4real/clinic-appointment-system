/**
 * =====================================================
 * AUTH ROUTES (Presentation Layer)
 * =====================================================
 * 
 * HTTP endpoints for authentication.
 * Uses httpOnly cookies for secure token storage.
 * 
 * @layer Presentation/Routes
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const { body, validationResult, cookie } = require('express-validator');
const AuthService = require('../../application/services/AuthService');
const { auth } = require('../../infrastructure/middleware/auth');

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Validation middleware
const validateRegister = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
  body('username').notEmpty().withMessage('Username required')
];

const validateLogin = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password required')
];

/**
 * POST /api/auth/register
 */
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, firstName, lastName, role } = req.body;
    const result = await AuthService.register({ username, email, password, firstName, lastName, role });
    
    // Set tokens in httpOnly cookies
    res.cookie('accessToken', result.token, { ...cookieOptions, maxAge: 60 * 60 * 1000 }); // 1 hour
    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    
    // Return user data (without tokens in body)
    res.status(201).json({ 
      user: result.user,
      message: 'Registration successful'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    
    // Set tokens in httpOnly cookies
    res.cookie('accessToken', result.token, { ...cookieOptions, maxAge: 60 * 60 * 1000 }); // 1 hour
    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    
    // Return user data (without tokens in body)
    res.json({ 
      user: result.user,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /api/auth/me
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
 * Update current user profile
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }
    
    const result = await AuthService.refreshToken(refreshToken);
    
    // Set new access token in httpOnly cookie
    res.cookie('accessToken', result.token, { 
      ...cookieOptions, 
      maxAge: 60 * 60 * 1000 
    });
    
    // Return new token for interceptor to use
    res.json({ token: result.token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', auth, async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

console.log('[Auth Routes] Authentication routes loaded with cookie support');
