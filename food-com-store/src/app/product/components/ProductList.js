import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

/**
 * ProductList component to display a list of products with filtering, sorting, and image scrolling capabilities.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.products - The list of products to display.
 * @param {string} props.selectedCategory - The currently selected category for filtering.
 * @param {string} props.searchTerm - The current search term for filtering products.
 * @param {string} props.sortOrder - The order of sorting (e.g., "price").
 * @param {string} props.sortDirection - The direction of sorting ("asc" or "desc").
 * @param {number} props.page - The current page number for pagination.
 * @param {function} props.buildQueryString - Function to build query string for product links.
 * @returns {JSX.Element} The rendered ProductList component.
 */
const ProductList = ({
  products,
  selectedCategory,
  searchTerm,
  sortOrder,
  sortDirection,
  page,
  buildQueryString,
}) => {
  const [preloadedImages, setPreloadedImages] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const scrollRefs = useRef({}); // Store refs for each product's image container

  // Preload images for each product
  useEffect(() => {
    const preloadImages = () => {
      const loadedImages = {};
      products.forEach((product) => {
        loadedImages[product.id] = [];
        setLoadingStates((prev) => ({ ...prev, [product.id]: true })); // Set loading to true for each product

        product.images.forEach((imageSrc) => {
          const img = new window.Image();
          img.src = imageSrc;
          img.onload = () => {
            loadedImages[product.id].push(imageSrc);

            // Check if all images for this product are loaded
            if (loadedImages[product.id].length === product.images.length) {
              setPreloadedImages((prev) => ({ ...prev, [product.id]: loadedImages[product.id] }));
              setLoadingStates((prev) => ({ ...prev, [product.id]: false })); // Set loading to false
            }
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${imageSrc}`);
            // Ensure loading state is reset if an image fails
            setLoadingStates((prev) => ({ ...prev, [product.id]: false }));
          };
        });
      });
    };

    preloadImages();
  }, [products]);

  // Handle scrolling to the next/prev image
  const handleImageScroll = (productId, direction) => {
    const container = scrollRefs.current[productId];
    const scrollAmount = container.clientWidth; // Amount to scroll by (one image width)
    const currentScrollPosition = container.scrollLeft;

    let newScrollPosition;
    if (direction === 'next') {
      newScrollPosition = currentScrollPosition + scrollAmount;
      if (newScrollPosition >= container.scrollWidth) {
        newScrollPosition = 0; // Loop back to the first image
      }
    } else if (direction === 'prev') {
      newScrollPosition = currentScrollPosition - scrollAmount;
      if (newScrollPosition < 0) {
        newScrollPosition = container.scrollWidth - scrollAmount; // Loop to the last image
      }
    }

    container.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
  };

  return (
    <div>
      <Head>
        <title>{searchTerm ? `Search Results for "${searchTerm}"` : 'Product List'}</title>
        <meta
          name="description"
          content={`Browse ${products.length} products in ${selectedCategory || 'all categories'}. Find the best products at the best prices.`}
        />
        <meta name="keywords" content={`products, ecommerce, ${selectedCategory || 'all categories'}, ${searchTerm || 'all'}, ratings`} />
      </Head>

      {products.length === 0 ? (
        <div className="text-center text-xl text-navy-blue">No items found for: {searchTerm}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const paddedId = product.id.toString().padStart(3, '0'); // Format the ID to 3 digits
            return (
              <div key={paddedId} className="bg-navy-blue border border-gray-200 p-4 rounded-lg shadow-sm"> {/* Navy Blue color */}
                <div className="relative">
                  {/* Image Carousel Controls */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={() => handleImageScroll(product.id, 'prev')}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-2 py-1 rounded"
                      >
                        &lt;
                      </button>
                      <button
                        onClick={() => handleImageScroll(product.id, 'next')}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-2 py-1 rounded"
                      >
                        &gt;
                      </button>
                    </>
                  )}

                  {/* Link around the gallery */}
                  <Link
                    href={`/product/productsPage/${paddedId}?${buildQueryString({
                      category: selectedCategory,
                      search: searchTerm,
                      sortBy: sortOrder,
                      order: sortDirection,
                      page,
                    })}`}
                    legacyBehavior
                  >
                    <a>
                      {/* Product Image Scroll Container */}
                      <div
                        className="overflow-hidden whitespace-nowrap"
                        ref={(el) => (scrollRefs.current[product.id] = el)}
                        style={{ scrollBehavior: 'smooth', display: 'flex', gap: '10px' }}
                      >
                        {loadingStates[product.id] ? (
                          <div className="loader"></div>
                        ) : (
                          preloadedImages[product.id]?.map((imageSrc, index) => (
                            <div
                              key={index}
                              className="inline-block flex-shrink-0 w-full h-auto"
                              style={{ height: '300px' }} // Adjust height as needed
                            >
                              <Image
                                src={imageSrc || '../image-placeholder.webp'} // Fallback to placeholder if src is empty
                                alt={product.title}
                                className="object-contain w-full h-full rounded" // Use object-contain to maintain aspect ratio
                                width={150}
                                height={150}
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL="../image-placeholder.webp"
                                formats={['webp']}
                                onError={() => {
                                  console.error(`Failed to load image: ${imageSrc}`);
                                }}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </a>
                  </Link>
                </div>

                {/* Product Info */}
                <h2 className="text-lg font-semibold mt-2 text-teal">{product.title}</h2>
                <p className="text-sm text-teal">Category: {product.category}</p>
                <div className="flex flex-wrap mt-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="mr-2 mb-1 bg-gray-800 px-2 py-1 rounded text-sm text-soft-gray">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-2 font-bold text-lg text-teal">${product.price.toFixed(2)}</p>
                <p className="mt-1 text-teal">Rating: {product.rating.toFixed(1)}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* CSS Loader for preloading images */}
      <style jsx>{`
        .loader {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left-color: #ffffff;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Tailwind CSS Custom Colors */}
      <style jsx global>{`
        @tailwind base;
        @tailwind components;
        @tailwind utilities;

        /* Custom Colors */
        :root {
          --navy-blue: #1F3B4D; /* Deep and strong */
          --teal: #3AAFA9; /* Soothing cool color */
          --coral: #FF6F61; /* Pop of warmth */
          --soft-gray: #E5E5E5; /* Neutral backdrop */
          --mustard-yellow: #FFD166; /* Bright accent */
        }

        .bg-navy-blue {
          background-color: var(--navy-blue);
        }

        .text-navy-blue {
          color: var(--navy-blue);
        }

        .text-teal {
          color: var(--teal);
        }

        .text-soft-gray {
          color: var(--soft-gray);
        }

        .bg-coral {
          background-color: var(--coral);
        }

        .bg-mustard-yellow {
          background-color: var(--mustard-yellow);
        }
      `}</style>
    </div>
  );
};

export default ProductList;
