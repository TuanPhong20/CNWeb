/**
 * FILE SPECIAL: Standalone Express app CHỈ xử lý route /api/quiz-questions/:id/options
 * 
 * Mục đích: Nếu app.js chính vẫn không hoạt động đúng, chạy file này như một server riêng biệt
 * để xử lý chỉ route cụ thể gây lỗi.
 * 
 * Cách chạy: node directRoute.js
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo app Express riêng
const app = express();
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Tạo pool kết nối database
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'hoctienganh',
    port: parseInt(process.env.DB_PORT) || 3306
};

const pool = mysql.createPool(dbConfig);

// ONLY ROUTE: Xử lý ONLY route /api/quiz-questions/:id/options
app.get('/api/quiz-questions/:id/options', async (req, res) => {
    console.log('================== DIRECT REQUEST ==================');
    console.log('Processing options request, params:', req.params);
    
    try {
        const questionId = parseInt(req.params.id);
        
        if (isNaN(questionId) || questionId <= 0) {
            return res.status(400).json({ 
                message: 'Invalid question ID',
                id: req.params.id
            });
        }
        
        // Kiểm tra kết nối DB
        try {
            const conn = await pool.getConnection();
            console.log('Database connection OK');
            conn.release();
        } catch (dbError) {
            console.error('Database connection FAILED:', dbError);
            return res.status(500).json({
                message: 'Database connection error',
                error: dbError.message
            });
        }
        
        // Query câu hỏi
        console.log('Querying question ID:', questionId);
        const [questions] = await pool.query(
            `SELECT * FROM QuizQuestions WHERE QuestionID = ${questionId} LIMIT 1`
        );
        
        if (!questions || questions.length === 0) {
            console.error('QUESTION NOT FOUND with ID:', questionId);
            return res.status(404).json({ 
                message: 'Question not found',
                id: questionId
            });
        }
        
        const question = questions[0];
        console.log('Found question:', question.QuestionID, question.QuestionText);
        
        // Query options
        console.log('Querying options for question ID:', questionId);
        const [options] = await pool.query(
            `SELECT * FROM QuizOptions WHERE QuestionID = ${questionId}`
        );
        
        console.log('Found options:', options.length);
        
        // Response
        const response = {
            questionId: question.QuestionID,
            topicId: question.TopicID,
            questionText: question.QuestionText,
            questionType: question.QuestionType,
            createdAt: question.CreatedAt,
            timestamp: Date.now(),
            options: options.map(opt => ({
                optionId: opt.OptionID,
                optionText: opt.OptionText,
                isCorrect: opt.IsCorrect === 1
            }))
        };
        
        console.log('SENDING RESPONSE - Question ID:', questionId);
        console.log('================== REQUEST END ==================');
        return res.status(200).json(response);
    } catch (error) {
        console.error('ERROR processing request:', error);
        return res.status(500).json({
            message: 'Server error processing options',
            error: error.message,
            stack: error.stack
        });
    }
});

// Kiểm tra các URL khác
app.all('*', (req, res) => {
    console.log('Unsupported route accessed:', req.method, req.url);
    res.status(404).json({
        message: 'Not found - Standalone server only handles /api/quiz-questions/:id/options',
        requested: req.originalUrl
    });
});

// Cổng khác với server chính
const PORT = 3001;

// Khởi động server
app.listen(PORT, () => {
    console.log(`=====================================================`);
    console.log(`STANDALONE SERVER RUNNING ON PORT ${PORT}`);
    console.log(`URL: http://localhost:${PORT}/api/quiz-questions/:id/options`);
    console.log(`=====================================================`);
});

// Export nếu cần test
module.exports = app; 