import { db } from '../../../../lib/firebase.js'; // Adjust the path to your firebase.js
import { doc, updateDoc, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * @desc API route to add a review to a product by ID
 * @param {Object} req - The request object containing the review data
 * @param {Object} context - Context containing the route parameters (including 'id')
 * @returns {Response} - A response indicating the outcome of the operation
 */
export async function POST(req, { params }) {
    try {
        const { id } = params; // Get the product ID from parameters
        const { reviewerName, rating, comment } = await req.json(); // Parse request body for review details

        // Check if the required fields are provided
        if (!reviewerName || !rating || !comment) {
            return new Response(JSON.stringify({ message: 'All fields are required' }), {
                status: 400, // Bad Request
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Reference to the specific document in the 'products' collection
        const productRef = doc(db, 'products', id);

        // Update the document by adding the new review to the 'reviews' array
        await updateDoc(productRef, {
            reviews: arrayUnion({
                reviewerName,
                rating: Number(rating), // Ensure rating is a number
                comment,
                date: new Date().toISOString(), // Add current date as ISO string
                uid: 'user_uid' // Placeholder for user ID, modify as necessary
            }),
        });

        // Optionally, fetch the updated product data to return it (if needed)
        const productSnap = await getDoc(productRef);
        const updatedProduct = { id: productSnap.id, ...productSnap.data() };

        return new Response(JSON.stringify(updatedProduct), {
            status: 201, // Created
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error adding review:', error); // Log the error for debugging
        return new Response(JSON.stringify({ error: 'Failed to add review' }), {
            status: 500, // Internal Server Error
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

/**
 * @desc API route to update a review of a product by ID
 * @param {Object} req - The request object containing the updated review data
 * @param {Object} context - Context containing the route parameters (including 'id' and 'reviewId')
 * @returns {Response} - A response indicating the outcome of the operation
 */
export async function PUT(req, { params }) {
    try {
        const { id, reviewId } = params; // Assuming you send reviewId in the URL
        const { rating, comment } = await req.json(); // Parse request body for updated review details

        // Check if the required fields are provided
        if (!rating || !comment) {
            return new Response(JSON.stringify({ message: 'Rating and comment are required' }), {
                status: 400, // Bad Request
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const productRef = doc(db, 'products', id); // Reference to the product document
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
            return new Response(JSON.stringify({ message: 'Product not found' }), {
                status: 404, // Not Found
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const productData = productSnap.data(); // Get the product data
        const reviews = productData.reviews || []; // Get the reviews array

        // Find the index of the review to update
        const reviewIndex = reviews.findIndex(review => review.id === reviewId);

        if (reviewIndex === -1) {
            return new Response(JSON.stringify({ message: 'Review not found' }), {
                status: 404, // Not Found
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Update the review in the array
        reviews[reviewIndex] = {
            ...reviews[reviewIndex],
            rating: Number(rating), // Ensure rating is a number
            comment,
            date: new Date().toISOString(), // Update date to current date
        };

        // Update the product document with the modified reviews array
        await updateDoc(productRef, {
            reviews: reviews, // Save the updated reviews array
        });

        return new Response(JSON.stringify({ message: 'Review updated successfully' }), {
            status: 200, // OK
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error updating review:', error); // Log the error for debugging
        return new Response(JSON.stringify({ error: 'Failed to update review' }), {
            status: 500, // Internal Server Error
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

/**
 * @desc API route to delete a review by the authenticated user
 * @param {Object} req - The request object containing the review ID to delete
 * @param {Object} res - The response object for sending the response
 * @returns {Response} - A response indicating the outcome of the deletion operation
 */
export default async function handler(req, res) {
    const { id } = req.query; // Get the product ID from query parameters
  
    if (req.method === 'DELETE') {
        const token = req.headers.authorization?.split(' ')[1]; // Get the token from the header
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized. User must be logged in to delete reviews.' });
        }
  
        try {
            const decodedToken = await getAuth().verifyIdToken(token); // Verify the user's token
            const uid = decodedToken.uid; // Get the user ID from the decoded token
  
            // Extract reviewId from request body
            const { reviewId } = req.body; // Parse request body for review ID
  
            // Logic to delete the review
            const reviewRef = doc(db, 'products', id, 'reviews', reviewId); // Reference to the specific review document
            await deleteDoc(reviewRef); // Delete the review document
  
            return res.status(200).json({ message: 'Review deleted successfully.' }); // Respond with success message
        } catch (error) {
            console.error('Error verifying token:', error); // Log the error for debugging
            return res.status(401).json({ message: 'Unauthorized. Invalid token.' }); // Respond with unauthorized error
        }
    } else {
        res.setHeader('Allow', ['DELETE']); // Set allowed methods
        return res.status(405).end(`Method ${req.method} Not Allowed`); // Respond with method not allowed error
    }
}
