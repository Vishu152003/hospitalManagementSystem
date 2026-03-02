import React, { useState, useEffect, useRef } from 'react';
import { MdPeople, MdLocalHospital, MdEventNote, MdTrendingUp, MdInventory, MdAttachMoney, MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  // Use useLocalStorageSync hook to sync data with localStorage
  const [appointments, setAppointments] = useLocalStorageSync('appointments', []);
  const [users] = useLocalStorageSync('users', []);
  const [bills, setBills] = useLocalStorageSync('bills', []);
  // Changed from 'inventory' to 'inventoryItems' to match Inventory.jsx
  const [inventoryItems, setInventoryItems] = useLocalStorageSync('inventoryItems', []);
  
  // Initialize stats with default values
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    pendingBills: 0,
    completedAppointments: 0,
    cancelledAppointments: 0
  });
  
  // Initialize previous stats separately
  const [previousStats, setPreviousStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0
  });
  
  // Use a ref to track the previous stats value
  const statsRef = useRef(stats);

  // Calculate statistics whenever data changes
  useEffect(() => {
    // store previous stats BEFORE recalculation
    setPreviousStats(prev => ({
      totalDoctors: stats.totalDoctors,
      totalPatients: stats.totalPatients,
      totalAppointments: stats.totalAppointments,
      totalRevenue: stats.totalRevenue
    }));

    // safety checks
    const isBillsArray = Array.isArray(bills);
    const isInventoryArray = Array.isArray(inventoryItems);
    const isAppointmentsArray = Array.isArray(appointments);
    const isUsersArray = Array.isArray(users);

    // Filter users to get doctors and patients
    const doctors = isUsersArray
      ? users.filter(u => u.role === 'doctor')
      : [];

    const patients = isUsersArray
      ? users.filter(u => u.role === 'patient')
      : [];

    const totalRevenue = isBillsArray
      ? bills.reduce((sum, bill) => {
          return bill?.status?.toLowerCase() === 'paid'
            ? sum + Number(bill.amount || 0)
            : sum;
        }, 0)
      : 0;

    // Fixed to use 'minStock' instead of 'minStockLevel' to match Inventory.jsx
    const lowStockItems = isInventoryArray
      ? inventoryItems.filter(item =>
          Number(item.quantity || 0) <= Number(item.minStock || 0)
        ).length
      : 0;

    const pendingBills = isBillsArray
      ? bills.filter(b => b?.status?.toLowerCase() === 'pending').length
      : 0;

    const completedAppointments = isAppointmentsArray
      ? appointments.filter(a => a?.status?.toLowerCase() === 'completed').length
      : 0;

    const cancelledAppointments = isAppointmentsArray
      ? appointments.filter(a => a?.status?.toLowerCase() === 'cancelled').length
      : 0;

    // now set NEW stats
    setStats({
      totalDoctors: doctors.length,
      totalPatients: patients.length,
      totalAppointments: isAppointmentsArray ? appointments.length : 0,
      totalRevenue: totalRevenue, // keep NUMBER
      lowStockItems,
      pendingBills,
      completedAppointments,
      cancelledAppointments
    });
  }, [appointments, users, bills, inventoryItems, stats.totalDoctors, stats.totalPatients, stats.totalAppointments, stats.totalRevenue]);

  // Prepare data for charts
  const getAppointmentsByMonth = () => {
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{ 
          label: 'Appointments', 
          data: [0, 0, 0, 0, 0, 0], 
          borderColor: 'rgb(59, 130, 246)', 
          backgroundColor: 'rgba(59, 130, 246, 0.1)', 
          tension: 0.4, 
          fill: true 
        }]
      };
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(months[monthIndex]);
    }

    const appointmentCounts = last6Months.map((month, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12;
      return appointments.filter(apt => {
        if (!apt.date) return false;
        const aptDate = new Date(apt.date);
        return !isNaN(aptDate.getTime()) && 
               aptDate.getMonth() === monthIndex && 
               aptDate.getFullYear() === new Date().getFullYear();
      }).length;
    });

    return {
      labels: last6Months,
      datasets: [{ 
        label: 'Appointments', 
        data: appointmentCounts, 
        borderColor: 'rgb(59, 130, 246)', 
        backgroundColor: 'rgba(59, 130, 246, 0.1)', 
        tension: 0.4, 
        fill: true 
      }]
    };
  };

  const getRevenueByMonth = () => {
    if (!Array.isArray(bills) || bills.length === 0) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{ 
          label: 'Revenue ($)', 
          data: [0, 0, 0, 0, 0, 0], 
          backgroundColor: 'rgba(34, 197, 94, 0.8)', 
          borderColor: 'rgb(34, 197, 94)', 
          borderWidth: 1 
        }]
      };
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(months[monthIndex]);
    }

    const revenueData = last6Months.map((month, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12;
      return bills
        .filter(bill => {
          if (!bill.createdAt) return false;
          const status = bill.status ? bill.status.toLowerCase() : '';
          if (status !== 'paid') return false;
          
          const billDate = new Date(bill.createdAt);
          return !isNaN(billDate.getTime()) && 
                 billDate.getMonth() === monthIndex && 
                 billDate.getFullYear() === new Date().getFullYear();
        })
        .reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    });

    return {
      labels: last6Months,
      datasets: [{ 
        label: 'Revenue ($)', 
        data: revenueData, 
        backgroundColor: 'rgba(34, 197, 94, 0.8)', 
        borderColor: 'rgb(34, 197, 94)', 
        borderWidth: 1 
      }]
    };
  };

  const getAppointmentStatusData = () => {
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return {
        labels: ['Completed', 'Scheduled', 'Cancelled', 'In Progress'],
        datasets: [{ 
          data: [0, 0, 0, 0], 
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)', 
            'rgba(59, 130, 246, 0.8)', 
            'rgba(239, 68, 68, 0.8)', 
            'rgba(245, 158, 11, 0.8)'
          ], 
          borderWidth: 0 
        }]
      };
    }

    const statusCounts = {
      completed: appointments.filter(apt => {
        const status = apt.status ? apt.status.toLowerCase() : '';
        return status === 'completed';
      }).length,
      scheduled: appointments.filter(apt => {
        const status = apt.status ? apt.status.toLowerCase() : '';
        return status === 'scheduled';
      }).length,
      cancelled: appointments.filter(apt => {
        const status = apt.status ? apt.status.toLowerCase() : '';
        return status === 'cancelled';
      }).length,
      'in-progress': appointments.filter(apt => {
        const status = apt.status ? apt.status.toLowerCase() : '';
        return status === 'in-progress';
      }).length
    };

    return {
      labels: ['Completed', 'Scheduled', 'Cancelled', 'In Progress'],
      datasets: [{ 
        data: [
          statusCounts.completed, 
          statusCounts.scheduled, 
          statusCounts.cancelled, 
          statusCounts['in-progress']
        ], 
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', 
          'rgba(59, 130, 246, 0.8)', 
          'rgba(239, 68, 68, 0.8)', 
          'rgba(245, 158, 11, 0.8)'
        ], 
        borderWidth: 0 
      }]
    };
  };

  const getDoctorSpecializationData = () => {
    const doctors = Array.isArray(users)
      ? users.filter(u => u.role === 'doctor')
      : [];

    if (doctors.length === 0) {
      return {
        labels: ['General'],
        datasets: [{
          label: 'Departments',
          data: [0],
          backgroundColor: ['rgba(59,130,246,0.8)']
        }]
      };
    }

    const departments = {};

    doctors.forEach(doc => {
      const dept = doc.department || doc.specialization || 'General';
      departments[dept] = (departments[dept] || 0) + 1;
    });

    return {
      labels: Object.keys(departments),
      datasets: [{
        label: 'Departments',
        data: Object.values(departments),
        backgroundColor: [
          'rgba(59,130,246,0.8)',
          'rgba(34,197,94,0.8)',
          'rgba(245,158,11,0.8)',
          'rgba(239,68,68,0.8)',
          'rgba(139,92,246,0.8)'
        ]
      }]
    };
  };

  // Updated to use inventoryItems and minStock to match Inventory.jsx
  const getInventoryStatusData = () => {
    if (!Array.isArray(inventoryItems)) {
      return {
        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
        datasets: [{ data: [0, 0, 0] }]
      };
    }

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    inventoryItems.forEach(item => {
      const qty = Number(item.quantity || 0);
      const min = Number(item.minStock || 0);

      if (qty === 0) {
        outOfStock++;
      } else if (qty <= min) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return {
      labels: ['In Stock', 'Low Stock', 'Out of Stock'],
      datasets: [{
        data: [inStock, lowStock, outOfStock],
        backgroundColor: [
          'rgba(34,197,94,0.8)',
          'rgba(245,158,11,0.8)',
          'rgba(239,68,68,0.8)'
        ]
      }]
    };
  };

  // New function to get category distribution for inventory
  const getInventoryCategoryData = () => {
    if (!Array.isArray(inventoryItems) || inventoryItems.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(200,200,200,0.8)']
        }]
      };
    }

    const categories = {};
    inventoryItems.forEach(item => {
      const category = item.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });

    const colors = [
      'rgba(59,130,246,0.8)',
      'rgba(34,197,94,0.8)',
      'rgba(245,158,11,0.8)',
      'rgba(239,68,68,0.8)',
      'rgba(139,92,246,0.8)',
      'rgba(236,72,153,0.8)'
    ];

    return {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: colors.slice(0, Object.keys(categories).length)
      }]
    };
  };

  const chartOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { position: 'top' } 
    } 
  };
  
  const lineChartOptions = { 
    ...chartOptions, 
    scales: { 
      y: { beginAtZero: true } 
    } 
  };

  const getPercentageChange = (current, previous) => {
    const curr = Number(current) || 0;
    const prev = Number(previous) || 0;

    if (prev === 0) return 0;

    return (((curr - prev) / prev) * 100).toFixed(1);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-full bg-blue-500 text-white"><MdLocalHospital size={24} /></div>
            <div className="flex items-center text-sm">
              {getPercentageChange(stats.totalDoctors, previousStats.totalDoctors) >= 0 ? 
                <MdKeyboardArrowUp className="text-green-500 mr-1" /> : 
                <MdKeyboardArrowDown className="text-red-500 mr-1" />
              }
              <span className={getPercentageChange(stats.totalDoctors, previousStats.totalDoctors) >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(getPercentageChange(stats.totalDoctors, previousStats.totalDoctors))}%
              </span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalDoctors}</h3>
          <p className="text-gray-600">Total Doctors</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-full bg-green-500 text-white"><MdPeople size={24} /></div>
            <div className="flex items-center text-sm">
              {getPercentageChange(stats.totalPatients, previousStats.totalPatients) >= 0 ? 
                <MdKeyboardArrowUp className="text-green-500 mr-1" /> : 
                <MdKeyboardArrowDown className="text-red-500 mr-1" />
              }
              <span className={getPercentageChange(stats.totalPatients, previousStats.totalPatients) >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(getPercentageChange(stats.totalPatients, previousStats.totalPatients))}%
              </span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalPatients}</h3>
          <p className="text-gray-600">Total Patients</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-full bg-purple-500 text-white"><MdEventNote size={24} /></div>
            <div className="flex items-center text-sm">
              {getPercentageChange(stats.totalAppointments, previousStats.totalAppointments) >= 0 ? 
                <MdKeyboardArrowUp className="text-green-500 mr-1" /> : 
                <MdKeyboardArrowDown className="text-red-500 mr-1" />
              }     
              <span className={getPercentageChange(stats.totalAppointments, previousStats.totalAppointments) >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(getPercentageChange(stats.totalAppointments, previousStats.totalAppointments))}%
              </span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</h3>
          <p className="text-gray-600">Total Appointments</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-full bg-yellow-500 text-white"><MdAttachMoney size={24} /></div>
            <div className="flex items-center text-sm">
              {getPercentageChange(parseFloat(stats.totalRevenue), parseFloat(previousStats.totalRevenue)) >= 0 ? 
                <MdKeyboardArrowUp className="text-green-500 mr-1" /> : 
                <MdKeyboardArrowDown className="text-red-500 mr-1" />
              }
              <span className={getPercentageChange(parseFloat(stats.totalRevenue), parseFloat(previousStats.totalRevenue)) >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(getPercentageChange(parseFloat(stats.totalRevenue), parseFloat(previousStats.totalRevenue)))}%
              </span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">${stats.totalRevenue.toFixed(2)}</h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointments Trend (Last 6 Months)</h2>
          <div className="h-64"><Line data={getAppointmentsByMonth()} options={lineChartOptions} /></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Trend (Last 6 Months)</h2>
          <div className="h-64"><Bar data={getRevenueByMonth()} options={lineChartOptions} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Status</h2>
          <div className="h-64"><Doughnut data={getAppointmentStatusData()} options={chartOptions} /></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Doctors by Specialization</h2>
          <div className="h-64"><Pie data={getDoctorSpecializationData()} options={chartOptions} /></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Status</h2>
          <div className="h-64"><Doughnut data={getInventoryStatusData()} options={chartOptions} /></div>
        </div>
      </div>

      {/* New Inventory Category Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory by Category</h2>
        <div className="h-64"><Pie data={getInventoryCategoryData()} options={chartOptions} /></div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/appointments" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <MdEventNote size={24} className="text-blue-600 mr-3" />
            <span className="text-gray-800">Manage Appointments</span>
          </Link>
          <Link to="/admin/doctors" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <MdLocalHospital size={24} className="text-green-600 mr-3" />
            <span className="text-gray-800">Manage Doctors</span>
          </Link>
          <Link to="/admin/patients" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <MdPeople size={24} className="text-purple-600 mr-3" />
            <span className="text-gray-800">Manage Patients</span>
          </Link>
          <Link to="/admin/inventory" className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <MdInventory size={24} className="text-yellow-600 mr-3" />
            <span className="text-gray-800">Manage Inventory</span>
          </Link>
        </div>
      </div>
      
      {stats.lowStockItems > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <MdInventory size={24} className="text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Low Stock Alert</h3>
              <p className="text-red-700">You have {stats.lowStockItems} items with low stock levels. Please update your inventory.</p>
              <Link to="/admin/inventory" className="text-red-600 underline hover:text-red-800 mt-2 inline-block">View Inventory</Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <MdEventNote size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-800">New appointment scheduled</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <MdPeople size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-800">New patient registered</p>
              <p className="text-sm text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <MdAttachMoney size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-800">New payment received</p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;































