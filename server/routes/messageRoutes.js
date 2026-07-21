const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
} = require('../controllers/messageController');

router.post('/conversation/:userId', protect, getOrCreateConversation);
router.get('/conversations', protect, getUserConversations);
router.get('/:conversationId', protect, getMessages);

module.exports = router;