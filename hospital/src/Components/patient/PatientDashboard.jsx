import React from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FaUser, FaCalendarPlus, FaListAlt, FaFileMedical, FaCog, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import './PatientDashboard.css';
// Import page components

import DashboardPage from './Dashboard';
import BookAppointmentPage from './BookAppointment';
import MyAppointmentsPage from './MyAppointment';
import MedicalRecordsPage from './MedicalRecords';
import ProfilePage from './ProfilePage';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const links = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: <FaUser size={20} /> },
    { name: 'Book Appointment', path: '/patient/book', icon: <FaCalendarPlus size={20} /> },
    { name: 'My Appointments', path: '/patient/appointments', icon: <FaListAlt size={20} /> },
    { name: 'Medical Records', path: '/patient/records', icon: <FaFileMedical size={20} /> },
    { name: 'Profile', path: '/patient/profile', icon: <FaCog size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* --- SIDEBAR --- */}
      <div className="w-64 h-full bg-gray-800 text-white flex flex-col">
        <div className="text-2xl font-bold p-6 border-b border-gray-700 flex gap-2 items-center">
          <FaUser size={28} />
          Patient Panel
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/patient/dashboard'}
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
              <p className="text-sm font-semibold truncate">{user.name || 'Loading...'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email || 'patient@hms.com'}</p>
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
          <Route index element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="book" element={<BookAppointmentPage />} />
          <Route path="appointments" element={<MyAppointmentsPage />} />
          <Route path="records" element={<MedicalRecordsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
};

export default PatientDashboard;