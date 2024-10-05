import { db } from '@/lib/firebase'; // Adjust the import based on your Firebase setup
import { setDoc, doc, getDocs, collection, query, where } from 'firebase/firestore';
import bcrypt from 'bcrypt';

export async function POST(request) {
  const { firstName, lastName, username, email, password } = await request.json();

  // Check if the email already exists
  const emailQuery = query(collection(db, 'users'), where('email', '==', email));
  const emailSnapshot = await getDocs(emailQuery);
  if (!emailSnapshot.empty) {
    return new Response(JSON.stringify({ error: 'Email already exists' }), { status: 409 });
  }

  // Check if the username already exists
  const userRef = doc(db, 'users', username); // Using username as the document ID
  const userSnapshot = await userRef.get();
  
  if (userSnapshot.exists()) {
    return new Response(JSON.stringify({ error: 'Username already exists' }), { status: 409 });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user document
  try {
    await setDoc(userRef, {
      firstName,
      lastName,
      email,
      password: hashedPassword, // Store the hashed password
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ message: 'User signed up successfully' }), { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: 'Failed to create user' }), { status: 500 });
  }
}