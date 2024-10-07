import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    // ダッシュボードに遷移する
    navigate('/dashboard'); // ダッシュボードへのルートを指定
  };

  return (
    <div className="success-page flex justify-center items-center min-h-screen bg-blue-50 font-poppins">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">登録完了</h2>
        <p className="mb-6">アカウントの登録が完了しました。ありがとうございます！</p>

        <button
          type="button"
          onClick={handleGoToDashboard}
          className="bg-blue-500 text-white py-3 px-4 rounded-lg shadow-lg"
        >
          ダッシュボードに進む
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
