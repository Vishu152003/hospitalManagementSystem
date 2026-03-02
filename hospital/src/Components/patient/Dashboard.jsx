import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaClock, FaTimesCircle, FaPills, FaBell, FaUserMd } from 'react-icons/fa';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';
import { generateId } from '../../Utils/dataUtils'; // Add this import

const findUserById = (id, userList) => {
  return userList.find(user => user.id === id || String(user.id) === String(id));
};

const DashboardPage = () => {
  const [appointments] = useLocalStorageSync('appointments', []);
  const [prescriptions] = useLocalStorageSync('prescriptions', []);
  const [notifications] = useLocalStorageSync('notifications', []);
  const [users] = useLocalStorageSync('users', []);
  
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: [],
    appointmentStats: { upcoming: 0, completed: 0, cancelled: 0 },
    recentPrescriptions: [],
    notifications: []
  });

  const patient = JSON.parse(localStorage.getItem('user')) || {};

  // Function to fetch all dashboard data
  const fetchDashboardData = () => {
    if (!patient.id) return;

    // Get doctors from users
    const doctors = users.filter(user => user.role === 'doctor');

    // Filter data for the current patient
    const patientAppointments = appointments.filter(apt => 
      apt.patientId === patient.id || String(apt.patientId) === String(patient.id)
    );
    const patientPrescriptions = prescriptions.filter(pres => 
      pres.patientId === patient.id || String(pres.patientId) === String(patient.id)
    );
    const patientNotifications = notifications.filter(notif => 
      (notif.recipientId === patient.id || String(notif.recipientId) === String(patient.id)) && !notif.isRead
    );

    // Process data for display
    const today = new Date().toISOString().split('T')[0];
    const todayApts = patientAppointments.filter(apt => apt.date === today);

    const stats = {
      // Changed from 'upcoming' to 'Pending' to match the status set in BookAppointment
      upcoming: patientAppointments.filter(apt => 
        apt.status === 'Pending' || apt.status === 'Confirmed' || apt.status === 'pending' || apt.status === 'confirmed'
      ).length,
      completed: patientAppointments.filter(apt => 
        apt.status === 'completed' || apt.status === 'Completed'
      ).length,
      cancelled: patientAppointments.filter(apt => 
        apt.status === 'cancelled' || apt.status === 'Cancelled'
      ).length,
    };

    // Sort prescriptions by date to get the most recent
    const recentPres = patientPrescriptions.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 3);

    setDashboardData({
      todayAppointments: todayApts,
      appointmentStats: stats,
      recentPrescriptions: recentPres,
      notifications: patientNotifications
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [appointments, prescriptions, notifications, users, patient.id]);

    useEffect(() => {
      window.generatePatientMockData = () => {
      if (!patient.id) {
        alert("Please log in as a patient first.");
        return;
      }
      
      // Get doctors from users
      const doctors = users.filter(user => user.role === 'doctor');
      
      if (doctors.length === 0) {
        alert("Please ensure doctors are registered first to create mock appointments.");
        return;
      }

      const doctor = doctors[0]; // Use the first available doctor

      const newAppointments = [
        { 
          id: generateId('apt'), 
          patientId: patient.id, 
          doctorId: doctor.id, 
          date: new Date().toISOString().split('T')[0], 
          time: '10:00', 
          status: 'Pending', 
          reason: 'General Checkup',
          patientName: patient.name,
          doctorName: doctor.name,
          createdAt: new Date().toISOString()
        },
        { 
          id: generateId('apt'), 
          patientId: patient.id, 
          doctorId: doctor.id, 
          date: new Date().toISOString().split('T')[0], 
          time: '14:00', 
          status: 'Confirmed', 
          reason: 'Follow-up',
          patientName: patient.name,
          doctorName: doctor.name,
          createdAt: new Date().toISOString()
        },
        { 
          id: generateId('apt'), 
          patientId: patient.id, 
          doctorId: doctor.id, 
          date: '2023-10-25', 
          time: '11:00', 
          status: 'Completed', 
          reason: 'Initial Consultation',
          patientName: patient.name,
          doctorName: doctor.name,
          createdAt: new Date().toISOString()
        },
        { 
          id: generateId('apt'), 
          patientId: patient.id, 
          doctorId: doctor.id, 
          date: '2023-10-20', 
          time: '09:00', 
          status: 'Cancelled', 
          reason: 'Routine Checkup',
          patientName: patient.name,
          doctorName: doctor.name,
          createdAt: new Date().toISOString()
        }
      ];
      
      // Update appointments using the setter from useLocalStorageSync
      setAppointments(prev => [...prev, ...newAppointments]);

      // Create sample prescription
      const newPrescription = {
        id: generateId('pres'),
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentId: generateId('apt'),
        date: '2023-10-25',
        patientName: patient.name,
        doctorName: doctor.name,
        medicines: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily' }],
        notes: 'Take after meals.',
        createdAt: new Date().toISOString()
      };
      
      // Update prescriptions using the setter from useLocalStorageSync
      setPrescriptions(prev => [...prev, newPrescription]);

      // Create sample notifications
      const newNotifications = [
        { 
          id: generateId('notif'), 
          recipientId: patient.id, 
          type: 'appointment_reminder', 
          message: 'Reminder: You have an appointment today at 10:00 AM.', 
          isRead: false, 
          timestamp: Date.now() - 3600000 
        },
        { 
          id: generateId('notif'), 
          recipientId: patient.id, 
          type: 'prescription_update', 
          message: 'Dr. Smith has updated your prescription.', 
          isRead: false, 
          timestamp: Date.now() - 7200000 
        }
      ];
      
      // Update notifications using the setter from useLocalStorageSync
      setNotifications(prev => [...prev, ...newNotifications]);
      
      alert('Mock data generated! Refresh the page to see it.');
    };
  }, [patient.id, users, appointments, prescriptions, notifications]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
        <p className="text-gray-600">Welcome back, {patient.name}. Here's your overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCalendarCheck className="text-blue-600" />
            Today's Appointments
          </h2>
          {dashboardData.todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.todayAppointments.map(apt => {
                const doctor = findUserById(apt.doctorId, users);
                return (
                  <div key={apt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Dr. {doctor?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{apt.time} - {apt.reason}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      apt.status === 'Pending' || apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      apt.status === 'Confirmed' || apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      apt.status === 'Completed' || apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'Cancelled' || apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No appointments for today.</p>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaBell className="text-yellow-500" />
            Notifications
            {dashboardData.notifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {dashboardData.notifications.length}
              </span>
            )}
          </h2>
          <div className="space-y-2">
            {dashboardData.notifications.length > 0 ? (
              dashboardData.notifications.map(notif => (
                <p key={notif.id} className="text-sm text-gray-600 border-b pb-2">{notif.message}</p>
              ))
            ) : (
              <p className="text-gray-500">No new notifications.</p>
            )}
          </div>
        </div>

        {/* Appointment Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600"><FaClock /> Upcoming</span>
                <span className="font-bold text-blue-600">{dashboardData.appointmentStats.upcoming}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600"><FaCalendarCheck /> Completed</span>
                <span className="font-bold text-green-600">{dashboardData.appointmentStats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600"><FaTimesCircle /> Cancelled</span>
                <span className="font-bold text-red-600">{dashboardData.appointmentStats.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaPills className="text-green-600" />
            Recent Prescriptions
          </h2>
          {dashboardData.recentPrescriptions.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentPrescriptions.map(pres => {
                const doctor = findUserById(pres.doctorId, users);
                return (
                  <div key={pres.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Prescribed by Dr. {doctor?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Date: {pres.date}</p>
                      </div>
                      <p className="text-sm text-gray-700">{pres.medicines?.[0]?.name || 'N/A'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No recent prescriptions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;