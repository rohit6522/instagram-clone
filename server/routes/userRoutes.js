const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // ADD THIS
const {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  uploadAvatar, // ADD THIS
} = require('../controllers/userController');

router.post('/upload-avatar', protect, upload.single('media'), uploadAvatar); // ADD THIS
router.get('/:username', getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/follow/:id', protect, followUser);
router.put('/unfollow/:id', protect, unfollowUser);

module.exports = router;