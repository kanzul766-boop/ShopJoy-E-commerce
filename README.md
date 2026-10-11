# ShopJoy — React Assignment #9

A beginner-friendly, responsive e-commerce demo built with React, Vite, plain CSS, and the Fake Store API.

## Features
- Fetches product data from `https://fakestoreapi.com/products`
- Search by product title or description
- Filter by category and minimum/maximum price
- Sort by featured, price, or rating
- Product details modal
- Wishlist saved in localStorage
- Cart with quantity controls, remove action, and automatic totals
- Checkout form with demo order confirmation
- Responsive mobile and desktop layout
- Loading, empty, and error states

## Run in VS Code
1. Install Node.js if it is not already installed.
2. Extract the ZIP file.
3. Open the extracted `assignment9-ecommerce` folder in VS Code.
4. Open Terminal → New Terminal.
5. Run:

   ```bash
   npm install
   npm run dev
   ```

6. Open the local URL shown by Vite, usually `http://localhost:5173`.

## Important notes
- An internet connection is needed to fetch products.
- The API provides sample/demo product data, and prices are displayed in USD.
- The checkout form is for demonstration only. It does not process payments or send orders to a real store.
- Cart and wishlist are saved in this browser using localStorage.
