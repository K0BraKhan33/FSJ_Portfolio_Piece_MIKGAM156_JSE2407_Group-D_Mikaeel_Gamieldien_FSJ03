import { db } from '../../../../lib/firebase.js'; // Adjust the path to your firebase.js
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

/**
 * @desc API route to add a review to a product by ID
 * @param {Object} req - The request object
 * @param {Object} context - Context containing the route parameters (including 'id')
 */
export async function POST(req, { params }) {
    try {
        const { id } = params;
        const { reviewerName, rating, comment } = await req.json();

        // Check if the required fields are provided
        if (!reviewerName || !rating || !comment) {
            return new Response(JSON.stringify({ message: 'All fields are required' }), {
                status: 400,
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
                date: new Date().toISOString(),
                uid: 'user_uid' // Add uid if necessary
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
        console.error('Error adding review:', error);
        return new Response(JSON.stringify({ error: 'Failed to add review' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

/**
 * @desc API route to update a review of a product by ID
 * @param {Object} req - The request object
 * @param {Object} context - Context containing the route parameters (including 'id' and 'reviewId')
 */
export async function PUT(req, { params }) {
    try {
        const { id, reviewId } = params; // Assuming you send reviewId in the URL
        const { rating, comment } = await req.json();

        // Check if the required fields are provided
        if (!rating || !comment) {
            return new Response(JSON.stringify({ message: 'Rating and comment are required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
            return new Response(JSON.stringify({ message: 'Product not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const productData = productSnap.data();
        const reviews = productData.reviews || [];

        // Find the index of the review to update
        const reviewIndex = reviews.findIndex(review => review.id === reviewId);

        if (reviewIndex === -1) {
            return new Response(JSON.stringify({ message: 'Review not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Update the review in the array
        reviews[reviewIndex] = {
            ...reviews[reviewIndex],
            rating: Number(rating),
            comment,
            date: new Date().toISOString(),
        };

        // Update the product document with the modified reviews array
        await updateDoc(productRef, {
            reviews: reviews,
        });

        return new Response(JSON.stringify({ message: 'Review updated successfully' }), {
            status: 200, // OK
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error updating review:', error);
        return new Response(JSON.stringify({ error: 'Failed to update review' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
