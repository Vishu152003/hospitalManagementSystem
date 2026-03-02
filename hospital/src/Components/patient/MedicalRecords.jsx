import React, { useState, useEffect } from 'react';
import { FaFileMedical, FaPills, FaFlask, FaNotesMedical, FaFileDownload, FaEye, FaCalendarAlt, FaUserMd, FaStethoscope, FaClipboardList } from 'react-icons/fa';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';

const MedicalRecords = () => {
  const patient = JSON.parse(localStorage.getItem('user')) || {};
  const [users] = useLocalStorageSync('users', []);
  const [medicalRecords, setMedicalRecords] = useLocalStorageSync('medicalRecords', []);
  const [prescriptions] = useLocalStorageSync('prescriptions', []);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Function to fetch all medical records including prescriptions
  const fetchMedicalRecords = () => {
    if (!patient.id) return;
    
    // Get patient medical records
    const patientRecords = medicalRecords.filter(record => 
      record.patientId === patient.id || String(record.patientId) === String(patient.id)
    );
    
    // Get patient prescriptions and convert them to medical record format
    const patientPrescriptions = prescriptions.filter(pres => 
      pres.patientId === patient.id || String(pres.patientId) === String(patient.id)
    );
    
    // Convert prescriptions to medical record format for display
    const prescriptionRecords = patientPrescriptions.map(pres => ({
      ...pres,
      type: 'prescription',
      title: `Prescription: ${pres.medications.map(m => m.name).join(', ')}`,
      content: pres.diagnosis || 'No diagnosis provided',
      date: pres.date,
      source: 'prescription'
    }));
    
    // Combine all records
    const allRecords = [...patientRecords, ...prescriptionRecords];
    
    // Sort all records by date (newest first)
    const sortedRecords = allRecords.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || b.createdAt));
    
    return sortedRecords;
  };

  const [allRecords, setAllRecords] = useState([]);
  
  useEffect(() => {
    setAllRecords(fetchMedicalRecords());
  }, [patient.id, medicalRecords, prescriptions]);

  const getDoctorName = (doctorId) => {
    const doctor = users.find(user => 
      (user.id === doctorId || String(user.id) === String(doctorId)) && user.role === 'doctor'
    );
    return doctor ? `Dr. ${doctor.name}` : 'N/A';
  };

  const openViewModal = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleDownloadRecord = (record) => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(record, null, 2)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${record.title.replace(/\s+/g, '_')}_${record.date}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderRecordCard = (record, icon) => {
    const date = new Date(record.date || record.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
    
    return (
      <div key={record.id} className="bg-white p-4 rounded-lg shadow-md mb-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {icon}
              <h3 className="font-semibold text-gray-800 ml-2">{record.title}</h3>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <FaCalendarAlt className="mr-2 text-gray-400" />
              <span>{formattedDate}</span>
              <FaUserMd className="ml-4 mr-2 text-gray-400" />
              <span>{getDoctorName(record.doctorId)}</span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">{record.content}</p>
            {record.medications && record.medications.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-blue-600 font-medium">
                  {record.medications.length} medication(s)
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-2 ml-4">
            <button onClick={() => openViewModal(record)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="View Details">
              <FaEye size={16} />
            </button>
            <button onClick={() => handleDownloadRecord(record)} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Download">
              <FaFileDownload size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Filter records by type
  const getRecordsByType = (type) => {
    if (type === 'all') return allRecords;
    return allRecords.filter(record => record.type === type);
  };

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Medical Records</h1>
        <p className="text-gray-600">View your medical history and documents</p>
      </header>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Records ({allRecords.length})
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'prescription'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('prescription')}
          >
            Prescriptions ({getRecordsByType('prescription').length})
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'diagnosis'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('diagnosis')}
          >
            Diagnosis ({getRecordsByType('diagnosis').length})
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'treatment'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('treatment')}
          >
            Treatment ({getRecordsByType('treatment').length})
          </button>
        </div>
      </div>

      {/* Records Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'all' && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaFileMedical className="text-blue-600" />
                Recent Records
              </h2>
              <div className="space-y-3">
                {allRecords.slice(0, 5).map(record => {
                  const icon = record.type === 'prescription' ? <FaPills className="text-green-600" /> :
                               record.type === 'diagnosis' ? <FaStethoscope className="text-purple-600" /> :
                               record.type === 'treatment' ? <FaNotesMedical className="text-orange-600" /> :
                               <FaFileMedical className="text-blue-600" />;
                  return renderRecordCard(record, icon);
                })}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaClipboardList className="text-indigo-600" />
                Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Records</span>
                  <span className="font-bold text-lg">{allRecords.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Prescriptions</span>
                  <span className="font-bold text-lg">{getRecordsByType('prescription').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-600">Diagnoses</span>
                  <span className="font-bold text-lg">{getRecordsByType('diagnosis').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-gray-600">Treatments</span>
                  <span className="font-bold text-lg">{getRecordsByType('treatment').length}</span>
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'prescription' && (
          <div className="col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaPills className="text-green-600" />
                Prescriptions
              </h2>
              <div className="space-y-3">
                {getRecordsByType('prescription').length > 0 ? (
                  getRecordsByType('prescription').map(record => renderRecordCard(record, <FaPills className="text-green-600" />))
                ) : (
                  <p className="text-gray-500 text-center py-4">No prescriptions found.</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'diagnosis' && (
          <div className="col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaStethoscope className="text-purple-600" />
                Diagnosis History
              </h2>
              <div className="space-y-3">
                {getRecordsByType('diagnosis').length > 0 ? (
                  getRecordsByType('diagnosis').map(record => renderRecordCard(record, <FaStethoscope className="text-purple-600" />))
                ) : (
                  <p className="text-gray-500 text-center py-4">No diagnoses found.</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'treatment' && (
          <div className="col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaNotesMedical className="text-orange-600" />
                Treatment History
              </h2>
              <div className="space-y-3">
                {getRecordsByType('treatment').length > 0 ? (
                  getRecordsByType('treatment').map(record => renderRecordCard(record, <FaNotesMedical className="text-orange-600" />))
                ) : (
                  <p className="text-gray-500 text-center py-4">No treatments found.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Record Modal */}
      {isViewModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{selectedRecord.title}</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-center">
                <span className="font-medium mr-2">Type:</span>
                <span className="capitalize">{selectedRecord.type?.replace('_', ' ') || 'Prescription'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Date:</span>
                <span>{new Date(selectedRecord.date || selectedRecord.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Doctor:</span>
                <span>{getDoctorName(selectedRecord.doctorId)}</span>
              </div>
              
              {selectedRecord.diagnosis && (
                <div>
                  <h3 className="font-medium mb-2">Diagnosis:</h3>
                  <p className="bg-gray-50 p-3 rounded">{selectedRecord.diagnosis}</p>
                </div>
              )}
              
              {/* Display medicines if it's a prescription */}
              {selectedRecord.medicines && selectedRecord.medicines.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Medications:</h3>
                  <div className="space-y-2">
                    {selectedRecord.medicines.map((medicine, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 rounded">
                        <p className="font-semibold">{medicine.name}</p>
                        <p className="text-sm text-gray-600">
                          {medicine.dosage} - {medicine.frequency} for {medicine.duration}
                        </p>
                        {medicine.instructions && (
                          <p className="text-sm text-gray-500 italic">Instructions: {medicine.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-medium mb-2">Notes:</h3>
                <p className="bg-gray-50 p-3 rounded">{selectedRecord.content || selectedRecord.notes || 'No additional notes'}</p>
              </div>
              
              {selectedRecord.prescriptionId && (
                <div className="text-sm text-gray-500">
                  <p>Prescription ID: {selectedRecord.prescriptionId}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;