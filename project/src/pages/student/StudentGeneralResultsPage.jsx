import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useElectionStore from '../../stores/electionStore';
import { Calendar, PieChart, AlertCircle, Loader2, ListChecks } from 'lucide-react';

const StudentGeneralResultsPage = () => {
  const { elections, loading, error, loadElections } = useElectionStore();

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  const displayElections = useMemo(() => {
    // Show all elections, or you can add a filter here if needed in the future
    return elections;
  }, [elections]);

  if (loading && elections.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        <p className="ml-3 text-gray-600">Loading election results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 p-4 rounded-lg border border-red-200">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <p className="text-red-700 font-medium">Error loading results:</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Election Results</h1>
      
      {displayElections.length === 0 && !loading ? (
        <div className="text-center py-12">
          <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No elections found.</p>
          <p className="text-sm text-gray-500 mt-2">Election results will appear here as they become available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayElections.map((election) => (
            <div key={election.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 truncate mb-3" title={election.title}>{election.title}</h2>
                <p className="text-sm text-gray-600 mb-4 h-10 overflow-hidden">{election.description || 'No description available.'}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <ListChecks className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
                  <span>Status: <span className={`font-medium ${election.status === 'active' ? 'text-green-600' : election.status === 'completed' ? 'text-gray-700' : 'text-yellow-600'}`}>{election.status.charAt(0).toUpperCase() + election.status.slice(1)}</span></span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {election.status === 'completed' ? 'Concluded: ' : 'Ends: '} 
                    {new Date(election.endDate).toLocaleDateString()} {new Date(election.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="mt-6">
                  <Link 
                    to={`/results/${election.id}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
                  >
                    View Full Results
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentGeneralResultsPage;
