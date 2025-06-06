/**
 * Utility to reset all data in localStorage and ensure proper structure
 */

// Reset all data in localStorage
export const resetAllData = () => {
  // Clear all localStorage data
  localStorage.clear();
  
  // Create admin user
  const users = [
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
  localStorage.setItem('users', JSON.stringify(users));
  
  // Create sample election with positions and candidates
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  
  const elections = [
    {
      id: '1',
      title: 'Student Council Election 2023',
      description: 'Annual election for student council members',
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
      status: 'active',
      positions: [
        {
          id: 'pos1',
          title: 'President',
          description: 'Student body president',
          maxSelections: 1,
          candidates: [
            {
              id: 'cand1',
              name: 'Alice Johnson',
              bio: '3rd year CS student'
            },
            {
              id: 'cand2',
              name: 'Bob Smith',
              bio: '2nd year EE student'
            }
          ]
        },
        {
          id: 'pos2',
          title: 'Vice President',
          description: 'Student body vice president',
          maxSelections: 1,
          candidates: [
            {
              id: 'cand3',
              name: 'Charlie Brown',
              bio: '3rd year Business student'
            },
            {
              id: 'cand4',
              name: 'Diana Prince',
              bio: '2nd year Art student'
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
  localStorage.setItem('elections', JSON.stringify(elections));
  
  console.log('✅ All data has been reset and sample data created');
  return true;
};

export default resetAllData; 