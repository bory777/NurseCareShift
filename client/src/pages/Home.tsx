import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const Home: React.FC = () => {
  const { token } = useAuth(); // ログイン状態を取得

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative flex-1">
        <img
          src="https://via.placeholder.com/1920x1080"
          alt="Nurse working"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center bg-blue-300 bg-opacity-50">
          <h2 className="text-5xl font-bold text-white mb-6">看護師のための技術共有プラットフォーム</h2>
          <p className="text-lg text-gray-200 mb-8">
            看護師が学んだ知識や技術を共有し、レビューし合い、スキルを高め合うための場所です。
          </p>

          {token ? (
            <Link
              to="/dashboard"
              className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
            >
              ダッシュボードに移動する
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
            >
              ログインして始める
            </Link>
          )}
        </div>
      </div>

      <footer className="bg-blue-200 text-white py-6">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 NurseCareShift. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
