import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useElectionStore from '../../stores/electionStore';
import { Calendar, ListChecks, PieChart, AlertCircle, Loader2 } from 'lucide-react';

const StudentElectionsPage = () => {
  const { elections, loading, error, loadElections } = useElectionStore();

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">Active</span>;
      case 'upcoming':
        return <span className="px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Upcoming</span>;
      case 'completed':
        return <span className="px-2 py-0.5 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">Completed</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">{status}</span>;
    }
  };

  if (loading && elections.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        <p className="ml-3 text-gray-600">Loading elections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 p-4 rounded-lg border border-red-200">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <p className="text-red-700 font-medium">Error loading elections:</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Elections</h1>
      
      {elections.length === 0 && !loading ? (
        <div className="text-center py-12">
          <ListChecks className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No elections available at the moment.</p>
          <p className="text-sm text-gray-500 mt-2">Please check back later or contact an administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => (
            <div key={election.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-800 truncate" title={election.title}>{election.title}</h2>
                  {getStatusBadge(election.status)}
                </div>
                <p className="text-sm text-gray-600 mb-4 h-10 overflow-hidden">{election.description || 'No description available.'}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}</span>
                </div>

                <div className="mt-6">
                  {election.status === 'active' && (
                    <Link 
                      to={`/election/${election.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
                    >
                      View & Vote
                    </Link>
                  )}
                  {election.status === 'upcoming' && (
                    <Link 
                      to={`/election/${election.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
                    >
                      View Details
                    </Link>
                  )}
                  {election.status === 'completed' && (
                    <Link 
                      to={`/results/${election.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors duration-150"
                    >
                      View Results
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentElectionsPage;
