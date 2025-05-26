import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import '../styles/TopicDetailPage.css';

interface Topic {
  id: number;
  title: string;
  description: string;
  userId: number;
  createdAt: string;
}

interface Word {
  id: number;
  wordText: string;
  meaning: string;
  pronunciation: string;
  audioUrl?: string;
  example?: string;
}

interface Result {
  wordId: number;
  isCorrect: boolean;
}

const TopicDetailPage: React.FC = () => {
  const { topicId } = useParams<{topicId: string}>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [checkResult, setCheckResult] = useState<'correct' | 'incorrect' | null>(null);
  const [volume, setVolume] = useState(80);
  const [results, setResults] = useState<Result[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchTopicDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch topic details
        const topicResponse = await fetch(`http://localhost:3000/api/topics/${topicId}`);
        if (!topicResponse.ok) {
          throw new Error('Không thể tải thông tin chủ đề');
        }
        const topicData = await topicResponse.json();
        console.log('Topic data loaded:', topicData);
        console.log('Topic structure:', Object.keys(topicData));
        
        // Tạm thời bỏ qua type check
        setTopic(topicData);
        
        // Fetch words associated with this topic
        const wordsResponse = await fetch(`http://localhost:3000/api/topic-words/topic/${topicId}/words`);
        if (wordsResponse.ok) {
          const wordsData = await wordsResponse.json();
          
          // Định dạng lại dữ liệu để đảm bảo có đúng tên trường
          const formattedWords = Array.isArray(wordsData) 
            ? wordsData.map((word: any) => ({
                id: word.WordID || word.id,
                wordText: word.English || word.wordText || word.englishText,
                meaning: word.Meaning || word.meaning || word.vietnameseText,
                pronunciation: word.Phonetic || word.pronunciation || '',
                audioUrl: word.AudioURL || word.audioUrl || '',
                example: word.Example || word.example || ''
              }))
            : [];
          
          setWords(formattedWords);
          console.log('Loaded words:', formattedWords);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
        setLoading(false);
      }
    };
    
    if (topicId) {
      fetchTopicDetails();
    }
  }, [topicId]);

  // Phát audio tự động khi chuyển sang từ mới
  useEffect(() => {
    if (words.length > 0 && !loading) {
      playAudio();
    }
  }, [currentWordIndex, words, loading]);

  const handleBack = () => {
    navigate('/my-topics');
  };

  const playAudio = () => {
    const currentWord = words[currentWordIndex];
    if (currentWord?.audioUrl && audioRef.current) {
      console.log('Playing audio:', currentWord.audioUrl);
      try {
        audioRef.current.src = currentWord.audioUrl;
        audioRef.current.volume = volume / 100;
        
        // Đảm bảo promise của phương thức play() được xử lý
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio played successfully');
            })
            .catch(error => {
              console.error('Error playing audio:', error);
              // Trong trường hợp autoplay bị chặn, hiển thị thông báo cho người dùng
              alert('Vui lòng nhấn nút phát để nghe âm thanh');
            });
        }
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    } else {
      console.log('No audio URL found for current word or audio reference not available');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setUserInput('');
      setCheckResult(null);
    }
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
      setUserInput('');
      setCheckResult(null);
    }
  };

  const checkAnswer = () => {
    const currentWord = words[currentWordIndex];
    const isCorrect = userInput.trim().toLowerCase() === currentWord.wordText.toLowerCase();
    
    // Lưu kết quả
    const newResult = {
      wordId: currentWord.id,
      isCorrect: isCorrect
    };
    
    // Kiểm tra xem kết quả đã tồn tại chưa
    const existingResultIndex = results.findIndex(r => r.wordId === currentWord.id);
    
    if (existingResultIndex >= 0) {
      // Cập nhật kết quả nếu đã tồn tại
      const updatedResults = [...results];
      updatedResults[existingResultIndex] = newResult;
      setResults(updatedResults);
    } else {
      // Thêm kết quả mới
      setResults([...results, newResult]);
    }
    
    if (isCorrect) {
      setCheckResult('correct');
    } else {
      setCheckResult('incorrect');
    }
  };

  const handleComplete = () => {
    setShowSummary(true);
  };

  const getCorrectCount = () => {
    return results.filter(r => r.isCorrect).length;
  };

  const handleRetry = () => {
    setCurrentWordIndex(0);
    setUserInput('');
    setCheckResult(null);
    setShowSummary(false);
    // Có thể reset kết quả nếu muốn
    // setResults([]);
  };

  const getCurrentWord = () => {
    return words.length > 0 ? words[currentWordIndex] : null;
  };

  const getTopicTitle = () => {
    if (!topic) return 'Đang tải...';
    
    // Ép kiểu để truy cập các thuộc tính không được khai báo
    const anyTopic = topic as any;
    
    // Thử các trường có thể chứa tên chủ đề
    if (topic.title) return topic.title;
    if (anyTopic.Title) return anyTopic.Title;
    if (anyTopic.name) return anyTopic.name;
    if (anyTopic.Name) return anyTopic.Name;
    
    return 'Chủ đề không xác định';
  };

  return (
    <div className="topic-detail-page">
      <Header />
      <main className="topic-detail-main">
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải thông tin chủ đề...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          ) : topic && words.length > 0 ? (
            <div className="listening-writing-container">
              {showSummary ? (
                <div className="summary-card">
                  <h2 className="summary-title">Kết quả luyện tập</h2>
                  <div className="topic-name">{getTopicTitle()}</div>
                  
                  <div className="score-display">
                    <div className="score-circle">
                      <span className="score-number">{getCorrectCount()}</span>
                      <span className="score-total">/{words.length}</span>
                    </div>
                    <div className="score-text">Số từ vựng đúng</div>
                  </div>
                  
                  <div className="summary-message">
                    {getCorrectCount() === words.length ? (
                      <p className="perfect-score">Xuất sắc! Bạn đã hoàn thành tất cả các từ vựng.</p>
                    ) : getCorrectCount() >= words.length * 0.7 ? (
                      <p className="good-score">Tốt lắm! Bạn đã hoàn thành phần lớn các từ vựng.</p>
                    ) : (
                      <p className="average-score">Hãy tiếp tục luyện tập để cải thiện kỹ năng của bạn.</p>
                    )}
                  </div>
                  
                  <div className="summary-actions">
                    <button className="retry-btn" onClick={handleRetry}>Luyện tập lại</button>
                    <button className="back-btn" onClick={handleBack}>Quay lại chủ đề</button>
                  </div>
                </div>
              ) : (
                <div className="listening-writing-practice">
                  <div className="listening-writing-card">
                    <div className="vocabulary-category">
                      <span className="category-name">
                        {getTopicTitle()}
                      </span>
                    </div>
                    
                    <div className="audio-section">
                      <div className="audio-controls">
                        <button className="play-btn" onClick={playAudio}>
                          <span className="audio-icon">🔊</span>
                        </button>
                        <input 
                          type="range" 
                          className="volume-slider" 
                          min="0" 
                          max="100" 
                          value={volume}
                          onChange={handleVolumeChange}
                        />
                        <button className="replay-btn" onClick={playAudio} title="Nghe lại">
                          <span>🔄</span>
                        </button>
                      </div>
                      <p className="instruction-text">Viết lại từ vừa nghe</p>
                    </div>
                    
                    <div className="input-section">
                      <input 
                        type="text" 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Nhập từ bạn vừa nghe"
                        className={`answer-input ${
                          checkResult === 'correct' ? 'correct' : 
                          checkResult === 'incorrect' ? 'incorrect' : ''
                        }`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            checkAnswer();
                          }
                        }}
                      />
                      <button className="confirm-btn" onClick={checkAnswer}>
                        Xác nhận
                      </button>
                    </div>
                    
                    {checkResult === 'correct' && (
                      <div className="result-message correct">
                        <p>Chính xác! Từ này là: {getCurrentWord()?.wordText}</p>
                        <p>Nghĩa: {getCurrentWord()?.meaning}</p>
                      </div>
                    )}
                    
                    {checkResult === 'incorrect' && (
                      <div className="result-message incorrect">
                        <p>Chưa chính xác. Hãy nghe và thử lại.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="navigation-controls">
                    <button 
                      className="nav-btn prev-btn" 
                      onClick={handlePrevious}
                      disabled={currentWordIndex === 0}
                    >
                      <i className="nav-icon">←</i>
                    </button>
                    <span className="progress-text">
                      {currentWordIndex + 1}/{words.length}
                    </span>
                    {currentWordIndex === words.length - 1 ? (
                      <button 
                        className="nav-btn complete-btn"
                        onClick={handleComplete}
                      >
                        <i className="nav-icon">✓</i>
                      </button>
                    ) : (
                      <button 
                        className="nav-btn next-btn"
                        onClick={handleNext}
                        disabled={currentWordIndex === words.length - 1}
                      >
                        <i className="nav-icon">→</i>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="not-found">
              <h2>Không tìm thấy chủ đề</h2>
              <p>Chủ đề này chưa có từ vựng nào hoặc không tồn tại.</p>
              <button onClick={handleBack}>Quay lại danh sách chủ đề</button>
            </div>
          )}
        </div>
      </main>
      <audio ref={audioRef} />
      <Footer />
    </div>
  );
};

export default TopicDetailPage; 