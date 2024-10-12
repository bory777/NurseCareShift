// Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Linkを追加
import { useAuth } from '../components/AuthContext';

// メールアドレスのバリデーション関数
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email) ? null : '有効なメールアドレスを入力してください。';
};

// パスワードのバリデーション関数
const validatePassword = (password: string): string | null => {
  return password ? null : 'パスワードを入力してください。';
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // バリデーション
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError || undefined, password: passwordError || undefined });
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // HttpOnlyクッキーを使用するためのオプション
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ログインに失敗しました');
      }

      const data = await response.json();
      login(data.accessToken); // アクセストークンをコンテキストにセット
      navigate('/dashboard'); // ダッシュボードに遷移
    } catch (err: any) {
      setErrors({ general: err.message });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">ログイン</h2>
        {errors.general && <p className="text-red-500 mb-4 text-center">{errors.general}</p>}
        <form onSubmit={handleSubmit}>
          {/* メールアドレス入力 */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded`}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* パスワード入力 */}
          <div className="mb-4">
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded`}
              required
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* パスワードを忘れた場合のリンク */}
          <div className="text-right mb-4">
            <Link to="/password-reset-request" className="text-blue-500 hover:underline">
              パスワードをお忘れですか？
            </Link>
          </div>

          {/* ログインボタン */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
