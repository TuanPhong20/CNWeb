import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import '../styles/QuizPage.css';

interface Topic {
  id: number;
  title: string;
  description: string;
  userId: number;
  createdAt: string;
}

const QuizPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/topics');
        
        if (!response.ok) {
          throw new Error('Không thể tải danh sách chủ đề');
        }
        
        const data = await response.json();
        setTopics(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
        setLoading(false);
      }
    };
    
    fetchTopics();
  }, []);

  const handleTopicClick = (topicId: number) => {
    navigate(`/quiz/topic/${topicId}`);
  };

  return (
    <div className="quiz-page">
      <Header />
      <main className="quiz-main">
        <div className="container">
          <div className="quiz-header">
            <h1>Trắc nghiệm từ vựng</h1>
            <p className="quiz-description">
              Hãy chọn một chủ đề để bắt đầu làm bài trắc nghiệm và kiểm tra kiến thức từ vựng của bạn.
            </p>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải danh sách chủ đề...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          ) : (
            <div className="topics-grid">
              {topics.length > 0 ? (
                topics.map(topic => (
                  <div 
                    key={topic.id} 
                    className="topic-card"
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <div className="topic-card-content">
                      <h3>{topic.title}</h3>
                      <p>{topic.description || 'Không có mô tả'}</p>
                    </div>
                    <div className="topic-card-footer">
                      <span className="quiz-badge">Trắc nghiệm</span>
                      <span className="arrow-icon">→</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-topics">
                  <p>Không có chủ đề nào. Vui lòng thử lại sau.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuizPage; 