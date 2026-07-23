import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import PostGridItem from '../components/PostGridItem';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  const fetchProfile = async () => {
    try {
      const { data } = await axiosInstance.get(`/users/${username}`);
      setProfile(data);
      setIsFollowing(data.followers.some((f) => f._id === currentUser._id));
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axiosInstance.put(`/users/unfollow/${profile._id}`);
      } else {
        await axiosInstance.put(`/users/follow/${profile._id}`);
      }
      setIsFollowing((prev) => !prev);
      // Refresh to get updated follower count
      fetchProfile();
    } catch (error) {
      console.error('Follow/unfollow failed', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      const { data } = await axiosInstance.post(`/messages/conversation/${profile._id}`);
      navigate(`/messages/${data._id}`, {
        state: { otherUser: { _id: profile._id, username: profile.username, profilePic: profile.profilePic } },
      });
    } catch (error) {
      console.error('Failed to start conversation', error);
    }
  };

  if (loading) {
    return <p className="text-center text-muted mt-10">Loading profile...</p>;
  }

  if (!profile) {
    return <p className="text-center text-muted mt-10">User not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-8 mb-8"
      >
        <img
          src={profile.profilePic || 'https://ui-avatars.com/api/?name=' + profile.username}
          alt={profile.username}
          className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover border border-border"
        />

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <h1 className="text-xl">{profile.username}</h1>

            {isOwnProfile ? (
              <button
                onClick={() => navigate('/edit-profile')}
                className="px-4 py-1.5 text-sm font-semibold bg-background border border-border rounded-lg"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    isFollowing
                      ? 'bg-background border border-border text-dark'
                      : 'bg-primary text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMessage}
                  className="px-4 py-1.5 text-sm font-semibold bg-background border border-border rounded-lg"
                >
                  Message
                </motion.button>
              </div>
            )}
          </div>

          <div className="flex gap-6 mb-4 text-sm">
            <span><strong>{profile.posts.length}</strong> posts</span>
            <span><strong>{profile.followers.length}</strong> followers</span>
            <span><strong>{profile.following.length}</strong> following</span>
          </div>

          <p className="text-sm font-semibold">{profile.fullName}</p>
          {profile.bio && <p className="text-sm">{profile.bio}</p>}
        </div>
      </motion.div>

      <div className="border-t border-border" />

      {/* Post grid */}
      {profile.posts.length === 0 ? (
        <p className="text-center text-muted mt-10">No posts yet</p>
      ) : (
        <div className="grid grid-cols-3 gap-1 mt-1">
          {profile.posts.map((post) => (
            <PostGridItem key={post._id} post={post} onClick={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;