// api/products/[id]/route.js

import { db } from '../../../firebase.js'; // Adjust the path to your firebase.js
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

/**
 * @desc API route to fetch a single product by ID
 * @param {Object} req - The request object
 * @param {Object} context - Context containing the route parameters (including 'id')
 */
export async function GET(req, { params }) {
    try {
        // Extract the id from the route params
        const { id } = params;

        // Reference to the specific document in the 'products' collection
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);

        // Check if the product exists
        if (productSnap.exists()) {
            // If the document exists, return the product data
            const product = { id: productSnap.id, ...productSnap.data() };
            return new Response(JSON.stringify(product), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } else {
            // If no product is found, return a 404 status
            return new Response(JSON.stringify({ message: 'Product not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch product' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
