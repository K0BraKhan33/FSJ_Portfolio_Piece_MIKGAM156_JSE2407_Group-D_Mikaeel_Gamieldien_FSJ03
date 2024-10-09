'use client';

import { useState, useEffect, useRef} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase.js';

export default function ProductDetailsPage({ params }) {
  const { id } = params;
  const searchParams = useSearchParams();
  const router = useRouter();
  const prePage = searchParams.get('page') || '1';
  const [product, setProduct] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [sortedReviews, setSortedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false); 
  const autoScrollTimeout = useRef(null);
  const imageContainerRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const handleImageLoad = () => {
    setImagesLoaded(true);
  };
  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    resetAutoScroll();
  };
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product data');
        const data = await res.json();
        setProduct(data);
        setSortedReviews(data.reviews || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();

    // Check if a review exists in localStorage
    const storedReview = JSON.parse(localStorage.getItem(`review-${id}`));
    if (storedReview) {
      setEditingReview(storedReview);
    }
  }, [id]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setReviewerName(userDoc.data().username);
        } else {
          console.error('No user document found');
        }
      };
      fetchUserData();
    }
  }, []);

  const handleConfirmReview = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setNotLoggedIn(true);
      return;
    }

    if (newReviewRating < 1 || newReviewRating > 5) {
      console.error('Rating must be between 1 and 5');
      return;
    }

    // Ensure reviewerName is defined
    const safeReviewerName = reviewerName || 'Anonymous';

    const newReview = {
      reviewerName: safeReviewerName,
      rating: newReviewRating,
      comment: newReviewComment || '',  // Fallback to empty string if undefined
      date: new Date().toISOString(),
      uid: user.uid,
    };

    try {
      if (editingReview && editingReview.id) {
        // Update existing review
        const reviewRef = doc(db, 'products', id, 'reviews', editingReview.id);
        await updateDoc(reviewRef, newReview);
        
        // Update the local state with the updated review
        setSortedReviews((prevReviews) => 
          prevReviews.map((rev) => (rev.id === editingReview.id ? { ...rev, ...newReview } : rev))
        );

        // Cache the updated review in localStorage
        localStorage.setItem(`review-${id}`, JSON.stringify(newReview));
      } else {
        // Create a new review
        const res = await fetch(`/api/products/${id}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newReview),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Failed to add review: ${errorData.message}`);
        }

        setSortedReviews((prevReviews) => [newReview, ...prevReviews]);

        // Cache the new review in localStorage
        localStorage.setItem(`review-${id}`, JSON.stringify(newReview));
      }

      toggleReviewModal();
      setNewReviewRating(0);
      setNewReviewComment('');
      setEditingReview(null);
    } catch (error) {
      console.error('Error handling review:', error);
    }
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

  const handleEditReview = (review) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user && review.reviewerName === reviewerName) {
      setEditingReview(review);
      setNewReviewRating(review.rating);
      setNewReviewComment(review.comment);
      toggleReviewModal();
    } else {
      alert('You cannot edit this review. Either there was an error or you are not logged in correctly');
      console.error('You cannot edit this review.');
    }
  };

  const handleDeleteReviews = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    // Check if the user is logged in
    if (!user) {
        setNotLoggedIn(true);
        return;
    }

    try {
        const idToken = await user.getIdToken(); // Get the token

        const res = await fetch(`/api/products/${id}/reviews`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${idToken}`, // Include the token
                'Content-Type': 'application/json',
            },
        });

        // Check if the response is okay
        if (!res.ok) {
            const errorData = await res.json();
            alert(`Sorry, an error has been found deleting the user review: ${errorData.message}`);
            throw new Error(`Failed to delete reviews: ${errorData.message}`);
        }

        // Update the local state by removing the user's reviews
        setSortedReviews((prevReviews) =>
            prevReviews.filter((review) => review.uid !== user.uid)
        );

        // Optionally, provide feedback to the user about successful deletion
        alert('Review deleted successfully!');
        localStorage.removeItem(`review-${id}`); // Remove from localStorage
    } catch (error) {
        console.error('Error deleting reviews:', error);
        alert('An unexpected error occurred while trying to delete the review. Please try again later.');
    }
  };

  const toggleReviewModal = () => {
    setIsReviewModalOpen(!isReviewModalOpen);
  };

  const handleBackClick = () => {
    const queryParams = {
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || '',
      order: searchParams.get('order') || '',
      page: prePage,
    };
    const queryString = new URLSearchParams(queryParams).toString();
    router.push(`/product/productsPage?${queryString}`);
  };

  if (loading) {
    return <div className="text-center text-soft-gray">Loading product details...</div>;
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
    <div className="container mx-auto p-4 bg-soft-gray text-navy-blue relative">
      <button
        onClick={handleBackClick}
        className="bg-teal text-soft-gray px-4 py-2 rounded mb-4 hover:bg-teal-700"
      >
        Back to Products
      </button>
      <h1 className="text-3xl font-bold mb-4 text-teal ">{title}</h1>

      
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
                  width={720}
                  height={360}
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
                width={100}
                height={100}
                alt={`${title} thumbnail ${idx + 1}`}
                className={`w-16 h-16 object-cover cursor-pointer rounded border-2 ${
                  currentImageIndex === idx ? 'border-teal-600' : 'border-transparent'
                }`}
                onClick={() => handleThumbnailClick(idx)}
              />
            ))}
          </div>
        </div>

        <div className="p-4 border text-white border-navy-blue rounded-md">
          <h2 className="text-2xl font-semibold mb-2">Product Details</h2>
          <p className="mb-2"><strong>Price:</strong> ${price.toFixed(2)}</p>
          <p className="mb-2"><strong>Description:</strong> {description}</p>
          <p className="mb-2"><strong>Brand:</strong> {brand}</p>
          <p className="mb-2"><strong>Stock:</strong> {stock}</p>
          <p className="mb-2"><strong>Category:</strong> {category}</p>
          <p className="mb-2"><strong>Tags:</strong> {tags.join(', ')}</p>
        </div>
      </div>

      <button
        onClick={toggleReviewModal}
        className="bg-teal text-white px-4 py-2 rounded mt-4 hover:bg-teal-700"
      >
        Leave a Review
      </button>
      <h2 className="text-2xl font-semibold mb-4 text-navy-blue">Reviews</h2>
      {sortedReviews.length > 0 ? (
        sortedReviews.map((review, index) => (
          <div key={review.id || index} className="border-b bg-teal border-navy-blue py-2">
            <p className="font-semibold text-navy-blue">
              {review.reviewerName} - {review.rating} ⭐
            </p>
            <p>{review.comment}</p>
            <p className="text-sm text-green-900 ">
              {new Date(review.date).toLocaleString()}
            </p>
            {review.reviewerName === reviewerName && (
              <div className="flex space-x-2">
                <button onClick={() => handleEditReview(review)} className="text-purple-700 mt-2">
                  Edit Review
                </button>
                <button onClick={handleDeleteReviews} className="text-red-600 mt-2">
                  Delete Review
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500">No reviews yet.</p>
      )}

      {isReviewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <h3 className="text-lg font-semibold">Leave a Review</h3>
            <label className="block mb-2">Rating (1-5):</label>
            <input
              type="number"
              min="1"
              max="5"
              defaultValue="5"
              value={newReviewRating}
              onChange={(e) => setNewReviewRating(parseInt(e.target.value))}
              className="border border-gray-300 rounded mb-2 p-1 w-full"
            />
            <label className="block mb-2">Comment:</label>
            <textarea
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              className="border border-gray-300 rounded mb-2 p-1 w-full"
              rows="4"
            />
            <div className="flex justify-end">
              <button
                onClick={handleConfirmReview}
                className="bg-teal text-white px-4 py-2 rounded hover:bg-teal-700"
              >
                {editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                onClick={toggleReviewModal}
                className="ml-2 text-black hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {notLoggedIn && (
        <div className="text-red-500">
          You must be logged in to leave a review.
        </div>
      )}
    </div>
  );
}
