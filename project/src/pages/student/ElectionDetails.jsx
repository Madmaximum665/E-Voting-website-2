import React, { useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, Award, ChevronRight, AlertCircle, Clock, CheckCircle, ShieldAlert } from 'lucide-react';
import useElectionStore from '../../stores/electionStore';
import { useAuthStore } from '../../stores/authStore';

const ElectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in the admin section
  const isAdminView = location.pathname.includes('/admin/');
  
  const { elections, loading, error, loadElections } = useElectionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      console.log('[ElectionDetails.jsx] User object from authStore:', JSON.parse(JSON.stringify(user)));
      console.log('[ElectionDetails.jsx] User votes:', user.votes ? JSON.parse(JSON.stringify(user.votes)) : 'user.votes is undefined');
    }
  }, [user]);
  
  useEffect(() => {
    loadElections();
  }, [loadElections]);
  
  // Helper function to check if user has already voted for a position
  const hasVoted = (electionId, positionId) => {
    if (!user || !user.votes) return false;
    return user.votes?.[electionId]?.[positionId] !== undefined;
  };
  
  // Check if user is approved to vote
  const isApprovedToVote = () => {
    // Admins cannot vote, only students who are approved can vote
    if (user?.role === 'admin') return false;
    return user?.role === 'student' && user?.approved === true;
  };
  
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
            <h3 className="text-sm font-medium text-red-800">Error loading election details</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const election = elections.find(e => e.id === id);
  
  if (!election) {
    return (
      <div className="card flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Election not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The election you're looking for doesn't exist or has been removed.
        </p>
        <Link to={isAdminView ? "/admin/elections" : "/dashboard"} className="mt-6 btn-primary">
          {isAdminView ? "Back to Elections" : "Back to Dashboard"}
        </Link>
      </div>
    );
  }
  
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
            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Completed
          </span>
        );
      default:
        return null;
    }
  };
  
  const PositionCard = ({ position }) => {
    const userHasVoted = hasVoted(election.id, position.id);
    const userCanVote = isApprovedToVote();
    
    return (
      <div className="card mb-4 animate-slideUp">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{position.title}</h3>
          {election.status === 'active' && (
            userHasVoted ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Voted
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Award className="h-3.5 w-3.5 mr-1" /> Not Voted
              </span>
            )
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600">{position.description}</p>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-1" />
          <span>{position.candidates.length} {position.candidates.length === 1 ? 'candidate' : 'candidates'}</span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">
              Select {position.maxSelections} {position.maxSelections === 1 ? 'candidate' : 'candidates'}
            </span>
          </div>
          <div>
            {election.status === 'active' && !isAdminView && (
              userHasVoted ? (
                <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
                  <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                  You have already voted
                </span>
              ) : userCanVote ? (
                <Link to={`/vote/${election.id}?position=${position.id}`} className="btn-primary">
                  Vote Now
                </Link>
              ) : (
                <button 
                  className="btn-disabled cursor-not-allowed flex items-center" 
                  disabled 
                  title="Your account needs approval to vote"
                >
                  <ShieldAlert className="h-4 w-4 mr-1" />
                  Approval Required
                </button>
              )
            )}
            {election.status === 'completed' && (
              <Link to={isAdminView ? `/admin/results` : `/results/${election.id}`} className="btn-secondary">
                View Results
              </Link>
            )}
            {isAdminView && election.status === 'active' && (
              <Link to={`/admin/elections/edit/${election.id}`} className="btn-primary">
                Edit Election
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-1">
        <Link 
          to={isAdminView ? "/admin/elections" : "/dashboard"} 
          className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
        >
          <ChevronRight className="h-4 w-4 mr-1 transform rotate-180" />
          {isAdminView ? "Back to Elections" : "Back to Dashboard"}
        </Link>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{election.title}</h1>
          <p className="mt-1 text-sm text-gray-600">{election.description}</p>
        </div>
        <div className="mt-2 sm:mt-0">
          {getStatusBadge(election.status)}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
            <span>Starts: {formatDate(election.startDate)}</span>
          </div>
          <span className="hidden sm:inline mx-2">•</span>
          <div className="flex items-center mt-1 sm:mt-0">
            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
            <span>Ends: {formatDate(election.endDate)}</span>
          </div>
        </div>
      </div>
      
      {election.status === 'upcoming' && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                This election has not started yet. Voting will begin on {formatDate(election.startDate)}.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {election.status === 'completed' && (
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                This election has ended. You can view the results below.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Approval warning for students */}
      {user?.role === 'student' && !user?.approved && election.status === 'active' && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                Your account has not been approved for voting yet. Please contact an administrator.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Admin warning */}
      {user?.role === 'admin' && election.status === 'active' && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                As an administrator, you cannot participate in voting. You can only manage and oversee elections.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Admin actions */}
      {isAdminView && (
        <div className="mb-6 flex justify-end space-x-4">
          <Link to={`/admin/elections/edit/${election.id}`} className="btn-primary">
            Edit Election
          </Link>
        </div>
      )}
      
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Positions</h2>
        {election.positions.map(position => (
          <PositionCard key={position.id} position={position} />
        ))}
      </section>
      
      {election.status === 'completed' && (
        <div className="mt-6 text-center">
          <Link to={isAdminView ? `/admin/results` : `/results/${election.id}`} className="btn-primary">
            View Complete Results
          </Link>
        </div>
      )}
    </div>
  );
};

export default ElectionDetails;
