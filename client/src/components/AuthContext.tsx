import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// AuthContextの型定義
interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// AuthContextを作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// useAuthカスタムフックを作成して、簡単にAuthContextにアクセスできるようにする
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProviderコンポーネント
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
