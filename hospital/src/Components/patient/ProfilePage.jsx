// ProfileSettings.jsx (Fixed with proper real-time synchronization)
import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaVenusMars, FaTint, FaMapMarkerAlt, FaNotesMedical, FaSave, FaTimes, FaEdit } from 'react-icons/fa';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';
import { generateId, saveToLocalStorage } from '../../Utils/dataUtils';

const ProfileSettings = () => {
  const [users, setUsers] = useLocalStorageSync('users', []);
  const [appointments, setAppointments] = useLocalStorageSync('appointments', []);
  const [medicalRecords, setMedicalRecords] = useLocalStorageSync('medicalRecords', []);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    medicalHistory: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    setCurrentUser(user);
    
    if (user.id) {
      // Find the user in the users array to get the most up-to-date data
      const updatedUser = users.find(u => u.id === user.id || String(u.id) === String(user.id));
      if (updatedUser) {
        setCurrentUser(updatedUser);
        setFormData({
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          contactNumber: updatedUser.contactNumber || '',
          dateOfBirth: updatedUser.dateOfBirth || '',
          gender: updatedUser.gender || '',
          bloodGroup: updatedUser.bloodGroup || '',
          address: updatedUser.address || '',
          medicalHistory: updatedUser.medicalHistory || ''
        });
      }
    }
  }, [users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear messages when user starts typing
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email) {
      setErrorMessage('Name and email are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      // Update user in the users array
      const updatedUsers = users.map(user => {
        if (user.id === currentUser.id || String(user.id) === String(currentUser.id)) {
          return {
            ...user,
            ...formData,
            updatedAt: new Date().toISOString()
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      
      // Update the current user in localStorage
      const updatedUser = { ...currentUser, ...formData, updatedAt: new Date().toISOString() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      // Update all related records with the new user information
      updateRelatedRecords(updatedUser);
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    }
  };

  const updateRelatedRecords = (updatedUser) => {
    // Update appointments with new patient name
    const updatedAppointments = appointments.map(apt => {
      if (apt.patientId === updatedUser.id || String(apt.patientId) === String(updatedUser.id)) {
        return { ...apt, patientName: updatedUser.name };
      }
      return apt;
    });
    
    if (JSON.stringify(updatedAppointments) !== JSON.stringify(appointments)) {
      setAppointments(updatedAppointments);
      saveToLocalStorage('appointments', updatedAppointments);
    }
    
    // Update medical records with new patient name
    const updatedMedicalRecords = medicalRecords.map(record => {
      if (record.patientId === updatedUser.id || String(record.patientId) === String(updatedUser.id)) {
        return { 
          ...record, 
          patientName: updatedUser.name,
          patientEmail: updatedUser.email
        };
      }
      return record;
    });
    
    if (JSON.stringify(updatedMedicalRecords) !== JSON.stringify(medicalRecords)) {
      setMedicalRecords(updatedMedicalRecords);
      saveToLocalStorage('medicalRecords', updatedMedicalRecords);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to current user data
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        contactNumber: currentUser.contactNumber || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        gender: currentUser.gender || '',
        bloodGroup: currentUser.bloodGroup || '',
        address: currentUser.address || '',
        medicalHistory: currentUser.medicalHistory || ''
      });
    }
    setSuccessMessage('');
    setErrorMessage('');
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) { 
      age--; 
    }
    return age;
  };

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-600">Manage your personal information and medical details</p>
      </header>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl mr-4">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <p className="text-blue-100">Patient ID: {currentUser.id}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {!isEditing ? (
            /* View Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Full Name</span>
                    <span className="font-medium">{currentUser.name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium">{currentUser.email || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-medium">{currentUser.contactNumber || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Date of Birth</span>
                    <span className="font-medium">{currentUser.dateOfBirth || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Age</span>
                    <span className="font-medium">{calculateAge(currentUser.dateOfBirth)} years</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Gender</span>
                    <span className="font-medium">{currentUser.gender || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Blood Group</span>
                    <span className="font-medium flex items-center">
                      <FaTint className="mr-2 text-red-500" />
                      {currentUser.bloodGroup || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact & Medical Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaNotesMedical className="mr-2 text-green-600" />
                  Contact & Medical Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Address</span>
                    <span className="font-medium flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-gray-400" />
                      {currentUser.address || 'Not provided'}
                    </span>
                  </div>
                  <div className="py-2 border-b">
                    <span className="text-gray-600 block mb-2">Medical History</span>
                    <p className="font-medium text-sm">{currentUser.medicalHistory || 'No medical history recorded'}</p>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Registration Date</span>
                    <span className="font-medium">{currentUser.registrationDate || 'Not available'}</span>
                  </div>
                  {currentUser.updatedAt && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">{new Date(currentUser.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information Fields */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaUser className="mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Group
                      </label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
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
                  </div>
                </div>

                {/* Contact & Medical Information Fields */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaNotesMedical className="mr-2 text-green-600" />
                    Contact & Medical Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical History
                      </label>
                      <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe any medical conditions, allergies, or past surgeries"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaSave /> Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;