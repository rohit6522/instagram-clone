const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
} = require('../controllers/userController');

router.get('/:username', getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/follow/:id', protect, followUser);
router.put('/unfollow/:id', protect, unfollowUser);

module.exports = router;