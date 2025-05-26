/**
 * Middleware đặc biệt để xử lý route quiz-questions/:id/options
 * File này cung cấp middleware để đảm bảo route options được ưu tiên xử lý
 */

const { pool } = require('../config/db.config');

/**
 * Middleware xử lý trực tiếp route /api/quiz-questions/:id/options
 * Bỏ qua router thông thường để tránh lỗi routing
 */
const handleOptionsRoute = async (req, res, next) => {
    // Kiểm tra chính xác URL để bắt route options
    // Hỗ trợ cả URL với hoặc không có dấu / ở cuối
    // Xem xét cả originalUrl và path để đảm bảo không bỏ sót
    const urlToCheck = req.originalUrl || req.url;
    console.log('Checking URL:', urlToCheck);
    
    // Pattern khớp với cả hai dạng URL: có hoặc không có / ở cuối
    const pattern = /^\/api\/quiz-questions\/(\d+)\/options\/?(?:\?.*)?$/;
    const match = urlToCheck.match(pattern);
    
    if (!match) {
        // Không phải route options, chuyển sang middleware tiếp theo
        return next();
    }
    
    // Đây là route options, xử lý trực tiếp
    console.log('DIRECT HANDLER: Processing options route');
    
    try {
        const questionId = parseInt(match[1]);
        console.log('Processing question ID:', questionId);
        
        if (isNaN(questionId) || questionId <= 0) {
            console.error('Invalid question ID:', questionId);
            return res.status(400).json({ message: 'Invalid question ID' });
        }
        
        // Đảm bảo database connection
        try {
            // Kiểm tra connection trước khi query
            const connectionTest = await pool.getConnection();
            connectionTest.release();
            console.log('Database connection verified');
        } catch (connErr) {
            console.error('Database connection error:', connErr);
            return res.status(500).json({ 
                message: 'Database connection error',
                error: connErr.message
            });
        }
        
        // Truy vấn trực tiếp câu hỏi - sử dụng query thô để tránh lỗi
        console.log('Executing question query');
        const questionSql = `SELECT * FROM QuizQuestions WHERE QuestionID = ${questionId}`;
        const [questions] = await pool.query(questionSql);
        
        if (!questions || questions.length === 0) {
            console.error('Question not found with ID:', questionId);
            return res.status(404).json({ message: 'Question not found' });
        }
        
        const question = questions[0];
        console.log('Found question:', question.QuestionID, question.QuestionText);
        
        // Truy vấn trực tiếp options - sử dụng query thô để tránh lỗi
        console.log('Executing options query');
        const optionsSql = `SELECT * FROM QuizOptions WHERE QuestionID = ${questionId}`;
        const [options] = await pool.query(optionsSql);
        console.log('Found options count:', options.length);
        
        // Format và trả về kết quả
        const response = {
            questionId: question.QuestionID,
            topicId: question.TopicID,
            questionText: question.QuestionText,
            questionType: question.QuestionType,
            createdAt: question.CreatedAt,
            options: options.map(opt => ({
                optionId: opt.OptionID,
                optionText: opt.OptionText,
                isCorrect: opt.IsCorrect === 1
            }))
        };
        
        // Gửi response ngay lập tức
        console.log('Sending successful response');
        return res.status(200).json(response);
    } catch (error) {
        console.error('Error in options middleware:', error);
        return res.status(500).json({ 
            message: 'Server error in options middleware',
            error: error.message
        });
    }
};

module.exports = { handleOptionsRoute }; 