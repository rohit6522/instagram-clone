import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiHeart,
  FiUser,
  FiLogOut,
} from 'react-icons/fi';
import { RiMovieLine } from 'react-icons/ri';
import { BsChatDots } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <FiHome size={24} />, label: 'Home' },
    { to: '/search', icon: <FiSearch size={24} />, label: 'Search' },
    { to: '/reels', icon: <RiMovieLine size={24} />, label: 'Reels' },
    { to: '/messages', icon: <BsChatDots size={24} />, label: 'Messages' },
    { to: '/create', icon: <FiPlusSquare size={24} />, label: 'Create' },
    { to: '/notifications', icon: <FiHeart size={24} />, label: 'Notifications' },
    { to: `/profile/${user?.username}`, icon: <FiUser size={24} />, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col justify-between h-screen w-64 fixed left-0 top-0 
                      border-r border-border bg-surface px-3 py-6">
        <div>
          <h1 className="text-2xl font-serif italic px-3 mb-8 select-none">Instagram</h1>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors
                   hover:bg-background
                   ${isActive ? 'font-bold' : 'font-normal'}`
                }
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-background 
                     transition-colors text-left"
        >
          <FiLogOut size={24} />
          <span className="text-sm">Logout</span>
        </motion.button>
      </div>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border 
                      flex justify-around items-center py-3 z-50">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {item.icon}
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default Sidebar;