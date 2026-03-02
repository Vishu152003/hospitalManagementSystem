import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiEye, FiTrash2, FiCalendar, FiClock, FiUser, FiFilter, FiSearch, FiCheck, FiX } from 'react-icons/fi';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';

const AppointmentsPage = () => {
  // Use the hook for all data to ensure real-time sync
  const [appointments, setAppointments] = useLocalStorageSync('appointments', []);
  const [patients] = useLocalStorageSync('patients', []);
  const [doctors] = useLocalStorageSync('doctors', []);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
  });
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter appointments with useMemo for performance
  const filteredAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    return appointments.filter(apt => {
      const matchesSearch = apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           apt.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || apt.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, filterStatus]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAppointment = () => {
    const patient = patients.find(p => p.id === formData.patientId);
    const doctor = doctors.find(d => d.id === formData.doctorId);

    if (!patient || !doctor || !formData.date || !formData.time) {
      showNotification('Please fill all fields.', 'error');
      return;
    }

    const newAppointment = {
      id: `APT-${Date.now()}`,
      patientId: formData.patientId,
      doctorId: formData.doctorId,
      patientName: patient.name,
      doctorName: doctor.name,
      department: doctor.specialization,
      date: formData.date,
      time: formData.time,
      status: 'Pending',
      reason: formData.reason,
    };

    // Use the setter from the hook
    setAppointments(currentAppointments => [...currentAppointments, newAppointment]);
    setIsCreateModalOpen(false);
    setFormData({ patientId: '', doctorId: '', date: '', time: '', reason: '' });
    showNotification('Appointment created and is pending approval.', 'success');
  };

  const handleEditAppointment = () => {
    if (!selectedAppointment) return;
    
    // Use the setter from the hook
    setAppointments(currentAppointments => 
      currentAppointments.map(apt => 
        apt.id === selectedAppointment.id ? { ...selectedAppointment, ...formData } : apt
      )
    );
    
    setIsEditModalOpen(false);
    setSelectedAppointment(null);
    showNotification('Appointment updated successfully.', 'success');
  };

  const handleApprove = (id) => {
    // Use the setter from the hook
    setAppointments(currentAppointments => 
      currentAppointments.map(apt => 
        apt.id === id ? { ...apt, status: 'Confirmed' } : apt
      )
    );
    showNotification('Appointment approved successfully.', 'success');
  };

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      // Use the setter from the hook
      setAppointments(currentAppointments => 
        currentAppointments.map(apt => 
          apt.id === id ? { ...apt, status: 'Cancelled' } : apt
        )
      );
      showNotification('Appointment cancelled successfully.', 'info');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      // Use the setter from the hook
      setAppointments(currentAppointments => currentAppointments.filter(apt => apt.id !== id));
      showNotification('Appointment deleted successfully.', 'info');
    }
  };

  const openViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
    });
    setIsEditModalOpen(true);
  };

  const showNotification = (message, type) => {
    // This notification function is fine, no changes needed
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    notification.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const displayHour = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      slots.push(`${displayHour}:00 ${ampm}`);
      slots.push(`${displayHour}:30 ${ampm}`);
    }
    return slots;
  };

  // The rest of the JSX (the return statement) remains the same.
  // It's a lot of code, but it doesn't need to change as it just uses the state and handlers.
  // Appointments.jsx
// ... (keep all the imports and the logic before the return statement) ...

  return (
    <div className="p-6">
      {/* Header with Search and Filter */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Appointment Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-600" />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus size={20} /> New Appointment
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FiCalendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{appointments.filter(apt => apt.status === 'Pending').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FiCheck size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-gray-800">{appointments.filter(apt => apt.status === 'Confirmed').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <FiX size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-gray-800">{appointments.filter(apt => apt.status === 'Cancelled').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">{apt.id}</td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                        {apt.patientName?.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{apt.patientName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                        {apt.doctorName?.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{apt.doctorName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">{`${apt.date} at ${apt.time}`}</td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                        apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => openViewModal(apt)} className="text-blue-600 hover:text-blue-900" title="View"><FiEye size={18} /></button>
                      <button onClick={() => openEditModal(apt)} className="text-green-600 hover:text-green-900" title="Edit"><FiEdit2 size={18} /></button>
                      {apt.status === 'Pending' && <button onClick={() => handleApprove(apt.id)} className="text-blue-600 hover:text-blue-900" title="Approve"><FiCheck size={18} /></button>}
                      {(apt.status === 'Pending' || apt.status === 'Confirmed') && <button onClick={() => handleCancel(apt.id)} className="text-red-600 hover:text-red-900" title="Cancel"><FiX size={18} /></button>}
                      <button onClick={() => handleDelete(apt.id)} className="text-gray-600 hover:text-gray-900" title="Delete"><FiTrash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAppointments.length === 0 && <div className="text-center py-10 text-gray-500">No appointments found.</div>}
      </div>

      {/* Create Appointment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Book New Appointment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select value={formData.doctorId} onChange={(e) => setFormData({...formData, doctorId: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Select Time</option>
                  {generateTimeSlots().map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" rows="3"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">Cancel</button>
              <button onClick={handleCreateAppointment} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {isViewModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Appointment Details</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>ID:</strong> {selectedAppointment.id}</p>
              <p><strong>Patient:</strong> {selectedAppointment.patientName}</p>
              <p><strong>Doctor:</strong> {selectedAppointment.doctorName}</p>
              <p><strong>Department:</strong> {selectedAppointment.department}</p>
              <p><strong>Date:</strong> {selectedAppointment.date}</p>
              <p><strong>Time:</strong> {selectedAppointment.time}</p>
              <p><strong>Status:</strong> {selectedAppointment.status}</p>
              <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {isEditModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Edit Appointment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select value={formData.doctorId} onChange={(e) => setFormData({...formData, doctorId: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Select Time</option>
                  {generateTimeSlots().map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" rows="3"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">Cancel</button>
              <button onClick={handleEditAppointment} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;