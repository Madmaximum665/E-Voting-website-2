import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart4, 
  Calendar, 
  Users, 
  Award, 
  Vote, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import useElectionStore from '../../stores/electionStore';
import useStudentStore from '../../stores/studentStore';
import { useAuthStore } from '../../stores/authStore';

const AdminDashboard = () => {
  const { elections, loading: electionsLoading, loadElections } = useElectionStore();
  const { students, loading: studentsLoading, loadStudents } = useStudentStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    loadElections();
    loadStudents();
  }, [loadElections, loadStudents]);
  
  if (electionsLoading || studentsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  const activeElections = elections.filter(election => election.status === 'active').length;
  const upcomingElections = elections.filter(election => election.status === 'upcoming').length;
  const completedElections = elections.filter(election => election.status === 'completed').length;
  
  const totalCandidates = (elections || []).reduce(
    (sum, election) => {
      const positions = election.positions || [];
      return sum + positions.reduce(
        (posSum, position) => {
          const candidates = position.candidates || [];
          return posSum + candidates.length;
        },
        0
      );
    },
    0
  );
  
  const totalVotes = (elections || []).reduce(
    (sum, election) => {
      const positions = election.positions || [];
      return sum + positions.reduce(
        (posSum, position) => {
          const candidates = position.candidates || [];
          return posSum + candidates.reduce(
            (candSum, candidate) => candSum + (candidate.votes || 0),
            0
          );
        },
        0
      );
    },
    0
  );
  
  const recentElections = [...elections]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);
  
  const getElectionStatus = (election) => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'active';
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Active
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3.5 w-3.5 mr-1" /> Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Completed
          </span>
        );
      default:
        return null;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Admin'}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's an overview of your voting system.
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {students.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/students" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all
              </Link>
            </div>
          </div>
        </div>
        
        {/* Total Elections */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Elections
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {elections.length}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <span className="sr-only">
                        {activeElections} active
                      </span>
                      <span>
                        {activeElections} active
                      </span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/elections" className="font-medium text-green-600 hover:text-green-500">
                View all elections
              </Link>
            </div>
          </div>
        </div>
        
        {/* Total Candidates */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Candidates
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {totalCandidates}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/candidates" className="font-medium text-yellow-600 hover:text-yellow-500">
                Manage candidates
              </Link>
            </div>
          </div>
        </div>
        
        {/* Total Votes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <BarChart4 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Votes Cast
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {totalVotes}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/results" className="font-medium text-purple-600 hover:text-purple-500">
                View results
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Elections */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Elections
          </h3>
          <Link 
            to="/admin/elections" 
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View All
          </Link>
        </div>
        <div className="bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {recentElections.length > 0 ? (
              recentElections.map((election) => (
                <li key={election.id}>
                  <Link 
                    to={`/admin/elections/edit/${election.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {election.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          {getStatusBadge(getElectionStatus(election))}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {formatDate(election.startDate)} - {formatDate(election.endDate)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500">
                            View details
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No elections found. Create your first election to get started.</p>
                <div className="mt-6">
                  <Link
                    to="/admin/elections/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Election
                  </Link>
                </div>
              </div>
            )}
          </ul>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            <Link
              to="/admin/elections/create"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Election
            </Link>
            <Link
              to="/admin/students/add"
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add New Student
            </Link>
            <Link
              to="/admin/results"
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Election Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
