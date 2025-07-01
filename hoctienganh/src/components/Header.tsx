import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SavedTopicsModal from './SavedTopicsModal';
import UserTopicsModal from './UserTopicsModal';
import '../styles/Header.css';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSavedTopicsModal, setShowSavedTopicsModal] = useState(false);
  const [showUserTopicsModal, setShowUserTopicsModal] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    // Đóng menu người dùng
    setShowUserMenu(false);
    // Chuyển hướng về trang chủ (không cần điều hướng vì App sẽ tự động làm điều đó)
  };

  const handleListeningWritingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowUserTopicsModal(true);
  };

  const handleSavedTopicsClick = () => {
    setShowSavedTopicsModal(true);
    setShowUserMenu(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <h1>HocTiengAnh</h1>
        </div>
        <nav className="nav">
          <ul>
            <li><Link to="/" className={isActive('/')}>Trang chủ</Link></li>
            <li><Link to="/flashcard" className={isActive('/flashcard')}>FlashCard</Link></li>
            <li><Link to="/quiz" className={isActive('/quiz')}>Trắc nghiệm</Link></li>
            <li>
              <a 
                href="#" 
                className={isActive('/listening-writing')}
                onClick={handleListeningWritingClick}
              >
                Nghe - Viết
              </a>
            </li>
          </ul>
        </nav>
        <div className="auth-buttons">
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button 
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-name">{user?.displayName}</span>
                <span className="user-icon">👤</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <ul>
                    <li><Link to="/profile">Tài khoản của tôi</Link></li>
                    <li><Link to="/my-topics">Danh sách các chủ đề của tôi</Link></li>
                    <li><button onClick={handleLogout}>Đăng xuất</button></li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"><button className="login-btn">Đăng nhập</button></Link>
              <Link to="/register"><button className="signup-btn">Đăng ký</button></Link>
            </>
          )}
        </div>
      </div>

      {/* Modal hiển thị các chủ đề của người dùng */}
      <UserTopicsModal 
        isOpen={showUserTopicsModal}
        onClose={() => setShowUserTopicsModal(false)}
      />

      {/* Modal hiển thị các chủ đề đã lưu */}
      <SavedTopicsModal 
        isOpen={showSavedTopicsModal}
        onClose={() => setShowSavedTopicsModal(false)}
      />
    </header>
  );
};

export default Header; 