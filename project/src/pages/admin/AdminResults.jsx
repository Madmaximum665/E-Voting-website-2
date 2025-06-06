import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, BarChart4, AlertCircle, Eye, Download, Trophy } from 'lucide-react';
import useElectionStore from '../../stores/electionStore';

const AdminResults = () => {
  const { elections, loading, error, loadElections } = useElectionStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [electionResults, setElectionResults] = useState({});
  
  useEffect(() => {
    loadElections();
  }, [loadElections]);
  
  useEffect(() => {
    // Calculate results for all elections
    const results = {};
    
    elections.forEach(election => {
      const positionResults = election.positions.map(position => {
        const totalVotes = position.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
        
        const candidateResults = position.candidates
          .map(candidate => ({
            candidateId: candidate.id,
            candidateName: candidate.name,
            votes: candidate.votes,
            percentage: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0,
          }))
          .sort((a, b) => b.votes - a.votes);
        
        return {
          positionId: position.id,
          positionTitle: position.title,
          candidates: candidateResults,
          totalVotes,
        };
      });
      
      const totalVotes = positionResults.reduce((sum, position) => sum + position.totalVotes, 0);
      
      // Calculate voter turnout based on number of students
      // In a real app, you'd get the total number of eligible voters
      // For simplicity, we're just using 100 as the total student count
      const totalStudents = 100; // This should ideally come from studentStore or configuration
      const voterTurnout = totalStudents > 0 ? (totalVotes / (totalStudents * (election.positions.length || 1))) * 100 : 0;
      
      results[election.id] = {
        electionId: election.id,
        positions: positionResults,
        totalVotes,
        voterTurnout: Math.min(voterTurnout, 100), // Cap at 100%
      };
    });
    
    setElectionResults(results);
  }, [elections]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Filter elections based on search query and status filter
  const filteredElections = elections
    .filter(election => 
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(election => 
      statusFilter === 'all' || election.status === statusFilter
    );
  
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
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const exportCsv = (election) => {
    const result = electionResults[election.id];
    if (!result) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add header
    csvContent += 'Election:,' + election.title + '\n';
    csvContent += 'Date:,' + formatDate(election.startDate) + ' to ' + formatDate(election.endDate) + '\n';
    csvContent += 'Status:,' + election.status + '\n';
    csvContent += 'Total Votes:,' + result.totalVotes + '\n';
    csvContent += 'Voter Turnout:,' + result.voterTurnout.toFixed(1) + '%\n\n';
    
    // Add position headers
    csvContent += 'Position Title,Candidate Name,Votes,Percentage\n';
    
    result.positions.forEach(position => {
      position.candidates.forEach(candidate => {
        csvContent += `"${position.positionTitle}","${candidate.candidateName}",${candidate.votes},${candidate.percentage.toFixed(1)}%\n`;
      });
      csvContent += '\n'; // Add a blank line between positions
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${election.title.replace(/\s+/g, '_')}_results.csv`);
    document.body.appendChild(link); // Required for FF
    
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-card rounded-lg p-6">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Election Results</h2>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search elections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {filteredElections.length > 0 ? (
          <div className="space-y-6">
            {filteredElections.map(election => {
              const result = electionResults[election.id];
              if (!result) return null;

              return (
                <div key={election.id} className="bg-gray-50 rounded-lg shadow-sm p-6">
                  <div className="md:flex md:items-start md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-primary-700 hover:text-primary-800">
                        <Link to={`/admin/elections/view/${election.id}`}>{election.title}</Link>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{election.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                        <span>{formatDate(election.startDate)} - {formatDate(election.endDate)}</span>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ 
                          election.status === 'completed' ? 'bg-green-100 text-green-800' :
                          election.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                      <Link 
                        to={`/admin/elections/view/${election.id}`}
                        className="btn-secondary-sm inline-flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1.5" /> View
                      </Link>
                      <button 
                        onClick={() => exportCsv(election)}
                        className="btn-secondary-sm inline-flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1.5" /> Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center">
                        <BarChart4 className="h-5 w-5 text-primary-600 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Total Votes</p>
                          <p className="text-lg font-semibold">{result.totalVotes}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center">
                        <BarChart4 className="h-5 w-5 text-primary-600 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Voter Turnout</p>
                          <p className="text-lg font-semibold">{result.voterTurnout.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 text-primary-600 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Positions</p>
                          <p className="text-lg font-semibold">{election.positions.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {result.positions.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-md font-medium text-gray-700 mb-3">Top Results by Position:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.positions.map(position => {
                          const winner = position.candidates[0];
                          return (
                            <div key={position.positionId || `pos-${position.positionTitle}`} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                              <h4 className="text-sm font-medium text-gray-700">{position.positionTitle}</h4>
                              {winner && (
                                <div className="mt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-primary-600">{winner.candidateName}</span>
                                    <span className="text-xs font-medium text-gray-500">{winner.votes} votes ({winner.percentage.toFixed(1)}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div 
                                      className="bg-primary-600 h-2 rounded-full" 
                                      style={{ width: `${winner.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-card p-12 text-center">
            {searchQuery || statusFilter !== 'all' ? (
              <>
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No elections found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <BarChart4 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No elections yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create an election to start seeing results here.
                </p>
                <Link 
                  to="/admin/elections/create" 
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Create Election
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResults;
