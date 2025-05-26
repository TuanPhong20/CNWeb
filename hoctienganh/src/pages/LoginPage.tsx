import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Login from '../components/Login';
import Footer from '../components/Footer';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="login-page">
      <Header />
      <main className="login-main">
        <Login 
          onSuccess={handleLoginSuccess}
          onCancel={handleCancel}
        />
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage; 