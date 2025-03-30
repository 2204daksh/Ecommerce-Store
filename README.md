# 🛂 MERN E-Commerce App  

A **full-stack** e-commerce application built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)** with **Zustand** for state management and **Razorpay** for payments.  

## 🚀 Features  
- **User Authentication** – Signup, login, logout, and refresh token functionality.  
- **Product Management** – Perform CRUD operations, manage featured products, and organize categories.  
- **Shopping Cart** – Add, remove, update quantity, and clear cart items.  
- **Coupons & Discounts** – Apply and validate coupon codes.  
- **Payments with Razorpay** – Secure online transactions.  
- **Admin Dashboard** – View analytics, including users, sales, and revenue.  
- **Optimized Performance** – Redis caching for featured products.  
- **Cloudinary Integration** – Upload product images seamlessly.  

---

## 🛠️ Tech Stack  
### **Frontend**  
- **React.js** – Vite-based setup for fast development.  
- **Tailwind CSS** – Modern styling approach.  
- **React Router** – Efficient navigation handling.  
- **React Hot Toast** – Notification management.  
- **Zustand** – Simplified state management.  
- **Razorpay SDK** – Payment gateway integration.  

### **Backend**  
- **Node.js & Express.js** – Backend API development.  
- **MongoDB & Mongoose** – NoSQL database and ODM.  
- **JWT & Redis** – Authentication and token storage.  
- **Cloudinary** – Image upload and storage solution.  

---

## 🛣️ API Endpoints  
### **Authentication**  
- `POST /api/auth/signup` – Register a new user  
- `POST /api/auth/login` – Login  
- `POST /api/auth/logout` – Logout  
- `POST /api/auth/refresh-token` – Refresh access token  
- `GET /api/auth/profile` – Get user profile  

### **Products**  
- `GET /api/products` – Get all products  
- `GET /api/products/featured` – Get featured products  
- `POST /api/products` – Add new product (Admin)  
- `DELETE /api/products/:id` – Delete product (Admin)  

### **Cart**  
- `GET /api/cart` – Get cart items  
- `POST /api/cart` – Add item to cart  
- `PUT /api/cart/:id` – Update item quantity  
- `DELETE /api/cart` – Remove item from cart  

### **Coupons**  
- `GET /api/coupons` – Get available coupon  
- `POST /api/coupons/validate` – Validate coupon  

### **Payments**  
- `POST /api/payments/create-checkout-session` – Create Razorpay order  
- `POST /api/payments/checkout-success` – Verify and complete payment  

---

## 📌 Project Structure  
```
📚 mern-ecommerce
├── 📚 backend
│   ├── 📚 controllers
│   ├── 📚 routes
│   ├── 📚 models
│   ├── 📚 middleware
│   ├── server.js
│   ├── lib/db.js
│   ├── lib/redis.js
│   ├── lib/razorpay.js
│   ├── .env
│   ├── package.json
│
├── 📚 frontend
│   ├── 📚 src
│   │   ├── 📚 pages
│   │   ├── 📚 components
│   │   ├── 📚 stores (Zustand)
│   │   ├── 📚 lib (Axios)
│   │   ├── App.jsx
│   ├── .env
│   ├── package.json
│
└── README.md
```
