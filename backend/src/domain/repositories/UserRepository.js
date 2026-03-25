/**
 * =====================================================
 * USER REPOSITORY
 * =====================================================
 * 
 * Data access layer for User entity.
 * Handles all database operations for users.
 * 
 * @layer Infrastructure/Repositories
 * =====================================================
 */

const User = require('../entities/User');

class UserRepository {
  /**
   * Creates a new user.
   */
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Finds a user by ID.
   */
  async findById(id) {
    return await User.findById(id);
  }

  /**
   * Finds a user by email.
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Finds a user by username.
   */
  async findByUsername(username) {
    return await User.findOne({ username });
  }

  /**
   * Finds a user by email or username.
   */
  async findByEmailOrUsername(email, username) {
    return await User.findOne({ 
      $or: [{ email }, { username }] 
    });
  }

  /**
   * Finds a user by ID with password (for authentication).
   */
  async findByIdWithPassword(id) {
    return await User.findById(id).select('+password');
  }

  /**
   * Finds a user by email with password (for authentication).
   */
  async findByEmailWithPassword(email) {
    return await User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  /**
   * Finds all users with a specific role.
   */
  async findByRole(role) {
    return await User.find({ role });
  }

  /**
   * Updates a user by ID.
   */
  async update(id, userData) {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  /**
   * Deletes a user by ID.
   */
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  /**
   * Finds a user by password reset token.
   */
  async findByResetToken(token) {
    return await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
  }
}

module.exports = new UserRepository();
