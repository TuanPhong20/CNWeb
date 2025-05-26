import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TopicWordsModal from '../components/TopicWordsModal';
import { useAuth } from '../contexts/AuthContext';
import '../styles/MyTopicsPage.css';

interface Topic {
  id: number;
  title: string;
  description: string;
  userId: number;
  createdAt: string;
}

const MyTopicsPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showTopicWordsModal, setShowTopicWordsModal] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-topics' } });
      return;
    }

    const fetchUserTopics = async () => {
      try {
        setLoading(true);
        
        // URL API cho chủ đề của người dùng
        let apiUrl = 'http://localhost:3000/api/topics';
        
        // Có hai cách để lấy chủ đề của người dùng:
        // 1. Lấy chủ đề được tạo bởi người dùng (userId)
        // 2. Lấy chủ đề đã lưu bởi người dùng (saved topics)
        
        // Sử dụng API để lấy các chủ đề do người dùng tạo
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Không thể tải danh sách chủ đề');
        }
        
        const allTopics = await response.json();
        
        // Lọc các chủ đề chỉ của người dùng hiện tại
        const userTopics = Array.isArray(allTopics) 
          ? allTopics.filter((topic: any) => {
              const topicUserId = topic.UserID || topic.userId;
              return topicUserId === user?.userId;
            }).map((topic: any) => ({
              id: topic.TopicID || topic.id,
              title: topic.Title || topic.title,
              description: topic.Description || topic.description,
              userId: topic.UserID || topic.userId,
              createdAt: topic.CreatedAt || topic.createdAt
            }))
          : [];
        
        // Đặt danh sách topic
        setTopics(userTopics);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    fetchUserTopics();
  }, [isAuthenticated, token, user, navigate]);

  const handleCreateTopic = () => {
    navigate('/create-topic');
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowTopicWordsModal(true);
  };

  const handleViewTopicDetails = (topicId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/listening-writing/${topicId}`);
  };

  const handleCloseModal = () => {
    setShowTopicWordsModal(false);
    setSelectedTopic(null);
  };

  const handleDeleteTopic = async (topicId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài (không mở topic)
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa chủ đề này không? Tất cả từ vựng trong chủ đề này cũng sẽ bị xóa.')) {
      return;
    }
    
    try {
      setDeletingTopicId(topicId);
      setDeleteError(null);
      
      const response = await fetch(`http://localhost:3000/api/topics/${topicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể xóa chủ đề. Vui lòng thử lại sau.');
      }
      
      // Xóa thành công, cập nhật lại danh sách
      setTopics(prevTopics => prevTopics.filter(topic => topic.id !== topicId));
      setDeleteSuccess(true);
      
      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error deleting topic:', err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa chủ đề';
      setDeleteError(errorMessage);
    } finally {
      setDeletingTopicId(null);
    }
  };

  return (
    <div className="my-topics-page">
      <Header />
      <main className="my-topics-main">
        <div className="container">
          <h1 className="page-title">Danh sách các chủ đề của tôi</h1>
          <p className="page-description">
            Quản lý và luyện tập với các chủ đề bạn đã tạo
          </p>
          
          <div className="add-topic-container">
            <button className="add-topic-btn" onClick={handleCreateTopic}>
              <span className="add-icon">+</span> Thêm chủ đề mới
            </button>
          </div>

          {deleteSuccess && (
            <div className="success-message">
              <p>Đã xóa chủ đề thành công!</p>
            </div>
          )}
          
          {deleteError && (
            <div className="error-message">
              <p>{deleteError}</p>
              <button onClick={() => setDeleteError(null)}>Đóng</button>
            </div>
          )}
          
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
          ) : topics.length > 0 ? (
            <div className="topics-grid">
              {topics.map(topic => (
                <div 
                  key={topic.id} 
                  className="topic-card"
                  onClick={() => handleTopicClick(topic)}
                >
                  <h2 className="topic-title">{topic.title}</h2>
                  <p className="topic-description">{topic.description}</p>
                  <div className="topic-actions">
                    <button 
                      className="add-word-btn-small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTopicClick(topic);
                      }}
                    >
                      Quản lý từ vựng
                    </button>
                    <button 
                      className="delete-topic-btn"
                      onClick={(e) => handleDeleteTopic(topic.id, e)}
                      disabled={deletingTopicId === topic.id}
                    >
                      {deletingTopicId === topic.id ? (
                        <span className="spinner-small"></span>
                      ) : (
                        <span className="delete-icon">🗑️</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-topics-message">
              <p>Bạn chưa có chủ đề nào. Hãy thêm chủ đề mới để bắt đầu!</p>
            </div>
          )}
        </div>
      </main>
      
      {selectedTopic && (
        <TopicWordsModal 
          isOpen={showTopicWordsModal}
          onClose={handleCloseModal}
          topicId={selectedTopic.id}
          topicTitle={selectedTopic.title}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default MyTopicsPage; 