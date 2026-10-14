import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const fetchUsersAndSetInitial = async () => {
    try {
      setLoading(true);
      const users = await api.getUsers();
      setAllUsers(users);
      if (users.length > 0) {
        // Tanisha Shah (id: 1) is the active user for the simulation
        const activeUser = users.find(u => u.id === 1) || users[0];
        setCurrentUser(activeUser);
        localStorage.setItem('friendsphere_active_user_id', activeUser.id);
        updatePendingCount(activeUser.id);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePendingCount = async (userId) => {
    try {
      const requests = await api.getPendingRequests(userId);
      setPendingRequestsCount(requests.length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsersAndSetInitial();
  }, []);

  const login = () => ({ success: true });
  const logout = () => {};

  const switchUser = (userId) => {
    const user = allUsers.find(u => u.id === Number(userId));
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('friendsphere_active_user_id', user.id);
      updatePendingCount(user.id);
    }
  };

  const refreshCurrentUser = async () => {
    if (!currentUser) return;
    try {
      const refreshed = await api.getUser(currentUser.id);
      setCurrentUser(refreshed);
      updatePendingCount(refreshed.id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        loading,
        pendingRequestsCount,
        login,
        logout,
        switchUser,
        refreshCurrentUser,
        updatePendingCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
