import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotUI from './components/ChatbotUI';
import { supabase } from './config/supabaseClient';
import VisitorTracker from './components/VisitorTracker';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import Home from './pages/user/Home';
import Welcome from './pages/user/Welcome';
import Login from './pages/user/Login';
import Shop from './pages/user/ShopPage';
import ProductDetails from './pages/user/ProductInfo';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Profile from './pages/user/Profile';
import Feedback from './pages/user/Feedback.jsx';
import ServiceRequest from './pages/user/ServiceRequest.jsx';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';
import AdminFeedback from './pages/admin/AdminFeedback.jsx';
import VisitorTracking from './pages/admin/VisitorTracking';
import ManageService from './pages/admin/ManageService';

// Custom Wrappers
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const App = () => {
  useEffect(() => {
    // Application active
  }, []);

  return (
    <AuthProvider>
      <VisitorTracker />
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100 selection:bg-blue-500/30">
            <Toaster position="bottom-right" toastOptions={{ duration: 5000, style: { background: '#1f2937', color: '#fff', borderRadius: '1rem' } }} />
            <Navbar />
            <main className="flex-grow w-full pt-20 pb-12">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/service" element={<ProtectedRoute><ServiceRequest /></ProtectedRoute>} />
                
                {/* Protected Routes (User) */}
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Protected Routes (Admin) */}
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
                <Route path="/admin/feedback" element={<AdminRoute><AdminFeedback /></AdminRoute>} />
                <Route path="/admin/tracking" element={<AdminRoute><VisitorTracking /></AdminRoute>} />
                <Route path="/admin/service" element={<AdminRoute><ManageService /></AdminRoute>} />
                
                {/* Handy Redirects */}
                <Route path="/AdminPanel" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </main>
            <ChatbotUI />
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
