const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
    getAllQuestions,
    getQuestionById,
    getQuestionsByTopicId,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionsWithOptionsByTopicId
} = require('../controllers/quizQuestion.controller');

// Chú ý: Route "/:id/options" được xử lý trực tiếp tại app.js
// KHÔNG ĐỊNH NGHĨA ROUTE NÀY Ở ĐÂY để tránh xung đột

// Public routes - đặt theo thứ tự từ cụ thể đến chung
router.get('/', getAllQuestions);

// Routes có tiền tố "/topic"
router.get('/topic/:topicId/options', getQuestionsWithOptionsByTopicId);
router.get('/topic/:topicId', getQuestionsByTopicId);

// QUAN TRỌNG: Route ID phải được đặt CUỐI CÙNG
// Route chung - lấy câu hỏi theo ID  
router.get('/:id', (req, res, next) => {
    // Kiểm tra nếu URL chứa "options" - đây là trường hợp cần tránh
    if (req.originalUrl.includes(`/${req.params.id}/options`)) {
        console.log('Route conflict detected in ID route, skipping');
        return next('route'); // Bỏ qua route handler này
    }
    
    console.log('Processing normal question by ID route:', req.params.id);
    return getQuestionById(req, res, next);
});

// Protected routes
router.post('/', verifyToken, createQuestion);
router.put('/:id', verifyToken, updateQuestion);
router.delete('/:id', verifyToken, deleteQuestion);

module.exports = router; 