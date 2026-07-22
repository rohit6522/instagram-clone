import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchFeed();
  }, []);

  return (
    <div>
      <StoriesBar />

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
    </div>
  );
};

export default Feed;