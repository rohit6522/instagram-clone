const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc   Get or create a conversation between current user and another user
// @route  POST /api/messages/conversation/:userId
const getOrCreateConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, otherUserId],
      });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting conversation' });
  }
};

// @desc   Get all conversations for the logged-in user (chat list)
// @route  GET /api/messages/conversations
const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'username profilePic')
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};

// @desc   Get all messages in a conversation
// @route  GET /api/messages/:conversationId
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate('sender', 'username profilePic')
      .sort({ createdAt: 1 }); // oldest first, like a real chat

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

module.exports = { getOrCreateConversation, getUserConversations, getMessages };