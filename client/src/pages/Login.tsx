import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState(''); // メールアドレスの状態
  const [password, setPassword] = useState(''); // パスワードの状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ用の状態
  const navigate = useNavigate(); // ナビゲーション用フック

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // エラーメッセージをリセット

    // フォームのバリデーション
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }

    try {
      // デバッグ用: ログインリクエスト送信前にログ出力
      console.log('ログインリクエスト送信中: ', { email, password });

      // バックエンドAPIへのログインリクエスト
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // リクエストヘッダーにJSONを指定
        },
        body: JSON.stringify({ email, password }), // リクエストボディにメールアドレスとパスワードを送信
      });

      // デバッグ用: レスポンスのステータスコードを確認
      console.log('レスポンスステータス: ', response.status);

      // レスポンスがOKでない場合エラーを投げる
      if (!response.ok) {
        const errorData = await response.json(); // APIからのエラーメッセージを取得
        throw new Error(errorData.message || 'ログインに失敗しました');
      }

      // 正常なレスポンスが返ってきた場合
      const data = await response.json();
      
      console.log('ログイン成功: ', data); // デバッグ用ログ
      
      localStorage.setItem('token', data.token); // JWTトークンをlocalStorageに保存

      // デバッグ用: リダイレクト前に確認
      console.log('ダッシュボードへリダイレクト中');

      // ログイン成功後にダッシュボードへリダイレクト
      await navigate('/dashboard'); // navigate に await を追加して処理を待つ
    } catch (err: any) {
      console.error('エラーが発生しました:', err); // エラー内容をコンソールに出力
      setError(err.message); // エラーメッセージを表示
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">ログイン</h2>
        {/* エラーメッセージが存在する場合表示 */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // メールアドレスの変更を反映
            className="w-full p-2 mb-4 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // パスワードの変更を反映
            className="w-full p-2 mb-4 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
