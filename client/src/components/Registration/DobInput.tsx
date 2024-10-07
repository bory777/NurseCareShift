import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DobInput: React.FC = () => {
  const [dob, setDob] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 生年月日のバリデーション
  const validateDob = (dob: string): string | null => {
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD形式
    return dobRegex.test(dob) ? null : '有効な生年月日を入力してください。';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーションチェック
    const validationError = validateDob(dob);
    if (validationError) {
      setError(validationError);
      return;
    }

    // 生年月日をコンソールに出力して、次のページに遷移
    console.log('生年月日:', dob);
    navigate('/job-info-input'); // 職務情報入力ページに遷移
  };

  return (
    <div className="dob-page flex justify-center items-center min-h-screen bg-blue-50 font-poppins">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">生年月日入力</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-gray-600 mb-4">あなたの生年月日を入力してください。</p>

          <input
            type="date"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              setError(null); // エラーメッセージをクリア
            }}
            placeholder="生年月日"
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

export default DobInput;
