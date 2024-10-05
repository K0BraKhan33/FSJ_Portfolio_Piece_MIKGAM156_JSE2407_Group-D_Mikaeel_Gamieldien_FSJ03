'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

/**
 * ProductDetailsPage component to display detailed information about a specific product.
 * It includes functionalities for image navigation, sorting reviews, and resetting filters.
 * 
 * @param {Object} props - Component props.
 * @param {Object} props.params - Parameters containing the product ID.
 */
export default function ProductDetailsPage({ params }) {
  const { id } = params;
  const searchParams = useSearchParams();
  const router = useRouter();
  const prePage = searchParams.get('page') || '1'; // Default page number
  const [product, setProduct] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageContainerRef = useRef(null);
  const autoScrollTimeout = useRef(null);
  const [sortedReviews, setSortedReviews] = useState([]);
  const [sortBy, setSortBy] = useState(''); // Default to 'Choose Sort'
  const [loading, setLoading] = useState(true); // Loading state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // State for review modal
  const [newReviewRating, setNewReviewRating] = useState(0); // State for new review rating
  const [newReviewComment, setNewReviewComment] = useState(''); // State for new review comment

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true); // Set loading to true when fetching starts
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product data');
        const data = await res.json();
        setProduct(data);
        setSortedReviews(data.reviews || []); // Initialize sorted reviews
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Set loading to false when fetching is done
      }
    }
    fetchProduct();
  }, [id]);

  const handleImageLoad = () => {
    setImagesLoaded(true);
  };

  const handleBackClick = () => {
    const queryParams = {
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || '',
      order: searchParams.get('order') || '',
      page: prePage
    };
    const queryString = new URLSearchParams(queryParams).toString();
    router.push(`/product/productsPage?${queryString}`);
  };

  const resetFilters = () => {
    setSortBy(''); // Reset the sort dropdown to default (Choose Sort)
    setSortedReviews(product?.reviews || []); // Reset reviews to default order (unsorted)
  };

  const resetAutoScroll = () => {
    setUserInteracted(true);
    if (autoScrollTimeout.current) clearTimeout(autoScrollTimeout.current);
    autoScrollTimeout.current = setTimeout(() => {
      setUserInteracted(false);
    }, 3000);
  };

  useEffect(() => {
    if (!userInteracted && product?.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [userInteracted, product]);

  useEffect(() => {
    if (product?.images?.length > 1 && imageContainerRef.current) {
      imageContainerRef.current.scrollLeft = currentImageIndex * imageContainerRef.current.offsetWidth;
    }
  }, [currentImageIndex, product]);

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    resetAutoScroll();
  };

  const sortReviews = (criteria) => {
    setSortBy(criteria);
    const sorted = [...(product?.reviews || [])];
    if (criteria === 'date') {
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (criteria === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    }
    setSortedReviews(sorted);
  };

  const toggleReviewModal = () => {
    setIsReviewModalOpen(!isReviewModalOpen);
  };

  const handleConfirmReview = () => {
    if (newReviewRating < 1 || newReviewRating > 5) return; // Ensure rating is between 1 and 5
    const newReview = {
      reviewerName: 'Anonymous', // Placeholder for reviewer name
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toISOString()
    };
    setSortedReviews((prevReviews) => [newReview, ...prevReviews]); // Add new review to the top
    toggleReviewModal(); // Close the modal
    setNewReviewRating(0); // Reset rating
    setNewReviewComment(''); // Reset comment
  };

  if (loading) {
    return <div className="text-center text-warm-white">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center text-red-500">Failed to load product details. Please try again later.</div>;
  }

  const {
    title,
    description,
    price,
    rating,
    stock,
    category,
    tags,
    brand,
    images,
  } = product;

  return (
    <div className="container mx-auto p-4 bg-[#224724] text-warm-white relative">
      <button onClick={handleBackClick} className="bg-teal-600 text-warm-white px-4 py-2 rounded mb-4 hover:bg-teal-700">
        Back to Products
      </button>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="gallery relative flex flex-col">
          {!imagesLoaded && (
            <div className="text-center text-teal-400">ProductID {id} found, please wait...</div>
          )}
          <div
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4"
            ref={imageContainerRef}
            onScroll={resetAutoScroll}
            onTouchStart={resetAutoScroll}
            onMouseDown={resetAutoScroll}
            style={{ width: '100%', height: '80vh' }}
          >
            {images?.map((img, idx) => (
              <div key={idx} className="flex-shrink-0 w-full h-full relative snap-center">
                <Image
                  src={img}
                  alt={title}
                  width={3000}
                  height={3000}
                  className="w-full h-full object-cover rounded"
                  onLoad={handleImageLoad}
                  style={{
                    display: imagesLoaded ? 'block' : 'none',
                    maxHeight: '100%',
                  }}
                />
              </div>
            ))}
          </div>

          <div className="thumbnails flex space-x-2 mt-4 justify-center">
            {images?.map((img, idx) => (
              <Image
                key={idx}
                src={img}
                width={3000}
                height={3000}
                alt={`${title} thumbnail ${idx + 1}`}
                className={`w-16 h-16 object-cover cursor-pointer rounded border-2 ${currentImageIndex === idx ? 'border-teal-600' : 'border-transparent'}`}
                onClick={() => handleThumbnailClick(idx)}
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-1 mt-4 md:mt-0">
          <p className="text-lg font-semibold">Brand: {brand}</p>
          <p className="text-lg font-semibold">Category: {category}</p>
          <p className="text-lg font-semibold">Price: <span className="text-teal-500">${price}</span></p>
          <p className="text-lg font-semibold">Rating: <span className="text-teal-500">{rating} / 5</span></p>
          <p className="text-lg font-semibold">Stock: {stock} units available</p>
          <p className="text-lg mt-4">{description}</p>
          <p className="text-lg font-semibold mt-4">Tags: {tags?.join(', ')}</p>

          {/* Dropdown for sorting reviews */}
          <div className="flex justify-between mb-4">
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => sortReviews(e.target.value)}
                className="bg-gray-800 text-warm-white p-2 rounded"
              >
                <option value="">Choose Sort</option>
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
              </select>
              <button onClick={resetFilters} className="bg-teal-600 text-warm-white px-4 py-2 rounded hover:bg-teal-700">
                Reset
              </button>
            </div>

            <button onClick={toggleReviewModal} className="bg-teal-600 text-warm-white px-4 py-2 rounded hover:bg-teal-700">
              Add Review
            </button>
          </div>

          <div className="reviews mt-4">
            {sortedReviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              sortedReviews.map((review, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded mb-2">
                  <p className="font-semibold">{review.reviewerName} - {new Date(review.date).toLocaleDateString()}</p>
                  <p className="text-teal-500">Rating: {review.rating} / 5</p>
                  <p>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#224724] p-4 rounded shadow-lg max-w-md w-full relative" style={{ height: '90vh' }}>
            <h2 className="text-2xl font-bold text-center mb-4">Add Your Review</h2>
            <div className="mb-4">
              <label htmlFor="rating" className="block text-lg">Rating (1-5):</label>
              <input
                type="number"
                id="rating"
                value={newReviewRating}
                onChange={(e) => setNewReviewRating(Number(e.target.value))}
                className="w-full p-2 rounded bg-gray-800 text-warm-white"
                min="1"
                max="5"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="block text-lg">Comment:</label>
              <textarea
                id="comment"
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-warm-white"
                rows="4"
              />
            </div>
            <div className="flex justify-between">
              <button onClick={toggleReviewModal} className="bg-red-600 text-warm-white px-4 py-2 rounded hover:bg-red-700">
                Cancel
              </button>
              <button onClick={handleConfirmReview} className="bg-teal-600 text-warm-white px-4 py-2 rounded hover:bg-teal-700">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
