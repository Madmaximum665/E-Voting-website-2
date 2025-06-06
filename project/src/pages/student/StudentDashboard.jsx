import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, AlertCircle, CheckCircle, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import useElectionStore from '../../stores/electionStore';
import { useAuthStore } from '../../stores/authStore';

const StudentDashboard = () => {
  const { elections, loading, error, loadElections } = useElectionStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    loadElections();
  }, [loadElections]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Active
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3.5 w-3.5 mr-1" /> Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Completed
          </span>
        );
      default:
        return null;
    }
  };
  
  const activeElections = elections.filter(election => election.status === 'active');
  const upcomingElections = elections.filter(election => election.status === 'upcoming');
  const completedElections = elections.filter(election => election.status === 'completed');
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading elections</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const ElectionCard = ({ election }) => {
    return (
      <div className="card mb-4 hover:shadow-lg transition-shadow duration-200 animate-slideUp">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{election.title}</h3>
          {getStatusBadge(election.status)}
        </div>
        <p className="mt-1 text-sm text-gray-600">{election.description}</p>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Starts: {formatDate(election.startDate)}</span>
          </div>
          <span className="hidden sm:inline mx-2">•</span>
          <div className="flex items-center mt-1 sm:mt-0">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Ends: {formatDate(election.endDate)}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">
              {election.positions.length} {election.positions.length === 1 ? 'position' : 'positions'}
            </span>
          </div>
          <div>
            {election.status === 'active' && (
              <Link to={`/election/${election.id}`} className="btn-primary">
                View & Vote
              </Link>
            )}
            {election.status === 'upcoming' && (
              <Link to={`/election/${election.id}`} className="btn-secondary">
                View Details
              </Link>
            )}
            {election.status === 'completed' && (
              <Link to={`/results/${election.id}`} className="btn-secondary">
                View Results
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome, {user?.name}! View and participate in college elections.
        </p>
      </div>
      
      {/* Approval Status Banner */}
      {user?.role === 'student' && (
        <div className={`mb-6 p-4 rounded-lg ${user?.approved ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {user?.approved ? (
                <ShieldCheck className="h-5 w-5 text-green-500" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${user?.approved ? 'text-green-800' : 'text-amber-800'}`}>
                {user?.approved ? 'Approved for Voting' : 'Awaiting Approval'}
              </h3>
              <p className={`mt-1 text-sm ${user?.approved ? 'text-green-700' : 'text-amber-700'}`}>
                {user?.approved 
                  ? 'Your account has been approved. You can vote in active elections.' 
                  : 'Your account is pending approval by an administrator. You cannot vote until approved.'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {activeElections.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Elections</h2>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  You have {activeElections.length} active {activeElections.length === 1 ? 'election' : 'elections'} available for voting.
                  {user?.role === 'student' && !user?.approved && ' (Approval required to vote)'}
                </p>
              </div>
            </div>
          </div>
          {activeElections.map(election => (
            <ElectionCard key={election.id} election={election} />
          ))}
        </section>
      )}
      
      {upcomingElections.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Elections</h2>
          {upcomingElections.map(election => (
            <ElectionCard key={election.id} election={election} />
          ))}
        </section>
      )}
      
      {completedElections.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Elections</h2>
          {completedElections.map(election => (
            <ElectionCard key={election.id} election={election} />
          ))}
        </section>
      )}
      
      {elections.length === 0 && !loading && !error && (
        <div className="card flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No elections found</h3>
          <p className="mt-2 text-sm text-gray-500">
            There are no elections available at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
