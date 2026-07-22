import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiImage, FiX } from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';

const CreatePost = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
  const [caption, setCaption] = useState('');
  const [isReel, setIsReel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected)); // temporary local preview URL
    setMediaType(selected.type.startsWith('video') ? 'video' : 'image');

    // If it's a video, ask if it should be a Reel
    if (selected.type.startsWith('video')) {
      setIsReel(true);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setMediaType(null);
    setIsReel(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image or video');
      return;
    }

    setIsLoading(true);
    setError('');

    // FormData is required because we're sending a file, not JSON
    const formData = new FormData();
    formData.append('media', file);
    formData.append('caption', caption);
    formData.append('isReel', isReel);

    try {
      await axiosInstance.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(isReel ? '/reels' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-surface border border-border rounded-sm p-6"
      >
        <h1 className="text-xl font-semibold text-center mb-6">Create new post</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!preview ? (
            <label className="border-2 border-dashed border-border rounded-lg h-64 
                              flex flex-col items-center justify-center gap-2 cursor-pointer
                              hover:bg-background transition-colors">
              <FiImage size={48} className="text-muted" />
              <span className="text-sm text-muted">Click to select a photo or video</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 z-10"
              >
                <FiX size={20} className="text-white" />
              </button>

              {mediaType === 'video' ? (
                <video src={preview} controls className="w-full max-h-96 object-contain" />
              ) : (
                <img src={preview} alt="preview" className="w-full max-h-96 object-contain" />
              )}
            </div>
          )}

          {mediaType === 'video' && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isReel}
                onChange={(e) => setIsReel(e.target.checked)}
              />
              Post this as a Reel
            </label>
          )}

          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm 
                       focus:outline-none focus:border-muted resize-none placeholder:text-muted"
          />

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading || !file}
            className="bg-primary text-white text-sm font-semibold py-2 rounded-lg
                       disabled:opacity-50 transition-opacity"
          >
            {isLoading ? 'Sharing...' : 'Share'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePost;