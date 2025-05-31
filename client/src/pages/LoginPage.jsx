import React from 'react';
import LoginForm from '../components/LoginForm';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col">
    

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md
          bg-white/80 backdrop-blur-sm
          rounded-2xl shadow-xl
          border border-white/20
          overflow-hidden
          transition-all duration-300
          hover:shadow-2xl hover:bg-white/90">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
              <p className="mt-2 text-sm text-gray-600">Sign in to your account to continue</p>
            </div>
            <LoginForm />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};

export default LoginPage;