import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmailVerification: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 確認コードのバリデーション関数
  const validateVerificationCode = (code: string): string | null => {
    return code.length === 6 ? null : '6桁の確認コードを入力してください。';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーションチェック
    const validationError = validateVerificationCode(verificationCode);
    if (validationError) {
      setError(validationError);
      return;
    }

    // 認証処理を行う（APIなどと通信）
    console.log('確認コード:', verificationCode);

    // エラーがなければ次のページに遷移する
    navigate('/dob-input'); // 生年月日入力ページに遷移
  };

  return (
    <div className="verify-page flex justify-center items-center min-h-screen bg-blue-50 font-poppins">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">メール認証</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-gray-600 mb-4">
            送信されたメールに記載されている6桁の確認コードを入力してください。
          </p>

          <input
            type="text"
            value={verificationCode}
            onChange={(e) => {
              setVerificationCode(e.target.value);
              setError(null); // エラーメッセージをクリア
            }}
            placeholder="確認コード"
            maxLength={6}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              error ? 'border-red-500' : ''
            }`}
          />

          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg shadow-lg transition duration-300 mt-6"
          >
            次へ
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;
