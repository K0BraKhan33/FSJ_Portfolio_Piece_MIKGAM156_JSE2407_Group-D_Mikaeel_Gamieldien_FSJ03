// api/logPage/signup/route.js
import { db } from '../../../lib/firebase'; // Adjust the path as necessary
import { collection, doc, setDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// Handle POST request
export async function POST(req) {
  const { firstName, lastName, username, email, password } = await req.json(); // Parse the request body

  try {
    // Use doc() to create a document with the username as the document ID
    const userDocRef = doc(collection(db, 'users'), username);

    // Set the document data
    await setDoc(userDocRef, {
      firstName,
      lastName,
      email,
      password, // It's recommended to hash passwords instead of storing plain text
    });

    console.log('User registered with ID:', userDocRef.id);

    // Respond with success
    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);

    // Respond with error
    return NextResponse.json({ error: 'Error registering user' }, { status: 500 });
  }
}
