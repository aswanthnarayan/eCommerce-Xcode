import React, { useState } from 'react';
import { ShoppingCart, Loader2, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPayment } from '../apis/payment';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
const ProductCard = ({ product }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    _id,        
    name,
    price,
    description,
    imageUrl,
    stock,
  } = product || {};

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY); 


  
const handleBuyNow = async (product) => {
  if (isLoading) return;
  
  if (!isAuthenticated) {
    toast('Please log in to make a purchase', { icon: '🔒' });
    navigate('/login', { state: { from: window.location.pathname } });
    return;
  }
  
  setIsLoading(true);
  try {
    const stripe = await stripePromise;
    const { id } = await createPayment(product._id);
    const result = await stripe.redirectToCheckout({ sessionId: id });
    if (result.error) {
      console.error('Stripe redirect error:', result.error.message);
      toast.error('Failed to process payment');
      setIsLoading(false);
    }
  } catch (err) {
    console.error('Checkout error:', err);
    toast.error('Failed to process payment');
    setIsLoading(false);
  }
};

  // Format the image URL to ensure it's absolute
  const getImageUrl = (url) => {
    if (!url) return null;
    
    // If it's already a full URL, handle spaces and return
    if (url.startsWith('http')) {
      return url.replace(/ /g, '%20');
    }
    
    // For local paths, prepend the base URL
    const baseUrl = 'http://localhost:5000';
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    const encodedPath = encodeURI(cleanPath);
    
    return `${baseUrl}/${encodedPath}`;
  };
  
  // Safely get the first image URL if multiple are 
  const getFirstImageUrl = (image) => {
    if (!image) return null;
    if (Array.isArray(image)) return image[0];
    return image;
  };
  
  const displayImage = getFirstImageUrl(imageUrl);

  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-100 h-full flex flex-col hover:border-indigo-100">
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        {imageUrl ? (
          <img
            src={getImageUrl(displayImage)}
            alt={name}
            className="w-full h-full object-contain p-3 transition-transform duration-200 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ShoppingCart className="w-8 h-8 text-gray-300" />
          </div>
        )}
        
        {stock <= 0 ? (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
            Out of Stock
          </span>
        ) : stock < 5 ? (
          <span className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
            {stock} Left
          </span>
        ) : null}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1" title={name}>
          {name}
        </h3>
        {description && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-2" title={description}>
            {description}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">${price?.toFixed(2)}</span>
          {stock > 0 && (
            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              In Stock
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="p-3 pt-0">
        <button
          onClick={() => handleBuyNow(product)}
          disabled={!product?.isActive || stock <= 0}
          className={`w-full py-1.5 text-sm rounded flex items-center justify-center space-x-1.5 transition-colors ${
            product?.isActive && stock > 0 && !isLoading
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : !product?.isActive ? (
            'Coming Soon'
          ) : stock > 0 ? (
            !isAuthenticated ? (
              <>
                <span>Login to Buy</span>
                <LogIn className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Buy</span>
                <ShoppingCart className="w-3.5 h-3.5" />
              </>
            )
          ) : (

            'Out of Stock'
          )}
        </button>
      </div>
    </div>
  );
};

// Default props 
ProductCard.defaultProps = {
  product: {
    _id: '',
    name: 'Product Name',
    price: 0,
    description: 'Product description goes here',
    imageUrl: '',
    stock: 10,
  },
};

export default ProductCard;