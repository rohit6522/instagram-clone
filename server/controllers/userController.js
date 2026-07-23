const User = require('../models/User');

// @desc   Get a user's profile by username
// @route  GET /api/users/:username
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username profilePic')
      .populate('following', 'username profilePic')
      .populate('posts'); // ADD THIS LINE

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc   Update logged-in user's own profile
// @route  PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only update fields that were actually sent
    user.fullName = req.body.fullName ?? user.fullName;
    user.bio = req.body.bio ?? user.bio;
    user.profilePic = req.body.profilePic ?? user.profilePic;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc   Follow a user
// @route  PUT /api/users/follow/:id
const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id.toString();

    if (targetId === currentUserId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (targetUser.followers.includes(currentUserId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    targetUser.followers.push(currentUserId);
    currentUser.following.push(targetId);

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while following user' });
  }
};

// @desc   Unfollow a user
// @route  PUT /api/users/unfollow/:id
const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id.toString();

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove currentUser from target's followers
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    // Remove target from currentUser's following
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetId
    );

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while unfollowing user' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
};