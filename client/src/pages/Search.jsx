import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    // Debounce: wait 400ms after the user stops typing before searching
    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await axiosInstance.get(`/users/search/${query}`);
        setResults(data);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    }, 400);

    // Cleanup: if the user types again before 400ms passes, cancel the pending search
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-background border border-border 
                     rounded-lg focus:outline-none placeholder:text-muted"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <FiX size={18} className="text-muted" />
          </button>
        )}
      </div>

      {loading && <p className="text-center text-muted text-sm">Searching...</p>}

      {!loading && query && results.length === 0 && (
        <p className="text-center text-muted text-sm">No users found</p>
      )}

      <div className="flex flex-col gap-1">
        {results.map((user) => (
          <motion.div
            key={user._id}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/profile/${user.username}`)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-background cursor-pointer"
          >
            <img
              src={user.profilePic || 'https://ui-avatars.com/api/?name=' + user.username}
              alt={user.username}
              className="w-11 h-11 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold">{user.username}</p>
              {user.fullName && <p className="text-xs text-muted">{user.fullName}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Search;