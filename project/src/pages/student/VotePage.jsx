import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, AlertCircle, User, Award, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import useElectionStore from '../../stores/electionStore';
import { useAuthStore } from '../../stores/authStore';

const VotePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const positionIdParam = queryParams.get('position');
  
  const { elections, loading, error, loadElections, castVote } = useElectionStore();
  const { user } = useAuthStore();
  
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [voteError, setVoteError] = useState(null);
  
  // Helper function to check if user has already voted for a position
  const hasVoted = (electionId, positionId, userId) => {
    if (!user || !user.votes) return false;
    return user.votes?.[electionId]?.[positionId] !== undefined;
  };
  
  useEffect(() => {
    loadElections();
  }, [loadElections]);
  
  useEffect(() => {
    if (elections.length > 0 && id) {
      const election = elections.find(e => e.id === id);
      if (election) {
        // If position ID was provided in URL, use that
        if (positionIdParam) {
          const position = election.positions.find(p => p.id === positionIdParam);
          if (position) {
            setSelectedPosition(position);
          }
        } else if (election.positions.length > 0) {
          // Otherwise use first position
          setSelectedPosition(election.positions[0]);
        }
      }
    }
  }, [elections, id, positionIdParam]);

  useEffect(() => {
    if (selectedPosition) {
      console.log('[VotePage] selectedPosition updated:', JSON.parse(JSON.stringify(selectedPosition)));
      console.log('[VotePage] Candidates in selectedPosition:', JSON.parse(JSON.stringify(selectedPosition.candidates)));
      console.log('[VotePage] maxSelections for selectedPosition:', selectedPosition.maxSelections);
    }
  }, [selectedPosition]);
  
  const handleSelectPosition = (position) => {
    setSelectedPosition(position);
    setSelectedCandidates([]);
  };
  
  const handleSelectCandidate = (candidateId) => {
    console.log('[VotePage] handleSelectCandidate called with candidateId:', candidateId);
    if (selectedPosition) {
      if (selectedPosition.maxSelections === 1) {
        // Single selection
        setSelectedCandidates([candidateId]);
      } else {
        // Multiple selection
        if (selectedCandidates.includes(candidateId)) {
          // Deselect
          setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
        } else {
          // Select if under max
          if (selectedCandidates.length < selectedPosition.maxSelections) {
            setSelectedCandidates([...selectedCandidates, candidateId]);
          }
        }
      }
    }
  };
  
  const handleSubmitVote = async () => {
    if (!user || !id || !selectedPosition) return;
    
    setIsSubmitting(true);
    setVoteError(null);
    
    try {
      for (const candidateId of selectedCandidates) {
        await castVote({
          electionId: id,
          positionId: selectedPosition.id,
          candidateId,
          voterId: user.id,
        });
      }
      
      setVoteSuccess(true);
      
      // Redirect to results after a brief delay
      setTimeout(() => {
        navigate(`/results/${id}`);
      }, 2000);
      
    } catch (error) {
      setVoteError(error instanceof Error ? error.message : 'An error occurred while submitting your vote');
    } finally {
      setIsSubmitting(false);
    }
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
        <Link to="/dashboard" className="mt-6 btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }
  // If the election is found, but the specific position (from URL param or default) isn't set,
  // selectedPosition will be null. The page might appear blank or error if selectedPosition is used directly.
  // A robust solution would be to also check for selectedPosition here and show a message if it's null
  // after the election object itself is confirmed to exist.
  // For now, reverting to the simpler check as requested.

  if (election.status !== 'active') {
    return (
      <div className="card flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Voting not active</h3>
        <p className="mt-2 text-sm text-gray-500">
          Voting for this election is not currently active.
        </p>
        <Link to={`/election/${id}`} className="mt-6 btn-secondary">
          View Election Details
        </Link>
      </div>
    );
  }
  
  // Check if user is an admin - admins cannot vote
  if (user?.role === 'admin') {
    return (
      <div className="card flex flex-col items-center justify-center py-12">
        <ShieldAlert className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Administrators Cannot Vote</h3>
        <p className="mt-2 text-sm text-gray-500">
          As an administrator, you cannot participate in voting. You can only manage and oversee elections.
        </p>
        <Link to={`/election/${id}`} className="mt-6 btn-secondary">
          View Election Details
        </Link>
      </div>
    );
  }
  
  // Check if user is approved to vote
  if (user?.role === 'student' && user?.approved !== true) {
    return (
      <div className="card flex flex-col items-center justify-center py-12">
        <ShieldAlert className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Not Approved for Voting</h3>
        <p className="mt-2 text-sm text-gray-500">
          Your account has not been approved for voting yet. Please contact an administrator.
        </p>
        <Link to="/dashboard" className="mt-6 btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (user && selectedPosition && hasVoted(election.id, selectedPosition.id, user.id)) {
    return (
      <div className="card flex flex-col items-center justify-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">You have already voted</h3>
        <p className="mt-2 text-sm text-gray-500">
          You have already cast your vote for the position "{selectedPosition.title}".
        </p>
        <Link to={`/results/${id}`} className="mt-6 btn-primary">
          View Results
        </Link>
      </div>
    );
  }

  if (voteSuccess) {
    return (
      <div className="card flex flex-col items-center justify-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Vote Submitted Successfully!</h3>
        <p className="mt-2 text-sm text-gray-500">
          Your vote for "{selectedPosition?.title}" has been recorded.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Redirecting to results...
        </p>
      </div>
    );
  }

  const CandidateCard = ({ candidate }) => {
    const isSelected = selectedCandidates.includes(candidate.id);
    return (
      <div 
        className={`card cursor-pointer transition-all duration-200 ease-in-out 
                    ${isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'}`}
        onClick={() => handleSelectCandidate(candidate.id)}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {candidate.imageUrl ? (
              <img src={candidate.imageUrl} alt={candidate.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-gray-500" />
            )}
          </div>
          <div className="ml-4">
            <h4 className="text-md font-medium text-gray-900">{candidate.name}</h4>
            {/* <p className="text-sm text-gray-500">{candidate.department} - {candidate.year}</p> */}
          </div>
          {isSelected && (
            <div className="ml-auto pl-3">
              <CheckCircle className="h-6 w-6 text-primary-600" />
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-1">
        <Link to={`/election/${id}`} className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
          <ChevronRight className="h-4 w-4 mr-1 transform rotate-180" />
          Back to Election Details
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vote in: {election.title}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar for positions */} 
        <div className="md:col-span-1 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Positions</h2>
          {election.positions.map(pos => {
            console.log('[VotePage] Rendering position button, pos.id:', pos?.id, 'Position title:', pos?.title);
            const userHasVotedForPosition = user ? hasVoted(election.id, pos.id, user.id) : false;
            return (
              <button
                key={pos.id}
                type="button"
                onClick={() => handleSelectPosition(pos)}
                disabled={userHasVotedForPosition}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-150 
                            ${selectedPosition?.id === pos.id ? 'bg-primary-600 text-white shadow-md' : 'bg-white hover:bg-gray-50'}
                            ${userHasVotedForPosition ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span>{pos.title}</span>
                  {userHasVotedForPosition ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <ChevronRight className={`h-5 w-5 ${selectedPosition?.id === pos.id ? 'text-white' : 'text-gray-400'}`} />
                  )}
                </div>
                {userHasVotedForPosition && (
                  <p className="text-xs mt-1 ${selectedPosition?.id === pos.id ? 'text-primary-100' : 'text-gray-500'}">
                    You've already voted for this position.
                  </p>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Main content for candidates */} 
        <div className="md:col-span-2">
          {selectedPosition ? (
            <div className="card">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{selectedPosition.title}</h2>
                <p className="mt-1 text-sm text-gray-600">{selectedPosition.description}</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Award className="h-3.5 w-3.5 mr-1" /> 
                  Select up to {selectedPosition.maxSelections} {selectedPosition.maxSelections === 1 ? 'candidate' : 'candidates'}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className={`font-medium ${selectedCandidates.length > selectedPosition.maxSelections ? 'text-red-600' : 'text-primary-600'}`}>
                    {selectedCandidates.length}
                  </span> / {selectedPosition.maxSelections} selected
                </div>
              </div>
              
              {/* Candidates */} 
              <div className="space-y-4">
                {selectedPosition.candidates.map(candidate => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
                
                {selectedPosition.candidates.length === 0 && (
                  <div className="card flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      There are no candidates for this position.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Submit button */} 
              {selectedPosition.candidates.length > 0 && (
                <div className="mt-6">
                  {voteError && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error submitting vote</h3>
                          <p className="mt-2 text-sm text-red-700">{voteError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    className="w-full btn-primary"
                    disabled={selectedCandidates.length === 0 || isSubmitting || selectedCandidates.length > selectedPosition.maxSelections}
                    onClick={handleSubmitVote}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Vote...
                      </>
                    ) : (
                      <>Submit Vote</>
                    )}
                  </button>
                  
                  {selectedCandidates.length === 0 && (
                    <p className="mt-2 text-sm text-center text-gray-500">
                      Please select {selectedPosition.maxSelections === 1 ? 'a candidate' : 'candidates'} to vote.
                    </p>
                  )}
                  
                  {selectedCandidates.length > selectedPosition.maxSelections && (
                    <p className="mt-2 text-sm text-center text-red-500">
                      You can only select up to {selectedPosition.maxSelections} {selectedPosition.maxSelections === 1 ? 'candidate' : 'candidates'}.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-12">
              <Info className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Select a position</h3>
              <p className="mt-2 text-sm text-gray-500">
                Please select a position from the sidebar to view candidates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotePage;
