import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserTopicsModal from '../components/UserTopicsModal';
import '../styles/FlashCardPage.css';

interface Flashcard {
  English: string;
  Meaning: string;
  Phonetic: string;
  AudioURL: string;
}

const FlashCardPage: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setFlipped(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setFlipped(false);
  };

  const playAudio = () => {
    if (!currentCard?.AudioURL) return;
    const audio = new Audio(currentCard.AudioURL);
    audio.play().catch((err) => {
      console.warn('Lỗi khi phát âm thanh:', err);
    });
  };

  useEffect(() => {
    if (!selectedTopicId) return;

    const fetchFlashcards = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/topic-words/topic/${selectedTopicId}/words`);
        const data = await res.json();
        console.log(data)

        if (!Array.isArray(data)) {
          throw new Error('Dữ liệu flashcards không hợp lệ');
        }

        setFlashcards(data);
        setCurrentIndex(0);
        setFlipped(false);
      } catch (err) {
        console.error('Lỗi khi tải flashcard:', err);
      }
    };

    fetchFlashcards();
  }, [selectedTopicId]);

  return (
    <div className="flashcard-page">
      <Header />

      <UserTopicsModal
        mode="select"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTopicSelect={(topicId: number) => {
          setSelectedTopicId(topicId);
          setIsModalOpen(false);
          console.log('Selected topic:', topicId);
        }}
      />

      <main className="flashcard-container">
        <h1 className="flashcard-title">FlashCard từ vựng</h1>
        <p className="flashcard-subtitle">
          Hãy luyện tập từ vựng bằng cách lật thẻ và kiểm tra kiến thức của bạn.
        </p>

        {flashcards.length === 0 ? (
          <p className="no-flashcards-message">Chưa có flashcard nào cho chủ đề này.</p>
        ) : (
          <>
            <div
              className={`card-box ${flipped ? 'flipped' : ''}`}
              onClick={() => setFlipped(!flipped)}
            >
              <div className="card-content">
                {flipped ? (
                  <div>
                    <p className="text-xl font-semibold mb-1">{currentCard.Meaning}</p>
                    <p className="text-sm text-gray-600 mb-2">{currentCard.Phonetic}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio();
                      }}
                      className="audio-button"
                    >
                      🔊 Nghe
                    </button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold">{currentCard.English}</h2>
                )}
              </div>
              <div className="card-footer">Click thẻ để lật ⬆</div>
            </div>

            <div className="nav-buttons">
              <button onClick={handlePrev}>⬅</button>
              <span className="nav-index">
                {currentIndex + 1} / {flashcards.length}
              </span>
              <button onClick={handleNext}>➡</button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FlashCardPage;
