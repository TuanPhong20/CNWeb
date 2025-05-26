import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

interface LoginProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onCancel }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear API error when user types anything
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setApiError('');
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
      
      // Đăng nhập thành công
      setSuccess(true);
      
      // Lưu thông tin đăng nhập vào AuthContext
      login(data.token, data.user);
      
      // Gọi callback nếu có
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2>Đăng Nhập</h2>
        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>Đăng nhập thành công!</p>
            <p>Bạn đang được chuyển hướng...</p>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            {apiError && <div className="error-message">{apiError}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập địa chỉ email của bạn"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu của bạn"
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            
            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Nhớ tài khoản</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">Quên mật khẩu?</Link>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={onCancel}
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="login-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner">
                    <span className="spinner"></span>
                    Đang xử lý...
                  </span>
                ) : 'Đăng nhập'}
              </button>
            </div>
            
            <div className="register-link">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login; 