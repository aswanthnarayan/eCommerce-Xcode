# MERN E-commerce Platform

A full-stack e-commerce application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring user authentication, product management, and Stripe payment integration.

## Features

- **User Authentication**

  - Login/Logout functionality
  - Protected routes
  - Role-based access control (Admin/User)

- **Product Management**

  - Browse products
  - Product details
  - Stock management

- **Shopping Experience**

  - Add to cart
  - Secure checkout with Stripe
  - Order history

- **Admin Dashboard**
  - Add/Edit/Delete products
  - View orders
  - Manage inventory

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- React Hot Toast
- Lucide React (Icons)
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe Payment Integration

### Development Tools
- Git & GitHub
- Postman (API Testing)
- MongoDB Compass (Database GUI)

##  Prerequisites

Before you begin, ensure you have installed the following:

- Node.js (v18 or later)
- npm (v9 or later) or yarn
- MongoDB Atlas account or local MongoDB instance (v6.0+)
- Stripe account for payment processing
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/aswanthnarayan/eCommerce-Xcode.git
cd eCommerce-Xcode
```

### 2. Backend Setup

```bash
# Navigate to server directory
# Install dependencies
npm install

# Create a .env file in the server directory and add:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
CLIENT_URL=http://localhost:5173
```

> **Note**: Replace the placeholder values with your actual configuration.

### 3. Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Create a .env file in the client directory and add:
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
```

> **Note**: Get your Stripe public key from the Stripe Dashboard.

### create a .env file in the client directory and add root path

### create a uploads folder in the root directory

### 4. Running the Application

#### Development Mode

1. **Start the Backend Server**
   ```bash
   # From the server directory
   npm run dev
   ```

2. **Start the Frontend**
   ```bash
   # From the client directory
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

#### Production Build

```bash
# Build the frontend for production
cd client
npm run build

# The built files will be in the 'dist' directory
```

## Database Schemas

The application uses MongoDB with the following schemas:

### 1. User Schema

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ["user", "admin"], 
    default: "user" 
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date,
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);
```

### 2. Product Schema

```javascript
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be a positive number']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Product image is required']
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['Electronics', 'Clothing', 'Books', 'Home', 'Other'],
    default: 'Other'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for product URL
productSchema.virtual('url').get(function() {
  return `/products/${this._id}`;
});
```

##  Demo Accounts

### Admin User
- **Email:** admin@example.com  
- **Password:** admin123  
- **Access:** Full access to admin dashboard and all features

### Regular User
- **Email:** user@example.com  
- **Password:** user123  
- **Access:** Standard shopping features

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PATCH /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
