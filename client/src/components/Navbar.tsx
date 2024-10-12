// components/Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/">ホーム</Link>
      {user ? (
        <div className="navbar-right">
          <div className="dropdown">
            <img
              src={user.profileImage || '/default-avatar.png'}
              alt="Profile"
              className="profile-image"
              onClick={() => setMenuOpen(!menuOpen)}
            />
            {menuOpen && (
              <div className="dropdown-menu">
                <Link to="/account/profile-edit" onClick={() => setMenuOpen(false)}>
                  プロフィール編集
                </Link>
                <Link to="/account/change-email" onClick={() => setMenuOpen(false)}>
                  メールアドレスの変更
                </Link>
                <Link to="/account/change-password" onClick={() => setMenuOpen(false)}>
                  パスワードの変更
                </Link>
                <Link to="/account/notification-settings" onClick={() => setMenuOpen(false)}>
                  通知設定
                </Link>
                <Link to="/account/privacy-settings" onClick={() => setMenuOpen(false)}>
                  プライバシー設定
                </Link>
                <Link to="/account/social-accounts" onClick={() => setMenuOpen(false)}>
                  ソーシャルアカウント連携
                </Link>
                <Link to="/account/browsing-history" onClick={() => setMenuOpen(false)}>
                  閲覧履歴の管理
                </Link>
                <Link to="/account/activity-log" onClick={() => setMenuOpen(false)}>
                  活動ログ
                </Link>
                <Link to="/account/delete-account" onClick={() => setMenuOpen(false)}>
                  アカウント削除
                </Link>
                <button onClick={handleLogout}>ログアウト</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="navbar-right">
          <Link to="/login">ログイン</Link>
          <Link to="/register">登録</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
