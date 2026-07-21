require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const storyRoutes = require('./routes/storyRoutes');
const messageRoutes = require('./routes/messageRoutes');

connectDB();

const app = express();
const server = http.createServer(app); // wrap express app in raw HTTP server

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// ---- SOCKET.IO LOGIC ----
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // User announces themselves after connecting
  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
  });

  // Sending a message
  socket.on('sendMessage', async ({ conversationId, senderId, receiverId, text }) => {
    const Message = require('./models/Message');
    const Conversation = require('./models/Conversation');

    // Save message to DB
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      text,
    });

    // Update conversation's lastMessage preview
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
    });

    const populatedMessage = await message.populate('sender', 'username profilePic');

    // Send to receiver if they're online
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', populatedMessage);
    }

    // Also send back to sender (so their own UI updates too)
    socket.emit('messageSent', populatedMessage);
  });

  // Typing indicator
  socket.on('typing', ({ receiverId, senderId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', { senderId });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { // note: server.listen, not app.listen
  console.log(`🚀 Server running on port ${PORT}`);
});