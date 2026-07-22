import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiSend } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const ReelCard = ({ reel }) => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(reel.likes.includes(user?._id));
  const [likesCount, setLikesCount] = useState(reel.likes.length);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  // Auto play/pause based on whether this reel is scrolled into view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play();
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.7 } // play only when 70%+ of the video is visible
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleLike = async () => {
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    try {
      await axiosInstance.put(`/posts/like/${reel._id}`);
    } catch {
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  const handleDoubleClick = () => {
    if (!liked) handleLike();
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 800);
  };

  return (
    <div className="relative h-screen w-full snap-start flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={reel.mediaUrl}
        loop
        muted
        playsInline
        onClick={togglePlayPause}
        onDoubleClick={handleDoubleClick}
        className="h-full w-full object-cover max-w-md mx-auto cursor-pointer"
      />

      {/* Pause icon overlay when paused */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-[14px] border-l-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heart burst on double click */}
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

      {/* Right-side action buttons */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 text-white">
        <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike} className="flex flex-col items-center gap-1">
          {liked ? <FaHeart size={28} className="text-red-500" /> : <FiHeart size={28} />}
          <span className="text-xs">{likesCount}</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-1">
          <FiMessageCircle size={28} />
          <span className="text-xs">{reel.comments.length}</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }}>
          <FiSend size={28} />
        </motion.button>
      </div>

      {/* Bottom info: username + caption */}
      <div className="absolute left-3 bottom-8 right-16 text-white">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={reel.user.profilePic || 'https://ui-avatars.com/api/?name=' + reel.user.username}
            className="w-8 h-8 rounded-full object-cover border border-white"
            alt={reel.user.username}
          />
          <span className="font-semibold text-sm">{reel.user.username}</span>
        </div>
        {reel.caption && <p className="text-sm">{reel.caption}</p>}
      </div>
    </div>
  );
};

export default ReelCard;