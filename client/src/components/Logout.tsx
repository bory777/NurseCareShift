import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // JWTトークンを削除
    localStorage.removeItem('token');

    // ログインページにリダイレクト
    navigate('/login');
  }, [navigate]);

  return null;
};

export default Logout;
