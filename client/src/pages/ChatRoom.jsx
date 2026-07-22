import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const ChatRoom = () => {
  const { conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const otherUser = location.state?.otherUser;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load message history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axiosInstance.get(`/messages/${conversationId}`);
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages', error);
      }
    };
    fetchMessages();
  }, [conversationId]);

  // Listen for real-time events
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleSent = (message) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTyping = ({ senderId }) => {
      if (senderId === otherUser?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    };

    socket.on('receiveMessage', handleReceive);
    socket.on('messageSent', handleSent);
    socket.on('userTyping', handleTyping);

    // Cleanup: remove these specific listeners when leaving the page
    return () => {
      socket.off('receiveMessage', handleReceive);
      socket.off('messageSent', handleSent);
      socket.off('userTyping', handleTyping);
    };
  }, [socket, conversationId, otherUser]);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;

    socket.emit('sendMessage', {
      conversationId,
      senderId: user._id,
      receiverId: otherUser._id,
      text,
    });

    setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket) return;

    socket.emit('typing', { senderId: user._id, receiverId: otherUser?._id });
  };

  const isOnline = onlineUsers.includes(otherUser?._id);

  return (
    <div className="h-screen flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
        <button onClick={() => navigate('/messages')}>
          <FiArrowLeft size={22} />
        </button>
        <img
          src={otherUser?.profilePic || 'https://ui-avatars.com/api/?name=' + otherUser?.username}
          alt={otherUser?.username}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-semibold">{otherUser?.username}</p>
          <p className="text-xs text-muted">{isOnline ? 'Active now' : 'Offline'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.map((msg) => {
          const isMine = msg.sender._id === user._id;
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                isMine
                  ? 'bg-primary text-white self-end rounded-br-sm'
                  : 'bg-background text-dark self-start rounded-bl-sm'
              }`}
            >
              {msg.text}
            </motion.div>
          );
        })}

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted self-start"
            >
              {otherUser?.username} is typing...
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border">
        <input
          type="text"
          value={text}
          onChange={handleTyping}
          placeholder="Message..."
          className="flex-1 px-4 py-2 text-sm bg-background border border-border rounded-full 
                     focus:outline-none placeholder:text-muted"
        />
        <motion.button whileTap={{ scale: 0.9 }} type="submit" className="text-primary">
          <FiSend size={22} />
        </motion.button>
      </form>
    </div>
  );
};

export default ChatRoom;