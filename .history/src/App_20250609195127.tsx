import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import SMSCenter from './components/sms/SMSCenter';
import SIMManager from './components/sims/SIMManager';
import Wallet from './components/billing/Wallet';
import APIKeys from './components/api/APIKeys';
import Analytics from './components/analytics/Analytics';
import Layout from './components/layout/Layout';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sms" element={<SMSCenter />} />
        <Route path="/sims" element={<SIMManager />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/api-keys" element={<APIKeys />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-950">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;