import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserMd, FaCalendarAlt, FaClock, FaChartLine, FaChartPie, FaChartBar, FaBox, FaStethoscope, FaNotesMedical, FaArrowUp, FaArrowDown, FaFilter, FaCalendar, FaDownload, FaPlus } from 'react-icons/fa';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync'; // Fixed path

function AnalyticsPage() {
  // Use useLocalStorageSync for REAL data from localStorage
  const [users] = useLocalStorageSync('users', []); // Get all users
  const [appointments] = useLocalStorageSync('appointments', []);
  const [inventory] = useLocalStorageSync('inventory', []);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Extract real doctors and patients from users
  const realDoctors = users.filter(user => user.role === 'doctor');
  const realPatients = users.filter(user => user.role === 'patient');

  useEffect(() => {
    // Just set loading to false since we're using real data
    setIsLoading(false);
  }, [users.length, appointments.length, inventory.length]);

  // Calculate REAL KPIs from actual data
  const totalPatients = realPatients.length;
  const totalDoctors = realDoctors.length;
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(apt => apt.status === 'Pending' || apt.status === 'pending').length;
  const completedAppointments = appointments.filter(apt => apt.status === 'Completed' || apt.status === 'completed').length;
  const cancelledAppointments = appointments.filter(apt => apt.status === 'Cancelled' || apt.status === 'cancelled').length;

  // Calculate REAL appointment trends
  const getAppointmentTrend = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayAppointments = appointments.filter(apt => apt.date === dateStr).length;
      last7Days.push({ date: dateStr, count: dayAppointments });
    }
    return last7Days;
  };

  // Get REAL patients per doctor
  const getPatientsPerDoctor = () => {
    return realDoctors.map(doctor => {
      const doctorAppointments = appointments.filter(apt => 
        apt.doctorId === doctor.id || String(apt.doctorId) === String(doctor.id)
      );
      const uniquePatients = [...new Set(doctorAppointments.map(apt => apt.patientId))];
      return { 
        name: doctor.name, 
        patients: uniquePatients.length, 
        specialization: doctor.specialization || 'General',
        id: doctor.id
      };
    });
  };

  // Get REAL inventory by category
  const getInventoryByCategory = () => {
    const categories = {};
    inventory.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = { count: 0, totalValue: 0 };
      }
      categories[item.category].count += 1;
      categories[item.category].totalValue += item.value || 0;
    });
    return Object.entries(categories).map(([category, data]) => ({ category, ...data }));
  };

  // Get REAL recent appointments
  const getRecentAppointments = () => {
    return appointments
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 10);
  };

  // Filter data based on selected doctor
  const filteredPatientsPerDoctor = selectedDoctor === 'all' 
    ? getPatientsPerDoctor()
    : getPatientsPerDoctor().filter(doc => doc.name === selectedDoctor);

  // Get appointment completion rate
  const getCompletionRate = () => {
    if (totalAppointments === 0) return 0;
    return Math.round((completedAppointments / totalAppointments) * 100);
  };

  // Get average patients per doctor
  const getAveragePatientsPerDoctor = () => {
    if (totalDoctors === 0) return 0;
    return Math.round(totalPatients / totalDoctors);
  };

  // Find busiest day
  const getBusiestDay = () => {
    const dayCounts = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    appointments.forEach(apt => {
      if (apt.date) {
        const dayName = days[new Date(apt.date).getDay()];
        dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
      }
    });
    
    let busiestDay = 'Monday';
    let maxCount = 0;
    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        busiestDay = day;
      }
    });
    
    return busiestDay;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  const appointmentTrend = getAppointmentTrend();
  const maxCount = Math.max(...appointmentTrend.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FaChartBar className="text-3xl text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">Real-time insights and metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
              <button 
                onClick={() => {
                  const data = {
                    users,
                    appointments,
                    inventory,
                    generatedAt: new Date().toISOString()
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <FaDownload className="inline mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Add Data Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Sample Data</h3>
          <div className="flex space-x-4">
            <button 
              onClick={() => {
                const sampleDoctors = [
                  { id: Date.now().toString(), name: 'Dr. Sarah Johnson', specialization: 'Cardiology', patients: 45 },
                  { id: (Date.now() + 1).toString(), name: 'Dr. Michael Chen', specialization: 'Dentist', patients: 38 },
                  { id: (Date.now() + 2).toString(), name: 'Dr. Emily Rodriguez', specialization: 'Pediatrics', patients: 52 },
                  { id: (Date.now() + 3).toString(), name: 'Dr. James Wilson', specialization: 'Orthopedics', patients: 31 },
                  { id: (Date.now() + 4).toString(), name: 'Dr. Lisa Anderson', specialization: 'Neurology', patients: 28 }
                ];
                
                const samplePatients = [
                  { id: (Date.now() + 5).toString(), name: 'John Smith', email: 'john@email.com', age: 45, gender: 'Male', registrationDate: '2024-01-15', role: 'patient' },
                  { id: (Date.now() + 6).toString(), name: 'Emily Davis', email: 'emily@email.com', age: 32, gender: 'Female', registrationDate: '2024-02-20', role: 'patient' },
                  { id: (Date.now() + 7).toString(), name: 'Robert Johnson', email: 'robert@email.com', age: 28, gender: 'Male', registrationDate: '2024-03-10', role: 'patient' },
                  { id: (Date.now() + 8).toString(), name: 'Maria Garcia', email: 'maria@email.com', age: 35, gender: 'Female', registrationDate: '2024-01-25', role: 'patient' },
                  { id: (Date.now() + 9).toString(), name: 'David Brown', email: 'david@email.com', age: 41, gender: 'Male', registrationDate: '2024-04-05', role: 'patient' },
                  { id: (Date.now() + 10).toString(), name: 'Jennifer Lee', email: 'jennifer@email.com', age: 29, gender: 'Female', registrationDate: '2024-02-15', role: 'patient' }
                ];
                
                const sampleAppointments = [
                  { id: (Date.now() + 11).toString(), patientId: (Date.now() + 5).toString(), doctorId: sampleDoctors[0].id, patientName: 'John Smith', doctorName: 'Dr. Sarah Johnson', date: new Date().toISOString().split('T')[0], time: '09:00', status: 'completed', type: 'Consultation' },
                  { id: (Date.now() + 12).toString(), patientId: (Date.now() + 6).toString(), doctorId: sampleDoctors[1].id, patientName: 'Emily Davis', doctorName: 'Dr. Michael Chen', date: new Date().toISOString().split('T')[0], time: '10:30', status: 'completed', type: 'Follow-up' },
                  { id: (Date.now() + 13).toString(), patientId: (Date.now() + 7).toString(), doctorId: sampleDoctors[2].id, patientName: 'Robert Johnson', doctorName: 'Dr. Emily Rodriguez', date: new Date().toISOString().split('T')[0], time: '14:00', status: 'pending', type: 'Initial Visit' },
                  { id: (Date.now() + 14).toString(), patientId: (Date.now() + 8).toString(), doctorId: sampleDoctors[3].id, patientName: 'Maria Garcia', doctorName: 'Dr. James Wilson', date: new Date().toISOString().split('T')[0], time: '11:00', status: 'scheduled', type: 'Consultation' },
                  { id: (Date.now() + 15).toString(), patientId: (Date.now() + 9).toString(), doctorId: sampleDoctors[4].id, patientName: 'David Brown', doctorName: 'Dr. Lisa Anderson', date: new Date().toISOString().split('T')[0], time: '15:30', status: 'completed', type: 'Treatment' }
                ];
                
                const sampleInventory = [
                  { id: (Date.now() + 16).toString(), name: 'Paracetamol', category: 'Medicine', quantity: 150, value: 750 },
                  { id: (Date.now() + 17).toString(), name: 'Surgical Gloves', category: 'PPE', quantity: 500, value: 2500 },
                  { id: (Date.now() + 18).toString(), name: 'Blood Pressure Monitor', category: 'Equipment', quantity: 25, value: 3750 },
                  { id: (Date.now() + 19).toString(), name: 'Bandages', category: 'Supplies', quantity: 200, value: 1200 },
                  { id: (Date.now() + 20).toString(), name: 'Thermometer', category: 'Equipment', quantity: 80, value: 1600 },
                  { id: (Date.now() + 21).toString(), name: 'Face Masks', category: 'PPE', quantity: 1000, value: 500 }
                ];
                
                // Update localStorage using the hook
                const allUsers = [...users, ...sampleDoctors, ...samplePatients];
                localStorage.setItem('users', JSON.stringify(allUsers));
                localStorage.setItem('appointments', JSON.stringify([...appointments, ...sampleAppointments]));
                localStorage.setItem('inventory', JSON.stringify([...inventory, ...sampleInventory]));
                
                // Trigger storage update events
                window.dispatchEvent(new CustomEvent('storageUpdate', { 
                  detail: { key: 'users', value: allUsers } 
                }));
                window.dispatchEvent(new CustomEvent('storageUpdate', { 
                  detail: { key: 'appointments', value: [...appointments, ...sampleAppointments] } 
                }));
                window.dispatchEvent(new CustomEvent('storageUpdate', { 
                  detail: { key: 'inventory', value: [...inventory, ...sampleInventory] } 
                }));
                
                alert('Sample data added successfully!');
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <FaPlus className="inline mr-2" />
              Add Sample Data
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Clear All Data
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Patients */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Patients</p>
                <p className="text-3xl font-bold text-blue-600">{totalPatients}</p>
                <div className="flex items-center mt-2">
                  <FaArrowUp className="text-green-500 mr-1" />
                  <span className="text-green-500 text-sm">Active patients</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          {/* Total Doctors */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Doctors</p>
                <p className="text-3xl font-bold text-green-600">{totalDoctors}</p>
                <div className="flex items-center mt-2">
                  <FaArrowUp className="text-green-500 mr-1" />
                  <span className="text-green-500 text-sm">Available doctors</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaUserMd className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          {/* Total Appointments */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Appointments</p>
                <p className="text-3xl font-bold text-purple-600">{totalAppointments}</p>
                <div className="flex items-center mt-2">
                  <FaArrowUp className="text-green-500 mr-1" />
                  <span className="text-green-500 text-sm">All time</span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaCalendarAlt className="text-purple-600 text-2xl" />
              </div>
            </div>
          </div>

          {/* Pending Appointments */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Appointments</p>
                <p className="text-3xl font-bold text-orange-600">{pendingAppointments}</p>
                <div className="flex items-center mt-2">
                  <FaClock className="text-orange-500 mr-1" />
                  <span className="text-orange-500 text-sm">Need attention</span>
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <FaClock className="text-orange-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Appointment Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Appointment Trend (Last 7 Days)</h3>
            <div className="h-64">
              <div className="flex items-end justify-between h-full px-2">
                {appointmentTrend.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-blue-500 rounded-t w-full"
                      style={{ 
                        height: `${(day.count / maxCount) * 100}%`,
                        minHeight: '4px'
                      }}
                    ></div>
                    <span className="text-xs mt-2 text-gray-600">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-semibold">{day.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appointment Status Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Appointment Status</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full border-8 border-green-500"></div>
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-8 border-orange-500" 
                     style={{ 
                       clipPath: `polygon(50% 50%, 50% 0%, ${100 - (completedAppointments/totalAppointments) * 100}% 0%, 100% 50%)`,
                       backgroundColor: '#f97316'
                     }}></div>
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-8 border-red-500" 
                     style={{ 
                       clipPath: `polygon(50% 50%, 50% 0%, ${100 - ((completedAppointments + pendingAppointments)/totalAppointments) * 100}% 0%, 100% 50%)`,
                       backgroundColor: '#ef4444'
                     }}></div>
              </div>
            </div>
            <div className="flex justify-center mt-4 space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Completed ({completedAppointments})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-sm">Pending ({pendingAppointments})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm">Cancelled ({cancelledAppointments})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Distribution by Doctor */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Patients per Doctor</h3>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Doctors</option>
              {realDoctors.map(doctor => (
                <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {filteredPatientsPerDoctor.map((doctor, index) => {
              const maxPatients = Math.max(...filteredPatientsPerDoctor.map(d => d.patients), 1);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{doctor.name}</p>
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600 mr-3">{doctor.patients}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${(doctor.patients / maxPatients) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory by Category */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Inventory by Category</h3>
          <div className="space-y-3">
            {getInventoryByCategory().map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaBox className="text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{category.category}</p>
                    <p className="text-sm text-gray-500">{category.count} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">${category.totalValue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Recent Appointments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getRecentAppointments().map(appointment => {
                  const patient = realPatients.find(p => p.id === appointment.patientId);
                  const doctor = realDoctors.find(d => d.id === appointment.doctorId);
                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient ? patient.name : appointment.patientName || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor ? doctor.name : appointment.doctorName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {appointment.type || 'Consultation'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Appointment Completion Rate</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {getCompletionRate()}%
              </div>
              <p className="text-sm text-gray-500 mt-2">of appointments completed</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Average Patients per Doctor</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {getAveragePatientsPerDoctor()}
              </div>
              <p className="text-sm text-gray-500 mt-2">patients per doctor</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Busiest Day</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">{getBusiestDay()}</div>
              <p className="text-sm text-gray-500 mt-2">Most appointments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;