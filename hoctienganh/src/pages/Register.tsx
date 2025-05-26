import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Registration from '../components/Registration';
import Footer from '../components/Footer';
import '../styles/Register.css';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleRegistrationSuccess = () => {
    // Chuyển hướng đến trang chủ sau khi đăng ký thành công
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="register-page">
      <Header />
      <main className="register-main">
        <Registration 
          onSuccess={handleRegistrationSuccess}
          onCancel={handleCancel}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Register; 