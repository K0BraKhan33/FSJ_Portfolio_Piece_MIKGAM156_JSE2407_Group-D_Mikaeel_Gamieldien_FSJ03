// Cache object to store fetched products and categories
const cache = {
  products: {},
  categories: null,
};

/**
 * Fetch products from API with caching.
 *
 * @param {Object} params - Parameters for fetching products.
 * @param {string} params.selectedCategory - The category to filter products by.
 * @param {string} params.searchTerm - The search term to filter products by.
 * @param {string} params.sortOrder - The field to sort the products by.
 * @param {string} params.sortDirection - The direction of the sort (asc/desc).
 * @param {number} params.page - The current page for pagination.
 * @param {number} params.limit - The number of products per page.
 * @param {Function} setLoading - Function to set loading state.
 * @param {Function} setError - Function to set error state.
 * @param {Function} setProducts - Function to set fetched products.
 * @param {Function} setAllSearchResults - Function to set all search results.
 */
export async function fetchProducts({
  selectedCategory,
  searchTerm,
  sortOrder,
  sortDirection,
  page,
  limit,
  setLoading,
  setError,
  setProducts,
  setAllSearchResults,
}) {
  setLoading(true);
  setError(null);
  try {
    const cacheKey = JSON.stringify({
      selectedCategory,
      searchTerm,
      sortOrder,
      sortDirection,
      page,
      limit,
    });

    // Return cached products if available
    if (cache.products[cacheKey]) {
      setProducts(cache.products[cacheKey]);
      setLoading(false);
      return;
    }

    let apiUrl = '/api/products?'; // Changed to your API endpoint
    const params = new URLSearchParams();

    // Add search term and fetch a large set for searching
    if (searchTerm) {
      params.append('search', searchTerm);
      params.append('limit', '3000'); // Fetch all matching results for search
    } else {
      // For normal pagination
      params.append('limit', limit);
      params.append('page', page); // Use page number instead of skip
    }

    // Filter by category
    if (selectedCategory) {
      params.append('category', selectedCategory);
    }

    // Sorting
    if (sortOrder) {
      params.append('sortBy', sortOrder);
      if (sortDirection) {
        params.append('order', sortDirection);
      }
    }

    // Construct full API URL
    apiUrl += params.toString();

    // Fetch products from API
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await res.json();

    // Handle sorting for search results
    if (searchTerm) {
      const sortedData = data.products.sort((a, b) => {
        if (sortOrder === 'price') {
          return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
        }
        if (sortOrder === 'rating') {
          return sortDirection === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        }
        return 0;
      });

      const start = (page - 1) * limit;
      const end = start + limit;
      setProducts(sortedData.slice(start, end));
      setAllSearchResults(sortedData);
      // Cache the fetched products
      cache.products[cacheKey] = sortedData.slice(start, end);
    } else {
      // For normal product list
      setProducts(data.products);
      setAllSearchResults([]);
      // Cache the fetched products
      cache.products[cacheKey] = data.products;
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

/**
 * Fetch categories from API with caching.
 *
 * @returns {Promise<Array>} The fetched categories.
 */
export async function fetchCategories() {
  // Return cached categories if available
  if (cache.categories) {
    return cache.categories;
  }

  try {
    const res = await fetch('/api/categories');
    if (!res.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await res.json();
    console.log('Categories Data:', data); // Log to see the fetched data

    // Ensure data is an array
    if (!Array.isArray(data) || !data[0]?.categories) {
      throw new Error('Invalid categories data format');
    }

    // Store fetched categories in cache
    cache.categories = data[0].categories;

    return data[0].categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Helper function to build a query string for URL based on filters.
 *
 * @param {Object} params - The query parameters.
 * @param {string} [params.category] - The selected category.
 * @param {string} [params.search] - The search term.
 * @param {string} [params.sortBy] - The field to sort by.
 * @param {string} [params.order] - The sort direction (asc/desc).
 * @param {number} [params.page] - The current page for pagination.
 * @returns {string} The built query string.
 */
export function buildQueryString({ category, search, sortBy, order, page }) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);
  if (order) params.append('order', order);
  if (page) params.append('page', page);
  return params.toString();
}
