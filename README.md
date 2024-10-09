
# Goods&Marting
#Website
-(https://goodsamarting.vercel.app/product/productsPage)
#API'S
-https://goodsamarting.vercel.app/api/products
-https://goodsamarting.vercel.app/api/products/[id]
-https://goodsamarting.vercel.app/api/category

FoodCom is an e-commerce application built with Next.js, featuring a product listing and detail page with dynamic SEO, filtering, sorting, and user interaction features.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [Usage](#usage)
- [Styling](#styling)
- [SEO Optimization](#seo-optimization)
- [Image Optimization](#image-optimization)
- [Progressive Web App (PWA) Issues](#progressive-web-app-pwa-issues)
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
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/get-npm)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/K0BraKhan33/MikGam156_JSE2407-D_Mikaeel-Gamieldien_FSJ02.git
   cd foodcom
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Folder Structure

```
foodCom/
├── app/
│   ├── product/
│   ├── components/
│   └── ...
├── public/
├── styles/
└── next.config.mjs
```

## Usage

### Product Listing Page

- Displays a grid of products with:
  - Product image
  - Category
  - Price
  - A link to view details

### Product Details Page

- Displays detailed information about a selected product:
  - Image gallery with navigation
  - Brand, category, price, rating, stock availability
  - Description and tags
  - Reviews with sorting options (by date or rating)

### Interactivity

- Users can:
  - Sort and filter products dynamically.
  - Navigate back to the product listing page while retaining search parameters.
  - Scroll through images in the product detail view with automatic scrolling features.
  - Reset filters and sorting options.

## Styling

This project uses **Tailwind CSS** for styling components, ensuring a modern and responsive design.

## SEO Optimization

- Dynamic metadata (title and description) is generated for each product page to improve search engine visibility.
- Meta tags are added for better SEO performance.

## Image Optimization

- The application uses Next.js's built-in image optimization features to serve images in modern formats (like WebP) and optimize loading times.

## Progressive Web App (PWA) Issues

Currently, the PWA features of the FoodCom application are not functioning as intended. Several attempts to implement service workers and offline capabilities have been made, but issues persist in correctly caching resources and handling offline scenarios. However, there are examples and references left in the code files that demonstrate the intended functionality and provide insight into the implementation. You can review files such as `next.config.mjs` and the corresponding service worker files for details.

## Contributing

If you'd like to contribute to this project, please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
