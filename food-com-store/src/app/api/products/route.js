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

        // Apply category filter
        if (category) {
            productsQuery = query(productsQuery, where('category', '==', category));
        }

        // Apply sorting
        if (sortBy && ['price', 'rating'].includes(sortBy)) {
            productsQuery = query(productsQuery, orderBy(sortBy, order === 'desc' ? 'desc' : 'asc'));
        }

        // Apply case-insensitive fuzzy search for title
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            const allDocsSnapshot = await getDocs(productsQuery); // use productsQuery to keep other filters
            let products = allDocsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).filter(product => product.title.toLowerCase().includes(lowerCaseQuery));

            // Pagination (if needed)
            const startIndex = (page - 1) * limitNum;
            products = products.slice(startIndex, startIndex + limitNum); // Paginate the filtered products

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
        }

        // Pagination
        const startIndex = (page - 1) * limitNum;
        let paginationQuery = query(productsQuery, limit(limitNum));

        if (page > 1) {
            const previousSnapshot = await getDocs(query(productsRef, limit(startIndex)));
            const lastVisible = previousSnapshot.docs[previousSnapshot.docs.length - 1];

            if (lastVisible) {
                paginationQuery = query(paginationQuery, startAfter(lastVisible), limit(limitNum));
            }
        }

        // Execute the query
        const snapshot = await getDocs(paginationQuery);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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
        return new Response(JSON.stringify({ error: 'Failed to fetch products', details: error.message || error }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
