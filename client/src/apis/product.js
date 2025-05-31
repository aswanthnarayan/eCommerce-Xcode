// src/apis/product.js
import axios from './axios';

export const productApi = {
  // Get all products
  getAll: () => axios.get('/products'),

  // Get single product
  getById: (id) => axios.get(`/products/${id}`),

  // Create product
  create: (formData) => axios.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true
  }),

  // Update product
  update: (id, formData) => axios.patch(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true
  }),

  // Delete product
  delete: (id) => axios.delete(`/products/${id}`, {
    withCredentials: true
  }),

  // Toggle product status
  toggleStatus: (id, isActive) => axios.patch(`/products/${id}`, { isActive }, {
    withCredentials: true
  })
};