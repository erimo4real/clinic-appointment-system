/**
 * =====================================================
 * NOTIFICATION ROUTES
 * =====================================================
 * 
 * HTTP endpoints for notifications.
 * 
 * @layer Presentation/Routes
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const Notification = require('../../domain/entities/Notification');
const { auth } = require('../../infrastructure/middleware/auth');

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all as read
 */
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
