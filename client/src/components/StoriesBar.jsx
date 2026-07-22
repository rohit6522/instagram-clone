import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import StoryCircle from './StoryCircle';
import { useAuth } from '../context/AuthContext';

const StoriesBar = ({ onStoryClick }) => {
  const [storyGroups, setStoryGroups] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await axiosInstance.get('/stories');
        setStoryGroups(data);
      } catch (error) {
        console.error('Failed to load stories', error);
      }
    };
    fetchStories();
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto px-4 py-4 border-b border-border 
                    scrollbar-hide bg-surface">
      {/* "Your story" always shows first, even with no stories yet */}
      <StoryCircle
        username="Your story"
        profilePic={user?.profilePic}
        hasUnseenStory={false}
        onClick={() => onStoryClick?.(null)}
      />

      {storyGroups.map((group) => (
        <StoryCircle
          key={group.user._id}
          username={group.user.username}
          profilePic={group.user.profilePic}
          hasUnseenStory={true}
          onClick={() => onStoryClick?.(group)}
        />
      ))}
    </div>
  );
};

export default StoriesBar;