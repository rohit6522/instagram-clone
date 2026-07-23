const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markAllAsRead } = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.put('/read', protect, markAllAsRead);

module.exports = router;