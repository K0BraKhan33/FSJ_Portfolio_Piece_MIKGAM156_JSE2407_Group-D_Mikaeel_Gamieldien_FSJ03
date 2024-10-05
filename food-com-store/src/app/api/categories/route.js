import { db } from '../../lib/firebase.js'; // Adjust the path to your firebase.js
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions

export async function GET(req) {
    try {
        // Reference to the 'categories' collection in Firestore
        const categoriesRef = collection(db, 'categories');
        console.log(categoriesRef);
        
        // Get all documents in the 'categories' collection
        const snapshot = await getDocs(categoriesRef);
    
        // Extract the data from each document
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
        // Return the categories as a JSON response
        return new Response(JSON.stringify(categories), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
