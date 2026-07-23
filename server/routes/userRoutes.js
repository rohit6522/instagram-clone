const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  uploadAvatar,
  searchUsers, // ADD THIS
} = require('../controllers/userController');

router.post('/upload-avatar', protect, upload.single('media'), uploadAvatar);
router.get('/search/:query', protect, searchUsers); // ADD THIS
router.get('/:username', getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/follow/:id', protect, followUser);
router.put('/unfollow/:id', protect, unfollowUser);

module.exports = router;