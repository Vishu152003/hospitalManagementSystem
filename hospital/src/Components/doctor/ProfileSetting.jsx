// import React, { useState, useEffect } from 'react';
// import { FaUserMd, FaCog, FaSave, FaTimes, FaCheckCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaGraduationCap } from 'react-icons/fa';
// import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';

// const ProfilePage = () => {
//   // --- STATE MANAGEMENT ---
//   // 'profileData' holds the information displayed in both view and edit modes.
//   const [profileData, setProfileData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//     specialization: '',
//     experience: '',
//     education: '',
//   });

//   // 'isEditing' toggles between the view-only card and the editable form.
//   const [isEditing, setIsEditing] = useState(false);
  
//   // 'showSaveSuccess' controls the visibility of the success notification.
//   const [showSaveSuccess, setShowSaveSuccess] = useState(false);

//   // Use the useLocalStorageSync hook for user and doctors data
//   const [user] = useLocalStorageSync('user', {});
//   const [doctors, setDoctors] = useLocalStorageSync('doctors', []);

//   // --- DATA LOADING ---
//   // Load data from the synchronized user state
//   useEffect(() => {
//     setProfileData(user);
//   }, [user]);

//   // --- HANDLERS ---
//   // Updates the state as the user types in the form fields.
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setProfileData(prevData => ({ ...prevData, [name]: value }));
//   };

//   // Handles the form submission.
//   const handleSave = (e) => {
//     e.preventDefault(); // Prevent the form from reloading the page.
    
//     // 1. Update the user state using the setter from useLocalStorageSync
//     // Note: Since we're using the useLocalStorageSync hook for the 'user' key,
//     // we need to access the setter function. For simplicity, we'll use localStorage directly here
//     // but in a real implementation, you might want to create a separate hook for user management
//     localStorage.setItem('user', JSON.stringify(profileData));
    
//     // 2. Update the main 'doctors' list if it exists.
//     const updatedDoctors = doctors.map(d => d.id === profileData.id ? { ...d, ...profileData } : d);
//     setDoctors(updatedDoctors);
    
//     // 3. Show a success message to the user.
//     setShowSaveSuccess(true);
    
//     // 4. Hide the success message after 3 seconds.
//     setTimeout(() => setShowSaveSuccess(false), 3000);
    
//     // 5. Switch back to 'view' mode so the user can see their updated information.
//     setIsEditing(false);
//   };

//   // --- JSX ---
//   return (
//     <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
//       {/* --- SUCCESS NOTIFICATION --- */}
//       {showSaveSuccess && (
//         <div className="flex items-center justify-between p-4 mb-6 text-sm font-medium text-green-800 bg-green-100 border border-green-300 rounded-lg shadow-sm">
//           <div className="flex items-center">
//             <FaCheckCircle className="mr-2 flex-shrink-0" />
//             <span>Your profile has been successfully updated.</span>
//           </div>
//           <button onClick={() => setShowSaveSuccess(false)} className="ml-4 text-green-600 hover:text-green-800">
//             <FaTimes />
//           </button>
//         </div>
//       )}

//       {/* --- PROFILE CARD --- */}
//       <div className="bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
//         {/* --- CARD HEADER --- */}
//         <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
//           <div className="flex items-center justify-between">
//             <h1 className="text-2xl font-bold">Dr. {profileData.name}</h1>
//             {!isEditing && (
//               <button
//                 onClick={() => setIsEditing(false)}
//                 className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
//                 title="Cancel Edit"
//               >
//                 <FaTimes size={20} />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* --- CARD BODY --- */}
//         <div className="p-6 sm:p-8">
//           {!isEditing ? (
//             // --- VIEW MODE ---
//             <div>
//               <div className="flex justify-end mb-6">
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
//                 >
//                   <FaCog className="mr-2" />
//                   Edit Profile
//                 </button>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Personal Information</h3>
//                   <dl className="space-y-3">
//                     <InfoItem label="Email" value={profileData.email} icon={FaEnvelope} />
//                     <InfoItem label="Phone" value={profileData.phone || 'Not provided'} icon={FaPhone} />
//                     <InfoItem label="Address" value={profileData.address || 'Not provided'} icon={FaMapMarkerAlt} />
//                   </dl>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Professional Details</h3>
//                   <dl className="space-y-3">
//                     <InfoItem label="Specialization" value={profileData.specialization} icon={FaBriefcase} />
//                     <InfoItem label="Experience" value={profileData.experience} icon={FaCog} />
//                     <InfoItem label="Education" value={profileData.education || 'N/A'} icon={FaGraduationCap} />
//                   </dl>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             // --- EDIT MODE (FORM) ---
//             <form onSubmit={handleSave}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Personal Information</h3>
//                   <div className="space-y-4">
//                     <FormField label="Full Name" name="name" value={profileData.name} onChange={handleInputChange} icon={FaUserMd} />
//                     <FormField label="Email" name="email" type="email" value={profileData.email} onChange={handleInputChange} icon={FaEnvelope} />
//                     <FormField label="Phone" name="phone" type="tel" value={profileData.phone} onChange={handleInputChange} icon={FaPhone} />
//                     <FormField label="Address" name="address" value={profileData.address} onChange={handleInputChange} icon={FaMapMarkerAlt} />
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Professional Details</h3>
//                   <div className="space-y-4">
//                     <FormField label="Specialization" name="specialization" value={profileData.specialization} onChange={handleInputChange} icon={FaBriefcase} />
//                     <FormField label="Experience" name="experience" value={profileData.experience} onChange={handleInputChange} icon={FaCog} />
//                     <TextAreaField label="Education" name="education" value={profileData.education} onChange={handleInputChange} icon={FaGraduationCap} />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
//                 <button
//                   type="button"
//                   onClick={() => setIsEditing(false)}
//                   className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
//                 >
//                   <FaSave className="mr-2" />
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- REUSABLE SUB-COMPONENTS ---

