const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  createStory,
  getStories,
  viewStory,
  deleteStory,
} = require('../controllers/storyController');

router.post('/', protect, upload.single('media'), createStory);
router.get('/', protect, getStories);
router.put('/view/:id', protect, viewStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;