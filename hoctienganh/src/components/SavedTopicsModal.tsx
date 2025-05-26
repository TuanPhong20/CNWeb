import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/SavedTopicsModal.css';

interface Topic {
  id: number;
  title: string;
  description: string;
}

interface SavedTopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SavedTopicsModal: React.FC<SavedTopicsModalProps> = ({ isOpen, onClose }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);
  const { token, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const fetchUserTopics = useCallback(async () => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDebug(null);
      
      console.log('Fetching user topics...');
      
      // Lấy tất cả chủ đề từ API
      const response = await fetch('http://localhost:3000/api/topics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const responseStatus = response.status;
      let responseText;
      try {
        responseText = await response.text();
        console.log('Response text:', responseText);
        setDebug(responseText);
      } catch (textError) {
        console.error('Error getting response text:', textError);
      }

      if (!response.ok) {
        throw new Error(`Không thể tải danh sách chủ đề. Status: ${responseStatus}, Response: ${responseText || 'No response text'}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed data:', data);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error(`Lỗi định dạng dữ liệu: ${parseError.message}`);
      }
      
      // Lọc chỉ lấy chủ đề của người dùng hiện tại
      const userTopics = Array.isArray(data) 
        ? data.filter((topic: any) => {
            const topicUserId = topic.UserID || topic.userId;
            return topicUserId === user?.userId;
          }).map((topic: any) => ({
            id: topic.TopicID || topic.id,
            title: topic.Title || topic.title,
            description: topic.Description || topic.description
          }))
        : [];

      setTopics(userTopics);
    } catch (err) {
      console.error('Error fetching user topics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, navigate, user]);

  useEffect(() => {
    if (!isOpen) return;
    fetchUserTopics();
  }, [isOpen, fetchUserTopics]);

  const handleTopicClick = (topicId: number) => {
    navigate(`/listening-writing/${topicId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="saved-topics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chủ đề của tôi</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Đang tải danh sách chủ đề...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              {debug && (
                <div className="debug-info">
                  <pre>{debug}</pre>
                </div>
              )}
              <button onClick={fetchUserTopics}>Thử lại</button>
            </div>
          ) : topics.length > 0 ? (
            <div className="saved-topics-list">
              {topics.map(topic => (
                <div 
                  key={topic.id} 
                  className="saved-topic-item"
                  onClick={() => handleTopicClick(topic.id)}
                >
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-topics-message">
              <p>Bạn chưa có chủ đề nào. Hãy tạo chủ đề mới để bắt đầu!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedTopicsModal; 