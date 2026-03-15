/**
 * =====================================================
 * AUTH SERVICE (Application Layer)
 * =====================================================
 * 
 * Business logic for authentication.
 * Handles user registration, login, password reset.
 * 
 * @layer Application/Services
 * =====================================================
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserRepository = require('../../domain/repositories/UserRepository');

class AuthService {
  /**
   * Generate access token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  /**
   * Register new user
   */
  async register(userData) {
    // Check if user exists
    const existingUser = await UserRepository.findByEmailOrUsername(userData.email, userData.username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const user = await UserRepository.create(userData);
    
    // Generate tokens
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
   * Login user
   */
  async login(email, password) {
    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

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
   * Get current user
   */
  async getCurrentUser(userId) {
    return await UserRepository.findById(userId);
  }

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Security: Always return success
      return { message: 'If an account exists, a reset link will be sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await UserRepository.update(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: Date.now() + 3600000
    });

    return { message: 'Reset link sent', debugToken: resetToken };
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserRepository.findByResetToken(hashedToken);
    
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    await UserRepository.update(user._id, {
      password: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    return { message: 'Password reset successful' };
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken) {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await UserRepository.findById(decoded.userId);
    
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    return { token: this.generateToken(user._id) };
  }
}

module.exports = new AuthService();
