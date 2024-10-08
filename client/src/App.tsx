import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostArticle from './pages/PostArticle'; // 新しい記事投稿ページ
import UnderstoodArticles from './pages/UnderstoodArticles'; // 理解した記事ページ
import ReviewArticles from './pages/ReviewArticles'; // 復習したい記事ページ
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthContext';
import Navbar from './components/Navbar';
import PreviewPage from './pages/PreviewPage';
import SuccessPage from './pages/SuccessPage'; // 登録完了ページ
import RegistrationPage from './pages/RegistrationPage'; // 登録ページ

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          {/* ナビゲーションバーを全ページで表示 */}
          <Navbar />
          <Routes>
            {/* ホームページとログイン・登録ページ */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegistrationPage />} /> {/* 新規登録ページ */}
            <Route path="/complete" element={<SuccessPage />} /> {/* 登録完了ページ */}

            {/* 認証が必要なルート (ProtectedRoute) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} /> {/* ダッシュボード */}
              <Route path="/understood-articles" element={<UnderstoodArticles />} /> {/* 理解した記事 */}
              <Route path="/review-articles" element={<ReviewArticles />} /> {/* 復習したい記事 */}
              <Route path="/post-article" element={<PostArticle />} /> {/* 記事投稿 */}
              <Route path="/preview" element={<PreviewPage />} /> {/* プレビュー用ルート */}
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
