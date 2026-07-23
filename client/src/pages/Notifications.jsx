import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiUserPlus } from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';

const iconMap = {
  like: <FiHeart className="text-red-500" size={20} />,
  comment: <FiMessageCircle className="text-primary" size={20} />,
  follow: <FiUserPlus className="text-primary" size={20} />,
};

const messageMap = {
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
};

// Small helper: turns a timestamp into "2h", "3d", etc. like Instagram does
const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  const intervals = [
    { label: 'y', secs: 31536000 },
    { label: 'mo', secs: 2592000 },
    { label: 'd', secs: 86400 },
    { label: 'h', secs: 3600 },
    { label: 'm', secs: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count}${i.label}`;
  }
  return 'now';
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndMarkRead = async () => {
      try {
        const { data } = await axiosInstance.get('/notifications');
        setNotifications(data);
        await axiosInstance.put('/notifications/read'); // mark as read once viewed
      } catch (error) {
        console.error('Failed to load notifications', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndMarkRead();
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Notifications</h1>

      {loading ? (
        <p className="text-center text-muted text-sm">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-center text-muted text-sm">No notifications yet</p>
      ) : (
        <div className="flex flex-col gap-1">
          {notifications.map((n) => (
            <motion.div
              key={n._id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/profile/${n.sender.username}`)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-background ${
                !n.read ? 'bg-primary/5' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={n.sender.profilePic || 'https://ui-avatars.com/api/?name=' + n.sender.username}
                  alt={n.sender.username}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5">
                  {iconMap[n.type]}
                </div>
              </div>

              <p className="text-sm flex-1">
                <span className="font-semibold">{n.sender.username}</span>{' '}
                {messageMap[n.type]}{' '}
                <span className="text-muted">{timeAgo(n.createdAt)}</span>
              </p>

              {n.post?.mediaUrl && (
                <img
                  src={n.post.mediaUrl}
                  alt="post"
                  className="w-11 h-11 object-cover rounded-sm"
                />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;