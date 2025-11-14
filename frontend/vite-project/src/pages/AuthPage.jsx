import React, { useState } from 'react';
import axios from 'axios';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;
  const validateName = (name) => name.trim().length >= 2;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      } else if (!validateName(formData.name)) {
        newErrors.name = 'Name must be at least 2 characters long';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    if (message.text) {
      setMessage({ type: '', text: '' });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = isLogin ? '/login' : '/user';
      const payload = isLogin 
        ? { email: formData.email.trim(), password: formData.password }
        : { name: formData.name.trim(), email: formData.email.trim(), password: formData.password };

      const response = await axios.post(`http://localhost:3000${endpoint}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      // ✅ Store token only in login
      if (isLogin && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Show success message
      setMessage({ 
        type: 'success', 
        text: response.data.message || (isLogin ? 'Login successful!' : 'Account created successfully!') 
      });

      setFormData({ name: '', email: '', password: '' });
      setErrors({});

      if (isLogin) {
        console.log('Login successful:', response.data);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3500);
      } else {
        // Switch to login mode after signup
        setTimeout(() => {
          setIsLogin(true);
          setMessage({ type: '', text: '' });
        }, 2000);
      }

    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.error || 'Something went wrong. Please try again.';
        setMessage({ type: 'error', text: errorMessage });

        if (error.response.status === 400 && errorMessage.includes('Email Already Taken')) {
          setErrors({ email: 'This email is already registered' });
        }
      } else if (error.request) {
        setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
      } else {
        setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
    setMessage({ type: '', text: '' });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Taskflow
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in to continue your productivity journey' 
              : 'Join thousands of users managing tasks efficiently'
            }
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
              message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/50 backdrop-blur-sm ${
                      errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />{errors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/50 backdrop-blur-sm ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/50 backdrop-blur-sm ${
                    errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder={isLogin ? "Enter your password" : "Create a secure password (min 6 characters)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{errors.password}
                </p>
              )}
              {!isLogin && !errors.password && (
                <p className="mt-1 text-sm text-gray-500">Password should be at least 6 characters long</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleAuthMode}
                className="ml-1 text-violet-600 hover:text-violet-700 font-medium"
              >
                {isLogin ? 'Sign up for free' : 'Sign in here'}
              </button>
            </p>
          </div>

          <div className="mt-6 text-center">
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              <Sparkles className="h-4 w-4 mr-1" />100% Free Forever
            </span>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to our{' '}
            <a href="#" className="text-violet-600 hover:text-violet-700">Terms of Service</a> and{' '}
            <a href="#" className="text-violet-600 hover:text-violet-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
