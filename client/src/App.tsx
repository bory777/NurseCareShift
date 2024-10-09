import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostArticle from './pages/PostArticle';
import UnderstoodArticles from './pages/UnderstoodArticles';
import ReviewArticles from './pages/ReviewArticles';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthContext';
import Navbar from './components/Navbar';
import PreviewPage from './pages/PreviewPage';
import SuccessPage from './pages/SuccessPage';
import RegistrationPage from './pages/RegistrationPage';
import ArticleList from './pages/ArticleListPage';

const App: React.FC = () => {
  return (
    <Router>
      {/* AuthProviderをRouter内に移動 */}
      <AuthProvider>
        <div>
          {/* ナビゲーションバーを全ページで表示 */}
          <Navbar />
          <Routes>
            {/* ホームページとログイン・登録ページ */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/success" element={<SuccessPage />} />

            {/* 認証が必要なルート (ProtectedRoute) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/understood-articles" element={<UnderstoodArticles />} />
              <Route path="/review-articles" element={<ReviewArticles />} />
              <Route path="/post-article" element={<PostArticle />} />
              <Route path="/preview" element={<PreviewPage />} />
              <Route path="/article-list" element={<ArticleList />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
