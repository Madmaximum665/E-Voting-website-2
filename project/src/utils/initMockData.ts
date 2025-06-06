// Initialize mock data for the application
const initMockData = () => {
  // Check if we've already initialized
  if (localStorage.getItem('initialized') === 'true') {
    return;
  }
  
  // Admin user
  const adminUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
  };
  
  // Student users
  const studentUsers = [
    {
      id: '2',
      name: 'John Smith',
      email: 'john@college.edu',
      password: 'CS12345',
      role: 'student',
      studentId: 'CS12345',
      department: 'Computer Science',
      year: 3,
    },
    {
      id: '3',
      name: 'Emily Johnson',
      email: 'emily@college.edu',
      password: 'BZ54321',
      role: 'student',
      studentId: 'BZ54321',
      department: 'Business',
      year: 2,
    },
    {
      id: '4',
      name: 'Michael Lee',
      email: 'michael@college.edu',
      password: 'EE67890',
      role: 'student',
      studentId: 'EE67890',
      department: 'Electrical Engineering',
      year: 4,
    },
    {
      id: '5',
      name: 'Sarah Williams',
      email: 'sarah@college.edu',
      password: 'PS24680',
      role: 'student',
      studentId: 'PS24680',
      department: 'Political Science',
      year: 3,
    },
    {
      id: '6',
      name: 'David Chen',
      email: 'david@college.edu',
      password: 'BI13579',
      role: 'student',
      studentId: 'BI13579',
      department: 'Biology',
      year: 2,
    },
  ];
  
  // Save users to localStorage
  const users = [adminUser, ...studentUsers];
  localStorage.setItem('users', JSON.stringify(users));
  
  // Create students array (without passwords)
  const students = studentUsers.map(({ password, ...student }) => student);
  localStorage.setItem('students', JSON.stringify(students));
  
  // Sample elections
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const elections = [
    {
      id: '1',
      title: 'Student Council Election 2025',
      description: 'Annual election for the student council representatives for the academic year 2025-2026.',
      startDate: now.toISOString(),
      endDate: nextWeek.toISOString(),
      status: 'active',
      positions: [
        {
          id: '1-1',
          title: 'President',
          description: 'The President leads the student council and represents the student body in official matters.',
          maxSelections: 1,
          candidates: [
            {
              id: '1-1-1',
              name: 'Michael Lee',
              studentId: 'EE67890',
              department: 'Electrical Engineering',
              year: 4,
              position: 'President',
              positionId: '1-1',
              manifesto: 'I will work to improve campus facilities and create more opportunities for student engagement.',
              imageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 12,
            },
            {
              id: '1-1-2',
              name: 'Sarah Williams',
              studentId: 'PS24680',
              department: 'Political Science',
              year: 3,
              position: 'President',
              positionId: '1-1',
              manifesto: 'I promise to be a voice for all students and advocate for better academic resources.',
              imageUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 15,
            },
          ],
        },
        {
          id: '1-2',
          title: 'Vice President',
          description: 'The Vice President assists the President and takes over in their absence.',
          maxSelections: 1,
          candidates: [
            {
              id: '1-2-1',
              name: 'John Smith',
              studentId: 'CS12345',
              department: 'Computer Science',
              year: 3,
              position: 'Vice President',
              positionId: '1-2',
              manifesto: 'I will focus on improving technology resources for all students.',
              imageUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 18,
            },
            {
              id: '1-2-2',
              name: 'Emily Johnson',
              studentId: 'BZ54321',
              department: 'Business',
              year: 2,
              position: 'Vice President',
              positionId: '1-2',
              manifesto: 'I will work on creating more internship opportunities and career events.',
              imageUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 8,
            },
          ],
        },
        {
          id: '1-3',
          title: 'Treasurer',
          description: 'The Treasurer manages the student council budget and financial affairs.',
          maxSelections: 1,
          candidates: [
            {
              id: '1-3-1',
              name: 'David Chen',
              studentId: 'BI13579',
              department: 'Biology',
              year: 2,
              position: 'Treasurer',
              positionId: '1-3',
              manifesto: 'I will ensure transparent and efficient use of student council funds.',
              imageUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 10,
            },
          ],
        },
      ],
      createdAt: lastWeek.toISOString(),
      updatedAt: lastWeek.toISOString(),
    },
    {
      id: '2',
      title: 'Department Representatives Election',
      description: 'Election for department representatives who will serve as liaisons between students and faculty.',
      startDate: nextWeek.toISOString(),
      endDate: new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'upcoming',
      positions: [
        {
          id: '2-1',
          title: 'Computer Science Representative',
          description: 'Represents the interests of Computer Science students.',
          maxSelections: 1,
          candidates: [
            {
              id: '2-1-1',
              name: 'John Smith',
              studentId: 'CS12345',
              department: 'Computer Science',
              year: 3,
              position: 'Computer Science Representative',
              positionId: '2-1',
              manifesto: 'I will advocate for updated curriculum and more hands-on projects.',
              imageUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 0,
            },
          ],
        },
        {
          id: '2-2',
          title: 'Business Representative',
          description: 'Represents the interests of Business students.',
          maxSelections: 1,
          candidates: [
            {
              id: '2-2-1',
              name: 'Emily Johnson',
              studentId: 'BZ54321',
              department: 'Business',
              year: 2,
              position: 'Business Representative',
              positionId: '2-2',
              manifesto: 'I will work to bring more industry leaders to campus for networking events.',
              imageUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 0,
            },
          ],
        },
      ],
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString(),
    },
    {
      id: '3',
      title: 'Campus Improvement Committee Election',
      description: 'Election for members of the Campus Improvement Committee to work on enhancing campus facilities.',
      startDate: lastWeek.toISOString(),
      endDate: yesterday.toISOString(),
      status: 'completed',
      positions: [
        {
          id: '3-1',
          title: 'Committee Chair',
          description: 'Leads the Campus Improvement Committee meetings and initiatives.',
          maxSelections: 1,
          candidates: [
            {
              id: '3-1-1',
              name: 'Sarah Williams',
              studentId: 'PS24680',
              department: 'Political Science',
              year: 3,
              position: 'Committee Chair',
              positionId: '3-1',
              manifesto: 'I will prioritize sustainable campus initiatives and student wellness facilities.',
              imageUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 25,
            },
            {
              id: '3-1-2',
              name: 'David Chen',
              studentId: 'BI13579',
              department: 'Biology',
              year: 2,
              position: 'Committee Chair',
              positionId: '3-1',
              manifesto: 'I will focus on improving study spaces and recreational areas.',
              imageUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 18,
            },
          ],
        },
        {
          id: '3-2',
          title: 'Committee Member',
          description: 'Works on various campus improvement projects.',
          maxSelections: 2,
          candidates: [
            {
              id: '3-2-1',
              name: 'Michael Lee',
              studentId: 'EE67890',
              department: 'Electrical Engineering',
              year: 4,
              position: 'Committee Member',
              positionId: '3-2',
              manifesto: 'I will use my engineering background to propose practical improvements to campus infrastructure.',
              imageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 22,
            },
            {
              id: '3-2-2',
              name: 'John Smith',
              studentId: 'CS12345',
              department: 'Computer Science',
              year: 3,
              position: 'Committee Member',
              positionId: '3-2',
              manifesto: 'I will work on improving technology in classrooms and study areas.',
              imageUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 20,
            },
            {
              id: '3-2-3',
              name: 'Emily Johnson',
              studentId: 'BZ54321',
              department: 'Business',
              year: 2,
              position: 'Committee Member',
              positionId: '3-2',
              manifesto: 'I will focus on improving common spaces to enhance student collaboration.',
              imageUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
              votes: 28,
            },
          ],
        },
      ],
      createdAt: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: yesterday.toISOString(),
    },
  ];
  
  localStorage.setItem('elections', JSON.stringify(elections));
  
  // Sample votes
  const votes = [
    {
      id: '1',
      electionId: '1',
      positionId: '1-1',
      candidateId: '1-1-2',
      voterId: '2',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      electionId: '1',
      positionId: '1-2',
      candidateId: '1-2-1',
      voterId: '2',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      electionId: '1',
      positionId: '1-3',
      candidateId: '1-3-1',
      voterId: '2',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      electionId: '3',
      positionId: '3-1',
      candidateId: '3-1-1',
      voterId: '2',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      electionId: '3',
      positionId: '3-2',
      candidateId: '3-2-3',
      voterId: '2',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      electionId: '3',
      positionId: '3-2',
      candidateId: '3-2-1',
      voterId: '2',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  
  localStorage.setItem('votes', JSON.stringify(votes));
  
  // Mark as initialized
  localStorage.setItem('initialized', 'true');
};

// Run initialization
initMockData();

export default initMockData;