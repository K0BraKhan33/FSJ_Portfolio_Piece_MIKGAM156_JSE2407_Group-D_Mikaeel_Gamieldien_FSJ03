// api/logPage/login/route.js
import { db } from '../../../lib/firebase'; // Adjust the path as necessary
import { collection, doc, getDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Handle POST request
export async function POST(req) {
  const { username, password } = await req.json(); // Parse the request body

  try {
    // Get user document from Firestore
    const userDocRef = doc(collection(db, 'users'), username);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // If the user doesn't exist, return an error
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    // Log the user data to check if it's being retrieved correctly
    console.log('Retrieved user data:', userData);
    console.log('Retrieved user passward:', userData.password);

    // Compare the entered password with the stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      // Log the hashed password to debug the issue
      console.log('Stored hashed password:', userData.password);
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // If everything is fine, return success and user data (without the password)
    const { password: _, ...userWithoutPassword } = userData;
    return NextResponse.json({ message: 'Login successful', user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json({ error: 'Error logging in user' }, { status: 500 });
  }
}
