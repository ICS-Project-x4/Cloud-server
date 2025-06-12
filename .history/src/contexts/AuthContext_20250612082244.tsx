import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, wallet } from '../services/api';

interface User {
  id: number;
  email: string;
  username: string;
  walletBalance?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  updateWalletBalance: (amount: number, description?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWalletBalance = async () => {
    try {
      const walletData = await wallet.get();
      setUser(prev => prev ? { ...prev, walletBalance: Number(walletData.balance) } : null);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      auth.getCurrentUser()
        .then((userData) => {
          setUser(userData);
          fetchWalletBalance();
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { access_token, user: userData } = await auth.login({ username: email, password });
      localStorage.setItem('token', access_token);
      setUser(userData);
      await fetchWalletBalance();
      return true;
    } catch (error) {
      console.error('Login error:', error);
    return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      await auth.register({ email, username, password });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateWalletBalance = async (amount: number, description?: string) => {
    try {
      const type = amount >= 0 ? 'credit' : 'debit';
      const absAmount = Math.abs(amount);
      await wallet.createTransaction({
        type,
        amount: absAmount,
        description: description || (type === 'credit' ? 'Wallet top-up' : 'Wallet debit')
      });
      await fetchWalletBalance();
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
      user,
        isAuthenticated: !!user,
        isLoading,
      login,
        logout,
      register,
        updateWalletBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}