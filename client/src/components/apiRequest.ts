import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  name?: string;
  bio?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refreshToken: () => Promise<string>; // 新しいトークンを返す関数
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProviderコンポーネント
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/user', { withCredentials: true });
      setUser(response.data);
      setToken('authenticated');
    } catch (error) {
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    await axios.post('http://localhost:8000/api/login', { email, password }, { withCredentials: true });
    await fetchUser();
  };

  const logout = async () => {
    await axios.post('http://localhost:8000/api/logout', {}, { withCredentials: true });
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data: any) => {
    await axios.put('/api/account/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    await fetchUser();
  };

  // 新しいトークンを取得する関数
  const refreshToken = async (): Promise<string> => {
    const response = await axios.post('/api/refresh-token', {}, { withCredentials: true });
    const { accessToken } = response.data;
    setToken(accessToken); // 新しいトークンをセット
    return accessToken;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateProfile, refreshToken, isLoading }}>
      {children} {/* childrenを必ず返す */}
    </AuthContext.Provider>
  );
};

// useAuthカスタムフックを作成して、簡単にAuthContextにアクセスできるようにする
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
