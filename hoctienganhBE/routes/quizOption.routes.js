const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
    getOptionsByQuestionId,
    getOptionById,
    createOption,
    updateOption,
    deleteOption
} = require('../controllers/quizOption.controller');
const { pool } = require('../config/db.config');

// Public route
router.get('/question/:questionId', async (req, res) => {
    try {
        // Trực tiếp xử lý tại route
        const questionId = parseInt(req.params.questionId);
        console.log('Direct handler in quizOption routes for questionId:', questionId);

        if (isNaN(questionId) || questionId <= 0) {
            return res.status(400).json({ message: 'Invalid question ID' });
        }

        // Truy vấn trực tiếp DB
        const [options] = await pool.execute(
            'SELECT OptionID, QuestionID, OptionText, IsCorrect FROM QuizOptions WHERE QuestionID = ?',
            [questionId]
        );

        // Format kết quả
        const formattedOptions = options.map(opt => ({
            optionId: opt.OptionID,
            questionId: opt.QuestionID,
            optionText: opt.OptionText,
            isCorrect: opt.IsCorrect === 1 ? true : false
        }));

        console.log(`Found ${formattedOptions.length} options for question ID ${questionId}`);
        res.json(formattedOptions);
    } catch (error) {
        console.error('Error fetching options by question:', error);
        res.status(500).json({ message: 'Error fetching options' });
    }
});

router.get('/:id', getOptionById);

// Protected routes
router.post('/', verifyToken, createOption);
router.put('/:id', verifyToken, updateOption);
router.delete('/:id', verifyToken, deleteOption);

module.exports = router; 