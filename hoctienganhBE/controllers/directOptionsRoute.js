/**
 * Controller đặc biệt để xử lý route tách biệt cho /api/quiz-questions/:id/options
 * File này hoàn toàn độc lập, không phụ thuộc vào các controller hoặc router khác
 */

const { pool } = require('../config/db.config');

// Xử lý request trực tiếp, không qua router hay middleware
const handleOptionsRequest = async (req, res) => {
    console.log('=============================================');
    console.log('DIRECT CONTROLLER: Processing options request');
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', req.params);
    console.log('=============================================');
    
    try {
        // Lấy và kiểm tra ID
        const questionId = parseInt(req.params.id);
        
        if (isNaN(questionId) || questionId <= 0) {
            console.error('Invalid question ID:', req.params.id);
            return res.status(400).json({ 
                message: 'Invalid question ID',
                requestId: Date.now()
            });
        }
        
        console.log('Processing question ID:', questionId);
        
        // Kiểm tra kết nối database
        try {
            const conn = await pool.getConnection();
            console.log('Database connection verified');
            conn.release();
        } catch (dbErr) {
            console.error('Database connection error:', dbErr);
            return res.status(500).json({
                message: 'Database connection error',
                error: dbErr.message,
                requestId: Date.now()
            });
        }
        
        // Query câu hỏi trực tiếp
        const questionQuery = `
            SELECT * 
            FROM QuizQuestions 
            WHERE QuestionID = ${questionId} 
            LIMIT 1
        `;
        
        console.log('Executing question query:', questionQuery);
        const [questionResults] = await pool.query(questionQuery);
        
        if (!questionResults || questionResults.length === 0) {
            console.error('Question not found with ID:', questionId);
            return res.status(404).json({ 
                message: 'Question not found',
                requestId: Date.now()
            });
        }
        
        const question = questionResults[0];
        console.log('Found question:', question.QuestionID, question.QuestionText);
        
        // Query options trực tiếp
        const optionsQuery = `
            SELECT * 
            FROM QuizOptions 
            WHERE QuestionID = ${questionId}
        `;
        
        console.log('Executing options query:', optionsQuery);
        const [optionsResults] = await pool.query(optionsQuery);
        console.log('Found options count:', optionsResults.length);
        
        // Chuẩn bị response
        const response = {
            questionId: question.QuestionID,
            topicId: question.TopicID,
            questionText: question.QuestionText,
            questionType: question.QuestionType,
            createdAt: question.CreatedAt,
            requestId: Date.now(),
            options: optionsResults.map(opt => ({
                optionId: opt.OptionID,
                optionText: opt.OptionText,
                isCorrect: opt.IsCorrect === 1
            }))
        };
        
        console.log('Sending successful response for question:', questionId);
        console.log('=============================================');
        
        // Trả về response
        return res.status(200).json(response);
    } catch (error) {
        console.error('ERROR in direct options controller:', error);
        return res.status(500).json({
            message: 'Server error processing options request',
            error: error.message,
            requestId: Date.now()
        });
    }
};

module.exports = handleOptionsRequest; 