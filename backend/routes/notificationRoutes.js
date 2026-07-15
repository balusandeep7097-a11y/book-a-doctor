const express = require('express');
const {
  getNotifications,
  markAsRead,
  clearAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All notification routes require authentication

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.delete('/', clearAllNotifications);

module.exports = router;
