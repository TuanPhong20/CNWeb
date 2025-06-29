import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import LoginPage from './pages/LoginPage';
import MyTopicsPage from './pages/MyTopicsPage';
import TopicDetailPage from './pages/TopicDetailPage';
import CreateTopicPage from './pages/CreateTopicPage';
import QuizPage from './pages/QuizPage';
import QuizTopicPage from './pages/QuizTopicPage';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/flashcard" element={<div>FlashCard Page Coming Soon</div>} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/quiz/topic/:topicId" element={<QuizTopicPage />} />
            <Route path="/my-topics" element={<MyTopicsPage />} />
            <Route path="/listening-writing/:topicId" element={<TopicDetailPage />} />
            <Route path="/create-topic" element={<CreateTopicPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
