// User Types
export interface User {
  id: string;
  name?: string; // For backward compatibility
  fullName: string;
  email: string;
  role: 'student' | 'admin';
  studentId?: string;
  department?: string;
  year?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Election Types
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  positions: Position[];
  status: 'upcoming' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
  maxSelections: number;
}

export interface Candidate {
  id: string;
  name: string;
  studentId: string;
  department: string;
  year: number;
  position: string;
  positionId: string;
  manifesto: string;
  imageUrl: string;
  votes: number;
}

// Vote Types
export interface Vote {
  id: string;
  electionId: string;
  positionId: string;
  candidateId: string;
  voterId: string;
  timestamp: string;
}

// Student Types
export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  department: string;
  year: number;
}

// Result Types
export interface ElectionResult {
  electionId: string;
  positions: PositionResult[];
  totalVotes: number;
  voterTurnout: number;
}

export interface PositionResult {
  positionId: string;
  positionTitle: string;
  candidates: CandidateResult[];
  totalVotes: number;
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  votes: number;
  percentage: number;
}