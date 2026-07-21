const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  createPost,
  getFeedPosts,
  getReels,
  getPostById,
  toggleLike,
  addComment,
  deletePost,
} = require('../controllers/postController');

router.post('/', protect, upload.single('media'), createPost);
router.get('/feed', protect, getFeedPosts);
router.get('/reels', protect, getReels);
router.get('/:id', getPostById);
router.put('/like/:id', protect, toggleLike);
router.post('/comment/:id', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;