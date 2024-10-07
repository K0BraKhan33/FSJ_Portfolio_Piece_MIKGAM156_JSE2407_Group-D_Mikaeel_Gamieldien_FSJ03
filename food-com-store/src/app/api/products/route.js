import { db } from '../../lib/firebase.js';
import { collection, getDocs, query, where, limit, startAfter, orderBy } from 'firebase/firestore';

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limitNum = parseInt(url.searchParams.get('limit')) || 20;
        const category = url.searchParams.get('category') || '';
        const searchQuery = url.searchParams.get('search') || '';
        const sortBy = url.searchParams.get('sortBy') || '';
        const order = url.searchParams.get('order') || 'asc';

        const productsRef = collection(db, 'products');
        let productsQuery = query(productsRef);
        
        console.log('Base query initialized.');

        // Apply category filter
        if (category) {
            productsQuery = query(productsQuery, where('category', '==', category));
            console.log(`Category filter applied: ${category}`);
        }

        // Apply search query filter for title
        if (searchQuery) {
            productsQuery = query(
                productsQuery,
                where('title', '>=', searchQuery),
                where('title', '<=', searchQuery + '\uf8ff')
            );
            console.log(`Search query applied: ${searchQuery}`);
        }

        // Apply sorting
        if (sortBy && ['price', 'rating'].includes(sortBy)) {
            productsQuery = query(productsQuery, orderBy(sortBy, order === 'desc' ? 'desc' : 'asc'));
            console.log(`Sorting applied: ${sortBy} in ${order} order`);
        }

        // Pagination
        const startIndex = (page - 1) * limitNum;
        let paginationQuery = query(productsQuery, limit(limitNum));

        if (page > 1) {
            const previousSnapshot = await getDocs(query(productsRef, limit(startIndex)));
            const lastVisible = previousSnapshot.docs[previousSnapshot.docs.length - 1];

            if (lastVisible) {
                paginationQuery = query(paginationQuery, startAfter(lastVisible), limit(limitNum));
                console.log(`Pagination applied. Page: ${page}`);
            } else {
                console.warn('No lastVisible document found for pagination.');
            }
        }

        // Execute the query
        const snapshot = await getDocs(paginationQuery);
        console.log('Query executed successfully.');

        // Extract the data from each document
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Return the products with pagination
        return new Response(JSON.stringify({
            products,
            currentPage: page,
            totalItems: products.length,
            totalPages: Math.ceil(products.length / limitNum),
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error details:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch products', details: error.message || error }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
