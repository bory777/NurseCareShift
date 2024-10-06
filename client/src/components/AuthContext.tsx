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
  // localStorageからトークンを取得し、初期化
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('token');
    console.log('AuthProvider初期化 - localStorageから取得したトークン:', storedToken);  // 初期化時にlocalStorageのトークンを確認
    return storedToken;
  });

  // tokenが変更されたときにlocalStorageを更新
  useEffect(() => {
    if (token) {
      console.log('トークンがlocalStorageにセットされました:', token); // トークンが保存される瞬間のログ
      localStorage.setItem('token', token);
    } else {
      console.log('トークンがlocalStorageから削除されました'); // トークンが削除される瞬間のログ
      localStorage.removeItem('token');
    }
  }, [token]);

  // ログイン時の処理
  const login = (newToken: string) => {
    console.log('login関数が呼ばれ、トークンがセットされます:', newToken); // トークンがセットされる瞬間をログ出力
    setToken(newToken); // localStorageはuseEffectで更新される
  };

  // ログアウト時の処理
  const logout = () => {
    console.log('logout関数が呼ばれ、トークンがクリアされます'); // ログアウト時のログ出力
    setToken(null); // localStorageはuseEffectでクリアされる
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
