import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';

const STORY_DURATION = 5000; // 5 seconds per story (matches real Instagram default for images)

const StoryViewer = ({ storyGroup, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);

    const stories = storyGroup?.stories || [];
    const currentStory = stories[currentIndex];

    const goToNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            onClose(); // last story finished, close viewer
        }
    };


    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    // Mark story as viewed when it becomes active — both on the backend AND locally
  useEffect(() => {
    if (!currentStory) return;
    axiosInstance.put(`/stories/view/${currentStory._id}`).catch(() => {});
    onStoryViewed?.(currentStory._id);
  }, [currentStory]);

   // Progress bar + auto-advance logic
  useEffect(() => {
    if (!currentStory || isPaused) return;

    setProgress(0);
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        goToNext();
      }
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [currentIndex, isPaused, currentStory]);





    if (!storyGroup || !currentStory) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            >
                <div className="relative w-full max-w-md h-full md:h-[90vh] md:rounded-lg overflow-hidden bg-black">
                    {/* Progress bars */}
                    <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                        {stories.map((_, idx) => (
                            <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full"
                                    style={{
                                        width:
                                            idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                                        transition: idx === currentIndex ? 'none' : 'width 0.2s',
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Header */}
                    <div className="absolute top-6 left-3 right-3 flex items-center justify-between z-20">
                        <div className="flex items-center gap-2">
                            <img
                                src={storyGroup.user.profilePic || 'https://ui-avatars.com/api/?name=' + storyGroup.user.username}
                                className="w-8 h-8 rounded-full object-cover border border-white"
                                alt={storyGroup.user.username}
                            />
                            <span className="text-white text-sm font-semibold">{storyGroup.user.username}</span>
                        </div>
                        <button onClick={onClose}>
                            <FiX size={26} className="text-white" />
                        </button>
                    </div>

                    {/* Media */}
                    <div
                        className="w-full h-full flex items-center justify-center"
                        onMouseDown={() => setIsPaused(true)}
                        onMouseUp={() => setIsPaused(false)}
                        onTouchStart={() => setIsPaused(true)}
                        onTouchEnd={() => setIsPaused(false)}
                    >
                        {currentStory.mediaType === 'video' ? (
                            <video
                                src={currentStory.mediaUrl}
                                autoPlay
                                muted
                                className="max-h-full max-w-full object-contain"
                                onEnded={goToNext}
                            />
                        ) : (
                            <img
                                src={currentStory.mediaUrl}
                                alt="story"
                                className="max-h-full max-w-full object-contain"
                            />
                        )}
                    </div>

                    {/* Invisible tap zones for prev/next */}
                    <button
                        onClick={goToPrev}
                        className="absolute left-0 top-0 h-full w-1/3 z-10"
                        aria-label="Previous story"
                    />
                    <button
                        onClick={goToNext}
                        className="absolute right-0 top-0 h-full w-1/3 z-10"
                        aria-label="Next story"
                    />

                    {/* Visible arrow hints, desktop only */}
                    <div className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10">
                        <FiChevronLeft size={30} className="text-white/70" />
                    </div>
                    <div className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10">
                        <FiChevronRight size={30} className="text-white/70" />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default StoryViewer;