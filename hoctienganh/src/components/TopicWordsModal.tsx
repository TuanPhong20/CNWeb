import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/TopicWordsModal.css';

interface Word {
  id: number;
  wordText: string;
  meaning: string;
  pronunciation: string;
  audioUrl?: string;
  example?: string;
}

interface TopicWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: number;
  topicTitle: string;
}

const TopicWordsModal: React.FC<TopicWordsModalProps> = ({ isOpen, onClose, topicId, topicTitle }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingWord, setAddingWord] = useState(false);
  const [englishText, setEnglishText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [addWordError, setAddWordError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deletingWordId, setDeletingWordId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchTopicWords();
    }
  }, [isOpen, topicId]);

  const fetchTopicWords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3000/api/topic-words/topic/${topicId}/words`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách từ vựng');
      }
      
      const data = await response.json();
      const formattedWords = Array.isArray(data) 
        ? data.map((word: any) => ({
            id: word.WordID || word.id,
            wordText: word.English || word.wordText || word.englishText,
            meaning: word.Meaning || word.meaning || word.vietnameseText,
            pronunciation: word.Phonetic || word.pronunciation,
            audioUrl: word.AudioURL || word.audioUrl,
            example: word.Example || word.example
          }))
        : [];
      
      setWords(formattedWords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!englishText.trim()) {
      setAddWordError('Vui lòng nhập từ tiếng Anh');
      return;
    }

    try {
      setAddingWord(true);
      setAddWordError(null);
      
      const response = await fetch('http://localhost:3000/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          englishText: englishText.trim(),
          topicId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đã xảy ra lỗi khi thêm từ');
      }

      // Successfully added word
      setSuccess(true);
      setEnglishText('');
      
      // Refresh the list of words
      fetchTopicWords();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setAddWordError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setAddingWord(false);
    }
  };

  const handleDeleteWord = async (wordId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa từ vựng này không?')) {
      return;
    }
    
    try {
      setDeletingWordId(wordId);
      setDeleteError(null);
      
      const response = await fetch(`http://localhost:3000/api/words/${wordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể xóa từ vựng. Vui lòng thử lại sau.');
      }
      
      // Xóa thành công, cập nhật lại danh sách
      setWords(prevWords => prevWords.filter(word => word.id !== wordId));
      setDeleteSuccess(true);
      
      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error deleting word:', err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa từ vựng';
      setDeleteError(errorMessage);
    } finally {
      setDeletingWordId(null);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="topic-words-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Danh sách từ vựng</h2>
          <p className="topic-title-text">Chủ đề: {topicTitle}</p>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải danh sách từ vựng...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchTopicWords}>Thử lại</button>
            </div>
          ) : (
            <>
              {deleteSuccess && (
                <div className="success-message">
                  <p>Đã xóa từ vựng thành công!</p>
                </div>
              )}
              
              {deleteError && (
                <div className="error-message">
                  <p>{deleteError}</p>
                  <button onClick={() => setDeleteError(null)}>Đóng</button>
                </div>
              )}
            
              <div className="words-list">
                {words.length > 0 ? (
                  words.map(word => (
                    <div key={word.id} className="word-card">
                      <div className="word-info">
                        <h3 className="word-text">{word.wordText}</h3>
                        <p className="word-pronunciation">{word.pronunciation}</p>
                        <p className="word-meaning">{word.meaning}</p>
                        {word.example && (
                          <p className="word-example">
                            <strong>Ví dụ:</strong> {word.example}
                          </p>
                        )}
                      </div>
                      <div className="word-actions">
                        {word.audioUrl && (
                          <button 
                            className="audio-btn"
                            onClick={() => playAudio(word.audioUrl || '')}
                          >
                            <span className="audio-icon">🔊</span>
                          </button>
                        )}
                        <button 
                          className="delete-word-btn"
                          onClick={() => handleDeleteWord(word.id)}
                          disabled={deletingWordId === word.id}
                        >
                          {deletingWordId === word.id ? (
                            <span className="spinner-small"></span>
                          ) : (
                            <span className="delete-icon">🗑️</span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-words-message">
                    <p>Chưa có từ vựng nào trong chủ đề này.</p>
                  </div>
                )}
              </div>

              <div className="add-word-section">
                <h3>Thêm từ vựng mới</h3>
                <form onSubmit={handleAddWord}>
                  <div className="form-group">
                    <label htmlFor="englishText">Từ tiếng Anh:</label>
                    <input
                      type="text"
                      id="englishText"
                      value={englishText}
                      onChange={(e) => setEnglishText(e.target.value)}
                      placeholder="Nhập từ tiếng Anh cần thêm"
                      disabled={addingWord}
                    />
                    <p className="form-helper">
                      Hệ thống sẽ tự động lấy nghĩa, phát âm và ví dụ cho từ vựng này.
                    </p>
                  </div>
                  
                  {addWordError && (
                    <div className="error-message">
                      <p>{addWordError}</p>
                    </div>
                  )}
                  
                  {success && (
                    <div className="success-message">
                      <p>Đã thêm từ vựng thành công!</p>
                    </div>
                  )}
                  
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="add-word-btn"
                      disabled={addingWord}
                    >
                      {addingWord ? (
                        <>
                          <span className="spinner-small"></span>
                          Đang xử lý...
                        </>
                      ) : 'Thêm từ vựng'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicWordsModal; 