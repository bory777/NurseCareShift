import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-blue-100 shadow-md py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">NurseCareShift</h1>
          <nav>
            <Link to="/login" className="text-blue-400 hover:text-blue-500 font-semibold">
              ログイン
            </Link>
          </nav>
        </div>
      </header>

      {/* メインセクション */}
      <div className="relative flex-1">
        {/* 背景画像 */}
        <img
          src="https://via.placeholder.com/1920x1080"
          alt="Nurse working"
          className="w-full h-full object-cover"
        />

        {/* コンテンツセクション */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center bg-blue-300 bg-opacity-50">
          <h2 className="text-5xl font-bold text-white mb-6">看護師のための技術共有プラットフォーム</h2>
          <p className="text-lg text-gray-200 mb-8">
            看護師が学んだ知識や技術を共有し、レビューし合い、スキルを高め合うための場所です。
          </p>
          <Link
            to="/login"
            className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
          >
            ログインして始める
          </Link>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-blue-200 text-white py-6"> {/* フッターも淡い青に */}
        <div className="container mx-auto text-center">
          <p>&copy; 2024 NurseCareShift. All rights reserved.</p>
          <nav className="mt-4">
            <Link to="/about" className="text-blue-500 hover:text-blue-700">
              このプラットフォームについて
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Home;
