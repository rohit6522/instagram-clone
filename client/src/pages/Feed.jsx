import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import StoryViewer from '../components/StoryViewer';
import { useAuth } from '../context/AuthContext';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storyGroups, setStoryGroups] = useState([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const { data } = await axiosInstance.get('/posts/feed');
        setPosts(data);
      } catch (error) {
        console.error('Failed to load feed', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStories = async () => {
      try {
        const { data } = await axiosInstance.get('/stories');
        setStoryGroups(data);
      } catch (error) {
        console.error('Failed to load stories', error);
      }
    };

    fetchFeed();
    fetchStories();
  }, []);

  // Called by StoryViewer every time a story is actually viewed
  const markStoryViewed = (groupIndex, storyId) => {
    setStoryGroups((prev) => {
      const updated = [...prev];
      const group = { ...updated[groupIndex] };
      group.stories = group.stories.map((s) =>
        s._id === storyId
          ? { ...s, viewers: [...s.viewers, user._id] }
          : s
      );
      updated[groupIndex] = group;
      return updated;
    });
  };

  return (
    <div>
      <StoriesBar
        storyGroups={storyGroups}
        onStoryClick={(index) => setActiveGroupIndex(index)}
      />

      <div className="py-4">
        {loading ? (
          <p className="text-center text-muted mt-10">Loading feed...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted mt-10">
            No posts yet — follow people or create your first post!
          </p>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>

      {activeGroupIndex !== null && (
        <StoryViewer
          storyGroup={storyGroups[activeGroupIndex]}
          onStoryViewed={(storyId) => markStoryViewed(activeGroupIndex, storyId)}
          onClose={() => setActiveGroupIndex(null)}
        />
      )}
    </div>
  );
};

export default Feed;