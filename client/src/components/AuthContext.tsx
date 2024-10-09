import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// AuthContextの型定義
interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(true); // 認証状態の確認中かどうか
  const navigate = useNavigate(); // リダイレクト用にuseNavigateを使う
  const location = useLocation(); // 現在のページを取得

  // 認証が必要なページ（例: ダッシュボードなど）をリストアップ
  const protectedRoutes = ['/dashboard'];

  useEffect(() => {
    console.log("プロフィールデータを取得中");
    const checkAuth = async () => {
      setIsLoading(true); // 認証確認中
      try {
        const response = await fetch('http://localhost:8000/api/check-auth', {
          method: 'GET',
          credentials: 'include', // HttpOnlyクッキーを含める
        });

        if (response.ok) {
          // 認証成功の場合、トークンは保持しなくても認証状態をセット
          setToken('authenticated');
        } else if (response.status === 401) {
          // 認証失敗の場合、リフレッシュトークンを使ってアクセストークンを再発行
          const refreshResponse = await fetch('http://localhost:8000/api/refresh-token', {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshResponse.ok) {
            // リフレッシュ成功、認証状態を維持
            setToken('authenticated');
          } else {
            // リフレッシュ失敗時にのみ、認証が必要なページでリダイレクト
            setToken(null);
            if (protectedRoutes.includes(location.pathname)) {
              navigate('/login');
            }
          }
        }
      } catch (err) {
        console.log('認証チェックに失敗しました', err);
        setToken(null); // エラーが発生した場合もログアウト状態にする
        if (protectedRoutes.includes(location.pathname)) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false); // 認証確認完了
      }
    };

    checkAuth(); // ページの初回ロード時に実行
  }, []);

  // ログイン時の処理
  const login = () => {
    setToken('authenticated'); // サーバーからの応答が正しければ「authenticated」状態にセット
  };

  // ログアウト時の処理
  const logout = () => {
    setToken(null); // ローカルでトークンをクリア
    fetch('http://localhost:8000/api/logout', {
      method: 'POST',
      credentials: 'include', // クッキーを含めてリクエスト
    })
      .then((response) => {
        if (response.ok) {
          navigate('/'); // ログアウト後にホーム画面にリダイレクト
        } else {
          console.log('ログアウトに失敗しました');
        }
      })
      .catch((error) => {
        console.error('ログアウトエラー:', error);
      });
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {isLoading ? <div>Loading...</div> : children} {/* ローディング中はメッセージ表示 */}
    </AuthContext.Provider>
  );
};
