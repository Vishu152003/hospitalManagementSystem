import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaCalendarCheck, FaUsers, FaClock, FaPlus, FaStar, FaFilePrescription } from 'react-icons/fa';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  // Use the useLocalStorageSync hook for real-time updates
  const [appointments] = useLocalStorageSync('appointments', []);
  
  const [data, setData] = useState({
    kpis: [],
    appointmentStats: [],
    todayAppointments: [],
  });

  // REAL-TIME DATA FETCH FROM LOCALSTORAGE
  useEffect(() => {
    const updateDashboardData = () => {
      console.log('--- DASHBOARD UPDATE TRIGGERED ---');
      console.log('All appointments from hook:', appointments);
      console.log('Current logged-in user:', user);
      console.log('User ID (type:', typeof user.id, '):', user.id);
      
      // --- FILTER for the CURRENT doctor and TODAY's appointments ---
      const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
      
      // More robust ID comparison
      const myTodayAppointments = appointments.filter(apt => {
        // --- DEBUGGING LOGS ---
        console.log(`Comparing appointment.doctorId (type: ${typeof apt.doctorId}): "${apt.doctorId}" with user.id (type: ${typeof user.id}): "${user.id}"`);
        
        const doctorIdMatch = apt.doctorId === user.id || 
                             apt.doctorId === String(user.id) || 
                             String(apt.doctorId) === String(user.id);
        
        console.log('-> Doctor ID match result:', doctorIdMatch);
        // --- END DEBUGGING LOGS ---
        
        return doctorIdMatch && apt.date === today;
      });

      console.log('My today appointments after filtering:', myTodayAppointments);

      // --- CALCULATE KPIs ---
      const myAllAppointments = appointments.filter(apt => {
        return apt.doctorId === user.id || 
               apt.doctorId === String(user.id) || 
               String(apt.doctorId) === String(user.id);
      });
      
      const totalPatients = [...new Set(myAllAppointments.map(apt => apt.patientId))].length;
      
      const kpis = [
        { title: "Today's Appointments", value: myTodayAppointments.length, icon: <FaCalendarCheck />, color: 'border-blue-500' },
        { title: "Total Patients", value: totalPatients, icon: <FaUsers />, color: 'border-green-500' },
        { title: "Pending Requests", value: myTodayAppointments.filter(a => a.status === 'Pending').length, icon: <FaClock />, color: 'border-yellow-500' },
      ];

      // --- CALCULATE STATS ---
      const stats = {
        Confirmed: myTodayAppointments.filter(a => a.status === 'Confirmed').length,
        Pending: myTodayAppointments.filter(a => a.status === 'Pending').length,
        Cancelled: myTodayAppointments.filter(a => a.status === 'Cancelled').length,
      };
      const formattedStats = Object.entries(stats).map(([status, count]) => ({
          status, count, color: status === 'Confirmed' ? 'bg-green-500' : status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
      }));

      // --- UPDATE STATE ---
      setData({
        kpis: kpis,
        todayAppointments: myTodayAppointments,
        appointmentStats: formattedStats,
      });
      console.log('--- END DASHBOARD UPDATE ---');
    };

    // Initial data load
    updateDashboardData();
    
  }, [appointments, user.id]); // Re-run if the appointments or logged-in user changes

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const maxCount = Math.max(...data.appointmentStats.map(s => s.count), 1);

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, Dr. {user.name}</h1>
        <p className="text-gray-600">Overview for {today}</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {data.kpis.map((kpi, index) => (
          <div key={index} className={`bg-white p-6 rounded-lg shadow-md border-t-4 ${kpi.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{kpi.title}</p>
                <p className="text-3xl font-bold text-gray-800">{kpi.value}</p>
              </div>
              <div className="text-3xl text-gray-400">{kpi.icon}</div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Appointment Status</h2>
          <div className="space-y-3">
            {data.appointmentStats.map((stat) => (
              <div key={stat.status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{stat.status}</span>
                  <span className="font-semibold">{stat.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`${stat.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${(stat.count / maxCount) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/doctor/appointments" className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 p-4 rounded-lg hover:bg-blue-100 transition-colors">
              <FaCalendarCheck size={20} />
              <span>View Appointments</span>
            </Link>
            <Link to="/doctor/patients" className="flex items-center justify-center gap-2 bg-green-50 text-green-600 p-4 rounded-lg hover:bg-green-100 transition-colors">
              <FaUsers size={20} />
              <span>View Patients</span>
            </Link>
            <Link to="/doctor/prescriptions" className="flex items-center justify-center gap-2 bg-purple-50 text-purple-600 p-4 rounded-lg hover:bg-purple-100 transition-colors">
              <FaFilePrescription size={20} />
              <span>Prescriptions</span>
            </Link>
            <Link to="/doctor/profile" className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <FaUserMd size={20} />
              <span>Profile</span>
            </Link>
          </div>
        </section>
      </div>

      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Appointments</h2>
        <div className="space-y-2">
          {data.todayAppointments.length > 0 ? (
            data.todayAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-600 font-medium w-24">{apt.time}</span>
                <Link to={`/doctor/patients/${apt.patientId}`} className="flex-grow text-blue-600 hover:underline font-medium text-center">
                  {apt.patientName}
                </Link>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  apt.status === 'Confirmed' ? 'bg-green-200 text-green-800' :
                  apt.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No appointments scheduled for today.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;