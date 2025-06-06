import { create } from 'zustand';
import api from '../utils/api'; // Import the API utility

const useStudentStore = create((set, get) => ({
  students: [],
  currentStudent: null,
  loading: false,
  error: null,
  
  // Load students from backend API
  loadStudents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/users/all'); // Uses the new backend endpoint
      // The backend already returns users, ensure it's an array
      const allUsers = Array.isArray(response.data) ? response.data : [];
      // Filter for users with role 'student'
      const students = allUsers.filter(user => user.role === 'student');
      set({ students, loading: false });
      return students;
    } catch (error) {
      console.error('Failed to load students from API:', error);
      const errorMessage = error.response?.data?.msg || 'Failed to load students';
      set({ error: errorMessage, loading: false });
      return [];
    }
  },

  // Get student by ID
  getStudent: (id) => {
    const students = get().students;
    return students.find(student => student.id === id) || null;
  },

  // Get student by email
  getStudentByEmail: (email) => {
    const students = get().students;
    return students.find(student => student.email === email) || null;
  },

  // Create a new student
  createStudent: (studentData) => {
    set({ loading: true, error: null });
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      if (users.some(user => user.email === studentData.email)) {
        throw new Error('Email already registered');
      }
      
      // Check if student ID already exists
      if (users.some(user => user.studentId === studentData.studentId)) {
        throw new Error('Student ID already registered');
      }
      
      const newStudent = {
        ...studentData,
        id: Date.now().toString(),
        role: 'student',
        approved: studentData.approved || false, // Default to not approved
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedUsers = [...users, newStudent];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      set(state => ({
        students: [...state.students, newStudent],
        currentStudent: newStudent,
        loading: false,
      }));
      
      return newStudent;
    } catch (error) {
      set({ error: error.message || 'Failed to create student', loading: false });
      throw error;
    }
  },

  // Update a student
  updateStudent: (id, updates) => {
    set({ loading: true, error: null });
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const index = users.findIndex(user => user.id === id && user.role === 'student');
      
      if (index === -1) {
        throw new Error('Student not found');
      }
      
      // Check if new email already exists
      if (updates.email && users.some((user, i) => i !== index && user.email === updates.email)) {
        throw new Error('Email already in use');
      }
      
      // Check if new student ID already exists
      if (updates.studentId && users.some((user, i) => i !== index && user.studentId === updates.studentId)) {
        throw new Error('Student ID already in use');
      }
      
      const updatedStudent = {
        ...users[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedUsers = [...users];
      updatedUsers[index] = updatedStudent;
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      set(state => ({
        students: state.students.map(s => 
          s.id === id ? updatedStudent : s
        ),
        currentStudent: state.currentStudent?.id === id ? updatedStudent : state.currentStudent,
        loading: false,
      }));
      
      return updatedStudent;
    } catch (error) {
      set({ error: error.message || 'Failed to update student', loading: false });
      throw error;
    }
  },

  // Delete a student
  deleteStudent: (id) => {
    set({ loading: true, error: null });
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter(user => !(user.id === id && user.role === 'student'));
      
      if (updatedUsers.length === users.length) {
        throw new Error('Student not found');
      }
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      set(state => ({
        students: state.students.filter(s => s.id !== id),
        currentStudent: state.currentStudent?.id === id ? null : state.currentStudent,
        loading: false,
      }));
      
      return true;
    } catch (error) {
      set({ error: error.message || 'Failed to delete student', loading: false });
      throw error;
    }
  },

  // Set current student
  setCurrentStudent: (student) => {
    set({ currentStudent: student });
  },
}));

export default useStudentStore;
