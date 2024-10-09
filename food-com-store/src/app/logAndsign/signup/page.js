'use client'; // Ensure this is a client component
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.js'; // Adjust the import based on your file structure
import { useRouter } from 'next/navigation'; // Use useRouter from next/navigation

const SignUpPage = () => {
  // State variables to manage form inputs and feedback messages
  const [firstName, setFirstName] = useState(''); // First name input
  const [lastName, setLastName] = useState(''); // Last name input
  const [username, setUsername] = useState(''); // Username input
  const [email, setEmail] = useState(''); // Email input
  const [password, setPassword] = useState(''); // Password input
  const [error, setError] = useState(null); // Error message state
  const [success, setSuccess] = useState(null); // Success message state
  const router = useRouter(); // Initialize useRouter for navigation

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const auth = getAuth(); // Get Firebase authentication instance

    try {
      // Create user with email and password using Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get the newly created user

      // Prepare additional user data to save in Firestore
      const userData = {
        uid: user.uid,
        firstName,
        lastName,
        username,
        email,
      };

      // Save user data to Firestore under 'users' collection
      await setDoc(doc(db, 'users', user.uid), userData);

      setSuccess('User registered successfully'); // Set success message
      setError(null); // Clear any existing error message
      
      // Clear form fields after successful registration
      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setPassword('');

      // Redirect to the login page after successful signup
      router.push('/logAndsign/login');
    } catch (error) {
      console.error('Error signing up:', error); // Log any signup errors
      setError(error.message); // Set error message to display
      setSuccess(null); // Clear any existing success message
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
              onChange={(e) => setFirstName(e.target.value)} // Update first name on input change
              className="w-full p-2 rounded bg-gray-700 text-warm-white"
              required // Mark this field as required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lastName" className="block text-lg">Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)} // Update last name on input change
              className="w-full p-2 rounded bg-gray-700 text-warm-white"
              required // Mark this field as required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block text-lg">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Update username on input change
              className="w-full p-2 rounded bg-gray-700 text-warm-white"
              required // Mark this field as required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-lg">Email (Gmail):</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email on input change
              className="w-full p-2 rounded bg-gray-700 text-warm-white"
              required // Mark this field as required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-lg">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update password on input change
              className="w-full p-2 rounded bg-gray-700 text-warm-white"
              required // Mark this field as required
            />
          </div>
          <button
            type="submit" // Submit button for the form
            className="bg-green-500 hover:bg-green-600 text-white text-warm-white px-4 py-2 rounded hover:bg-teal-700 w-full"
          >
            Sign Up
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>} {/* Display error message if any */}
        {success && <p className="text-green-500 mt-4">{success}</p>} {/* Display success message if any */}
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
