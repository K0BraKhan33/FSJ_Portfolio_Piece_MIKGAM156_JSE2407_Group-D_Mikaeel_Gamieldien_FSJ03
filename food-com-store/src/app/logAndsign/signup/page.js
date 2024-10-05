// app/signup/page.js
'use client'
import React, { useState } from 'react';

const SignUpPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle the sign-up logic here
    console.log({ firstName, lastName, username, email, password });
    
    // Example: Send data to your API endpoint
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, username, email, password }),
      });
      
      if (response.ok) {
        // Handle successful sign-up (e.g., redirect, show success message)
        console.log('User signed up successfully');
      } else {
        // Handle error response
        console.error('Error signing up:', response.statusText);
      }
    } catch (error) {
      console.error('Network error:', error);
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
      </div>
    </div>
  );
};

export default SignUpPage;
