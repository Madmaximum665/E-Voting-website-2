import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { 
  Plus, 
  AlertCircle, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle,
  X,
  Save,
  User,
  UserPlus
} from 'lucide-react';
import useElectionStore from '../../stores/electionStore';
import useStudentStore from '../../stores/studentStore';

const ManageCandidates = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Added for navigation
  const queryParams = new URLSearchParams(location.search);
  const electionIdParam = queryParams.get('election');
  const positionIdParam = queryParams.get('position');
  
  const { elections, loading: electionsLoading, loadElections, updateElection } = useElectionStore();
  const { students, loading: studentsLoading, loadStudents } = useStudentStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null); // For editing
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    manifesto: '',
    imageUrl: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  
  useEffect(() => {
    loadElections(); // Corrected function call
    loadStudents();
  }, [loadElections, loadStudents]);
  
  useEffect(() => {
    if (elections.length > 0) {
      let currentElection = null;
      if (electionIdParam) {
        currentElection = elections.find(e => e.id === electionIdParam);
      }
      if (!currentElection) {
        currentElection = elections.find(e => e.status === 'ongoing') || elections.find(e => e.status === 'upcoming') || elections[0];
      }

      if (currentElection) {
        setSelectedElection(currentElection);
        let currentPosition = null;
        if (positionIdParam && currentElection.id === electionIdParam) {
          currentPosition = currentElection.positions.find(p => p.id === positionIdParam);
        }
        if (!currentPosition && currentElection.positions.length > 0) {
          currentPosition = currentElection.positions[0];
        }
        setSelectedPosition(currentPosition);
        if (currentElection.id !== electionIdParam || (currentPosition && currentPosition.id !== positionIdParam)){
            updateUrlParams(currentElection.id, currentPosition ? currentPosition.id : null);
        }
      }
    }
  }, [elections, electionIdParam, positionIdParam, navigate]);

  const updateUrlParams = (electionId, positionId) => {
    const params = new URLSearchParams();
    if (electionId) params.set('election', electionId);
    if (positionId) params.set('position', positionId);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };
  
  const handleElectionChange = (electionId) => {
    const election = elections.find(e => e.id === electionId);
    if (election) {
      setSelectedElection(election);
      const firstPosition = election.positions.length > 0 ? election.positions[0] : null;
      setSelectedPosition(firstPosition);
      setShowAddForm(false);
      setEditingCandidate(null);
      updateUrlParams(election.id, firstPosition ? firstPosition.id : null);
    }
  };
  
  const handlePositionChange = (positionId) => {
    if (selectedElection) {
      const position = selectedElection.positions.find(p => p.id === positionId);
      if (position) {
        setSelectedPosition(position);
        setShowAddForm(false);
        setEditingCandidate(null);
        updateUrlParams(selectedElection.id, position.id);
      }
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.studentId) errors.studentId = 'Please select a student';
    if (!formData.manifesto.trim()) errors.manifesto = 'Manifesto is required';
    if (!formData.imageUrl.trim()) {
      errors.imageUrl = 'Image URL is required';
    } else if (!isValidUrl(formData.imageUrl)){
      errors.imageUrl = 'Please enter a valid URL for the image';
    }

    // Check if student is already a candidate for this position (if not editing that specific candidate)
    if (selectedPosition && selectedPosition.candidates) {
        const existingCandidate = selectedPosition.candidates.find(c => c.studentId === formData.studentId);
        if (existingCandidate && (!editingCandidate || existingCandidate.id !== editingCandidate.id)) {
            errors.studentId = 'This student is already a candidate for this position.';
        }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAddOrUpdateCandidate = async (e) => {
    e.preventDefault();
    if (!validateForm() || !selectedElection || !selectedPosition) return;
    
    setIsSubmitting(true);
    try {
      const candidateData = {
        ...formData,
        name: students.find(s => s.id === formData.studentId)?.name || 'Unknown Student',
        votes: editingCandidate ? editingCandidate.votes : 0, // Preserve votes if editing
      };

      if (editingCandidate) {
        await updateCandidate(selectedElection.id, selectedPosition.id, editingCandidate.id, candidateData);
      } else {
        await addCandidate(selectedElection.id, selectedPosition.id, candidateData);
      }
      
      setShowAddForm(false);
      setEditingCandidate(null);
      setFormData({ studentId: '', manifesto: '', imageUrl: '' }); // Reset form
      setValidationErrors({});
      // getElections(); // Re-fetch to update candidate list, or rely on store's optimistic update
    } catch (error) {
      console.error('Error saving candidate:', error);
      setValidationErrors({ form: error.message || 'Failed to save candidate. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCandidate = async (candidateId) => {
    if (!selectedElection || !selectedPosition) return;
    
    setIsSubmitting(true);
    try {
      await deleteCandidate(selectedElection.id, selectedPosition.id, candidateId);
      setConfirmDelete(null);
      // getElections(); // Re-fetch or rely on store
    } catch (error) {
      console.error('Error deleting candidate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditForm = (candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      studentId: candidate.studentId,
      manifesto: candidate.manifesto,
      imageUrl: candidate.imageUrl,
    });
    setShowAddForm(true);
    setValidationErrors({});
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingCandidate(null);
    setFormData({ studentId: '', manifesto: '', imageUrl: '' });
    setValidationErrors({});
  };
  
  const availableStudents = students.filter(student => {
    if (!selectedPosition || !selectedPosition.candidates) return true;
    // If editing, allow the current candidate's studentId
    if (editingCandidate && student.id === editingCandidate.studentId) return true;
    // Otherwise, only show students not already candidates for this position
    return !selectedPosition.candidates.some(c => c.studentId === student.id);
  });

  const filteredCandidates = selectedPosition?.candidates?.filter(candidate => 
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-card rounded-lg p-6">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Manage Candidates</h2>
          {!showAddForm && !editingCandidate && selectedPosition && (
            <button 
              type="button"
              onClick={() => { setShowAddForm(true); setEditingCandidate(null); setFormData({ studentId: '', manifesto: '', imageUrl: '' }); setValidationErrors({}); }}
              className="btn-primary inline-flex items-center"
            >
              <UserPlus className="h-5 w-5 mr-2" /> Add Candidate
            </button>
          )}
        </div>

        {/* Election and Position Selectors */} 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="election" className="block text-sm font-medium text-gray-700 mb-1">Election</label>
            <select 
              id="election" 
              name="election"
              value={selectedElection ? selectedElection.id : ''}
              onChange={(e) => handleElectionChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>Select an election</option>
              {elections.map(election => (
                <option key={election.id} value={election.id}>{election.title} ({election.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <select 
              id="position" 
              name="position"
              value={selectedPosition ? selectedPosition.id : ''}
              onChange={(e) => handlePositionChange(e.target.value)}
              disabled={!selectedElection || selectedElection.positions.length === 0}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>Select a position</option>
              {selectedElection && selectedElection.positions.map(pos => (
                <option key={pos.id} value={pos.id}>{pos.title}</option>
              ))}
              {selectedElection && selectedElection.positions.length === 0 && (
                <option value="" disabled>No positions available for this election</option>
              )}
            </select>
          </div>
        </div>

        {/* Add/Edit Candidate Form */} 
        {(showAddForm || editingCandidate) && selectedPosition && (
          <form onSubmit={handleAddOrUpdateCandidate} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'} for {selectedPosition.title}
            </h3>
            {validationErrors.form && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{validationErrors.form}</p>
                        </div>
                    </div>
                </div>
            )}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student</label>
              <select 
                id="studentId" 
                name="studentId" 
                value={formData.studentId}
                onChange={handleInputChange}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${validationErrors.studentId ? 'border-red-500' : ''}`}
              >
                <option value="" disabled>Select a student</option>
                {availableStudents.map(student => (
                  <option key={student.id} value={student.id}>{student.name} ({student.studentId})</option>
                ))}
                 {editingCandidate && !availableStudents.find(s => s.id === editingCandidate.studentId) && students.find(s => s.id === editingCandidate.studentId) && (
                    <option key={editingCandidate.studentId} value={editingCandidate.studentId}>
                        {students.find(s => s.id === editingCandidate.studentId).name} ({students.find(s => s.id === editingCandidate.studentId).studentId})
                    </option>
                )}
              </select>
              {validationErrors.studentId && <p className="mt-2 text-sm text-red-600">{validationErrors.studentId}</p>}
            </div>
            <div>
              <label htmlFor="manifesto" className="block text-sm font-medium text-gray-700">Manifesto</label>
              <textarea 
                id="manifesto" 
                name="manifesto" 
                rows="3" 
                value={formData.manifesto}
                onChange={handleInputChange}
                className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${validationErrors.manifesto ? 'border-red-500' : ''}`}
              />
              {validationErrors.manifesto && <p className="mt-2 text-sm text-red-600">{validationErrors.manifesto}</p>}
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
              <input 
                type="text" 
                id="imageUrl" 
                name="imageUrl" 
                value={formData.imageUrl}
                onChange={handleInputChange}
                className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${validationErrors.imageUrl ? 'border-red-500' : ''}`}
              />
              {validationErrors.imageUrl && <p className="mt-2 text-sm text-red-600">{validationErrors.imageUrl}</p>}
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={closeForm} className="btn-secondary">
                <X className="h-5 w-5 mr-1" /> Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                <Save className="h-5 w-5 mr-1" /> {isSubmitting ? (editingCandidate ? 'Saving...' : 'Adding...') : (editingCandidate ? 'Save Changes' : 'Add Candidate')}
              </button>
            </div>
          </form>
        )}

        {/* Candidates List */} 
        {selectedPosition ? (
          <>
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder={`Search candidates in ${selectedPosition.title}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {filteredCandidates.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredCandidates.map(candidate => (
                  <li key={candidate.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={candidate.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=random`} alt={candidate.name} className="h-10 w-10 rounded-full object-cover mr-3" />
                      <div>
                        <p className="text-sm font-medium text-primary-600">{candidate.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-md">{candidate.manifesto}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => openEditForm(candidate)} className="p-1 text-gray-500 hover:text-primary-600">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => setConfirmDelete(candidate.id)} className="p-1 text-gray-500 hover:text-red-600">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'Try adjusting your search.' : `No candidates yet for ${selectedPosition.title}.`}
                </p>
                {!showAddForm && !editingCandidate && (
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(true); setEditingCandidate(null); setFormData({ studentId: '', manifesto: '', imageUrl: '' }); }}
                    className="mt-4 btn-primary flex items-center mx-auto"
                  >
                    <UserPlus className="h-5 w-5 mr-1" />
                    Add Candidate
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No position selected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please select an election and a position to manage candidates.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */} 
      {confirmDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Candidate</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to remove this candidate? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  onClick={() => handleDeleteCandidate(confirmDelete)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  onClick={() => setConfirmDelete(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCandidates;
