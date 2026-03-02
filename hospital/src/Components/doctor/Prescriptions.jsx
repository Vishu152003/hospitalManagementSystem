import React, { useState, useEffect } from 'react';
import { FaPlus, FaEye, FaFileMedical, FaSearch, FaUser, FaCalendarAlt, FaTimes, FaCapsules, FaNotesMedical } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';
import { generateId, saveToLocalStorage } from '../../Utils/dataUtils';

const PrescriptionPage = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  // Use the useLocalStorageSync hook for real-time updates
  const [prescriptions, setPrescriptions] = useLocalStorageSync('prescriptions', []);
  const [users] = useLocalStorageSync('users', []);
  const [appointments, setAppointments] = useLocalStorageSync('appointments', []);
  const [medicalRecords, setMedicalRecords] = useLocalStorageSync('medicalRecords', []);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get patients from users
  const patients = users.filter(p => p.role === 'patient');

  // Form data for creating a new prescription
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentId: '',
    diagnosis: '',
    notes: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
  });

  // --- Form Handling ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    setFormData(prev => ({ ...prev, medications: updatedMedications }));
  };

  const addMedicationField = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const removeMedicationField = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, medications: updatedMedications }));
    }
  };

  // --- Action Handlers ---
  const handleCreatePrescription = () => {
    // const patient = patients.find(p => p.id === parseInt(formData.patientId));
    const patient = patients.find(p => String(p.id) === String(formData.patientId));

    if (!patient || !formData.medications.some(m => m.name)) {
      alert('Please select a patient and fill out at least one medication.');
      return;
    }

    // Create the prescription object
    const newPrescription = {
      id: generateId('pres'),
      patientId: patient.id,
      patientName: patient.name,
      doctorId: user.id,
      doctorName: user.name,
      appointmentId: formData.appointmentId,
      date: new Date().toISOString().split('T')[0],
      diagnosis: formData.diagnosis,
      medications: formData.medications.filter(m => m.name),
      notes: formData.notes,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Update prescriptions using the setter from useLocalStorageSync
    setPrescriptions(prev => [...prev, newPrescription]);
    
    // Create comprehensive medical record entries
    const medicalRecordEntries = [];

    // 1. Create a prescription medical record
    const prescriptionRecord = {
      id: generateId('medRec'),
      patientId: patient.id,
      patientName: patient.name,
      doctorId: user.id,
      doctorName: user.name,
      type: 'prescription',
      title: `Prescription: ${newPrescription.medications.map(m => m.name).join(', ')}`,
      content: formData.diagnosis || 'No diagnosis provided.',
      date: newPrescription.date,
      medicines: newPrescription.medications,
      prescriptionId: newPrescription.id,
      notes: formData.notes || 'No additional notes provided.',
      createdAt: new Date().toISOString()
    };
    medicalRecordEntries.push(prescriptionRecord);

    // 2. Create a diagnosis medical record if diagnosis is provided
    if (formData.diagnosis) {
      const diagnosisRecord = {
        id: generateId('medRec'),
        patientId: patient.id,
        patientName: patient.name,
        doctorId: user.id,
        doctorName: user.name,
        type: 'diagnosis',
        title: `Diagnosis: ${formData.diagnosis}`,
        content: `Patient diagnosed with: ${formData.diagnosis}`,
        date: newPrescription.date,
        prescriptionId: newPrescription.id,
        notes: `Diagnosis provided during consultation on ${newPrescription.date}`,
        createdAt: new Date().toISOString()
      };
      medicalRecordEntries.push(diagnosisRecord);
    }

    // 3. Create a treatment medical record
    const treatmentRecord = {
      id: generateId('medRec'),
      patientId: patient.id,
      patientName: patient.name,
      doctorId: user.id,
      doctorName: user.name,
      type: 'treatment',
      title: `Treatment Plan`,
      content: `Treatment initiated with medications: ${newPrescription.medications.map(m => m.name).join(', ')}`,
      date: newPrescription.date,
      medicines: newPrescription.medications,
      prescriptionId: newPrescription.id,
      notes: `Treatment plan created on ${newPrescription.date}. Follow-up recommended.`,
      createdAt: new Date().toISOString()
    };
    medicalRecordEntries.push(treatmentRecord);

    // Update medical records using the setter from useLocalStorageSync
    setMedicalRecords(prev => [...prev, ...medicalRecordEntries]);

    // Update appointment status if appointmentId is provided
    if (formData.appointmentId) {
      setAppointments(prev => prev.map(apt => {
        if (apt.id === formData.appointmentId) {
          return { ...apt, status: 'Completed', completedAt: new Date().toISOString() };
        }
        return apt;
      }));
    }

    // Reset form and close modal
    setShowCreateModal(false);
    setFormData({
      patientId: '',
      appointmentId: '',
      diagnosis: '',
      notes: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
    alert('Prescription created and medical records updated successfully!');
  };

  const openViewModal = (prescription) => {
    setSelectedPrescription(prescription);
    setShowViewModal(true);
  };

  // --- Data Filtering ---
  const getMyPatients = () => {
    const myPatientIds = [...new Set(appointments
      .filter(apt => apt.doctorId === user.id || apt.doctorId === String(user.id))
      .map(apt => apt.patientId)
    )];
    return patients.filter(p => myPatientIds.includes(p.id.toString()));
  };

  const getPatientAppointments = (patientId) => {
    return appointments.filter(apt => 
      (apt.patientId === patientId || String(apt.patientId) === String(patientId)) &&
      (apt.doctorId === user.id || apt.doctorId === String(user.id)) &&
      (apt.status === 'Confirmed' || apt.status === 'confirmed')
    );
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const isMine = prescription.doctorId === user.id || prescription.doctorId === String(user.id);
    const matchesSearch = prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    return isMine && matchesSearch;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="p-6">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Prescriptions</h1>
          <p className="text-gray-600">Manage and view patient prescriptions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus size={20} /> New Prescription
        </button>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map(prescription => (
            <div key={prescription.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <FaFileMedical className="text-blue-500 text-2xl" />
                <span className="text-sm text-gray-500">{prescription.date}</span>
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">
                <Link to={`/doctor/patients/${prescription.patientId}`} className="hover:text-blue-600 hover:underline">
                  {prescription.patientName}
                </Link>
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {prescription.diagnosis ? `Diagnosis: ${prescription.diagnosis}` : 'No diagnosis'}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                {prescription.medications.length} medication(s)
              </p>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  prescription.status === 'active' ? 'bg-green-100 text-green-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {prescription.status}
                </span>
                <span className="text-xs text-gray-500">
                  ID: {prescription.id}
                </span>
              </div>
              <button
                onClick={() => openViewModal(prescription)}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                <FaEye size={16} /> View Details
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500">No prescriptions found.</p>
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Prescription</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Patient</option>
                    {getMyPatients().map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Appointment (Optional)</label>
                  <select
                    name="appointmentId"
                    value={formData.appointmentId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Appointment</option>
                    {formData.patientId && getPatientAppointments(formData.patientId).map(apt => (
                      <option key={apt.id} value={apt.id}>
                        {apt.date} at {apt.time} - {apt.reason}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Enter diagnosis"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medications *</label>
                {formData.medications.map((med, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-2 relative">
                    {formData.medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicationField(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Medicine Name *"
                        value={med.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g., 500mg) *"
                        value={med.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g., 2x/day) *"
                        value={med.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g., 5 days) *"
                        value={med.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Instructions (e.g., After meals)"
                        value={med.instructions}
                        onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMedicationField}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Another Medication
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor's Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Additional instructions for the patient..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePrescription}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {showViewModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold">Prescription Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient</p>
                  <p className="font-semibold">{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date Issued</p>
                  <p className="font-semibold">{selectedPrescription.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Prescription ID</p>
                  <p className="font-semibold">{selectedPrescription.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    selectedPrescription.status === 'active' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedPrescription.status}
                  </span>
                </div>
              </div>

              {selectedPrescription.diagnosis && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Diagnosis</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedPrescription.diagnosis}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <FaCapsules className="mr-2" /> Medications
                </p>
                <div className="space-y-3">
                  {selectedPrescription.medications.map((med, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-800">{med.name}</p>
                      <p className="text-sm text-gray-600">
                        {med.dosage} - {med.frequency} for {med.duration}
                      </p>
                      {med.instructions && (
                        <p className="text-sm text-gray-500 italic">Instructions: {med.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Doctor's Notes</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedPrescription.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t text-right text-sm text-gray-500">
                <p>Issued by: Dr. {selectedPrescription.doctorName}</p>
                <p>Created at: {new Date(selectedPrescription.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionPage;