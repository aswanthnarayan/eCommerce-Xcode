import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();
import Product from '../models/Products.js';
const  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create metadata object with product info
    const metadata = {
      productId: product._id.toString(),
      productName: product.name,
    };

    // Add user ID to metadata if user is authenticated
    if (req.user && req.user._id) {
      metadata.userId = req.user._id.toString();
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description || '',
              images: product.images?.length > 0 ? [product.images[0]] : [],
            },
            unit_amount: Math.round(product.price * 100), 
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-cancel`,
      metadata: metadata
    });

    res.json({ 
      success: true,
      id: session.id,
      url: session.url 
    });

  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ error: 'Failed to create Stripe session' });
  }
};


// Get checkout session and update product stock if payment is successful
export const getCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });
    res.json(session);
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
};

