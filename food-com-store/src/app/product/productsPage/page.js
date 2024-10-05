// app/product/productsPage/page.js
"use client"; // Mark this component as a Client Component

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head'; // Import Head for SEO meta tags
import ProductFilters from '../components/ProductFilters';
import ProductList from '../components/ProductList';
import Pagination from '../components/Pagination';
import { fetchProducts, fetchCategories, buildQueryString } from './sourceCode';
/**
 * ProductsPage component that displays a list of products with filtering, sorting, and pagination.
 * 
 * @param {Object} props - The props object.
 * @param {Object} props.searchParams - The search parameters from the URL.
 * @returns {JSX.Element} The rendered ProductsPage component.
 */

export default function ProductsPage({ searchParams }) {
  // State variables
  const [products, setProducts] = useState([]);
  const [allSearchResults, setAllSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || '');
  const [searchInput, setSearchInput] = useState(searchParams.search || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '');
  const [sortOrder, setSortOrder] = useState(searchParams.sortBy || '');
  const [sortDirection, setSortDirection] = useState(searchParams.order || '');
  const [page, setPage] = useState(searchParams.page ? parseInt(searchParams.page, 10) : 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageIndex, setImageIndex] = useState({});
  const limit = 20;
  const router = useRouter();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Fetch products based on search, category, and filters
  useEffect(() => {
    fetchProducts({
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
    });
  }, [selectedCategory, searchTerm, sortOrder, sortDirection, page]);

  // Sync searchParams on component mount
  useEffect(() => {
    setSelectedCategory(searchParams.category || '');
    setSearchInput(searchParams.search || '');
    setSearchTerm(searchParams.search || '');
    setSortOrder(searchParams.sortBy || '');
    setSortDirection(searchParams.order || '');
    setPage(searchParams.page ? parseInt(searchParams.page, 10) : 1);
  }, [searchParams]);


   /**
   * Handles the search operation by updating the search term and fetching products.
   */
  const handleSearch = () => {
    setSearchTerm(searchInput);
    const queryString = buildQueryString({
      category: selectedCategory,
      search: searchInput,
      sortBy: sortOrder,
      order: sortDirection,
      page: 1,
    });
    router.push(`/product/productsPage?${queryString}`);
    fetchProducts({
      selectedCategory,
      searchTerm: searchInput,
      sortOrder,
      sortDirection,
      page: 1,
      limit,
      setLoading,
      setError,
      setProducts,
      setAllSearchResults,
    });
    setPage(1);
  };


    /**
   * Handles the change of selected category and fetches products based on it.
   * @param {string} category - The selected category.
   */
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const queryString = buildQueryString({
      category,
      search: searchTerm,
      sortBy: sortOrder,
      order: sortDirection,
      page: 1,
    });
    router.push(`/product/productsPage?${queryString}`);
    fetchProducts({
      selectedCategory: category,
      searchTerm,
      sortOrder,
      sortDirection,
      page: 1,
      limit,
      setLoading,
      setError,
      setProducts,
      setAllSearchResults,
    });
    setPage(1);
  };

/**
   * Resets the filters applied to the product list.
   */
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortOrder('');
    setSortDirection('');

    const queryString = buildQueryString({
      page,
    });

    router.push(`/product/productsPage?${queryString}`);
    fetchProducts({
      selectedCategory: '',
      searchTerm: '',
      sortOrder: '',
      sortDirection: '',
      page,
      limit,
      setLoading,
      setError,
      setProducts,
      setAllSearchResults,
    });
  };


    /**
   * Handles changes in the sorting options and fetches products accordingly.
   * @param {Event} e - The change event.
   */
  const handleSortChange = (e) => {
    const [sortBy, order] = e.target.value.split(':');
    setSortOrder(sortBy);
    setSortDirection(order === 'asc' ? 'asc' : 'desc');
    const queryString = buildQueryString({
      category: selectedCategory,
      search: searchTerm,
      sortBy,
      order,
      page: 1,
    });
    router.push(`/product/productsPage?${queryString}`);
    fetchProducts({
      selectedCategory,
      searchTerm,
      sortOrder: sortBy,
      sortDirection: order,
      page: 1,
      limit,
      setLoading,
      setError,
      setProducts,
      setAllSearchResults,
    });
    setPage(1);
  };


    /**
   * Handles page change for pagination.
   * @param {number} newPage - The new page number.
   */
  const handlePageChange = (newPage) => {
    setPage(newPage);
    const queryString = buildQueryString({
      category: selectedCategory,
      search: searchTerm,
      sortBy: sortOrder,
      order: sortDirection,
      page: newPage,
    });
    router.push(`/product/productsPage?${queryString}`);
    fetchProducts({
      selectedCategory,
      searchTerm,
      sortOrder,
      sortDirection,
      page: newPage,
      limit,
      setLoading,
      setError,
      setProducts,
      setAllSearchResults,
    });
  };


  /**
   * Handles the key down event to trigger search on Enter key.
   * @param {Event} e - The key down event.
   */

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

    /**
   * Changes the displayed image in the product image carousel.
   * @param {string} productId - The ID of the product.
   * @param {string} direction - The direction to change the image ('next' or 'prev').
   */

  const handleImageChange = (productId, direction) => {
    setImageIndex((prevIndex) => {
      const currentIndex = prevIndex[productId] || 0;
      const imageCount = products.find(product => product.id === productId).images.length;
  
      let newIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % imageCount; // Loop back to the first image
      } else if (direction === 'prev') {
        newIndex = (currentIndex - 1 + imageCount) % imageCount; // Loop back to the last image if going before the first
      }
  
      return { ...prevIndex, [productId]: newIndex };
    });
  };
  
  /**
   * Navigates back to the previous page.
   */
  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        {error}
        <div className="mt-4">
          <button onClick={handleGoBack} className="ml-2 px-4 py-2 bg-gray-500 text-white rounded">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Products - Explore our collection</title>
        <meta name="description" content="Browse our extensive collection of products. Use filters to find exactly what you need." />
        <meta name="keywords" content="products, categories, shopping, filters, sorting" />
        <meta name="author" content="Mikaeel Gamieldien mocK Food commerce store" />
        <meta property="og:title" content="Products - Explore our collection" />
        <meta property="og:description" content="Browse our extensive collection of products with advanced filters." />
        <meta property="og:image" content="/path-to-image.jpg" />
        <meta property="og:url" content="https://yourdomain.com/product/productsPage" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Products</h1>

        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          handleCategoryChange={handleCategoryChange}
          sortOrder={sortOrder}
          sortDirection={sortDirection}
          handleSortChange={handleSortChange}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleSearch={handleSearch}
          handleKeyDown={handleKeyDown}
          resetFilters={resetFilters}
        />

        <ProductList
          products={products}
          imageIndex={imageIndex}
          handleImageChange={handleImageChange}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          sortOrder={sortOrder}
          sortDirection={sortDirection}
          page={page}
          buildQueryString={buildQueryString}
        />

        <Pagination
          page={page}
          handlePageChange={handlePageChange}
          productsLength={products.length}
          limit={limit}
        />
      </div>
    </>
  );
}
