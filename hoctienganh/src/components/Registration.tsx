import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Registration.css';

interface RegistrationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onSuccess, onCancel }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate display name
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Vui lòng nhập tên hiển thị';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu nhập lại không khớp';
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
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }
      
      // Đăng ký thành công
      setSuccess(true);
      
      // Lưu thông tin đăng nhập vào AuthContext
      login(data.token, { userId: data.userId, email: formData.email, displayName: formData.displayName });
      
      // Gọi callback nếu có
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-form-wrapper">
        <h2>Đăng Ký Tài Khoản</h2>
        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>Đăng ký tài khoản thành công!</p>
            <p>Bạn đang được chuyển hướng...</p>
          </div>
        ) : (
          <form className="registration-form" onSubmit={handleSubmit}>
            {apiError && <div className="error-message">{apiError}</div>}
            
            <div className="form-group">
              <label htmlFor="displayName">Tên hiển thị</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Nhập tên hiển thị của bạn"
                className={errors.displayName ? 'input-error' : ''}
              />
              {errors.displayName && <span className="error">{errors.displayName}</span>}
            </div>
            
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
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
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
                className="register-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner">
                    <span className="spinner"></span>
                    Đang xử lý...
                  </span>
                ) : 'Đăng ký'}
              </button>
            </div>
            
            <div className="login-link">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Registration; 