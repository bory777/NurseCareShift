import React, { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<{ id: number; email: string } | null>(null); // プロフィール状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ状態

  useEffect(() => {
    const token = localStorage.getItem('token'); // ローカルストレージからトークンを取得

    // トークンが存在しない場合
    if (!token) {
      setError('ログインが必要です');
      return;
    }

    // 認証が必要なAPIにリクエスト
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
        setProfile(data); // プロフィールデータを保存
      })
      .catch((err) => {
        setError(err.message); // エラーメッセージを設定
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">ダッシュボード</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>} {/* エラーメッセージ */}
        {profile ? (
          <div>
            <p>ユーザーID: {profile.id}</p>
            <p>メールアドレス: {profile.email}</p>
          </div>
        ) : (
          !error && <p>プロフィールを読み込み中...</p> // プロフィールが読み込まれるまで
        )}
      </div>
    </div>
  );
};

export default Dashboard;
