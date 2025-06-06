// Storage keys
const STORAGE_KEYS = {
  USERS: import.meta.env.VITE_USERS_STORAGE_KEY || 'users',
  ELECTIONS: 'elections',
  POSITIONS: 'positions',
  CANDIDATES: 'candidates',
  VOTES: 'votes',
};

// Function to clear all data
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Initialize mock data in localStorage if it doesn't exist
const initializeMockData = () => {
  // Users
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const mockUsers = [
      {
        id: '1',
        name: 'Admin User',
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // In a real app, this should be hashed
        role: 'admin',
        studentId: 'ADMIN001',
        department: 'Administration',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'John Doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'student123', // In a real app, this should be hashed
        role: 'student',
        studentId: 'STU001',
        department: 'Computer Science',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }

  // Elections
  if (!localStorage.getItem(STORAGE_KEYS.ELECTIONS)) {
    const mockElections = [
      {
        id: '1',
        title: 'Student Council Election 2023',
        description: 'Annual election for student council members',
        startDate: '2023-10-01T00:00:00Z',
        endDate: '2023-10-15T23:59:59Z',
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Department Representatives 2023',
        description: 'Election for department representatives',
        startDate: '2023-11-01T00:00:00Z',
        endDate: '2023-11-15T23:59:59Z',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ELECTIONS, JSON.stringify(mockElections));
  }

  // Positions
  if (!localStorage.getItem(STORAGE_KEYS.POSITIONS)) {
    const mockPositions = [
      {
        id: '1',
        title: 'President',
        description: 'Head of the student council',
        electionId: '1',
        maxVotes: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Vice President',
        description: 'Assists the president',
        electionId: '1',
        maxVotes: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(mockPositions));
  }

  // Candidates
  if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
    const mockCandidates = [
      {
        id: '1',
        name: 'Alice Johnson',
        bio: '3rd year CS student',
        positionId: '1',
        electionId: '1',
        votes: 0,
        image: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Bob Smith',
        bio: '2nd year EE student',
        positionId: '1',
        electionId: '1',
        votes: 0,
        image: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(mockCandidates));
  }

  // Votes
  if (!localStorage.getItem(STORAGE_KEYS.VOTES)) {
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify([]));
  }
};

// Function to reset and reinitialize data
export const resetAndInitializeData = () => {
  clearAllData();
  initializeMockData();
};

export default initializeMockData;
