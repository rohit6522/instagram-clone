import { motion } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiFilm } from 'react-icons/fi';

const PostGridItem = ({ post, onClick }) => {
  return (
    <motion.div
      whileHover={{ opacity: 0.9 }}
      onClick={onClick}
      className="relative aspect-square cursor-pointer group overflow-hidden bg-background"
    >
      {post.mediaType === 'video' ? (
        <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
      ) : (
        <img src={post.mediaUrl} alt="post" className="w-full h-full object-cover" />
      )}

      {post.isReel && (
        <FiFilm className="absolute top-2 right-2 text-white drop-shadow-md" size={18} />
      )}

      {/* Hover overlay with stats — desktop only, since hover doesn't exist on mobile */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                      transition-opacity hidden md:flex items-center justify-center gap-6 text-white">
        <span className="flex items-center gap-1 font-semibold text-sm">
          <FiHeart className="fill-white" size={18} /> {post.likes.length}
        </span>
        <span className="flex items-center gap-1 font-semibold text-sm">
          <FiMessageCircle className="fill-white" size={18} /> {post.comments.length}
        </span>
      </div>
    </motion.div>
  );
};

export default PostGridItem;