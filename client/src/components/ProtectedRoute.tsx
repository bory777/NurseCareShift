// ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC = () => {
  const { token } = useAuth();

  // トークンがない場合はログインページへリダイレクト
  if (!token) {
    return <Navigate to="/login" />;
  }

  // トークンがある場合は保護されたコンテンツを表示
  return <Outlet />;
};

export default ProtectedRoute;
