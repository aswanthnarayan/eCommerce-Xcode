import axios from 'axios';
import { toast } from 'react-hot-toast';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
instance.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const isPublicRoute = ['/', '/login'].includes(window.location.pathname);
        
        // Skip refresh logic for public routes
        if (isPublicRoute) {
            return Promise.reject(error);
        }
        
        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, add to queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(() => {
                    return instance(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the token
                await axios.post('/auth/refresh', {}, {
                    skipAuthRefresh: true // Custom flag to prevent infinite loops
                });
                
                // Process queued requests
                processQueue(null);
                
                // Retry the original request
                return instance(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear auth and redirect to login
                processQueue(refreshError);
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other errors
        if (error.response) {
            switch (error.response.status) {
                case 403:
                    toast.error('You do not have permission to access this resource');
                    break;
                case 404:
                    toast.error('The requested resource was not found');
                    break;
                case 500:
                    toast.error('A server error occurred. Please try again later.');
                    break;
                default:
                    const message = error.response.data?.message || 'An error occurred';
                    if (message) toast.error(message);
            }
        } else if (error.request) {
            toast.error('No response from server. Please check your connection.');
        } else {
            toast.error('Error: ' + error.message);
        }

        return Promise.reject(error);
    }
);

export default instance;