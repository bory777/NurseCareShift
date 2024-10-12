// components/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// ユーザーの型定義
interface User {
  id: number;
  email: string;
  name?: string;
  bio?: string;
  profileImage?: string;
}

// AuthContextの型定義
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  isLoading: boolean; // 認証確認中かどうか
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
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 認証状態の確認中かどうか
  const navigate = useNavigate(); // リダイレクト用にuseNavigateを使う
  const location = useLocation(); // 現在のページを取得

  // 認証が必要なページ（例: ダッシュボードなど）をリストアップ
  const protectedRoutes = ['/dashboard'];

  // ユーザー情報を取得する関数
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

  // ページの初回ロード時に認証チェックを実行
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true); // 認証確認中
      try {
        const response = await axios.get('http://localhost:8000/api/check-auth', { withCredentials: true });
        if (response.status === 200) {
          await fetchUser();
        } else if (response.status === 401) {
          // リフレッシュトークンを使って再認証
          const refreshResponse = await axios.post('http://localhost:8000/api/refresh-token', {}, { withCredentials: true });
          if (refreshResponse.status === 200) {
            await fetchUser();
          } else {
            setToken(null);
            if (protectedRoutes.includes(location.pathname)) {
              navigate('/login');
            }
          }
        }
      } catch (error) {
        console.error('認証チェックに失敗しました', error);
        setToken(null);
        if (protectedRoutes.includes(location.pathname)) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false); // 認証確認完了
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  // ログイン時の処理
  const login = async (email: string, password: string) => {
    await axios.post('http://localhost:8000/api/login', { email, password }, { withCredentials: true });
    await fetchUser();
  };

  // ログアウト時の処理
  const logout = async () => {
    await axios.post('http://localhost:8000/api/logout', {}, { withCredentials: true });
    setUser(null);
    setToken(null);
    navigate('/'); // ログアウト後にホーム画面にリダイレクト
  };

  // プロフィール更新
  const updateProfile = async (data: any) => {
    await axios.put('/api/account/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    await fetchUser(); // プロフィール更新後に最新のユーザー情報を取得
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateProfile, isLoading }}>
      {isLoading ? <div>Loading...</div> : children} {/* 認証中はローディング表示 */}
    </AuthContext.Provider>
  );
};
