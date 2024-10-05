// app/signup/page.js
'use client';
import React, { useState } from 'react';

const SignUpPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // State for error messages
  const [success, setSuccess] = useState(null); // State for success messages

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log({ firstName, lastName, username, email, password });

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setError(null); // Clear any existing errors
        // Optionally, redirect the user or clear the form
      } else {
        setError(data.error);
        setSuccess(null); // Clear any existing success messages
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('An unexpected error occurred. Please try again later.');
      setSuccess(null); // Clear any existing success messages
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#224724] text-warm-white">
      <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Create Your Account</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-lg">First Name:</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-warm-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lastName" className="block text-lg">Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-warm-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block text-lg">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-warm-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-lg">Email (Gmail):</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-warm-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-lg">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-warm-white"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-teal-600 text-warm-white px-4 py-2 rounded hover:bg-teal-700 w-full"
          >
            Sign Up
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>} {/* Display error message */}
        {success && <p className="text-green-500 mt-4">{success}</p>} {/* Display success message */}
      </div>
    </div>
  );
};

export default SignUpPage;
