import React, { useState, useEffect } from 'react';
import { FaUserInjured, FaBirthdayCake, FaVenusMars, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEye, FaSearch, FaTint, FaNotesMedical, FaCalendarAlt, FaFileMedical, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';

const PatientsPage = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  // Use the useLocalStorageSync hook instead of directly accessing localStorage
  const [users] = useLocalStorageSync('users', []);
  const [appointments, setAppointments] = useLocalStorageSync('appointments', []);
  const [medicalRecords, setMedicalRecords] = useLocalStorageSync('medicalRecords', []);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState('details');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('patients');

  // Get patients from users
  const patients = users.filter(p => p.role === 'patient');

  // Get patients who have appointments with the current doctor
  const getDoctorPatients = () => {
    const doctorAppointmentIds = [...new Set(appointments
      .filter(apt => apt.doctorId === user.id || apt.doctorId === String(user.id))
      .map(apt => apt.patientId)
    )];
    
    return patients.filter(patient => doctorAppointmentIds.includes(patient.id.toString()));
  };

  // Get medical records for a specific patient with the current doctor
  const getPatientMedicalRecords = (patientId) => {
    return medicalRecords
      .filter(record => record.patientId === patientId && (record.doctorId === user.id || record.doctorId === String(user.id)))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Get appointments for a specific patient with the current doctor
  const getPatientAppointments = (patientId) => {
    return appointments
      .filter(apt => apt.patientId === patientId && (apt.doctorId === user.id || apt.doctorId === String(user.id)))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) { 
      age--; 
    }
    return age;
  };

  // Filter patients based on search term
  const filteredPatients = getDoctorPatients().filter(patient => {
    return patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           patient.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Open patient details modal
  const openPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setActiveProfileTab('details');
    setShowViewModal(true);
  };

  // Add new medical record
  const addMedicalRecord = (patientId, diagnosis, prescription, notes) => {
    const newRecord = {
      id: Date.now(),
      patientId: patientId,
      doctorId: user.id,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      prescription,
      notes
    };
    
    // Update medical records using the setter from useLocalStorageSync
    setMedicalRecords([...medicalRecords, newRecord]);
  };

  // Initialize with sample medical records if none exist
  useEffect(() => {
    if (medicalRecords.length === 0) {
      const initialRecords = [
        { id: 1, patientId: 1, doctorId: 'doc-1', date: '2023-10-15', diagnosis: 'Hypertension', prescription: 'Lisinopril 10mg daily', notes: 'Patient shows stable blood pressure with medication' },
        { id: 2, patientId: 2, doctorId: 'doc-1', date: '2023-11-05', diagnosis: 'Common Cold', prescription: 'Paracetamol as needed', notes: 'Patient advised to rest and increase fluid intake' },
        { id: 3, patientId: 3, doctorId: 'doc-2', date: '2023-09-20', diagnosis: 'Type 2 Diabetes', prescription: 'Metformin 500mg twice daily', notes: 'Blood sugar levels need monitoring' }
      ];
      setMedicalRecords(initialRecords);
    }
  }, [medicalRecords.length, setMedicalRecords]);

  // Rest of the component remains the same...
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Patients</h1>
        <p className="text-gray-600">View and manage your patient records</p>
      </header>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'patients'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('patients')}
          >
            My Patients ({getDoctorPatients().length})
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'consultations'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('consultations')}
          >
            Recent Consultations
          </button>
        </div>
      </div>

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <>
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Patients List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => {
                      const lastAppointment = getPatientAppointments(patient.id)[0];
                      return (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <FaBirthdayCake className="mr-1" /> {calculateAge(patient.dateOfBirth)} years
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{patient.email}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FaPhone className="mr-1" />{patient.contactNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <FaVenusMars className="mr-1" />{patient.gender}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FaTint className="mr-1" />{patient.bloodGroup}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lastAppointment ? lastAppointment.date : 'No visits yet'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => openPatientDetails(patient)} 
                              className="text-blue-600 hover:text-blue-900" 
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No patients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Consultations Tab */}
      {activeTab === 'consultations' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicalRecords
                  .filter(record => record.doctorId === user.id || record.doctorId === String(user.id))
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10) // Show only the 10 most recent consultations
                  .map((record) => {
                    const patient = patients.find(p => p.id === record.patientId);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient ? patient.name : 'Unknown Patient'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {record.diagnosis}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => {
                              if (patient) {
                                openPatientDetails(patient);
                                setActiveProfileTab('medical-history');
                              }
                            }} 
                            className="text-blue-600 hover:text-blue-900" 
                            title="View Full Record"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                }
                {medicalRecords.filter(record => record.doctorId === user.id || record.doctorId === String(user.id)).length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No consultation records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showViewModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Patient Details - {selectedPatient.name}</h2>
            </div>
            <div className="p-6">
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  {['details', 'medical-history', 'appointments', 'add-record'].map((tab) => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveProfileTab(tab)} 
                      className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                        activeProfileTab === tab 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.replace('-', ' ')}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Patient Details Tab */}
              {activeProfileTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedPatient.name}</p>
                      <p><span className="font-medium">Date of Birth:</span> {selectedPatient.dateOfBirth}</p>
                      <p><span className="font-medium">Age:</span> {calculateAge(selectedPatient.dateOfBirth)} years</p>
                      <p><span className="font-medium">Gender:</span> {selectedPatient.gender}</p>
                      <p><span className="font-medium">Blood Group:</span> {selectedPatient.bloodGroup}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Email:</span> {selectedPatient.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedPatient.contactNumber}</p>
                      <p><span className="font-medium">Address:</span> {selectedPatient.address}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Medical Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Medical History:</span> {selectedPatient.medicalHistory}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical History Tab */}
              {activeProfileTab === 'medical-history' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Medical History</h3>
                  <div className="space-y-4">
                    {getPatientMedicalRecords(selectedPatient.id).length > 0 ? (
                      getPatientMedicalRecords(selectedPatient.id).map((record) => (
                        <div key={record.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-gray-900">Consultation on {record.date}</p>
                            <p className="text-sm text-gray-500">Dr. {user.name}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Diagnosis</p>
                              <p className="text-gray-900">{record.diagnosis}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Prescription</p>
                              <p className="text-gray-900">{record.prescription}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-sm font-medium text-gray-700">Notes</p>
                              <p className="text-gray-900">{record.notes}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        No medical records found for this patient.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Appointments Tab */}
              {activeProfileTab === 'appointments' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment History</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getPatientAppointments(selectedPatient.id).map((apt) => (
                          <tr key={apt.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.time}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                apt.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                                apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {apt.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{apt.reason}</td>
                          </tr>
                        ))}
                        {getPatientAppointments(selectedPatient.id).length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                              No appointments found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add Record Tab */}
              {activeProfileTab === 'add-record' && (
                <AddMedicalRecordForm 
                  patientId={selectedPatient.id} 
                  onAddRecord={(diagnosis, prescription, notes) => {
                    addMedicalRecord(selectedPatient.id, diagnosis, prescription, notes);
                    setActiveProfileTab('medical-history');
                  }} 
                />
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowViewModal(false)} 
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Medical Record Form Component
const AddMedicalRecordForm = ({ patientId, onAddRecord }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (diagnosis && prescription) {
      onAddRecord(diagnosis, prescription, notes);
      // Reset form
      setDiagnosis('');
      setPrescription('');
      setNotes('');
    } else {
      alert('Please fill in all required fields.');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add Medical Record</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prescription *</label>
          <textarea
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientsPage;


// import React, { useState, useEffect } from 'react';
// import { FaUserInjured, FaBirthdayCake, FaVenusMars, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEye, FaSearch, FaTint, FaNotesMedical, FaCalendarAlt, FaFileMedical, FaClock } from 'react-icons/fa';
// import { Link } from 'react-router-dom';
// import { useLocalStorageSync } from '../../hooks/localstorage';

// const PatientsPage = () => {
//   const user = JSON.parse(localStorage.getItem('user')) || {};
  
//   // Use the useLocalStorageSync hook instead of directly accessing localStorage
//   const [users] = useLocalStorageSync('users', []);
//   const [appointments, setAppointments] = useLocalStorageSync('appointments', []);
//   const [medicalRecords, setMedicalRecords] = useLocalStorageSync('medicalRecords', []);
  
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const [activeProfileTab, setActiveProfileTab] = useState('details');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeTab, setActiveTab] = useState('patients');

//   // Get patients from users
//   const patients = users.filter(p => p.role === 'patient');

//   // Get patients who have appointments with the current doctor
//   const getDoctorPatients = () => {
//     const doctorAppointmentIds = [...new Set(appointments
//       .filter(apt => apt.doctorId === user.id || apt.doctorId === String(user.id))
//       .map(apt => apt.patientId)
//     )];
    
//     return patients.filter(patient => doctorAppointmentIds.includes(patient.id.toString()));
//   };

//   // Get medical records for a specific patient with the current doctor
//   const getPatientMedicalRecords = (patientId) => {
//     return medicalRecords
//       .filter(record => record.patientId === patientId && (record.doctorId === user.id || record.doctorId === String(user.id)))
//       .sort((a, b) => new Date(b.date) - new Date(a.date));
//   };

//   // Get appointments for a specific patient with the current doctor
//   const getPatientAppointments = (patientId) => {
//     return appointments
//       .filter(apt => apt.patientId === patientId && (apt.doctorId === user.id || apt.doctorId === String(user.id)))
//       .sort((a, b) => new Date(b.date) - new Date(a.date));
//   };

//   // Calculate age from date of birth
//   const calculateAge = (dateOfBirth) => {
//     const today = new Date();
//     const birthDate = new Date(dateOfBirth);
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDifference = today.getMonth() - birthDate.getMonth();
//     if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) { 
//       age--; 
//     }
//     return age;
//   };

//   // Filter patients based on search term
//   const filteredPatients = getDoctorPatients().filter(patient => {
//     return patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
//            patient.email.toLowerCase().includes(searchTerm.toLowerCase());
//   });

//   // Open patient details modal
//   const openPatientDetails = (patient) => {
//     setSelectedPatient(patient);
//     setActiveProfileTab('details');
//     setShowViewModal(true);
//   };

//   // Add new medical record
//   const addMedicalRecord = (patientId, diagnosis, prescription, notes) => {
//     const newRecord = {
//       id: Date.now().toString(),
//       patientId: patientId,
//       doctorId: user.id,
//       date: new Date().toISOString().split('T')[0],
//       diagnosis,
//       prescription,
//       notes
//     };
    
//     // Update medical records using the setter from useLocalStorageSync
//     setMedicalRecords([...medicalRecords, newRecord]);
//   };

//   // Initialize with sample medical records if none exist
//   useEffect(() => {
//     if (medicalRecords.length === 0) {
//       const initialRecords = [
//         { id: '1', patientId: '1', doctorId: 'doc-1', date: '2023-10-15', diagnosis: 'Hypertension', prescription: 'Lisinopril 10mg daily', notes: 'Patient shows stable blood pressure with medication' },
//         { id: '2', patientId: '2', doctorId: 'doc-1', date: '2023-11-05', diagnosis: 'Common Cold', prescription: 'Paracetamol as needed', notes: 'Patient advised to rest and increase fluid intake' },
//         { id: '3', patientId: '3', doctorId: 'doc-2', date: '2023-09-20', diagnosis: 'Type 2 Diabetes', prescription: 'Metformin 500mg twice daily', notes: 'Blood sugar levels need monitoring' }
//       ];
//       setMedicalRecords(initialRecords);
//     }
//   }, [medicalRecords.length, setMedicalRecords]);

//   return (
//     <div className="p-6">
//       <header className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Patients</h1>
//         <p className="text-gray-600">View and manage your patient records</p>
//       </header>

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow-md mb-6">
//         <div className="flex border-b">
//           <button
//             className={`flex-1 py-3 px-4 text-center font-medium ${
//               activeTab === 'patients'
//                 ? 'text-blue-600 border-b-2 border-blue-600'
//                 : 'text-gray-600 hover:text-gray-800'
//             }`}
//             onClick={() => setActiveTab('patients')}
//           >
//             My Patients ({getDoctorPatients().length})
//           </button>
//           <button
//             className={`flex-1 py-3 px-4 text-center font-medium ${
//               activeTab === 'consultations'
//                 ? 'text-blue-600 border-b-2 border-blue-600'
//                 : 'text-gray-600 hover:text-gray-800'
//             }`}
//             onClick={() => setActiveTab('consultations')}
//           >
//             Recent Consultations
//           </button>
//         </div>
//       </div>

//       {/* Patients Tab */}
//       {activeTab === 'patients' && (
//         <>
//           {/* Search Bar */}
//           <div className="bg-white p-4 rounded-lg shadow-md mb-6">
//             <div className="relative">
//               <FaSearch className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search patients..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Patients List */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead className="bg-gray-50 border-b border-gray-200">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredPatients.length > 0 ? (
//                     filteredPatients.map(patient => {
//                       const lastAppointment = getPatientAppointments(patient.id)[0];
//                       return (
//                         <tr key={patient.id} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
//                                 {patient.name.split(' ').map(n => n[0]).join('')}
//                               </div>
//                               <div className="ml-4">
//                                 <div className="text-sm font-medium text-gray-900">{patient.name}</div>
//                                 <div className="text-sm text-gray-500 flex items-center">
//                                   <FaBirthdayCake className="mr-1" /> {calculateAge(patient.dateOfBirth)} years
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="text-sm text-gray-900">{patient.email}</div>
//                             <div className="text-sm text-gray-500 flex items-center">
//                               <FaPhone className="mr-1" />{patient.contactNumber}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="text-sm text-gray-900 flex items-center">
//                               <FaVenusMars className="mr-1" />{patient.gender}
//                             </div>
//                             <div className="text-sm text-gray-500 flex items-center">
//                               <FaTint className="mr-1" />{patient.bloodGroup}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {lastAppointment ? lastAppointment.date : 'No visits yet'}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                             <button 
//                               onClick={() => openPatientDetails(patient)} 
//                               className="text-blue-600 hover:text-blue-900" 
//                               title="View Details"
//                             >
//                               <FaEye />
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     <tr>
//                       <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
//                         No patients found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Consultations Tab */}
//       {activeTab === 'consultations' && (
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {medicalRecords
//                   .filter(record => record.doctorId === user.id || record.doctorId === String(user.id))
//                   .sort((a, b) => new Date(b.date) - new Date(a.date))
//                   .slice(0, 10) // Show only the 10 most recent consultations
//                   .map((record) => {
//                     const patient = patients.find(p => p.id === record.patientId);
//                     return (
//                       <tr key={record.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {record.date}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {patient ? patient.name : 'Unknown Patient'}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-900">
//                           {record.diagnosis}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                           <button 
//                             onClick={() => {
//                               if (patient) {
//                                 openPatientDetails(patient);
//                                 setActiveProfileTab('medical-history');
//                               }
//                             }} 
//                             className="text-blue-600 hover:text-blue-900" 
//                             title="View Full Record"
//                           >
//                             <FaEye />
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 }
//                 {medicalRecords.filter(record => record.doctorId === user.id || record.doctorId === String(user.id)).length === 0 && (
//                   <tr>
//                     <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
//                       No consultation records found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Patient Details Modal */}
//       {showViewModal && selectedPatient && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">Patient Details - {selectedPatient.name}</h2>
//             </div>
//             <div className="p-6">
//               <div className="border-b border-gray-200 mb-6">
//                 <nav className="flex space-x-8">
//                   {['details', 'medical-history', 'appointments', 'add-record'].map((tab) => (
//                     <button 
//                       key={tab} 
//                       onClick={() => setActiveProfileTab(tab)} 
//                       className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
//                         activeProfileTab === tab 
//                           ? 'border-blue-500 text-blue-600' 
//                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                       }`}
//                     >
//                       {tab.replace('-', ' ')}
//                     </button>
//                   ))}
//                 </nav>
//               </div>

//               {/* Patient Details Tab */}
//               {activeProfileTab === 'details' && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <h3 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h3>
//                     <div className="space-y-2">
//                       <p><span className="font-medium">Name:</span> {selectedPatient.name}</p>
//                       <p><span className="font-medium">Date of Birth:</span> {selectedPatient.dateOfBirth}</p>
//                       <p><span className="font-medium">Age:</span> {calculateAge(selectedPatient.dateOfBirth)} years</p>
//                       <p><span className="font-medium">Gender:</span> {selectedPatient.gender}</p>
//                       <p><span className="font-medium">Blood Group:</span> {selectedPatient.bloodGroup}</p>
//                     </div>
//                   </div>
//                   <div>
//                     <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
//                     <div className="space-y-2">
//                       <p><span className="font-medium">Email:</span> {selectedPatient.email}</p>
//                       <p><span className="font-medium">Phone:</span> {selectedPatient.contactNumber}</p>
//                       <p><span className="font-medium">Address:</span> {selectedPatient.address}</p>
//                     </div>
//                   </div>
//                   <div className="md:col-span-2">
//                     <h3 className="text-sm font-medium text-gray-500 mb-2">Medical Information</h3>
//                     <div className="space-y-2">
//                       <p><span className="font-medium">Medical History:</span> {selectedPatient.medicalHistory}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Medical History Tab */}
//               {activeProfileTab === 'medical-history' && (
//                 <div>
//                   <h3 className="text-lg font-medium text-gray-900 mb-4">Medical History</h3>
//                   <div className="space-y-4">
//                     {getPatientMedicalRecords(selectedPatient.id).length > 0 ? (
//                       getPatientMedicalRecords(selectedPatient.id).map((record) => (
//                         <div key={record.id} className="bg-gray-50 p-4 rounded-lg">
//                           <div className="flex justify-between items-start mb-2">
//                             <p className="font-medium text-gray-900">Consultation on {record.date}</p>
//                             <p className="text-sm text-gray-500">Dr. {user.name}</p>
//                           </div>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                               <p className="text-sm font-medium text-gray-700">Diagnosis</p>
//                               <p className="text-gray-900">{record.diagnosis}</p>
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium text-gray-700">Prescription</p>
//                               <p className="text-gray-900">{record.prescription}</p>
//                             </div>
//                             <div className="md:col-span-2">
//                               <p className="text-sm font-medium text-gray-700">Notes</p>
//                               <p className="text-gray-900">{record.notes}</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-center py-10 text-gray-500">
//                         No medical records found for this patient.
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Appointments Tab */}
//               {activeProfileTab === 'appointments' && (
//                 <div>
//                   <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment History</h3>
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {getPatientAppointments(selectedPatient.id).map((apt) => (
//                           <tr key={apt.id}>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.date}</td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.time}</td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                 apt.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
//                                 apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
//                                 'bg-red-100 text-red-800'
//                               }`}>
//                                 {apt.status}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-gray-900">{apt.reason}</td>
//                           </tr>
//                         ))}
//                         {getPatientAppointments(selectedPatient.id).length === 0 && (
//                           <tr>
//                             <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
//                               No appointments found.
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}

//               {/* Add Record Tab */}
//               {activeProfileTab === 'add-record' && (
//                 <AddMedicalRecordForm 
//                   patientId={selectedPatient.id} 
//                   onAddRecord={(diagnosis, prescription, notes) => {
//                     addMedicalRecord(selectedPatient.id, diagnosis, prescription, notes);
//                     setActiveProfileTab('medical-history');
//                   }} 
//                 />
//               )}
//             </div>
//             <div className="p-6 border-t border-gray-200 flex justify-end">
//               <button 
//                 onClick={() => setShowViewModal(false)} 
//                 className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-200"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Add Medical Record Form Component
// const AddMedicalRecordForm = ({ patientId, onAddRecord }) => {
//   const [diagnosis, setDiagnosis] = useState('');
//   const [prescription, setPrescription] = useState('');
//   const [notes, setNotes] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (diagnosis && prescription) {
//       onAddRecord(diagnosis, prescription, notes);
//       // Reset form
//       setDiagnosis('');
//       setPrescription('');
//       setNotes('');
//     } else {
//       alert('Please fill in all required fields.');
//     }
//   };

//   return (
//     <div>
//       <h3 className="text-lg font-medium text-gray-900 mb-4">Add Medical Record</h3>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
//           <textarea
//             value={diagnosis}
//             onChange={(e) => setDiagnosis(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             rows="2"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Prescription *</label>
//           <textarea
//             value={prescription}
//             onChange={(e) => setPrescription(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             rows="2"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
//           <textarea
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             rows="3"
//           />
//         </div>
//         <div className="flex justify-end space-x-3">
//           <button
//             type="button"
//             onClick={() => window.history.back()}
//             className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Save Record
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default PatientsPage;