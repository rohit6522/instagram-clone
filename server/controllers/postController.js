const Post = require('../models/Post');
const User = require('../models/User');

// @desc   Create a new post (or reel if isReel=true)
// @route  POST /api/posts
const createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image or video' });
    }

    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    const post = await Post.create({
      user: req.user._id,
      mediaUrl: req.file.path, // Cloudinary URL
      mediaType,
      isReel: req.body.isReel === 'true', // form-data sends strings
      caption: req.body.caption || '',
    });

    // Add post to user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: post._id },
    });

    const populatedPost = await post.populate('user', 'username profilePic');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

// @desc   Get feed posts (from users you follow + your own), newest first
// @route  GET /api/posts/feed
const getFeedPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const userIds = [...currentUser.following, req.user._id];

    const posts = await Post.find({ user: { $in: userIds }, isReel: false })
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching feed' });
  }
};

// @desc   Get all reels (public, like TikTok - not just from people you follow)
// @route  GET /api/posts/reels
const getReels = async (req, res) => {
  try {
    const reels = await Post.find({ isReel: true })
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json(reels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching reels' });
  }
};

// @desc   Get single post by id
// @route  GET /api/posts/:id
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching post' });
  }
};

// @desc   Like / Unlike a post (toggle)
// @route  PUT /api/posts/like/:id
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
};

// @desc   Add a comment to a post
// @route  POST /api/posts/comment/:id
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({ user: req.user._id, text });
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'username profilePic');

    res.status(201).json(updatedPost.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

// @desc   Delete a post (only by owner)
// @route  DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: post._id },
    });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
};

module.exports = {
  createPost,
  getFeedPosts,
  getReels,
  getPostById,
  toggleLike,
  addComment,
  deletePost,
};