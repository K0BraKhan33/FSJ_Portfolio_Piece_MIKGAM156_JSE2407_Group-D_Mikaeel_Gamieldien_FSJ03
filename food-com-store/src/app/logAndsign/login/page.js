'use client'; // Ensure this is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use correct import based on Next.js version
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthComponent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter(); // Correctly placed within a client component

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // User is signed in
        router.push('/product/productsPage'); // Redirect on login
      } else {
        setUser(null); // No user is signed in
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, [router]); // Dependency on router

  const handleLogin = async (email, password) => {
    try {
      setLoading(true); // Start loading state
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message); // Set error message
    } finally {
      setLoading(false); // End loading state
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <p className="text-center">Loading...</p>; // Optional loading UI
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        {user ? (
          <>
            <h2 className="text-2xl font-bold text-center">Welcome!</h2>
            <p className="text-center">You are logged in as {user.email}.</p>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-center">Login</h2>
            {error && <p className="text-red-500 text-center">{error}</p>} {/* Display error message */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const password = e.target.password.value;
                handleLogin(email, password);
              }}
              className="space-y-4"
            >
              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition duration-200"
              >
                Login
              </button>
            </form>
            <button
              onClick={() => router.push('/logAndsign/signup')} // Route to the signup page
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
