// User type
export const UserRole = {
  ADMIN: 'admin',
  STUDENT: 'student',
};

// Election status
export const ElectionStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// User model
export const UserModel = {
  id: '',
  name: '',
  email: '',
  role: '',
  studentId: '',
  department: '',
  createdAt: '',
  updatedAt: '',
};

// Election model
export const ElectionModel = {
  id: '',
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  status: '',
  positions: [],
  createdAt: '',
  updatedAt: '',
};

// Position model
export const PositionModel = {
  id: '',
  title: '',
  description: '',
  electionId: '',
  candidates: [],
  maxVotes: 1,
  createdAt: '',
  updatedAt: '',
};

// Candidate model
export const CandidateModel = {
  id: '',
  name: '',
  bio: '',
  positionId: '',
  electionId: '',
  votes: 0,
  image: '',
  createdAt: '',
  updatedAt: '',
};

// Vote model
export const VoteModel = {
  id: '',
  voterId: '',
  candidateId: '',
  positionId: '',
  electionId: '',
  timestamp: '',
  createdAt: '',
};
