import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiSend, FiBookmark } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const handleLike = async () => {
    // Optimistic UI update — update instantly, don't wait for server response
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      await axiosInstance.put(`/posts/like/${post._id}`);
    } catch (error) {
      // Revert if the request actually failed
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  const handleDoubleClick = () => {
    if (!liked) handleLike();
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 800);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const { data } = await axiosInstance.post(`/posts/comment/${post._id}`, {
        text: commentText,
      });
      setComments(data);
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-sm mb-4 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={post.user.profilePic || 'https://ui-avatars.com/api/?name=' + post.user.username}
          alt={post.user.username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-semibold">{post.user.username}</span>
      </div>

      {/* Media with double-tap-to-like */}
      <div className="relative" onDoubleClick={handleDoubleClick}>
        {post.mediaType === 'video' ? (
          <video src={post.mediaUrl} controls className="w-full max-h-[600px] object-cover" />
        ) : (
          <img src={post.mediaUrl} alt="post" className="w-full max-h-[600px] object-cover" />
        )}

        {/* Heart burst animation on double-click */}
        <AnimatePresence>
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <FaHeart size={90} className="text-white drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike}>
            {liked ? (
              <FaHeart size={24} className="text-red-500" />
            ) : (
              <FiHeart size={24} />
            )}
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowComments((p) => !p)}>
            <FiMessageCircle size={24} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }}>
            <FiSend size={24} />
          </motion.button>
        </div>
        <motion.button whileTap={{ scale: 0.85 }}>
          <FiBookmark size={24} />
        </motion.button>
      </div>

      {/* Likes count */}
      <div className="px-4 text-sm font-semibold">{likesCount} likes</div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pt-1 text-sm">
          <span className="font-semibold mr-2">{post.user.username}</span>
          {post.caption}
        </div>
      )}

      {/* Comments toggle */}
      {comments.length > 0 && (
        <button
          onClick={() => setShowComments((p) => !p)}
          className="px-4 pt-1 text-sm text-muted block"
        >
          View all {comments.length} comments
        </button>
      )}

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 overflow-hidden"
          >
            {comments.map((c) => (
              <div key={c._id} className="text-sm py-1">
                <span className="font-semibold mr-2">{c.user.username}</span>
                {c.text}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add comment */}
      <form
        onSubmit={handleAddComment}
        className="flex items-center border-t border-border px-4 py-3 mt-2"
      >
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted"
        />
        {commentText.trim() && (
          <button type="submit" className="text-primary text-sm font-semibold">
            Post
          </button>
        )}
      </form>
    </div>
  );
};

export default PostCard;