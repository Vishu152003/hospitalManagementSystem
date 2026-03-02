import React, { useState, useMemo } from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdEventNote, MdLocalHospital, MdPeople, MdReceipt, MdInventory, MdBarChart, MdPerson } from 'react-icons/md';
import { FiLogOut } from 'react-icons/fi';
import { Stethoscope } from "lucide-react";
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';

// Import all individual page components for admin panel
import Dashboard from './Dashboard';
import AppointmentsPage from './Appointment';
import Doctors from './Doctors';
import Patients from './Patients';
import AdminBillingPage from './Billing';
import Inventory from './Inventory';
import Analytics from './Analytics';

const AdminDashboard = () => {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || {});
  // Use the hook for all data to ensure real-time sync
  const [appointments] = useLocalStorageSync('appointments', []);
  const [doctors] = useLocalStorageSync('doctors', []);
  const [patients] = useLocalStorageSync('patients', []);
  const [bills] = useLocalStorageSync('bills', []);
  const [inventory] = useLocalStorageSync('inventory', []);
  
  const navigate = useNavigate();
  const location = useLocation();
 
  const links = [
    { name: 'Dashboard', path: '/admin', icon: <MdDashboard size={20} /> },
    { name: 'Appointments', path: '/admin/appointments', icon: <MdEventNote size={20} /> },
    { name: 'Doctors', path: '/admin/doctors', icon: <MdLocalHospital size={20} /> },
    { name: 'Patients', path: '/admin/patients', icon: <MdPeople size={20} /> },
    { name: 'Billing', path: '/admin/billing', icon: <MdReceipt size={20} /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <MdInventory size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <MdBarChart size={20} /> },
  ];

  // Use useMemo to prevent re-calculating on every render
  const stats = useMemo(() => {
    // Add safety checks
    if (!Array.isArray(bills) || !Array.isArray(inventory)) {
      return {
        totalDoctors: 0, totalPatients: 0, totalAppointments: 0,
        totalRevenue: '0.00', lowStockItems: 0
      };
    }
    const totalRevenue = bills.reduce((sum, bill) => (bill.status === 'paid' ? sum + parseFloat(bill.amount || 0) : sum), 0);
    const lowStockItems = inventory.filter(item => parseInt(item.quantity || 0) <= parseInt(item.minStockLevel || 0)).length;

    return {
      totalDoctors: doctors.length,
      totalPatients: patients.length,
      totalAppointments: appointments.length,
      totalRevenue: totalRevenue.toFixed(2),
      lowStockItems: lowStockItems
    };
  }, [appointments, doctors, patients, bills, inventory]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 h-full bg-gray-800 text-white flex flex-col">
        <div className="text-2xl font-bold p-6 border-b border-gray-700 flex gap-2"> 
          <Stethoscope size={32} className="text-blue-300" /> 
          Admin Panel 
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded mb-2 hover:bg-gray-700 transition-colors ${
                  isActive ? 'bg-gray-700 font-semibold' : ''
                }`
              }
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 mb-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <MdPerson size={20} className="text-gray-300" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name || 'Administrator'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email || 'admin@hms.com'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors">
            <FiLogOut size={18} /> Log out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        <Routes>
          <Route index element={<Dashboard stats={stats} />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="patients" element={<Patients />} />
          <Route path="billing" element={<AdminBillingPage />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="analytics" element={<Analytics />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;