import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { useResponsive } from './hooks/useResponsive';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load components
const TouristMap = lazy(() => import('./components/TouristMap'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const Navbar = lazy(() => import('./components/NavBar'));
const MobileNav = lazy(() => import('./components/mobileNav'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 bg-primary-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

function App() {
  const { isMobile } = useResponsive();

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
            {/* Navbar */}
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
            
            {/* Main Content */}
            <main className={`${!isMobile ? 'pt-16' : ''} pb-16 md:pb-0 transition-all duration-300`}>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<TouristMap />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route 
                    path="/favorites" 
                    element={
                      <ProtectedRoute>
                        <TouristMap favoritesView />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <div>Profile Page (Coming Soon)</div>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <div>Settings Page (Coming Soon)</div>
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Suspense>
            </main>

            {/* Mobile Navigation */}
            {isMobile && (
              <Suspense fallback={null}>
                <MobileNav />
              </Suspense>
            )}

            {/* Toast Notifications */}
            <Toaster
              position={isMobile ? 'top-center' : 'bottom-right'}
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  padding: isMobile ? '12px' : '16px',
                  fontSize: isMobile ? '14px' : '16px',
                },
              }}
            />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;