# FoodCom

FoodCom is an e-commerce application built with Next.js, featuring a product listing and detail page with dynamic SEO, filtering, sorting, and user interaction features.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [Usage](#usage)
- [Styling](#styling)
- [SEO Optimization](#seo-optimization)
- [Image Optimization](#image-optimization)
- [Current Status](#current-status)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Product Listing**: Display a grid of products with images, categories, and prices.
- **Product Details**: View detailed product information, including description, stock, and reviews.
- **Dynamic Search and Filtering**: Search products by name, filter by category, and sort by price or rating.
- **Pagination**: Navigate through multiple pages of products, limited to 20 items per page.
- **Image Carousel**: An image gallery that allows users to scroll through product images.
- **Review System**: Sort and display product reviews based on date and rating.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **SEO and Performance Optimizations**: Dynamic metadata generation and efficient data fetching strategies.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or later)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/getting-started/install)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/K0BraKhan33/MikGam156_JSE2407-D_Mikaeel-Gamieldien_FSJ02.git
   cd foodcom
Install dependencies:

bash
Copy code
npm install
Run the development server:

bash
Copy code
npm run dev
Open your browser and navigate to http://localhost:3000.

Folder Structure
arduino
Copy code
foodCom/
├── app/
│   ├── product/
│   ├── components/
│   └── ...
├── public/
├── styles/
└── next.config.mjs
Usage
Product Listing Page
Displays a grid of products with:
Product image
Category
Price
A link to view details
Product Details Page
Displays detailed information about a selected product:
Image gallery with navigation
Brand, category, price, rating, stock availability
Description and tags
Reviews with sorting options (by date or rating)
Interactivity
Users can:
Sort and filter products dynamically.
Navigate back to the product listing page while retaining search parameters.
Scroll through images in the product detail view with automatic scrolling features.
Reset filters and sorting options.
Styling
This project uses Tailwind CSS for styling components, ensuring a modern and responsive design.

SEO Optimization
Dynamic metadata (title and description) is generated for each product page to improve search engine visibility.
Meta tags are added for better SEO performance.
Image Optimization
The application uses Next.js's built-in image optimization features to serve images in modern formats (like WebP) and optimize loading times.
Current Status
The current Progressive Web App (PWA) implementation is not functioning as expected. Examples of the code related to the PWA are included in the project files for reference and troubleshooting.

Contributing
If you'd like to contribute to this project, please fork the repository and submit a pull request with your changes.

License
This project is licensed under the MIT License - see the LICENSE file for details.

css
Copy code

Feel free to adjust any section as needed!