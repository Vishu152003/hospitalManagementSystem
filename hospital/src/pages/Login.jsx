import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope } from "lucide-react";
import { useLocalStorageSync } from '../hooks/UseLocalStorageSync';
import { saveToLocalStorage } from '../Utils/dataUtils';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    role: 'admin'
  });

  const navigate = useNavigate();
  
  // Use the useLocalStorageSync hook to access users data
  const [users] = useLocalStorageSync('users', []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password, role } = credentials;

    /* =======================
       1️⃣ ADMIN LOGIN
    ======================== */
    if (role === 'admin' && email === 'admin@email.com' && password === '12345') {
      const adminUser = {
        id: 'admin-001',
        name: 'Administrator',
        email: 'admin@email.com',
        role: 'admin'
      };

      // Use saveToLocalStorage to trigger storage update events
      saveToLocalStorage('user', adminUser);
      navigate('/admin');
      return;
    }

    /* =======================
       2️⃣ DOCTOR LOGIN
    ======================== */
    if (role === 'doctor') {
      // Find the user who is a doctor AND has matching email AND password
      const doctor = users.find(u => u.role === 'doctor' && u.email === email && u.password === password);

      if (doctor) {
        // Use saveToLocalStorage to trigger storage update events
        saveToLocalStorage('user', {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          role: 'doctor'
        });

        navigate('/doctor/dashboard');
        return;
      } else {
        alert('Invalid email or password for doctor account.');
        return;
      }
    }

    /* =======================
       3️⃣ PATIENT LOGIN
    ======================== */
    if (role === 'patient') {
      const patient = users.find(
        u => u.email === email && u.password === password && u.role === 'patient'
      );

      if (patient) {
        // Use saveToLocalStorage to trigger storage update events
        saveToLocalStorage('user', patient);
        navigate('/patient/dashboard');
        return;
      } else {
        alert('Invalid email or password for patient account.');
        return;
      }
    }

    // Fallback
    alert('Invalid login attempt');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        {/* Title */}
        <div className="flex items-center gap-2 justify-center">
          <Stethoscope size={32} className="text-blue-600" />
          <h2 className="text-3xl font-bold text-blue-600 mb-6 pt-3">
            Medico
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block font-medium mb-1">Login as</label>
            <select
              name="role"
              value={credentials.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* Register */}
        <p className="text-center text-gray-600 mt-4">
          New User?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;