// src/components/patient/MyAppointments.jsx

import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiCheck, FiX, FiSearch, FiFilter, FiEdit3, FiEye } from 'react-icons/fi';

// Hardcoded list of doctors (same as in BookAppointment for consistency)
const doctorsList = [
  { id: 'doc-1', name: 'Dr. John Smith', specialization: 'Cardiologist' },
  { id: 'doc-2', name: 'Dr. Sarah Johnson', specialization: 'Neurologist' },
  { id: 'doc-3', name: 'Dr. Michael Brown', specialization: 'Orthopedic Surgeon' },
  { id: 'doc-4', name: 'Dr. Emily Davis', specialization: 'Pediatrician' },
  { id: 'doc-5', name: 'Dr. Robert Wilson', specialization: 'General Physician' },
  { id: 'doc-6', name: 'Dr. Jennifer Lee', specialization: 'Interventional Cardiologist' },
  { id: 'doc-7', name: 'Dr. David Martinez', specialization: 'Neurosurgeon' },
  { id: 'doc-8', name: 'Dr. Lisa Anderson', specialization: 'Sports Medicine Specialist' }
];

const MyAppointments = () => {
  const patient = JSON.parse(localStorage.getItem('user')) || {};
  const [appointments, setAppointments] = useState({
    pending: [],
    upcoming: [],
    past: []
  });
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  // Function to fetch and categorize appointments
  const fetchAppointments = () => {
    if (!patient.id) return;
    
    const allAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const patientAppointments = allAppointments.filter(apt => apt.patientId === patient.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pending = [];
    const upcoming = [];
    const past = [];

    patientAppointments.forEach(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);

      if (apt.status === 'Pending') {
        pending.push(apt);
      } else if (apt.status === 'Confirmed') {
        if (aptDate >= today) {
          upcoming.push(apt);
        } else {
          past.push(apt); // Confirmed appointments in the past are also "past"
        }
      } else if (apt.status === 'Completed' || apt.status === 'Cancelled') {
        past.push(apt);
      }
    });

    // Sort appointments by date and time
    const sortAppointments = (a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`);
    pending.sort(sortAppointments);
    upcoming.sort(sortAppointments);
    past.sort(sortAppointments).reverse(); // Past appointments in descending order

    setAppointments({ pending, upcoming, past });
  };

  useEffect(() => {
    fetchAppointments();

    // Listen for real-time updates from the doctor's panel
    const handleStorageUpdate = () => {
      fetchAppointments();
    };
    
    window.addEventListener('storageUpdate', handleStorageUpdate);
    return () => window.removeEventListener('storageUpdate', handleStorageUpdate);
  }, [patient.id]);

  // --- Action Handlers ---

  const handleCancelAppointment = (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    const allAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const updatedAppointments = allAppointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: 'Cancelled' } : apt
    );
    
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    window.dispatchEvent(new Event('storageUpdate')); // Notify other components
    fetchAppointments(); // Update local state immediately
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(''); // Reset form
    setNewTime('');
    setAvailableSlots([]);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = () => {
    if (!newDate || !newTime) {
      alert('Please select a new date and time.');
      return;
    }

    const allAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const updatedAppointments = allAppointments.map(apt => {
      if (apt.id === selectedAppointment.id) {
        return { ...apt, date: newDate, time: newTime, status: 'Pending' }; // Reset to Pending for doctor approval
      }
      return apt;
    });
    
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    window.dispatchEvent(new Event('storageUpdate'));
    
    setIsRescheduleModalOpen(false);
    fetchAppointments();
    alert('Appointment rescheduled. It is now pending approval from the doctor.');
  };

  // --- UI Helpers ---

  const getDoctorName = (doctorId) => {
    const doctor = doctorsList.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.name}` : 'N/A';
  };
  
  const getDoctorSpecialization = (doctorId) => {
    const doctor = doctorsList.find(d => d.id === doctorId);
    return doctor ? doctor.specialization : 'N/A';
  };

  const renderAppointmentCard = (appointment) => {
    const date = new Date(appointment.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
    });
    
    return (
      <div key={appointment.id} className="bg-white p-4 rounded-lg shadow-md mb-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <FiUser className="text-blue-500 mr-2" />
              <span className="font-semibold text-blue-800">{getDoctorName(appointment.doctorId)}</span>
              <span className="text-sm text-gray-500 ml-2">({getDoctorSpecialization(appointment.doctorId)})</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <FiCalendar className="mr-2 text-gray-400" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <FiClock className="mr-2 text-gray-400" />
                <span>{appointment.time}</span>
              </div>
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-gray-700"><span className="font-medium">Reason:</span> {appointment.reason}</p>
            </div>
            
            <div className="mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                appointment.status === 'Confirmed' ? 'bg-green-200 text-green-800' :
                appointment.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                appointment.status === 'Cancelled' ? 'bg-red-200 text-red-800' :
                appointment.status === 'Completed' ? 'bg-blue-200 text-blue-800' :
                'bg-gray-200 text-gray-800'
              }`}>
                {appointment.status}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 ml-4">
            <button onClick={() => { setSelectedAppointment(appointment); setIsViewModalOpen(true); }} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="View Details">
              <FiEye size={16} />
            </button>
            
            {(appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
              <>
                <button onClick={() => openRescheduleModal(appointment)} className="p-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors" title="Reschedule">
                  <FiEdit3 size={16} />
                </button>
                <button onClick={() => handleCancelAppointment(appointment.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Cancel">
                  <FiX size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Update available time slots when date changes in reschedule modal
  useEffect(() => {
    if (newDate) {
      const slots = [];
      for (let hour = 9; hour <= 16; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [newDate]);

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
        <p className="text-gray-600">Track and manage all your appointments</p>
      </header>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approval ({appointments.pending?.length || 0})
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({appointments.upcoming?.length || 0})
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'past' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('past')}
          >
            Past ({appointments.past?.length || 0})
          </button>
        </div>
      </div>

      {/* Appointments Content */}
      <div>
        {activeTab === 'pending' && (
          appointments.pending.length > 0 ? appointments.pending.map(renderAppointmentCard) : 
          <div className="bg-white p-8 rounded-lg shadow-md text-center"><p className="text-gray-500">No pending appointments.</p></div>
        )}
        {activeTab === 'upcoming' && (
          appointments.upcoming.length > 0 ? appointments.upcoming.map(renderAppointmentCard) : 
          <div className="bg-white p-8 rounded-lg shadow-md text-center"><p className="text-gray-500">No upcoming appointments.</p></div>
        )}
        {activeTab === 'past' && (
          appointments.past.length > 0 ? appointments.past.map(renderAppointmentCard) : 
          <div className="bg-white p-8 rounded-lg shadow-md text-center"><p className="text-gray-500">No past appointments.</p></div>
        )}
      </div>

      {/* View Details Modal */}
      {isViewModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Appointment Details</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Doctor:</strong> {getDoctorName(selectedAppointment.doctorId)}</p>
              <p><strong>Specialization:</strong> {getDoctorSpecialization(selectedAppointment.doctorId)}</p>
              <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedAppointment.time}</p>
              <p><strong>Status:</strong> {selectedAppointment.status}</p>
              <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
              {selectedAppointment.symptoms && <p><strong>Symptoms:</strong> {selectedAppointment.symptoms}</p>}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Reschedule Appointment</h2>
            <p className="text-sm text-gray-600 mb-4">Select a new date and time. The appointment will be set to 'Pending' for doctor approval.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                <select value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={!newDate}>
                  <option value="">Select Time</option>
                  {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsRescheduleModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
              <button onClick={handleRescheduleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Confirm Reschedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
