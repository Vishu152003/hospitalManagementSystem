import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';
import { FaDollarSign, FaClock, FaFileInvoice, FaUserInjured } from 'react-icons/fa';

function AdminBillingPage() {
  // Use the hook for real-time sync
  const [bills, setBills] = useLocalStorageSync('bills', []);
  const [appointments] = useLocalStorageSync('appointments', []);
  const [users] = useLocalStorageSync('users', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Update lastUpdated time whenever bills change
  useEffect(() => {
    setLastUpdated(new Date());
  }, [bills]);

  // Initialize sample data only if the bills array is empty
  useEffect(() => {
    if (bills.length === 0) {
      const initialBills = [
        { id: 1, invoiceNumber: 'INV-2024-001', patientName: 'John Smith', patientEmail: 'john@email.com', doctorName: 'Dr. Sarah Johnson', amount: 220, status: 'Paid', source: 'Patient Booking', createdAt: new Date().toISOString() },
        { id: 2, invoiceNumber: 'INV-2024-002', patientName: 'Emily Davis', patientEmail: 'emily@email.com', doctorName: 'Dr. Michael Chen', amount: 165, status: 'Pending', source: 'Patient Booking', createdAt: new Date().toISOString() }
      ];
      setBills(initialBills);
    }
  }, [bills.length, setBills]);

  // Create bills from appointments if they don't exist
  useEffect(() => {
    if (appointments.length > 0 && users.length > 0) {
      const newBills = [];
      
      appointments.forEach(appointment => {
        // Check if a bill already exists for this appointment
        const existingBill = bills.find(bill => bill.appointmentId === appointment.id);
        
        if (!existingBill) {
          // Get patient and doctor details
          const patient = users.find(u => u.id === appointment.patientId);
          const doctor = users.find(u => u.id === appointment.doctorId);
          
          if (patient && doctor) {
            // Create a new bill
            newBills.push({
              id: `BILL-${appointment.id}`,
              appointmentId: appointment.id,
              invoiceNumber: `INV-${new Date().getFullYear()}-${String(appointment.id).padStart(3, '0')}`,
              patientName: patient.name,
              patientEmail: patient.email,
              doctorName: doctor.name,
              amount: 50, // Default consultation fee
              status: appointment.status === 'completed' ? 'Paid' : 'Pending',
              source: 'Patient Booking',
              createdAt: appointment.createdAt || new Date().toISOString()
            });
          }
        }
      });
      
      if (newBills.length > 0) {
        setBills([...bills, ...newBills]);
      }
    }
  }, [appointments, users, bills, setBills]);

  // Filter bills with useMemo for performance
  const filteredBills = useMemo(() => {
    if (!Array.isArray(bills)) return [];
    return bills.filter(bill => {
      const matchesSearch = bill.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bill.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || bill.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [bills, searchTerm, filterStatus]);

  const deleteBill = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      // Use the setter from the hook
      setBills(currentBills => currentBills.filter(bill => bill.id !== id));
    }
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Calculate totals with useMemo
  const { totalRevenue, pendingAmount } = useMemo(() => {
    if (!Array.isArray(bills)) return { totalRevenue: 0, pendingAmount: 0 };
    
    // Check for both 'Paid' and 'paid' status to handle case inconsistencies
    const totalRevenue = bills.filter(bill => {
      const status = bill.status ? bill.status.toLowerCase() : '';
      return status === 'paid';
    }).reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    
    // Check for both 'Pending' and 'pending' status
    const pendingAmount = bills.filter(bill => {
      const status = bill.status ? bill.status.toLowerCase() : '';
      return status === 'pending';
    }).reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    
    return { totalRevenue, pendingAmount };
  }, [bills]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Billing Dashboard</h1>
              <p className="text-sm text-gray-500">Real-time billing from patient activities</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <span className="text-sm text-gray-500">
                Last update: {formatTimeAgo(lastUpdated)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">{bills.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaFileInvoice className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Patient Bookings</p>
                <p className="text-2xl font-bold text-purple-600">{bills.filter(i => i.source === 'Patient Booking').length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaUserInjured className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by patient name or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('All');
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.length > 0 ? (
                  filteredBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{bill.invoiceNumber}</div>
                          <div className="text-sm text-gray-500">{formatTimeAgo(bill.createdAt)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{bill.patientName}</div>
                        <div className="text-sm text-gray-500">{bill.patientEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.doctorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${bill.amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {bill.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBill(bill);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteBill(bill.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No bills found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Invoice Modal */}
        {showViewModal && selectedBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="font-medium">{selectedBill.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{selectedBill.patientName}</p>
                  <p className="text-sm text-gray-500">{selectedBill.patientEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-medium">{selectedBill.doctorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-lg">${selectedBill.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    selectedBill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedBill.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {selectedBill.source}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="mt-6 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBillingPage;