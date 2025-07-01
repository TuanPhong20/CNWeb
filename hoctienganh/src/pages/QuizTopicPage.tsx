import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/QuizPage.css';
import { useAuth } from '../contexts/AuthContext';

// Sound effects
const CORRECT_SOUND = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b3cfa.mp3';
const INCORRECT_SOUND = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b3cfa.mp3';

interface QuizOption {
  optionId: number;
  optionText: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  questionId: number;
  topicId: number;
  questionText: string;
  questionType: string;
  createdAt: string;
  options: QuizOption[];
}

interface UserAnswer {
  questionId: number;
  selectedOptionId: number | null;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  averageTime: number;
  accuracy: number;
  timeSpent: number;
}

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

const TIME_PER_QUESTION = 15; // Giảm thời gian còn 15 giây

function extractAudioUrlAndText(questionText: string) {
  const audioMatch = questionText.match(/<audio\s+src=["']([^"']+)["'][^>]*><\/audio>/);
  const audioUrl = audioMatch ? audioMatch[1] : null;
  const cleanText = questionText.replace(/<audio\s+src=["'][^"']+["'][^>]*><\/audio>/, '').trim();
  return { audioUrl, cleanText };
}

const QuizTopicPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [animate, setAnimate] = useState<'none' | 'fade' | 'shake' | 'bounce'>('none');
  const [showConfetti, setShowConfetti] = useState(false);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/api/quiz-questions/topic/${topicId}/options`);
        if (!res.ok) throw new Error('Không thể tải câu hỏi');
        let data: QuizQuestion[] = await res.json();
        data = shuffleArray(data).map(q => ({ ...q, options: shuffleArray(q.options) }));
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
        setLoading(false);
      }
    };
    if (topicId) fetchQuestions();
  }, [topicId]);

  // Timer effect
  useEffect(() => {
    if (loading || showResult) return;
    
    setQuestionStartTime(Date.now());
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleNextAuto();
          return TIME_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, showResult, current]);

  // Animation effects
  useEffect(() => {
    setAnimate('fade');
    const timeout = setTimeout(() => setAnimate('none'), 400);
    return () => clearTimeout(timeout);
  }, [current]);

  useEffect(() => {
    setTimeLeft(TIME_PER_QUESTION);
  }, [current]);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [token, isAuthenticated, navigate]);

  const playSound = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {}); // Ignore audio errors
    }
  };

  const handleSelect = (optionId: number) => {
    if (selected !== null) return; // Prevent multiple selections
    setSelected(optionId);
  };

  const calculateStats = (): QuizStats => {
    const totalQuestions = questions.length;
    const correctAnswers = userAnswers.filter(ans => ans.isCorrect).length;
    const incorrectAnswers = userAnswers.filter(ans => !ans.isCorrect && ans.selectedOptionId !== null).length;
    const skippedQuestions = userAnswers.filter(ans => ans.selectedOptionId === null).length;
    const totalTime = userAnswers.reduce((sum, ans) => sum + ans.timeSpent, 0);
    const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      averageTime,
      accuracy,
      timeSpent: totalTime
    };
  };

  const handleNext = () => {
    const timeSpent = TIME_PER_QUESTION - timeLeft;
    
    if (selected !== null && questions[current]) {
      const correct = questions[current].options.find(opt => opt.isCorrect)?.optionId;
      const isCorrect = selected === correct;
      setScore(s => isCorrect ? s + 1 : s);
      setUserAnswers(ans => [...ans, {
        questionId: questions[current].questionId,
        selectedOptionId: selected,
        isCorrect,
        timeSpent
      }]);
      
      if (isCorrect) {
        playSound(CORRECT_SOUND);
        setAnimate('bounce');
      } else {
        playSound(INCORRECT_SOUND);
        setAnimate('shake');
      }
    } else {
      setUserAnswers(ans => [...ans, {
        questionId: questions[current].questionId,
        selectedOptionId: null,
        isCorrect: false,
        timeSpent
      }]);
    }
    
    setTimeout(() => {
      setSelected(null);
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
      } else {
        const stats = calculateStats();
        setQuizStats(stats);
        if (stats.accuracy >= 80) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        setShowResult(true);
      }
    }, 800);
  };

  const handleNextAuto = () => {
    const timeSpent = TIME_PER_QUESTION - timeLeft;
    setUserAnswers(ans => [...ans, {
      questionId: questions[current].questionId,
      selectedOptionId: null,
      isCorrect: false,
      timeSpent
    }]);
    setSelected(null);
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      const stats = calculateStats();
      setQuizStats(stats);
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setShowResult(false);
    setScore(0);
    setUserAnswers([]);
    setTimeLeft(TIME_PER_QUESTION);
    setQuizStats(null);
    setShowConfetti(false);
    setQuestions(qs => shuffleArray(qs).map(q => ({ ...q, options: shuffleArray(q.options) })));
  };

  const handleBackToTopics = () => {
    navigate('/quiz');
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <Header />
        <main className="quiz-main">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải câu hỏi...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page">
        <Header />
        <main className="quiz-main">
          <div className="container">
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-page">
        <Header />
        <main className="quiz-main">
          <div className="container">
            <div className="no-questions">
              <p>Không có câu hỏi cho chủ đề này.</p>
              <button onClick={handleBackToTopics}>Quay lại danh sách</button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="quiz-page">
        <Header />
        <main className="quiz-main">
          <div className="container">
            <div className="quiz-result">
              <div className="result-header">
                <h2>🎉 Kết quả bài trắc nghiệm</h2>
                {showConfetti && <div className="confetti-container"></div>}
              </div>
              
              {quizStats && (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">{quizStats.correctAnswers}/{quizStats.totalQuestions}</div>
                    <div className="stat-label">Câu đúng</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{quizStats.accuracy.toFixed(1)}%</div>
                    <div className="stat-label">Độ chính xác</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{Math.floor(quizStats.averageTime)}s</div>
                    <div className="stat-label">Thời gian trung bình</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{Math.floor(quizStats.timeSpent / 60)}:{String(Math.floor(quizStats.timeSpent % 60)).padStart(2, '0')}</div>
                    <div className="stat-label">Tổng thời gian</div>
                  </div>
                </div>
              )}

              <div className="result-actions">
                <button className="btn-primary" onClick={handleRestart}>
                  🔄 Làm lại
                </button>
                <button className="btn-secondary" onClick={handleBackToTopics}>
                  📚 Chọn chủ đề khác
                </button>
              </div>

              <div className="quiz-review">
                <h3>📋 Đáp án & Giải thích</h3>
                {questions.map((q, idx) => {
                  const userAns = userAnswers[idx];
                  const correctOption = q.options.find(opt => opt.isCorrect);
                  return (
                    <div className="review-question" key={q.questionId}>
                      <div className="review-question-header">
                        <span className="question-number">Câu {idx + 1}</span>
                        <span className={`question-status ${userAns?.isCorrect ? 'correct' : 'incorrect'}`}>
                          {userAns?.isCorrect ? '✅ Đúng' : '❌ Sai'}
                        </span>
                      </div>
                      <p className="question-text">{q.questionText}</p>
                      <div className="options-review">
                        {q.options.map(opt => (
                          <span
                            key={opt.optionId}
                            className={
                              'review-option ' +
                              (opt.isCorrect ? 'correct' : userAns?.selectedOptionId === opt.optionId ? 'incorrect' : 'neutral')
                            }
                          >
                            {opt.optionText}
                            {opt.isCorrect && <span className="correct-icon">✓</span>}
                            {userAns?.selectedOptionId === opt.optionId && !opt.isCorrect && <span className="incorrect-icon">✗</span>}
                          </span>
                        ))}
                      </div>
                      {!userAns?.isCorrect && (
                        <div className="correct-answer">
                          <strong>Đáp án đúng:</strong> {correctOption?.optionText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <audio ref={audioRef} />
      </div>
    );
  }

  const q = questions[current];
  const correctId = q.options.find(opt => opt.isCorrect)?.optionId;
  const progress = ((current + 1) / questions.length) * 100;
  const { audioUrl, cleanText } = extractAudioUrlAndText(q.questionText);

  return (
    <div className="quiz-page">
      <Header />
      <main className="quiz-main">
        <div className="container">
          <div className="quiz-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-text">
              Câu {current + 1} / {questions.length}
            </div>
          </div>

          <div className="quiz-timer-container">
            <div className="timer-bar">
              <div 
                className="timer-fill" 
                style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
              ></div>
            </div>
            <div className="timer-text">
              ⏰ {timeLeft}s
            </div>
          </div>

          <div className="quiz-content">
            <div className="question-container">
              <h2 className="question-text">{cleanText}</h2>
              {audioUrl && (
                <button
                  className="audio-btn"
                  onClick={() => playSound(audioUrl)}
                  title="Nghe phát âm"
                  style={{ marginLeft: 8 }}
                >
                  🔊 Nghe
                </button>
              )}
            </div>
            
            <div className={`quiz-options animate-${animate}`}>
              {q.options.map((opt, index) => (
                <button
                  key={opt.optionId}
                  className={
                    'quiz-option-btn' +
                    (selected === opt.optionId ? ' selected' : '') +
                    (selected !== null
                      ? opt.optionId === correctId
                        ? ' correct'
                        : opt.optionId === selected
                          ? ' incorrect'
                          : ''
                      : '')
                  }
                  onClick={() => handleSelect(opt.optionId)}
                  disabled={selected !== null}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{opt.optionText}</span>
                </button>
              ))}
            </div>

            <div className="quiz-actions">
              <button 
                className="next-btn"
                onClick={handleNext} 
                disabled={selected === null}
              >
                {current === questions.length - 1 ? '🏁 Xem kết quả' : '⏭️ Câu tiếp theo'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <audio ref={audioRef} />
    </div>
  );
};

export default QuizTopicPage;