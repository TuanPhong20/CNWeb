import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Hero.css';

const Hero: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h2>Học tiếng Anh mọi lúc, mọi nơi</h2>
          <p>
            Khám phá phương pháp học tiếng Anh hiệu quả với hơn 10,000+ bài học,
            từ vựng và bài tập đa dạng.
          </p>
          <div className="cta-buttons">
            {isAuthenticated ? (
              <>
                <Link to="/my-topics">
                  <button className="primary-btn">Tiếp tục học</button>
                </Link>
                <Link to="/quiz">
                  <button className="secondary-btn">Làm bài trắc nghiệm</button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <button className="primary-btn">Bắt đầu học ngay</button>
                </Link>
                <Link to="/login">
                  <button className="secondary-btn">Đăng nhập</button>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          {/* Placeholder for image */}
          <div className="image-placeholder">
            <img src="/images/learning-illustration.svg" alt="Học tiếng Anh" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 