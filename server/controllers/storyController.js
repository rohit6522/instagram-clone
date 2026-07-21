const Story = require('../models/Story');
const User = require('../models/User');

// @desc   Create a new story
// @route  POST /api/stories
const createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image or video' });
    }

    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    const story = await Story.create({
      user: req.user._id,
      mediaUrl: req.file.path,
      mediaType,
    });

    const populatedStory = await story.populate('user', 'username profilePic');

    res.status(201).json(populatedStory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating story' });
  }
};

// @desc   Get stories from people you follow (+ your own), grouped by user
// @route  GET /api/stories
const getStories = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const userIds = [...currentUser.following, req.user._id];

    const stories = await Story.find({ user: { $in: userIds } })
      .populate('user', 'username profilePic')
      .sort({ createdAt: -1 });

    // Group stories by user so frontend can show one circle per user
    const grouped = {};
    stories.forEach((story) => {
      const uid = story.user._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = {
          user: story.user,
          stories: [],
        };
      }
      grouped[uid].stories.push(story);
    });

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching stories' });
  }
};

// @desc   Mark a story as viewed by current user
// @route  PUT /api/stories/view/:id
const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (!story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    res.status(200).json({ message: 'Story marked as viewed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error marking story viewed' });
  }
};

// @desc   Delete own story manually (before it auto-expires)
// @route  DELETE /api/stories/:id
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    await story.deleteOne();
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting story' });
  }
};

module.exports = { createStory, getStories, viewStory, deleteStory };