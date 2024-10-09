import { db } from '../../lib/firebase.js'; // Import the Firestore database instance
import { collection, getDocs, query, where, limit, startAfter, orderBy } from 'firebase/firestore';

/**
 * @desc API route to fetch products with optional filtering, sorting, and pagination
 * @param {Object} req - The request object containing query parameters for filtering
 * @returns {Response} - A response containing the list of products and pagination information
 */
export async function GET(req) {
    try {
        const url = new URL(req.url); // Create a URL object from the request URL
        const page = parseInt(url.searchParams.get('page')) || 1; // Get the current page number
        const limitNum = parseInt(url.searchParams.get('limit')) || 20; // Get the limit of products per page
        const category = url.searchParams.get('category') || ''; // Get the category filter
        const searchQuery = url.searchParams.get('search') || ''; // Get the search query
        const sortBy = url.searchParams.get('sortBy') || ''; // Get the sort field
        const order = url.searchParams.get('order') || 'asc'; // Get the sorting order (ascending or descending)

        const productsRef = collection(db, 'products'); // Reference to the 'products' collection
        let productsQuery = query(productsRef); // Initialize the query with the products reference

        // Apply category filter
        if (category) {
            productsQuery = query(productsQuery, where('category', '==', category)); // Filter by category
        }

        // Apply sorting
        if (sortBy && ['price', 'rating'].includes(sortBy)) {
            productsQuery = query(productsQuery, orderBy(sortBy, order === 'desc' ? 'desc' : 'asc')); // Sort products
        }

        // Apply case-insensitive fuzzy search for title
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase(); // Convert search query to lowercase
            const allDocsSnapshot = await getDocs(productsQuery); // Fetch all documents to filter later
            let products = allDocsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).filter(product => product.title.toLowerCase().includes(lowerCaseQuery)); // Filter products by title

            // Pagination (if needed)
            const startIndex = (page - 1) * limitNum; // Calculate start index for pagination
            products = products.slice(startIndex, startIndex + limitNum); // Paginate the filtered products

            return new Response(JSON.stringify({
                products,
                currentPage: page, // Current page number
                totalItems: products.length, // Total number of items in the filtered list
                totalPages: Math.ceil(products.length / limitNum), // Total number of pages
            }), {
                status: 200, // OK
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Pagination
        const startIndex = (page - 1) * limitNum; // Calculate start index for pagination
        let paginationQuery = query(productsQuery, limit(limitNum)); // Limit the number of products

        if (page > 1) {
            const previousSnapshot = await getDocs(query(productsRef, limit(startIndex))); // Fetch previous documents
            const lastVisible = previousSnapshot.docs[previousSnapshot.docs.length - 1]; // Get the last document for pagination

            if (lastVisible) {
                paginationQuery = query(paginationQuery, startAfter(lastVisible), limit(limitNum)); // Start after the last visible document
            }
        }

        // Execute the query
        const snapshot = await getDocs(paginationQuery); // Fetch the paginated products
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Map documents to product objects

        return new Response(JSON.stringify({
            products,
            currentPage: page, // Current page number
            totalItems: products.length, // Total number of items fetched
            totalPages: Math.ceil(products.length / limitNum), // Total number of pages
        }), {
            status: 200, // OK
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch products', details: error.message || error }), {
            status: 500, // Internal Server Error
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
