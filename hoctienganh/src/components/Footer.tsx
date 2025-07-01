import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>HocTiengAnh</h3>
            <p>Nền tảng học tiếng Anh trực tuyến hàng đầu Việt Nam.</p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">Facebook</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">Youtube</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">Instagram</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Liên kết</h3>
            <ul>
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/vocabulary">Từ vựng</Link></li>
              <li><Link to="/grammar">Ngữ pháp</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Hỗ trợ</h3>
            <ul>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
              <li><Link to="/privacy">Chính sách bảo mật</Link></li>
              <li><Link to="/terms">Điều khoản sử dụng</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Liên hệ</h3>
            <p>Email: info@hoctienganh.com</p>
            <p>Hotline: 0123 456 789</p>
            <p>Địa chỉ: Quy Nhơn, Việt Nam</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} HocTiengAnh. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 