import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import SMSCenter from './components/sms/SMSCenter';
import SIMManager from './components/sims/SIMManager';
import Analytics from './components/analytics/Analytics';
import ApiKeys from './components/settings/ApiKeys';
import Wallets from './components/settings/Wallets';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Public Route component (for login/register)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1">
        <TopBar />
        <div className="pt-16"> {/* Add padding-top to account for fixed TopBar */}
          {children}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/sms" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <SMSCenter />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/sims" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <SIMManager />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Analytics />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/api-keys" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ApiKeys />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/wallets" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Wallets />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;