// PasswordResetRequest.tsx
import React, { useState } from 'react';

// CSRFトークンを取得する関数
const getCsrfToken = () => {
  const matches = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return matches ? decodeURIComponent(matches[1]) : '';
};

interface PasswordResetRequestProps {
  onRequestSuccess: () => void;
}

const PasswordResetRequest: React.FC<PasswordResetRequestProps> = ({ onRequestSuccess }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // メールアドレスのバリデーション関数
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email) ? null : '有効なメールアドレスを入力してください。';
  };

  // パスワードリセットリクエストの送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsSubmitting(true);

    try {
      const csrfToken = getCsrfToken();

      const response = await fetch('http://localhost:8000/api/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ email }),
        credentials: 'include', // クッキーを送信する場合
      });

      const data = await response.json();

      if (!response.ok) {
        const serverErrors = data.errors || [data.error] || ['パスワードリセット要求に失敗しました。'];
        setError(serverErrors.join('\n'));
      } else {
        setSuccessMessage('パスワードリセットのメールを送信しました。');
        onRequestSuccess();
      }
    } catch (err) {
      console.error('パスワードリセット要求エラー:', err);
      setError('サーバーへの接続に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="password-reset-request-page flex justify-center items-center min-h-screen bg-blue-50 font-poppins">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">パスワードリセットのリクエスト</h2>

        {successMessage ? (
          <p className="text-green-500 text-center">
            {successMessage}
            <br />
            メールを確認し、パスワードリセットの手続きを完了してください。
          </p>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレス"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  error ? 'border-red-500' : ''
                }`}
                aria-invalid={!!error}
                aria-describedby="email-error"
                required
              />
              {error && (
                <p id="email-error" className="text-red-500 text-sm mt-1">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg shadow-lg transition duration-300 mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? '送信中...' : 'パスワードリセットをリクエスト'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetRequest;
