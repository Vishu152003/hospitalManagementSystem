import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaUserInjured, FaBirthdayCake, FaVenusMars, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, FaFilter, FaSearch, FaFileDownload, FaPlus, FaCalendarAlt, FaNotesMedical, FaTint, FaSyncAlt } from 'react-icons/fa';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';
import { generateId, saveToLocalStorage } from '../../Utils/dataUtils';

const Patients = () => {
  // Use the sync hook to get the real-time list of ALL users
  const [allUsers, setAllUsers] = useLocalStorageSync('users', []);
  // Filter users to get only patients
  const patients = useMemo(() => allUsers.filter(user => user.role === 'patient'), [allUsers]);

  const [appointments] = useLocalStorageSync('appointments', []);
  const [medicalRecords] = useLocalStorageSync('medicalRecords', []);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState('details');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterBloodGroup, setFilterBloodGroup] = useState('All');
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('patients');

  // Force refresh when related data changes
  useEffect(() => {
    const handleStorageUpdate = () => {
      // Refresh when any related data changes
      setRefreshKey(prev => prev + 1);
      setLastUpdated(new Date());
    };

    window.addEventListener('storageUpdate', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('storageUpdate', handleStorageUpdate);
    };
  }, []);

  // Calculate age from date of birth
  const calculateAge = useCallback((dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) { 
      age--; 
    }
    return age;
  }, []);

  // Memoized functions to get patient-related data
  const getPatientAppointments = useCallback((patientId) => {
    return appointments.filter(apt => 
      (apt.patientId === patientId || String(apt.patientId) === String(patientId))
    ).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || b.createdAt));
  }, [appointments]);

  const getPatientMedicalRecords = useCallback((patientId) => {
    return medicalRecords.filter(record => 
      (record.patientId === patientId || String(record.patientId) === String(patientId))
    ).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || b.createdAt));
  }, [medicalRecords]);

  // Get patient statistics with memoization
  const getPatientStats = useCallback((patientId) => {
    const patientAppointments = getPatientAppointments(patientId);
    const patientRecords = getPatientMedicalRecords(patientId);
    
    return {
      totalAppointments: patientAppointments.length,
      completedAppointments: patientAppointments.filter(apt => apt.status === 'completed').length,
      pendingAppointments: patientAppointments.filter(apt => apt.status === 'pending').length,
      totalRecords: patientRecords.length,
      lastVisit: patientAppointments.length > 0 ? 
        new Date(Math.max(...patientAppointments.map(apt => new Date(apt.date)))) : 
        'No visits yet'
    };
  }, [getPatientAppointments, getPatientMedicalRecords]);

  // Filter patients with memoization
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || patient.status === filterStatus;
      const matchesBloodGroup = filterBloodGroup === 'All' || patient.bloodGroup === filterBloodGroup;
      return matchesSearch && matchesStatus && matchesBloodGroup;
    });
  }, [patients, searchTerm, filterStatus, filterBloodGroup]);

  // Handle edit patient - FIXED
  const handleEditPatient = useCallback((e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;
    
    // Create updated patient object
    const updatedPatient = {
      ...selectedPatient,
      updatedAt: new Date().toISOString()
    };
    
    // Update user in the users array
    const updatedUsers = allUsers.map(user => {
      if (user.id === selectedPatient.id || String(user.id) === String(selectedPatient.id)) {
        return { ...user, ...updatedPatient, role: 'patient' }; // Ensure role is preserved
      }
      return user;
    });
    
    // Update the users array using the setter from useLocalStorageSync
    setAllUsers(updatedUsers);
    
    // Also save directly to localStorage to ensure admin panel sees the update
    saveToLocalStorage('users', updatedUsers);
    
    setShowEditModal(false);
    setSelectedPatient(null);
  }, [selectedPatient, allUsers, setAllUsers]);

  // Handle delete patient - FIXED
  const handleDeletePatient = useCallback((id) => {
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }
    
    const updatedUsers = allUsers.filter(user => user.id !== id);
    setAllUsers(updatedUsers);
    // Also delete related appointments and medical records
    const updatedAppointments = appointments.filter(apt => apt.patientId !== id);
    const updatedRecords = medicalRecords.filter(record => record.patientId !== id);
    
    // Also save directly to localStorage to ensure admin panel sees the update
    saveToLocalStorage('appointments', updatedAppointments);
    saveToLocalStorage('medicalRecords', updatedRecords);
  }, [allUsers, appointments, medicalRecords, setAllUsers]);

  // Handle view patient
  const openViewModal = useCallback((patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  }, []);

  // Handle export to CSV
  const exportToCSV = useCallback(() => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Date of Birth', 'Gender', 'Blood Group', 'Status', 'Registration Date'];
    const csvData = patients.map(patient => [
      patient.id,
      patient.name,
      patient.email,
      patient.contactNumber || patient.phone,
      patient.dateOfBirth,
      patient.gender,
      patient.bloodGroup,
      patient.status,
      patient.registrationDate
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'patients.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [patients]);

  // Get statistics for overview
  const stats = useMemo(() => ({
    totalPatients: patients.length,
    activePatients: patients.filter(p => p.status === 'active').length,
    newThisMonth: patients.filter(p => {
      const regDate = new Date(p.registrationDate);
      const thisMonth = new Date();
      return regDate.getMonth() === thisMonth.getMonth() && regDate.getFullYear() === thisMonth.getFullYear();
    }).length,
    totalAppointments: appointments.filter(apt => patients.some(p => p.id === apt.patientId)).length
  }), [patients, appointments]);

  // Get distribution data for analytics
  const ageDistributionData = useMemo(() => {
    const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51+': 0 };
    patients.forEach(patient => {
      const age = calculateAge(patient.dateOfBirth);
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else ageGroups['51+']++;
    });
    return ageGroups;
  }, [patients, calculateAge]);

  const genderDistributionData = useMemo(() => {
    const genderCounts = { 'Male': 0, 'Other': 0, 'Female': 0 };
    patients.forEach(patient => {
      if (genderCounts[patient.gender] !== undefined) {
        genderCounts[patient.gender]++;
      }
    });
    return genderCounts;
  }, [patients]);

  const bloodGroupDistribution = useMemo(() => {
    const bloodGroups = {};
    patients.forEach(patient => {
      if (patient.bloodGroup) {
        bloodGroups[patient.bloodGroup] = (bloodGroups[patient.bloodGroup] || 0) + 1;
      }
    });
    return Object.entries(bloodGroups).map(([group, count]) => ({ group, count }));
  }, [patients]);

  return (
    <div className="p-6">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Patient Management</h1>
          <p className="text-gray-600">Manage patient records, appointments, and medical history</p>
          <p className="text-xs text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <button
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition flex items-center gap-2"
          title="Refresh data"
        >
          <FaSyncAlt className={refreshKey > 0 ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('patients')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'patients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Patients
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <>
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={filterBloodGroup}
                  onChange={(e) => setFilterBloodGroup(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Blood Groups</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <FaFileDownload /> Export
                </button>
              </div>
            </div>
          </div>

          {/* Patients List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => {
                      const patientStats = getPatientStats(patient.id);
                      return (
                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.contactNumber || patient.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <FaBirthdayCake className="mr-2 text-gray-400" />
                                {calculateAge(patient.dateOfBirth)}
                                <span className="text-gray-500 ml-1">y</span>
                              </div>
                              <div className="flex items-center">
                                <FaVenusMars className="mr-2 text-gray-400" />
                                {patient.gender}
                              </div>
                              <div className="flex items-center">
                                <FaTint className="mr-2 text-red-500" />
                                {patient.bloodGroup}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openViewModal(patient)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="View Details"
                              >
                                <FaEye size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setShowEditModal(true);
                                }}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Edit Patient"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeletePatient(patient.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete Patient"
                              >
                                <FaTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No patients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Age Distribution</h3>
            <div className="space-y-3">
              {Object.entries(ageDistributionData).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{range} years</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${patients.length ? (count / patients.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count} patients</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gender Distribution</h3>
            <div className="space-y-3">
              {Object.entries(genderDistributionData).map(([gender, count]) => (
                <div key={gender} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{gender}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${patients.length ? (count / patients.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count} patients</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Blood Group Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bloodGroupDistribution.map(({ group, count }) => (
                <div key={group} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium flex items-center">
                    <FaTint className="mr-2 text-red-500" />
                    <span className="font-medium">{group}</span>
                  </span>
                  <span className="text-sm text-gray-600">{count} patients</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Patient Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <FaUserInjured className="text-blue-500 text-3xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedPatient.name}</h3>
                    <p className="text-sm text-gray-500">ID: {selectedPatient.id}</p>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <div className="border-b border-gray-200 mb-4">
                    <nav className="flex space-x-8">
                      <button
                        onClick={() => setActiveProfileTab('details')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeProfileTab === 'details'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setActiveProfileTab('appointments')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeProfileTab === 'appointments'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Appointments
                      </button>
                      <button
                        onClick={() => setActiveProfileTab('records')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeProfileTab === 'records'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Medical Records
                      </button>
                    </nav>
                  </div>
                  
                  {activeProfileTab === 'details' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                          <p className="text-sm text-gray-900">{selectedPatient.email}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                          <p className="text-sm text-gray-900">{selectedPatient.contactNumber || selectedPatient.phone}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h4>
                          <p className="text-sm text-gray-900">{selectedPatient.dateOfBirth}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Age</h4>
                          <p className="text-sm text-gray-900">{calculateAge(selectedPatient.dateOfBirth)} years</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Gender</h4>
                          <p className="text-sm text-gray-900">{selectedPatient.gender}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Blood Group</h4>
                          <p className="text-sm text-gray-900">{selectedPatient.bloodGroup}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                          <p className="text-sm text-gray-900">{selectedPatient.status}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Registration Date</h4>
                          <p className="text-sm text-gray-900">{selectedPatient.registrationDate}</p>
                        </div>
                      </div>
                      {selectedPatient.address && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Address</h4>
                          <p className="text-sm text-gray-900">{selectedPatient.address}</p>
                        </div>
                      )}
                      {selectedPatient.medicalHistory && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Medical History</h4>
                          <p className="text-sm text-gray-900">{selectedPatient.medicalHistory}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeProfileTab === 'appointments' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Appointments</h3>
                      {getPatientAppointments(selectedPatient.id).length > 0 ? (
                        <div className="space-y-3">
                          {getPatientAppointments(selectedPatient.id).map(appointment => (
                            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">{appointment.date}</h4>
                                  <p className="text-sm text-gray-500">{appointment.time}</p>
                                  <p className="text-sm text-gray-700 mt-1">{appointment.reason || 'No reason provided'}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No appointments found</p>
                      )}
                    </div>
                  )}
                  
                  {activeProfileTab === 'records' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Records</h3>
                      {getPatientMedicalRecords(selectedPatient.id).length > 0 ? (
                        <div className="space-y-3">
                          {getPatientMedicalRecords(selectedPatient.id).map(record => (
                            <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">{record.date}</h4>
                                  <p className="text-sm text-gray-700 mt-1">{record.diagnosis || 'No diagnosis provided'}</p>
                                  <p className="text-sm text-gray-700 mt-1">{record.treatment || 'No treatment provided'}</p>
                                  {record.notes && <p className="text-sm text-gray-700 mt-1">{record.notes}</p>}
                                </div>
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                  {record.type || 'General'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No medical records found</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Edit Patient</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleEditPatient} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={selectedPatient.name}
                    onChange={(e) => setSelectedPatient({...selectedPatient, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={selectedPatient.email}
                    onChange={(e) => setSelectedPatient({...selectedPatient, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    id="phone"
                    value={selectedPatient.contactNumber || selectedPatient.phone || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, contactNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={selectedPatient.dateOfBirth || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    id="gender"
                    value={selectedPatient.gender || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    id="bloodGroup"
                    value={selectedPatient.bloodGroup || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, bloodGroup: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    value={selectedPatient.status || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  id="address"
                  rows="3"
                  value={selectedPatient.address || ''}
                  onChange={(e) => setSelectedPatient({...selectedPatient, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="mt-4">
                <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                <textarea
                  id="medicalHistory"
                  rows="3"
                  value={selectedPatient.medicalHistory || ''}
                  onChange={(e) => setSelectedPatient({...selectedPatient, medicalHistory: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;