/**
 * =====================================================
 * AUTH SERVICE
 * =====================================================
 * 
 * Business logic layer for authentication operations.
 * Handles user registration, login, password reset,
 * and JWT token management.
 * 
 * @layer Application/Services
 * =====================================================
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserRepository = require('../../domain/repositories/UserRepository');

class AuthService {
  /**
   * Generates a JWT access token for a user.
   * Token expires in 1 hour.
   * 
   * @param {string} userId - User's database ID
   * @returns {string} JWT access token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  /**
   * Generates a JWT refresh token for a user.
   * Token expires in 7 days.
   * 
   * @param {string} userId - User's database ID
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  /**
   * Registers a new user in the system.
   * Checks for existing email/username and creates new user.
   * 
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User's email (unique)
   * @param {string} userData.username - Username (unique)
   * @param {string} userData.password - Plain text password
   * @param {string} userData.firstName - First name (optional)
   * @param {string} userData.lastName - Last name (optional)
   * @param {string} userData.role - User role (default: 'patient')
   * @returns {Object} User object and tokens
   * @throws {Error} If user already exists
   */
  async register(userData) {
    // Check if user with email or username already exists
    const existingUser = await UserRepository.findByEmailOrUsername(userData.email, userData.username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const user = await UserRepository.create(userData);
    
    // Generate authentication tokens
    const token = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token,
      refreshToken
    };
  }

  /**
   * Authenticates a user with email and password.
   * 
   * @param {string} email - User's email address
   * @param {string} password - Plain text password
   * @returns {Object} User object and tokens
   * @throws {Error} If credentials are invalid
   */
  async login(email, password) {
    // Find user with password field included
    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare provided password with stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate authentication tokens
    const token = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token,
      refreshToken
    };
  }

  /**
   * Retrieves the current user's profile.
   * 
   * @param {string} userId - User's database ID
   * @returns {Object} User profile object
   */
  async getCurrentUser(userId) {
    return await UserRepository.findById(userId);
  }

  /**
   * Initiates the password reset process.
   * Generates a reset token and stores its hash.
   * Always returns success for security (prevents email enumeration).
   * 
   * @param {string} email - User's email address
   * @returns {Object} Success message
   */
  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Return same message whether user exists or not
      return { message: 'If an account exists, a reset link will be sent' };
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store hashed token with 1 hour expiration
    await UserRepository.update(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: Date.now() + 3600000
    });

    return { message: 'Reset link sent', debugToken: resetToken };
  }

  /**
   * Resets user's password using a valid reset token.
   * 
   * @param {string} token - Plain text reset token from email
   * @param {string} newPassword - New password to set
   * @returns {Object} Success message
   * @throws {Error} If token is invalid or expired
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserRepository.findByResetToken(hashedToken);
    
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    // Update password and clear reset token fields
    await UserRepository.update(user._id, {
      password: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    return { message: 'Password reset successful' };
  }

  /**
   * Refreshes an access token using a valid refresh token.
   * 
   * @param {string} refreshToken - Valid refresh token
   * @returns {Object} New access token
   * @throws {Error} If refresh token is invalid
   */
  async refreshToken(refreshToken) {
    // Verify refresh token and extract user ID
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await UserRepository.findById(decoded.userId);
    
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    return { token: this.generateToken(user._id) };
  }
}

module.exports = new AuthService();
