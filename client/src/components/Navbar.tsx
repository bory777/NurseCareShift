import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext'; // AuthContextを使用

const Navbar: React.FC = () => {
  const { token, logout } = useAuth(); // ログイン状態とログアウト関数を取得

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <Link to="/" className="text-white font-bold text-lg">
            NurseCareShift
          </Link>
        </div>
        <div>
          <Link to="/" className="ml-4 hover:underline">
            ホーム
          </Link>
          {!token ? (
            <Link to="/login" className="ml-4 hover:underline">
              ログイン
            </Link>
          ) : (
            <>
              <Link to="/dashboard" className="ml-4 hover:underline">
                ダッシュボード
              </Link>
              <button onClick={logout} className="ml-4 hover:underline">
                ログアウト
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
