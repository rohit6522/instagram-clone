import { motion } from 'framer-motion';

const StoryCircle = ({ username, profilePic, hasUnseenStory = true, onClick }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 w-16"
    >
      <div
        className={`w-16 h-16 rounded-full p-[2px] ${
          hasUnseenStory
            ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
            : 'bg-border'
        }`}
      >
        <div className="w-full h-full rounded-full border-2 border-surface overflow-hidden bg-background">
          <img
            src={profilePic || 'https://ui-avatars.com/api/?name=' + username}
            alt={username}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <span className="text-xs truncate w-full text-center">{username}</span>
    </motion.div>
  );
};

export default StoryCircle;