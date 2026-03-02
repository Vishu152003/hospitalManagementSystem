import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiMail, FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { generateId, saveToLocalStorage, getFromLocalStorage, initializeDepartments } from '../../Utils/dataUtils';
import { useLocalStorageSync } from '../../hooks/UseLocalStorageSync';

const BookAppointment = () => {
  const navigate = useNavigate();
  const patient = JSON.parse(localStorage.getItem('user')) || {};
  
  // Use the useLocalStorageSync hook for real-time updates
  const [appointments, setAppointments] = useLocalStorageSync('appointments', []);
  const [users] = useLocalStorageSync('users', []);
  const [departments, setDepartments] = useLocalStorageSync('departments', []);
  
  // Get doctors from users
  const doctors = users.filter(user => user.role === 'doctor');
  
  // Form state
  const [formData, setFormData] = useState({
    department: '',
    doctor: '',
    date: '',
    time: '',
    reason: '',
    symptoms: ''
  });
  
  // Available data
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Initialize departments on component mount
  useEffect(() => {
    const initializedDepartments = initializeDepartments();
    if (departments.length === 0) {
      setDepartments(initializedDepartments);
    }
  }, []);

  // Update available time slots when date changes
  useEffect(() => {
    if (formData.date) {
      const slots = [];
      for (let hour = 9; hour <= 16; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeString);
        }
      }
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.date]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If doctor is selected, update selectedDoctor state
    if (name === 'doctor') {
      const doctor = doctors.find(d => d.id === value);
      setSelectedDoctor(doctor || null);
    }
    
    // If department changes, clear doctor selection
    if (name === 'department') {
      setFormData(prev => ({ ...prev, doctor: '' }));
      setSelectedDoctor(null);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.department || !formData.doctor || !formData.date || !formData.time || !formData.reason) {
      alert('Please fill all required fields');
      return;
    }
    
    // Move to payment step
    setBookingStep(2);
  };

  // Handle payment
  const handlePayment = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const appointment = {
        id: generateId('apt'),
        doctorId: formData.doctor,
        doctorName: selectedDoctor.name,
        patientId: patient.id,
        patientName: patient.name,
        department: formData.department,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        symptoms: formData.symptoms,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      
      setAppointments([...appointments, appointment]);
      
      const notifications = getFromLocalStorage('notifications', []);
      notifications.push({
        id: generateId('notif'),
        recipientId: formData.doctor,
        type: 'new_appointment',
        message: `New appointment request from ${patient.name} on ${formData.date} at ${formData.time}`,
        isRead: false,
        timestamp: Date.now()
      });
      saveToLocalStorage('notifications', notifications);
      
      setBookingId(appointment.id);
      setAppointmentBooked(true);
      setBookingStep(3);
      setIsProcessing(false);
    }, 2000);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      department: '',
      doctor: '',
      date: '',
      time: '',
      reason: '',
      symptoms: ''
    });
    setBookingStep(1);
    setAppointmentBooked(false);
    setBookingId('');
    setSelectedDoctor(null);
  };

  // Navigate back to dashboard
  const goToDashboard = () => {
    navigate('/patient/dashboard');
  };

  // Get doctors for selected department
  const getFilteredDoctors = () => {
    if (!formData.department) return [];
    
    return doctors.filter(doctor => {
      const doctorSpecialization = doctor.specialization?.toLowerCase() || '';
      const selectedDepartment = formData.department.toLowerCase();
      
      return doctorSpecialization.includes(selectedDepartment) ||
             selectedDepartment.includes(doctorSpecialization) ||
             (selectedDepartment === 'cardiology' && doctorSpecialization.includes('cardio')) ||
             (selectedDepartment === 'neurology' && doctorSpecialization.includes('neuro')) ||
             (selectedDepartment === 'orthopedics' && doctorSpecialization.includes('ortho')) ||
             (selectedDepartment === 'pediatrics' && doctorSpecialization.includes('ped')) ||
             (selectedDepartment === 'general' && (doctorSpecialization.includes('general') || doctorSpecialization.includes('physician'))) ||
             (selectedDepartment === 'dermatology' && doctorSpecialization.includes('derma')) ||
             (selectedDepartment === 'gynecology' && doctorSpecialization.includes('gyne')) ||
             (selectedDepartment === 'ophthalmology' && doctorSpecialization.includes('ophthal')) ||
             (selectedDepartment === 'ent' && (doctorSpecialization.includes('ent') || doctorSpecialization.includes('ear') || doctorSpecialization.includes('nose') || doctorSpecialization.includes('throat'))) ||
             (selectedDepartment === 'psychiatry' && doctorSpecialization.includes('psych'));
    });
  };

  // Get today's date in YYYY-MM-DD format for min date attribute
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get department name by ID
  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : departmentId;
  };

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Book Appointment</h1>
        <p className="text-gray-600">Schedule an appointment with a doctor</p>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${bookingStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {bookingStep > 1 ? <FiCheck /> : 1}
            </div>
            <span className="ml-2 font-medium">Appointment Details</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${bookingStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${bookingStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {bookingStep > 2 ? <FiCheck /> : 2}
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${bookingStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${bookingStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Confirmation</span>
          </div>
        </div>

        {/* Step 1: Appointment Details Form */}
        {bookingStep === 1 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  {departments.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No departments available. Please try refreshing the page.</p>
                  )}
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor *
                  </label>
                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.department}
                  >
                    <option value="">Select Doctor</option>
                    {getFilteredDoctors().map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                  {formData.department && getFilteredDoctors().length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No doctors available in this department.</p>
                  )}
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={getTodayDate()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time *
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.date}
                  >
                    <option value="">Select Time</option>
                    {availableSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                {/* Appointment Reason */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Reason *
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief reason for appointment"
                    required
                  ></textarea>
                </div>

                {/* Symptoms */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms (Optional)
                  </label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your symptoms in detail"
                  ></textarea>
                </div>
              </div>

              {/* Selected Doctor Info */}
              {selectedDoctor && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Selected Doctor</h3>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <FiUser className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Dr. {selectedDoctor.name}</p>
                      <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                      <p className="text-sm text-gray-600">{selectedDoctor.email}</p>
                      {selectedDoctor.phone && (
                        <p className="text-sm text-gray-600">{selectedDoctor.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!formData.department || !formData.doctor || !formData.date || !formData.time || !formData.reason}
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Payment */}
        {bookingStep === 2 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Appointment Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Department:</span>
                  <span>{getDepartmentName(formData.department)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Doctor:</span>
                  <span>Dr. {selectedDoctor?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Date:</span>
                  <span>{formData.date}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Time:</span>
                  <span>{formData.time}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Consultation Fee:</span>
                  <span>$50.00</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" id="card" defaultChecked className="mr-3" />
                  <label htmlFor="card" className="flex items-center cursor-pointer">
                    <FiCreditCard className="mr-2" />
                    Credit/Debit Card
                  </label>
                </div>
                <div className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" id="cash" className="mr-3" />
                  <label htmlFor="cash" className="flex items-center cursor-pointer">
                    Pay at Hospital
                  </label>
                </div>
              </div>
            </div>

            {isProcessing ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <span className="ml-2">Processing payment...</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setBookingStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePayment}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirm Payment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {bookingStep === 3 && appointmentBooked && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-green-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Appointment Booked!</h2>
            <p className="text-gray-600 mb-6">
              Your appointment has been successfully booked. You will receive a confirmation email shortly.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-medium mb-2">Appointment Details</h3>
              <div className="flex justify-between mb-2">
                <span>Booking ID:</span>
                <span>{bookingId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Department:</span>
                <span>{getDepartmentName(formData.department)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Doctor:</span>
                <span>Dr. {selectedDoctor?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Date:</span>
                <span>{formData.date}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Time:</span>
                <span>{formData.time}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Status:</span>
                <span className="text-yellow-600 font-medium">Pending Confirmation</span>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={goToDashboard}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;