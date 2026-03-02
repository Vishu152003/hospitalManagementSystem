import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiCheck, FiX, FiSearch, FiFilter } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync'

const Schedule = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  // Use the useLocalStorageSync hook for real-time updates
  const [appointments, setAppointments] = useLocalStorageSync('appointments', []);
  
  const [activeTab, setActiveTab] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Categorize appointments in real-time
  const getCategorizedAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    // Filter appointments for current doctor with robust ID comparison
    const doctorAppointments = appointments.filter(apt => {
      const doctorIdMatch = apt.doctorId === user.id || 
                           apt.doctorId === String(user.id) || 
                           String(apt.doctorId) === String(user.id);
      return doctorIdMatch;
    });
    
    console.log('All appointments:', appointments);
    console.log('Doctor appointments:', doctorAppointments);
    console.log('Current user ID:', user.id);
    
    // Categorize appointments
    const todayAppointments = [];
    const upcomingAppointments = [];
    const pastAppointments = [];
    
    doctorAppointments.forEach(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      
      if (aptDate.getTime() === today.getTime()) {
        todayAppointments.push(apt);
      } else if (aptDate > today) {
        upcomingAppointments.push(apt);
      } else {
        pastAppointments.push(apt);
      }
    });
    
    // Sort appointments by date and time
    const sortAppointments = (a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    };
    
    todayAppointments.sort(sortAppointments);
    upcomingAppointments.sort(sortAppointments);
    pastAppointments.sort(sortAppointments).reverse(); // Past appointments in descending order
    
    return {
      today: todayAppointments,
      upcoming: upcomingAppointments,
      past: pastAppointments
    };
  };

  const categorizedAppointments = getCategorizedAppointments();

  // Update appointment status using the setter from useLocalStorageSync
  const updateAppointmentStatus = (appointmentId, newStatus) => {
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === appointmentId) {
        return { ...apt, status: newStatus };
      }
      return apt;
    });
    
    // Update appointments using the setter from useLocalStorageSync
    setAppointments(updatedAppointments);
  };

  // Filter appointments based on search and status filter
  const filterAppointments = (appointmentsList) => {
    return appointmentsList.filter(apt => {
      const matchesSearch = apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           apt.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  };

  // Open view modal
  const openViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  // Render appointment card
  const renderAppointmentCard = (appointment) => {
    const date = new Date(appointment.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    return (
      <div key={appointment.id} className="bg-white p-4 rounded-lg shadow-md mb-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <FiUser className="text-blue-500 mr-2" />
              <Link to={`/doctor/patients/${appointment.patientId}`} className="font-semibold text-blue-600 hover:underline">
                {appointment.patientName}
              </Link>
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
              <p className="text-sm text-gray-700">
                <span className="font-medium">Reason:</span> {appointment.reason}
              </p>
            </div>
            
            <div className="mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                appointment.status === 'Confirmed' ? 'bg-green-200 text-green-800' :
                appointment.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                appointment.status === 'Cancelled' ? 'bg-red-200 text-red-800' :
                'bg-gray-200 text-gray-800'
              }`}>
                {appointment.status}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => openViewModal(appointment)}
              className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              title="View Details"
            >
              <FiSearch size={16} />
            </button>
            
            {appointment.status === 'Pending' && (
              <>
                <button
                  onClick={() => updateAppointmentStatus(appointment.id, 'Confirmed')}
                  className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                  title="Approve"
                >
                  <FiCheck size={16} />
                </button>
                <button
                  onClick={() => updateAppointmentStatus(appointment.id, 'Cancelled')}
                  className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  title="Cancel"
                >
                  <FiX size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render appointments list
  const renderAppointmentsList = (appointmentsList, emptyMessage) => {
    const filteredAppointments = filterAppointments(appointmentsList);
    
    return (
      <div>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map(renderAppointmentCard)
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
        <p className="text-gray-600">Manage your appointment schedule</p>
      </header>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or reason..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <FiFilter className="mr-2 text-gray-400" />
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'today'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('today')}
          >
            Today ({categorizedAppointments.today.length})
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'upcoming'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({categorizedAppointments.upcoming.length})
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'past'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('past')}
          >
            Past ({categorizedAppointments.past.length})
          </button>
        </div>
      </div>

      {/* Appointments Content */}
      <div>
        {activeTab === 'today' && (
          renderAppointmentsList(
            categorizedAppointments.today,
            "No appointments scheduled for today."
          )
        )}
        {activeTab === 'upcoming' && (
          renderAppointmentsList(
            categorizedAppointments.upcoming,
            "No upcoming appointments."
          )
        )}
        {activeTab === 'past' && (
          renderAppointmentsList(
            categorizedAppointments.past,
            "No past appointments."
          )
        )}
      </div>

      {/* View Appointment Modal */}
      {isViewModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Appointment Details</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>ID:</strong> {selectedAppointment.id}</p>
              <p><strong>Patient:</strong> {selectedAppointment.patientName}</p>
              <p><strong>Date:</strong> {selectedAppointment.date}</p>
              <p><strong>Time:</strong> {selectedAppointment.time}</p>
              <p><strong>Status:</strong> {selectedAppointment.status}</p>
              <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
              {selectedAppointment.symptoms && (
                <p><strong>Symptoms:</strong> {selectedAppointment.symptoms}</p>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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

export default Schedule;