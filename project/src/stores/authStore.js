import { create } from 'zustand';
import useElectionStore from './electionStore';
import { authAPI, userAPI, electionAPI } from '../utils/api';

// Storage key for JWT token
const AUTH_TOKEN_KEY = 'auth_token';

export const useAuthStore = create((set, get) => ({
  user: null,
  users: [], // For admin to manage users
  loading: false,
  error: null,
  
  // Initialize by checking for existing token and fetching user data
  initialize: async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return;
    
    try {
      set({ loading: true });
      const user = await authAPI.getCurrentUser();
      set({ user, loading: false });
    } catch (error) {
      // Token might be invalid or expired
      localStorage.removeItem(AUTH_TOKEN_KEY);
      set({ loading: false });
    }
  },

  refreshCurrentUser: async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      // No token, so no user to refresh
      set({ user: null, loading: false });
      return null;
    }
    // Don't set global loading for this, as it's a background refresh
    // set({ loading: true }); 
    try {
      const user = await authAPI.getCurrentUser();
      const apiUser = user; // Rename to avoid confusion with store's user
      console.log('[authStore.refreshCurrentUser] User data from API:', JSON.parse(JSON.stringify(apiUser)));
      set({ user: { ...apiUser, votes: apiUser.votes || {} }, loading: false, error: null });
      return user;
    } catch (error) {
      console.error('[refreshCurrentUser] Error:', error);
      // If token is invalid (e.g. expired), log out the user
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        set({ user: null, loading: false, error: 'Session expired. Please log in again.' });
      } else {
        set({ loading: false, error: error.response?.data?.msg || 'Failed to refresh user data' });
      }
      return null;
    }
  },
  
  login: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const response = await authAPI.login(email, password);
      const { token } = response;
      
      // Store token
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      
      // Get user data
      const user = await authAPI.getCurrentUser();
      
      set({ 
        user: { ...user, votes: user.votes || {} },
        loading: false 
      });
      
      return user;
    } catch (error) {
      set({ 
        error: error.response?.data?.msg || 'Invalid email or password', 
        loading: false 
      });
      throw error;
    }
  },
  
  register: async (userData) => {
    set({ loading: true, error: null });
    
    try {
      console.log('Registering with data:', userData);
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      const { token } = response;
      
      // Store token
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      console.log('Token stored in localStorage');
      
      // Get user data
      const user = await authAPI.getCurrentUser();
      console.log('User data retrieved:', user);
      
      set({ 
        user: { ...user, votes: user.votes || {} },
        loading: false 
      });
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      set({ 
        error: error.response?.data?.msg || 'Registration failed', 
        loading: false 
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    set({ user: null });
  },
  
  // Admin functions to manage users
  loadUsers: async () => {
    set({ loading: true, error: null });
    
    try {
      const users = await userAPI.getAllUsers();
      console.log('Loaded users from API:', users);
      set({ users, loading: false });
      return users;
    } catch (error) {
      console.error('Failed to load users:', error);
      set({ 
        error: error.response?.data?.msg || 'Failed to load users', 
        loading: false 
      });
      throw error;
    }
  },
  
  approveStudent: async (studentId) => {
    set({ loading: true, error: null });
    
    try {
      const updatedUser = await userAPI.approveUser(studentId);
      
      // Update the users list
      const { users } = get();
      const updatedUsers = users.map(user => 
        user.id === studentId ? { ...user, approved: true } : user
      );
      
      set({ 
        users: updatedUsers,
        loading: false 
      });
      
      return updatedUser;
    } catch (error) {
      set({ 
        error: error.response?.data?.msg || 'Failed to approve student', 
        loading: false 
      });
      throw error;
    }
  },
  
  updateUser: async (userId, userData) => {
    set({ loading: true, error: null });
    
    try {
      console.log(`Updating user ${userId} with data:`, userData);
      const updatedUser = await userAPI.updateUser(userId, userData);
      console.log('User updated successfully:', updatedUser);
      
      // Update the users list
      const { users } = get();
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, ...updatedUser } : user
      );
      
      // If the updated user is the current user, update that too
      const { user } = get();
      if (user && user._id === userId) {
        set({ user: { ...user, ...updatedUser } });
      }
      
      set({ 
        users: updatedUsers,
        loading: false 
      });
      
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      set({ 
        error: error.response?.data?.msg || 'Failed to update user', 
        loading: false 
      });
      throw error;
    }
  },
  
  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    
    try {
      console.log(`Deleting user ${userId}`);
      await userAPI.deleteUser(userId);
      console.log('User deleted successfully');
      
      // Remove from the users list
      const { users } = get();
      const updatedUsers = users.filter(user => user._id !== userId);
      
      set({ 
        users: updatedUsers,
        loading: false 
      });
      
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      set({ 
        error: error.response?.data?.msg || 'Failed to delete user', 
        loading: false 
      });
      throw error;
    }
  },
  
  // Voting functionality
  castVote: async (electionId, positionId, candidateId) => {
    set({ loading: true, error: null });
    
    try {
      // Check if user is admin - prevent voting
      const { user } = get();
      if (user?.role === 'admin') {
        set({ 
          error: 'Administrators are not allowed to vote in elections',
          loading: false 
        });
        throw new Error('Administrators are not allowed to vote in elections');
      }
      
      await electionAPI.voteInElection(electionId, positionId, candidateId);
      
      // Refresh election data after voting
      const electionStore = useElectionStore.getState();
      await electionStore.loadElections();
      
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.msg || error.message || 'Failed to cast vote', 
        loading: false 
      });
      throw error;
    }
  }
}));
