import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthContext';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          {/* ナビゲーションバーを全ページで表示 */}
          <Navbar />
          <Routes>
            {/* ホームページとログインページ */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* 認証が必要なルート (ProtectedRoute) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
