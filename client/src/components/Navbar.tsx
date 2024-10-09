import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LogoutButton from './LogoutButton';

const Navbar: React.FC = () => {
  const { token } = useAuth(); // ログイン状態を取得

  return (
    <nav className="bg-blue-100 p-4 text-blue-500">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <Link to="/" className="text-blue-600 font-bold text-3xl">
            NurseCareShift
          </Link>
        </div>
        <div>
          {token ? (
            <>
              <Link to="/dashboard" className="ml-4 hover:bg-white py-2 px-5 font-bold rounded">
                ダッシュボード
              </Link>
              <Link to="/post-article" className="ml-4 hover:bg-white py-2 px-5 font-bold rounded">
                記事投稿
              </Link>
              <Link to="/article-list" className="ml-4 hover:bg-white py-2 px-5 font-bold rounded">
                記事一覧
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link to="/login" className="ml-4 hover:underline">
              ログイン
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
