import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(user?.profilePic || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let profilePicUrl = user.profilePic;

      // If a new photo was picked, upload it first via a dedicated upload step
      if (profilePicFile) {
        const formData = new FormData();
        formData.append('media', profilePicFile);
        // We reuse the same Cloudinary upload middleware, but need a small
        // dedicated endpoint for "just upload, don't create a post" - see Step 99
        const { data } = await axiosInstance.post('/users/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        profilePicUrl = data.url;
      }

      const { data } = await axiosInstance.put('/users/profile', {
        fullName,
        bio,
        profilePic: profilePicUrl,
      });

      // Update local auth state + localStorage so the new info shows everywhere immediately
      login({ ...user, ...data, token: localStorage.getItem('token') });
      navigate(`/profile/${user.username}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border rounded-sm p-6"
      >
        <h1 className="text-xl font-semibold mb-6 text-center">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <img
              src={preview || 'https://ui-avatars.com/api/?name=' + user?.username}
              alt="profile"
              className="w-20 h-20 rounded-full object-cover border border-border"
            />
            <label className="text-primary text-sm font-semibold cursor-pointer">
              Change photo
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
            className="bg-primary text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfile;