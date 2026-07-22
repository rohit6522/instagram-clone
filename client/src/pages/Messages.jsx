import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axiosInstance.get('/messages/conversations');
        setConversations(data);
      } catch (error) {
        console.error('Failed to load conversations', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Helper: get the "other" participant (not yourself) from a conversation
  const getOtherUser = (conversation) => {
    return conversation.participants.find((p) => p._id !== user._id);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Messages</h1>

      {loading ? (
        <p className="text-muted text-sm">Loading conversations...</p>
      ) : conversations.length === 0 ? (
        <p className="text-muted text-sm">
          No conversations yet — visit a profile and click "Message" to start one.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {conversations.map((conv) => {
            const otherUser = getOtherUser(conv);
            const isOnline = onlineUsers.includes(otherUser?._id);

            return (
              <motion.div
                key={conv._id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/messages/${conv._id}`, { state: { otherUser } })}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-background cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={otherUser?.profilePic || 'https://ui-avatars.com/api/?name=' + otherUser?.username}
                    alt={otherUser?.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{otherUser?.username}</p>
                  <p className="text-xs text-muted truncate">
                    {conv.lastMessage || 'Start a conversation'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Messages;