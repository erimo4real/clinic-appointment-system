/**
 * =====================================================
 * USER REPOSITORY
 * =====================================================
 * 
 * Data access layer for User entity.
 * Handles all database operations for users.
 * 
 * @layer Infrastructure/Repositories
 * @implements IUserRepository
 * =====================================================
 */

const User = require('../entities/User');

class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   */
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   */
  async findById(id) {
    return await User.findById(id);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by username
   * @param {string} username - Username
   */
  async findByUsername(username) {
    return await User.findOne({ username });
  }

  /**
   * Find user by email or username
   * @param {string} email - Email
   * @param {string} username - Username
   */
  async findByEmailOrUsername(email, username) {
    return await User.findOne({ 
      $or: [{ email }, { username }] 
    });
  }

  /**
   * Find user by ID with password (for auth)
   * @param {string} id - User ID
   */
  async findByIdWithPassword(id) {
    return await User.findById(id).select('+password');
  }

  /**
   * Find user by email with password (for auth)
   * @param {string} email - User email
   */
  async findByEmailWithPassword(email) {
    return await User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  /**
   * Find all users by role
   * @param {string} role - User role
   */
  async findByRole(role) {
    return await User.find({ role });
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} userData - Updated data
   */
  async update(id, userData) {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  /**
   * Delete user
   * @param {string} id - User ID
   */
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  /**
   * Find user by reset token
   * @param {string} token - Reset token (hashed)
   */
  async findByResetToken(token) {
    return await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
  }
}

module.exports = new UserRepository();
