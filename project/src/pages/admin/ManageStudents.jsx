import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  AlertCircle, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Save,
  User,
  Filter,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { userAPI } from '../../utils/api';

const ManageStudents = () => {
  const { users, loading, error, loadUsers, updateUser, deleteUser } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all'); // Keep as string, even for 'all'
  const [approvalFilter, setApprovalFilter] = useState('all');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // Store student ID being edited
  const [confirmDelete, setConfirmDelete] = useState(null); // Store student ID for delete confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '', // This is the unique ID like 'S1001'
    department: '',
    year: '', // Changed from number to string
    approved: false, // Add approval status to form
  });
  const [validationErrors, setValidationErrors] = useState({});
  
  useEffect(() => {
    // Load users from the backend API
    loadUsers();
  }, [loadUsers]);
  
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      studentId: '',
      department: '',
      year: '',
      approved: false,
    });
    setValidationErrors({});
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value
    }));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.studentId.trim()) {
      errors.studentId = 'Student ID is required';
    } else if (
      (!editingStudent || (editingStudent && users.find(s => s._id === editingStudent)?.studentId !== formData.studentId)) && 
      users.some(user => user.studentId === formData.studentId)
    ) {
      errors.studentId = 'Student ID already exists';
    }
    
    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }
    
    if (!formData.year) {
      errors.year = 'Year of study is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingStudent) {
        await updateUser(editingStudent, formData);
        setEditingStudent(null);
      } else {
        // For new users, we'll use the registration API
        await userAPI.register({
          ...formData,
          password: 'tempPassword123', // Temporary password, should be changed by user
        });
        setShowAddForm(false);
      }
      resetForm();
      // Reload users after changes
      await loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setValidationErrors({ form: err.response?.data?.msg || err.message || 'Failed to save user. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteUser = async (id) => {
    setIsSubmitting(true);
    try {
      await deleteUser(id);
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleApproveUser = async (userId) => {
    setIsSubmitting(true);
    try {
      await updateUser(userId, { approved: true });
      // Reload users to get updated data
      await loadUsers();
    } catch (err) {
      console.error('Error approving user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnapproveUser = async (userId) => {
    setIsSubmitting(true);
    try {
      await updateUser(userId, { approved: false });
      // Reload users to get updated data
      await loadUsers();
    } catch (err) {
      console.error('Error unapproving user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (user) => {
    setFormData({
      fullName: user.fullName,
      email: user.email,
      studentId: user.studentId,
      department: user.department || '',
      year: user.year,
      approved: user.approved || false,
    });
    setEditingStudent(user._id); // Store the MongoDB _id for update
    setShowAddForm(false); // Close add form if open
    setValidationErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to show edit form
  };

  const cancelEdit = () => {
    resetForm();
    setEditingStudent(null);
    setShowAddForm(false);
  };
  
  // Filter to only student users
  const students = users.filter(user => user.role === 'student');
  
  // Get unique departments and years for filters
  const uniqueDepartments = [...new Set(students.map(student => student.department).filter(Boolean))].sort();
  const uniqueYears = [...new Set(students.map(student => student.year).filter(Boolean))].sort();

  const filteredStudents = students
    .filter(student => 
      student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(student => 
      departmentFilter === 'all' || student.department === departmentFilter
    )
    .filter(student => 
      yearFilter === 'all' || student.year === yearFilter
    )
    .filter(student => 
      approvalFilter === 'all' || 
      (approvalFilter === 'approved' && student.approved) || 
      (approvalFilter === 'pending' && !student.approved)
    );

  if (loading && students.length === 0) { // Show loader only on initial load
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
          <h2 className="text-2xl font-semibold text-gray-800">Manage Students</h2>
          {!showAddForm && !editingStudent && (
            <button 
              type="button"
              onClick={() => { resetForm(); setShowAddForm(true); setEditingStudent(null); }}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" /> Add New Student
            </button>
          )}
        </div>

        {/* Add/Edit Student Form */} 
        {(showAddForm || editingStudent) && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h3>
            {validationErrors.form && (
                <div className="rounded-md bg-red-50 p-4 my-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${validationErrors.fullName ? 'border-red-500' : ''}`}
                />
                {validationErrors.fullName && <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${validationErrors.email ? 'border-red-500' : ''}`}
                />
                {validationErrors.email && <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
                <input 
                  type="text" 
                  id="studentId" 
                  name="studentId" 
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${validationErrors.studentId ? 'border-red-500' : ''}`}
                />
                {validationErrors.studentId && <p className="mt-1 text-sm text-red-600">{validationErrors.studentId}</p>}
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                <input 
                  type="text" 
                  id="department" 
                  name="department" 
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science"
                  className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${validationErrors.department ? 'border-red-500' : ''}`}
                />
                {validationErrors.department && <p className="mt-1 text-sm text-red-600">{validationErrors.department}</p>}
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year of Study</label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${validationErrors.year ? 'border-red-500' : ''}`}
                >
                  <option value="" disabled>Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                </select>
                {validationErrors.year && <p className="mt-1 text-sm text-red-600">{validationErrors.year}</p>}
              </div>
              {editingStudent && (
                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      id="approved"
                      name="approved"
                      type="checkbox"
                      checked={formData.approved}
                      onChange={(e) => setFormData({...formData, approved: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="approved" className="ml-2 block text-sm text-gray-900">
                      Approved for Voting
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Only approved students can vote in elections
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={cancelEdit} className="btn-secondary">
                <X className="h-5 w-5 mr-1" /> Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                <Save className="h-5 w-5 mr-1" /> {isSubmitting ? (editingStudent ? 'Saving...' : 'Adding...') : (editingStudent ? 'Save Changes' : 'Add Student')}
              </button>
            </div>
          </form>
        )}

        {/* Filters and Search */} 
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
          <div className="md:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search Students</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="search"
                placeholder="Name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
              />
            </div>
          </div>
          <div>
            <label htmlFor="departmentFilter" className="block text-sm font-medium text-gray-700">Filter by Department</label>
            <select 
              id="departmentFilter" 
              name="departmentFilter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700">Filter by Year</label>
            <select 
              id="yearFilter" 
              name="yearFilter"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="approvalFilter" className="block text-sm font-medium text-gray-700">Filter by Approval</label>
            <select 
              id="approvalFilter" 
              name="approvalFilter"
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Students</option>
              <option value="approved">Approved</option>
              <option value="pending">Not Approved</option>
            </select>
          </div>
        </div>

        {/* Error Display */} 
        {error && (
          <div className="rounded-md bg-red-50 p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Students List */} 
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <tr key={student._id} className={`${editingStudent === student._id ? 'bg-primary-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.approved ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not Approved
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex">
                      <button onClick={() => startEdit(student)} className="text-primary-600 hover:text-primary-800 p-1">
                        <Edit className="h-5 w-5" />
                      </button>
                      {!student.approved ? (
                        <button 
                          onClick={() => handleApproveUser(student._id)} 
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Approve for voting"
                        >
                          <ThumbsUp className="h-5 w-5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUnapproveUser(student._id)} 
                          className="text-orange-600 hover:text-orange-800 p-1"
                          title="Remove voting approval"
                        >
                          <ThumbsDown className="h-5 w-5" />
                        </button>
                      )}
                      <button onClick={() => setConfirmDelete(student._id)} className="text-red-600 hover:text-red-800 p-1">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            {searchQuery || departmentFilter !== 'all' || yearFilter !== 'all' ? (
              <>
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No students match your filters</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDepartmentFilter('all');
                    setYearFilter('all');
                  }}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No students yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Get started by adding your first student using the button above.
                </p>
              </>
            )}
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Student</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this student? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  onClick={() => handleDeleteUser(confirmDelete)}
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

export default ManageStudents;
