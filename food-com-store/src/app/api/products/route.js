import { db } from '../../lib/firebase.js'; // Adjust the path to your firebase.js
import { collection, getDocs, query, where, limit, startAfter } from 'firebase/firestore';

export async function GET(req) {
    try {
        // Parse the query parameters from the request
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page')) || 1; // Default to page 1
        const limitNum = parseInt(url.searchParams.get('limit')) || 20; // Default to limit 20
        const category = url.searchParams.get('category') || ''; // Get category if provided
        const searchQuery = url.searchParams.get('search') || ''; // Search query parameter

        // Reference to the 'products' collection in Firestore
        const productsRef = collection(db, 'products');

        // Base query with pagination
        let productsQuery = query(productsRef, limit(limitNum));

        // Apply search logic if a search query is provided
        if (searchQuery) {
            // Perform partial match using the `where` clause
            // Firestore doesn't have a direct "contains" feature, but we can use this for basic matching
            productsQuery = query(
                productsRef,
                where('name', '>=', searchQuery), // Matches terms greater than or equal to the searchQuery
                where('name', '<=', searchQuery + '\uf8ff'), // Matches terms less than searchQuery + a high Unicode character
                limit(limitNum)
            );
        }

        // Apply category filter if a category is provided
        if (category) {
            productsQuery = query(
                productsQuery,
                where('category', '==', category), // Add the category filter
                limit(limitNum)
            );
        }

        // Handle pagination
        if (page > 1) {
            const previousQuery = query(productsRef, limit((page - 1) * limitNum));
            const previousSnapshot = await getDocs(previousQuery);
            const lastVisible = previousSnapshot.docs[previousSnapshot.docs.length - 1];

            // Continue query after the last visible document from the previous page
            productsQuery = query(productsQuery, startAfter(lastVisible), limit(limitNum));
        }

        // Execute the query
        const snapshot = await getDocs(productsQuery);

        // Extract the data from each document
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Return the products along with pagination information
        return new Response(JSON.stringify({
            products,
            currentPage: page,
            totalItems: products.length, // Set total items for the response
            totalPages: Math.ceil(products.length / limitNum), // Calculate total pages based on product count
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
