import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, Plus, Trash2, AlertCircle, Save, Info } from 'lucide-react';
import useElectionStore from '../../stores/electionStore';

const CreateElection = () => {
  const navigate = useNavigate();
  const { createElection, loading, error } = useElectionStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('draft');
  const [positions, setPositions] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  
  const addPosition = () => {
    setPositions([
      ...positions,
      {
        title: '',
        description: '',
        maxSelections: 1,
      },
    ]);
  };
  
  const updatePosition = (index, field, value) => {
    const updatedPositions = [...positions];
    updatedPositions[index] = {
      ...updatedPositions[index],
      [field]: value,
    };
    setPositions(updatedPositions);
  };
  
  const removePosition = (index) => {
    const updatedPositions = [...positions];
    updatedPositions.splice(index, 1);
    setPositions(updatedPositions);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!title.trim()) {
      errors.title = 'Election title is required';
    }
    
    if (!description.trim()) {
      errors.description = 'Election description is required';
    }
    
    if (!startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!endDate) {
      errors.endDate = 'End date is required';
    } else if (new Date(startDate) >= new Date(endDate)) {
      errors.endDate = 'End date must be after start date';
    }
    
    positions.forEach((position, index) => {
      if (!position.title.trim()) {
        errors[`positionTitle_${index}`] = 'Position title is required';
      }
      
      const maxSelections = parseInt(position.maxSelections, 10);
      if (isNaN(maxSelections) || maxSelections < 1) {
        errors[`positionMaxSelections_${index}`] = 'Must be at least 1';
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await createElection({
        title,
        description,
        status,
        startDate,
        endDate,
        positions: positions.map(pos => ({
          ...pos,
          maxSelections: parseInt(pos.maxSelections, 10)
        })),
      });
      
      // Redirect to elections list on success
      navigate('/admin/elections');
    } catch (err) {
      console.error('Error creating election:', err);
    }
  };
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };
  
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <div className="flex">
                <Link to="/admin" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                  Dashboard
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <Link to="/admin/elections" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Elections
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <span className="ml-4 text-sm font-medium text-gray-500">Create New</span>
              </div>
            </li>
          </ol>
        </nav>
        <div className="mt-2 md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Create New Election
            </h2>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
          <div>
            <div className="space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                    Election Title
                  </label>
                  <p className="mt-1 text-sm text-gray-500">A clear and descriptive name for the election</p>
                </div>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <input
                    type="text"
                    id="title"
                    className={`block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm ${
                      validationErrors.title ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500' : ''
                    }`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {validationErrors.title && (
                    <p className="mt-2 text-sm text-red-600" id="title-error">
                      {validationErrors.title}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                    Election Status
                  </label>
                  <p className="mt-1 text-sm text-gray-500">Set the initial status of this election</p>
                </div>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <select
                    id="status"
                    name="status"
                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    <Info className="inline-block h-4 w-4 mr-1 text-gray-400" />
                    "Draft" elections are not visible to students. "Active" elections are open for voting.
                  </p>
                </div>
              </div>
              
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                    Description
                  </label>
                  <p className="mt-1 text-sm text-gray-500">Provide details about the election</p>
                </div>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <textarea
                    id="description"
                    rows={3}
                    className={`block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.description ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500' : ''
                    }`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  {validationErrors.description && (
                    <p className="mt-2 text-sm text-red-600" id="description-error">
                      {validationErrors.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Election Period</h3>
                  <p className="mt-1 text-sm text-gray-500">When will the election take place?</p>
                </div>
                <div className="mt-2 space-y-4 sm:col-span-2 sm:mt-0">
                  <div className="flex items-center">
                    <div className="w-24">
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Start
                      </label>
                    </div>
                    <div className="flex-1">
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="datetime-local"
                          id="startDate"
                          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                            validationErrors.startDate ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500' : ''
                          }`}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      {validationErrors.startDate && (
                        <p className="mt-1 text-sm text-red-600" id="startDate-error">
                          {validationErrors.startDate}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-24">
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        End
                      </label>
                    </div>
                    <div className="flex-1">
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="datetime-local"
                          id="endDate"
                          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                            validationErrors.endDate ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500' : ''
                          }`}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || undefined}
                        />
                      </div>
                      {validationErrors.endDate && (
                        <p className="mt-1 text-sm text-red-600" id="endDate-error">
                          {validationErrors.endDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Positions</h3>
                <button
                  type="button"
                  onClick={addPosition}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Plus className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                  Add Position
                </button>
              </div>
              
              {positions.length === 0 ? (
                <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No positions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding positions to your election.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={addPosition}
                      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Add Position
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {positions.map((position, index) => (
                    <div key={index} className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <div className="absolute top-4 right-4">
                        <button
                          type="button"
                          onClick={() => removePosition(index)}
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <span className="sr-only">Remove position</span>
                          <Trash2 className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label htmlFor={`position-title-${index}`} className="block text-sm font-medium text-gray-700">
                            Position Title
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id={`position-title-${index}`}
                              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                validationErrors[`positionTitle_${index}`] ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500' : ''
                              }`}
                              value={position.title}
                              onChange={(e) => updatePosition(index, 'title', e.target.value)}
                            />
                            {validationErrors[`positionTitle_${index}`] && (
                              <p className="mt-1 text-sm text-red-600" id={`position-title-${index}-error`}>
                                {validationErrors[`positionTitle_${index}`]}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor={`position-description-${index}`} className="block text-sm font-medium text-gray-700">
                            Description (Optional)
                          </label>
                          <div className="mt-1">
                            <textarea
                              id={`position-description-${index}`}
                              rows={2}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={position.description}
                              onChange={(e) => updatePosition(index, 'description', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label htmlFor={`position-max-selections-${index}`} className="block text-sm font-medium text-gray-700">
                              Maximum Selections
                            </label>
                            <div className="mt-1">
                              <input
                                type="number"
                                id={`position-max-selections-${index}`}
                                min="1"
                                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                  validationErrors[`positionMaxSelections_${index}`] ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500' : ''
                                }`}
                                value={position.maxSelections}
                                onChange={(e) => updatePosition(index, 'maxSelections', parseInt(e.target.value, 10) || 1)}
                              />
                              {validationErrors[`positionMaxSelections_${index}`] && (
                                <p className="mt-1 text-sm text-red-600" id={`position-max-selections-${index}-error`}>
                                  {validationErrors[`positionMaxSelections_${index}`]}
                                </p>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Number of candidates a voter can select for this position
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addPosition}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <Plus className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                      Add Another Position
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-5">
          <div className="flex justify-end space-x-3">
            <Link
              to="/admin/elections"
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                  Create Election
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateElection;
