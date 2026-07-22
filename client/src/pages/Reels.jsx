import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import ReelCard from '../components/ReelCard';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const { data } = await axiosInstance.get('/posts/reels');
        setReels(data);
      } catch (error) {
        console.error('Failed to load reels', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading reels...
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        No reels yet — be the first to post one!
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {reels.map((reel) => (
        <ReelCard key={reel._id} reel={reel} />
      ))}
    </div>
  );
};

export default Reels;