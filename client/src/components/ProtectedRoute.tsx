import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext'; // AuthContextを使用

const ProtectedRoute: React.FC = () => {
  const { token } = useAuth(); // ログイン状態を取得

  // トークンがなければログインページにリダイレクト
  if (!token) {
    return <Navigate to="/login" />;
  }

  // トークンがあれば、保護されたコンテンツを表示
  return <Outlet />;
};

export default ProtectedRoute;
