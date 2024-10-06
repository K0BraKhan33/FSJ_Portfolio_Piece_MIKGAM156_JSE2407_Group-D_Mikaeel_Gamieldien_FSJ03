'use client';

import { useState, useEffect } from 'react';
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
      }

      toggleReviewModal();
      setNewReviewRating(0);
      setNewReviewComment('');
      setEditingReview(null);
    } catch (error) {
      console.error('Error handling review:', error);
    }
  };

  const handleEditReview = (review) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user && review.reviewerName === reviewerName) {
      setEditingReview(review);
      setNewReviewRating(review.rating);
      setNewReviewComment(review.comment);
      toggleReviewModal();
    } else {
      console.error('You cannot edit this review.');
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
      <button
        onClick={handleBackClick}
        className="bg-teal-600 text-warm-white px-4 py-2 rounded mb-4 hover:bg-teal-700"
      >
        Back to Products
      </button>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="gallery relative flex flex-col">
          {!imagesLoaded && (
            <div className="text-center text-teal-400">ProductID {id} found, please wait...</div>
          )}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4" style={{ width: '100%', height: '80vh' }}>
            {images?.map((image, index) => (
              <div key={index} className="flex-none snap-start" style={{ width: '100%' }}>
                <Image
                  src={image}
                  alt={title}
                  width={500}
                  height={500}
                  onLoad={() => setImagesLoaded(true)}
                  className={`object-contain ${imagesLoaded ? '' : 'hidden'}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col p-4 bg-gray-800 rounded">
          <p className="text-lg font-semibold">Price: ${price.toFixed(2)}</p>
          <p className="text-md mt-2">Rating: {rating} ⭐</p>
          <p className="text-md">Stock: {stock}</p>
          <p className="text-md">Category: {category}</p>
          <p className="text-md">Brand: {brand}</p>
          <p className="text-md">Tags: {tags.join(', ')}</p>
          <p className="text-md mt-2">{description}</p>
          <button
            onClick={toggleReviewModal}
            className="bg-teal-600 text-warm-white px-4 py-2 rounded mt-4 hover:bg-teal-700"
          >
            Add Review
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        <div>
          {sortedReviews.map((review, index) => (
            <div key={review.id || index} className="border-b border-gray-600 py-2">
              <p className="font-semibold">{review.reviewerName} - {review.rating} ⭐</p>
              <p>{review.comment}</p>
              <p className="text-sm text-gray-500">{new Date(review.date).toLocaleString()}</p>
              {review.reviewerName === reviewerName && (
                <button onClick={() => handleEditReview(review)} className="text-teal-600 mt-2">
                  Edit Review
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isReviewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-4 rounded shadow-lg">
            <h2 className="text-lg font-semibold">{editingReview ? 'Edit Review' : 'Add Review'}</h2>
            <div className="flex flex-col mt-4">
              <label className="mb-2">Your Name:</label>
              <input
                type="text"
                value={reviewerName}
                readOnly
                className="mb-2 p-2 rounded bg-gray-700 text-warm-white"
              />
              <label className="mb-2">Rating (1-5):</label>
              <input
                type="number"
                value={newReviewRating}
                onChange={(e) => setNewReviewRating(Number(e.target.value))}
                className="mb-2 p-2 rounded bg-gray-700 text-warm-white"
                min="1"
                max="5"
              />
              <label className="mb-2">Comment:</label>
              <textarea
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                className="mb-4 p-2 rounded bg-gray-700 text-warm-white"
              />
              <div className="flex justify-end">
                <button onClick={toggleReviewModal} className="bg-red-600 text-white px-4 py-2 rounded mr-2">
                  Cancel
                </button>
                <button onClick={handleConfirmReview} className="bg-teal-600 text-white px-4 py-2 rounded">
                  {editingReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notLoggedIn && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-4 rounded shadow-lg">
            <h2 className="text-lg font-semibold">Please Log In to Add a Review</h2>
            <button onClick={() => setNotLoggedIn(false)} className="bg-teal-600 text-white px-4 py-2 rounded mt-4">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
