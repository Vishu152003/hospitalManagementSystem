import React from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FaUserMd, FaCalendarAlt, FaUsers, FaFilePrescription, FaCog, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

// Import page components
import DashboardPage from './Dashboard';
import AppointmentsPage from './Schedule';
import PatientsPage from './Patients';
import PrescriptionsPage from './Prescriptions';
import ProfilePage from './ProfileSetting';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const links = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: <FaUserMd size={20} /> },
    { name: 'Appointments', path: '/doctor/appointments', icon: <FaCalendarAlt size={20} /> },
    { name: 'Patients', path: '/doctor/patients', icon: <FaUsers size={20} /> },
    { name: 'Prescriptions', path: '/doctor/prescriptions', icon: <FaFilePrescription size={20} /> },
    { name: 'Profile', path: '/doctor/profile', icon: <FaCog size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* --- SIDEBAR --- */}
      <div className="w-64 h-full bg-gray-800 text-white flex flex-col">
        <div className="text-2xl font-bold p-6 border-b border-gray-700 flex gap-2 items-center">
          <FaUserMd size={28} />
          Doctor Panel
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/doctor/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded mb-2 hover:bg-gray-700 transition-colors ${
                  isActive ? 'bg-gray-700 font-semibold' : ''
                }`
              }
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 mb-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUserCircle size={20} className="text-gray-300" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">Dr. {user.name || 'Loading...'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email || 'doctor@hms.com'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors">
            <FaSignOutAlt size={18} /> Log out
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        <Routes>
          <Route index element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* This route is for viewing a specific patient's profile, not the doctor's own */}
          <Route path="patients/:patientId" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
};

export default DoctorDashboard;