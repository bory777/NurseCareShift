// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import LogoutButton from '../components/LogoutButton';

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<{ id: number; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // AuthContextからトークンを取得

  useEffect(() => {
    if (!token) {
      setError('ログインが必要です');
      return;
    }

    // 認証が必要なAPIにリクエストを送信
    fetch('http://localhost:8000/api/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // トークンをAuthorizationヘッダーに付与
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('プロフィールの取得に失敗しました');
        }
        return response.json();
      })
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">ダッシュボード</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {profile ? (
          <div>
            <p>ユーザーID: {profile.id}</p>
            <p>メールアドレス: {profile.email}</p>
            <LogoutButton /> {/* ログアウトボタンを追加 */}
          </div>
        ) : (
          !error && <p>プロフィールを読み込み中...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
