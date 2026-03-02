import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope } from "lucide-react";

const Register = () => {
  // State for form inputs
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const { name, email, password, role } = formData;

    // Get existing users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if user already exists
    if (users.find(user => user.email === email)) {
      alert('User with this email already exists!');
      return;
    }

    // Create new user object
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password, // In a real app, you MUST hash the password
      role,
    };

    // Add new user to the array and save back to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // --- KEY CHANGE: Log the user in immediately ---
    // Create a session object for the current user
    const currentUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
    localStorage.setItem('user', JSON.stringify(currentUser));

    // --- KEY CHANGE: Redirect to the correct dashboard ---
    let redirectPath = '/'; // Default fallback
    if (role === 'doctor') {
      redirectPath = '/doctor/dashboard';
    } else if (role === 'patient') {
      redirectPath = '/patient/dashboard';
    }
    
    alert(`Registration successful! Welcome, ${name}.`);
    navigate(redirectPath); // Redirect to the correct dashboard
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        {/* Title */}
        <div className="flex items-center gap-2 justify-center">
          <Stethoscope size={32} className="text-blue-600" />
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-6 pt-3">
            Medico
          </h2>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* User Type Dropdown */}
          <div>
            <label className="block font-medium mb-1">Register as</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;