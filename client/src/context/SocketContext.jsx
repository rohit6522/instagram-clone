import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Create the connection once user is logged in
    const socket = io(import.meta.env.VITE_SOCKET_URL);
    socketRef.current = socket;

    // Tell the server who just connected
    socket.emit('addUser', user._id);

    socket.on('getOnlineUsers', (userIds) => {
      setOnlineUsers(userIds);
    });

    // Cleanup: disconnect when user logs out or app unmounts
    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);