// src/apis/auth.js
import axios from './axios';
import Cookies from 'js-cookie';

const authApi = {
    login: async (email, password) => {
        try {
            const response = await axios.post('/auth/signin', { 
                email, 
                password 
            });
            
            // Store user data in cookie
            if (response?.user) {
                const { email, role } = response.user;
                Cookies.set('user', JSON.stringify({ email, role }), {
                    expires: 7,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax'
                });
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await axios.post('/auth/signup', userData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            await axios.post('/auth/signout');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        } finally {
            // Clear cookies
            document.cookie.split(';').forEach(c => {
                document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
            });
            Cookies.remove('user');
        }
    },

   
    getCurrentUser: async () => {
        try {
            // check user data is in cookie
            const userCookie = Cookies.get('user');
            if (userCookie) {
                return JSON.parse(userCookie);
            }
            
            // refresh session
            const response = await axios.post('/auth/refresh');
            if (response?.user) {
                const { email, role } = response.user;
                Cookies.set('user', JSON.stringify({ email, role }), {
                    expires: 7,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
                return { email, role };
            }
            return null;
        } catch (error) {
            return null;
        }
    },

    isAuthenticated: async () => {
        try {
            const user = await this.getCurrentUser();
            return !!user;
        } catch (error) {
            return false;
        }
    },

    getAccessToken: () => {
        return null;
    }
};

export default authApi;