// // A component for displaying a single piece of information in 'view' mode.
// const InfoItem = ({ label, value, icon: Icon }) => (
//   <div className="flex items-start space-x-3">
//     <Icon className="mt-1 text-gray-400 flex-shrink-0" />
//     <div>
//       <dt className="text-sm font-medium text-gray-500">{label}</dt>
//       <dd className="mt-1 text-sm text-gray-900">{value}</dd>
//     </div>
//   </div>
// );

// // A component for an input field in 'edit' mode.
// const FormField = ({ label, icon: Icon, ...props }) => (
//   <div>
//     <label htmlFor={props.name} className="block text-sm font-medium text-gray-700 mb-1">
//       {label}
//     </label>
//     <div className="relative rounded-md shadow-sm">
//       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//         <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
//       </div>
//       <input
//         {...props}
//         id={props.name}
//         className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//       />
//     </div>
//   </div>
// );

// // A component for the textarea field in 'edit' mode.
// const TextAreaField = ({ label, icon: Icon, ...props }) => (
//   <div>
//     <label htmlFor={props.name} className="block text-sm font-medium text-gray-700 mb-1">
//       {label}
//     </label>
//     <div className="relative rounded-md shadow-sm">
//       <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
//         <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
//       </div>
//       <textarea
//         {...props}
//         id={props.name}
//         rows={3}
//         className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//       />
//     </div>
//   </div>
// );

// export default ProfilePage;


import React, { useState, useEffect } from 'react';
import { FaUserMd, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaSave, FaTimes, FaEdit, FaCheckCircle, FaClock, FaCalendarAlt, FaHospital } from 'react-icons/fa';
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
    phone: '',
    address: '',
    specialization: '',
    experience: '',
    education: '',
    department: '',
    consultationFee: '',
    availability: '',
    joinDate: ''
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
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
          specialization: updatedUser.specialization || '',
          experience: updatedUser.experience || '',
          education: updatedUser.education || '',
          department: updatedUser.department || '',
          consultationFee: updatedUser.consultationFee || '',
          availability: updatedUser.availability || '',
          joinDate: updatedUser.joinDate || ''
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
    // Update appointments with new doctor name
    const updatedAppointments = appointments.map(apt => {
      if (apt.doctorId === updatedUser.id || String(apt.doctorId) === String(updatedUser.id)) {
        return { 
          ...apt, 
          doctorName: updatedUser.name,
          specialization: updatedUser.specialization
        };
      }
      return apt;
    });
    
    if (JSON.stringify(updatedAppointments) !== JSON.stringify(appointments)) {
      setAppointments(updatedAppointments);
      saveToLocalStorage('appointments', updatedAppointments);
    }
    
    // Update medical records with new doctor name
    const updatedMedicalRecords = medicalRecords.map(record => {
      if (record.doctorId === updatedUser.id || String(record.doctorId) === String(updatedUser.id)) {
        return { 
          ...record, 
          doctorName: updatedUser.name,
          specialization: updatedUser.specialization
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
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        specialization: currentUser.specialization || '',
        experience: currentUser.experience || '',
        education: currentUser.education || '',
        department: currentUser.department || '',
        consultationFee: currentUser.consultationFee || '',
        availability: currentUser.availability || '',
        joinDate: currentUser.joinDate || ''
      });
    }
    setSuccessMessage('');
    setErrorMessage('');
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
        <p className="text-gray-600">Manage your personal and professional information</p>
      </header>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <FaCheckCircle className="mr-2" />
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
                <FaUserMd />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Dr. {currentUser.name}</h2>
                <p className="text-blue-100">Doctor ID: {currentUser.id}</p>
                <p className="text-blue-100">{currentUser.specialization || 'General Practitioner'}</p>
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
                  <FaUserMd className="mr-2 text-blue-600" />
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
                    <span className="font-medium">{currentUser.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Address</span>
                    <span className="font-medium flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-gray-400" />
                      {currentUser.address || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaBriefcase className="mr-2 text-green-600" />
                  Professional Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Specialization</span>
                    <span className="font-medium">{currentUser.specialization || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Department</span>
                    <span className="font-medium flex items-center">
                      <FaHospital className="mr-2 text-gray-400" />
                      {currentUser.department || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">{currentUser.experience || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Education</span>
                    <span className="font-medium flex items-center">
                      <FaGraduationCap className="mr-2 text-gray-400" />
                      {currentUser.education || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Consultation Fee</span>
                    <span className="font-medium">${currentUser.consultationFee || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Availability</span>
                    <span className="font-medium flex items-center">
                      <FaClock className="mr-2 text-gray-400" />
                      {currentUser.availability || 'Not provided'}
                    </span>
                  </div>
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
                    <FaUserMd className="mr-2 text-blue-600" />
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
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
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
                  </div>
                </div>

                {/* Professional Information Fields */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaBriefcase className="mr-2 text-green-600" />
                    Professional Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Cardiology, Neurology"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Internal Medicine"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience
                      </label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 5 years"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Education
                      </label>
                      <textarea
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., MD from Harvard Medical School"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consultation Fee
                      </label>
                      <input
                        type="text"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., $100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability
                      </label>
                      <input
                        type="text"
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Mon-Fri, 9AM-5PM"
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