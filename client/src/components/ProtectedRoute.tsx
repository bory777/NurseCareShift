import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token'); // JWTトークンの取得

  // トークンが存在しない場合はログインページにリダイレクト
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
