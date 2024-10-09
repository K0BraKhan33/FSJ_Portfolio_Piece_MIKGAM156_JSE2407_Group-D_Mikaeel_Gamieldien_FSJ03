'use client'; // Ensure this is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use correct import based on Next.js version
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthComponent = () => {
  const [user, setUser] = useState(null); // State to store the current user
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(''); // State to store error messages
  const router = useRouter(); // Correctly placed within a client component

  useEffect(() => {
    // Set up authentication state observer
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // User is signed in
        router.push('/product/productsPage'); // Redirect to products page on login
      } else {
        setUser(null); // No user is signed in
      }
      setLoading(false); // End loading state once user is determined
    });

    return () => unsubscribe(); // Cleanup function to unsubscribe on component unmount
  }, [router]); // Dependency on router

  const handleLogin = async (email, password) => {
    try {
      setLoading(true); // Start loading state during login
      await signInWithEmailAndPassword(auth, email, password); // Attempt to sign in
    } catch (error) {
      console.error('Login error:', error); // Log any errors
      setError(error.message); // Set error message to display
    } finally {
      setLoading(false); // End loading state after login attempt
    }
  };

  const handleLogout = async () => {
    await signOut(auth); // Sign the user out
  };

  // Display loading state if loading
  if (loading) {
    return <p className="text-center">Loading...</p>; // Optional loading UI
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-4 bg-navy rounded-lg shadow-md">
        {user ? ( // If user is logged in
          <>
            <h2 className="text-2xl font-bold text-center">Welcome!</h2>
            <p className="text-center">You are logged in as {user.email}.</p>
            <button
              onClick={handleLogout} // Call handleLogout on button click
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition duration-200"
            >
              Logout
            </button>
          </>
        ) : ( // If user is not logged in
          <div>
            <h2 className="text-2xl font-bold text-center">Login</h2>
            {error && <p className="text-red-500 text-center">{error}</p>} {/* Display error message if any */}
            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevent default form submission
                const email = e.target.email.value; // Get email from form
                const password = e.target.password.value; // Get password from form
                handleLogin(email, password); // Call handleLogin with email and password
              }}
              className="space-y-4"
            >
              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required // Make this field required
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required // Make this field required
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit" // Submit button for the form
                className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition duration-200"
              >
                Login
              </button>
            </form>
            <button
              onClick={() => router.push('/logAndsign/signup')} // Route to the signup page on click
              className="mt-4 w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition duration-200"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthComponent;
