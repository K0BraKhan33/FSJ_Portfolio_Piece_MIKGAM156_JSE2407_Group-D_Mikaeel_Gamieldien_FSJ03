'use client';
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.js'; // Adjust the import based on your file structure
import { useRouter } from 'next/navigation'; // Use useRouter from next/navigation

const SignUpPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user data to Firestore
      const userData = {
        uid: user.uid,
        firstName,
        lastName,
        username,
        email,
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      setSuccess('User registered successfully');
      setError(null);
      
      // Clear form fields
      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setPassword('');

      // Redirect to the login page after successful signup
      router.push('/logAndsign/login');
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message);
      setSuccess(null);
    }
  };

  return (
    <div className="min-h-screen text-teal flex items-center justify-center text-warm-white">
      <div className="bg-navy p-8 rounded shadow-lg w-full max-w-md">
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
            className="bg-green-500 hover:bg-green-600 text-white text-warm-white px-4 py-2 rounded hover:bg-teal-700 w-full"
          >
            Sign Up
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-500 mt-4">{success}</p>}
        <button
          onClick={() => router.push('/logAndsign/login')} // Route to the login page
          className="mt-4 bg-blue-600 text-white text-warm-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Already have an account? Log In
        </button>
      </div>
    </div>
  );
};

export default SignUpPage;


//bIRRFXxwzQcVa7PEos4X4NRrqOA3

//"bIRRFXxwzQcVa7PEos4X4NRrqOA3"