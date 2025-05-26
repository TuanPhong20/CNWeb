import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import '../styles/CreateTopicPage.css';

const CreateTopicPage: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề chủ đề';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
    }

    if (!description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả chủ đề';
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
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể tạo chủ đề mới');
      }

      // Redirect to topics page after successful creation
      navigate('/my-topics');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/my-topics');
  };

  return (
    <div className="create-topic-page">
      <Header />
      <main className="create-topic-main">
        <div className="container">
          <div className="create-topic-container">
            <h1 className="page-title">Tạo chủ đề mới</h1>
            
            <form className="create-topic-form" onSubmit={handleSubmit}>
              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="title">Tiêu đề</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề chủ đề"
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả chi tiết về chủ đề này"
                  rows={5}
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-small"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    'Tạo chủ đề'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateTopicPage; 