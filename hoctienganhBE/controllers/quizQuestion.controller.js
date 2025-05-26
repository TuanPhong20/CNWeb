const QuizQuestion = require('../models/QuizQuestion');
const Word = require('../models/Word');
const QuizGeneratorService = require('../services/quizGenerator.service');
const QuizOption = require('../models/QuizOption');

// Lấy tất cả câu hỏi
const getAllQuestions = async (req, res) => {
    try {
        const questions = await QuizQuestion.findAll();
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Error fetching questions' });
    }
};

// Lấy câu hỏi theo ID
const getQuestionById = async (req, res) => {
    try {
        const questionId = req.params.id;
        const question = await QuizQuestion.findById(questionId);
        
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        res.json(question);
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ message: 'Error fetching question' });
    }
};

// Lấy câu hỏi theo topic ID
const getQuestionsByTopicId = async (req, res) => {
    try {
        const topicId = req.params.topicId;
        const questions = await QuizQuestion.findByTopicId(topicId);
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions by topic:', error);
        res.status(500).json({ message: 'Error fetching questions' });
    }
};

// Tạo câu hỏi mới
const createQuestion = async (req, res) => {
    try {
        const { topicId, wordId, questionType } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!topicId || !wordId || !questionType) {
            return res.status(400).json({ 
                message: 'Missing required fields', 
                required: ['topicId', 'wordId', 'questionType'] 
            });
        }

        // Đảm bảo topicId và wordId là số
        const parsedTopicId = parseInt(topicId);
        const parsedWordId = parseInt(wordId);

        // Kiểm tra tính hợp lệ của ID
        if (isNaN(parsedTopicId) || parsedTopicId <= 0) {
            return res.status(400).json({ message: 'Invalid topic ID' });
        }
        if (isNaN(parsedWordId) || parsedWordId <= 0) {
            return res.status(400).json({ message: 'Invalid word ID' });
        }

        // Lấy thông tin từ
        const word = await Word.findById(parsedWordId);
        if (!word) {
            return res.status(404).json({ message: 'Word not found' });
        }

        // Tạo câu hỏi
        const questionData = {
            topicId: parsedTopicId,
            questionText: `What is the meaning of '${word.English}' in Vietnamese?`,
            questionType: questionType
        };
        
        // Lưu câu hỏi và lấy ID
        const questionId = await QuizQuestion.create(questionData);

        // Tạo các đáp án sai ngẫu nhiên
        const wrongAnswers = await QuizGeneratorService.generateWrongAnswers(word.English);

        // Tạo các đáp án cho câu hỏi
        await QuizGeneratorService.createQuizOptionsForQuestion(
            questionId,
            word.Meaning,  // Đáp án đúng
            wrongAnswers   // Các đáp án sai
        );

        res.status(201).json({
            message: 'Question and options created successfully',
            question: {
                id: questionId,
                topicId: parsedTopicId,
                questionText: questionData.questionText,
                correctAnswer: word.Meaning,
                wrongAnswers: wrongAnswers
            }
        });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ 
            message: 'Error creating question',
            error: error.message 
        });
    }
};

// Cập nhật câu hỏi
const updateQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        const { questionText } = req.body;
        const questionData = { questionText };

        const success = await QuizQuestion.update(questionId, questionData);
        if (!success) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question updated successfully' });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Error updating question' });
    }
};

// Xóa câu hỏi
const deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        const success = await QuizQuestion.delete(questionId);
        
        if (!success) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Error deleting question' });
    }
};

// Lấy câu hỏi và các lựa chọn theo ID
const getQuestionWithOptions = async (req, res) => {
    try {
        // Đảm bảo ID là số
        const rawQuestionId = req.params.id;
        const questionId = parseInt(rawQuestionId);
        console.log('Getting question with options for ID:', questionId, 'Raw ID:', rawQuestionId, 'URL:', req.originalUrl);

        if (isNaN(questionId) || questionId <= 0) {
            console.error('Invalid question ID provided:', rawQuestionId);
            return res.status(400).json({ message: 'Invalid question ID' });
        }

        // Kiểm tra xem có phải direct route không
        console.log('isOptionsRequest flag:', req.isOptionsRequest ? 'true' : 'false');

        try {
            // Lấy thông tin câu hỏi
            console.log('Finding question by ID:', questionId);
            const { pool } = require('../config/db.config');
            
            // Truy vấn trực tiếp DB để lấy thông tin câu hỏi
            const [questionRows] = await pool.execute(
                'SELECT QuestionID, TopicID, QuestionText, QuestionType, CreatedAt FROM QuizQuestions WHERE QuestionID = ?',
                [questionId]
            );
            
            if (!questionRows || questionRows.length === 0) {
                console.error('Question not found with ID:', questionId);
                return res.status(404).json({ message: 'Question not found' });
            }
            
            const question = questionRows[0];
            console.log('Found question:', question);
            
            // Truy vấn trực tiếp DB để lấy options
            const [optionRows] = await pool.execute(
                'SELECT OptionID, QuestionID, OptionText, IsCorrect FROM QuizOptions WHERE QuestionID = ?',
                [questionId]
            );
            
            console.log('Direct DB query found options:', optionRows ? optionRows.length : 0);
            
            // Kết hợp câu hỏi và options
            const result = {
                questionId: question.QuestionID,
                topicId: question.TopicID,
                questionText: question.QuestionText,
                questionType: question.QuestionType,
                createdAt: question.CreatedAt,
                options: optionRows && optionRows.length > 0 
                    ? optionRows.map(opt => ({
                        optionId: opt.OptionID,
                        optionText: opt.OptionText,
                        isCorrect: opt.IsCorrect === 1 ? true : false
                    }))
                    : [] // Trả về mảng rỗng nếu không có options
            };
            
            // Trả về kết quả
            return res.json(result);
        } catch (dbError) {
            console.error('Error querying from DB:', dbError);
            return res.status(500).json({ 
                message: 'Database error',
                error: dbError.message 
            });
        }
    } catch (error) {
        console.error('Error fetching question with options:', error);
        res.status(500).json({ 
            message: 'Error fetching question with options',
            error: error.message 
        });
    }
};

// Lấy tất cả câu hỏi và options theo topic ID
const getQuestionsWithOptionsByTopicId = async (req, res) => {
    try {
        const topicId = parseInt(req.params.topicId);
        console.log('Getting questions with options for topic ID:', topicId);

        if (isNaN(topicId) || topicId <= 0) {
            return res.status(400).json({ message: 'Invalid topic ID' });
        }

        const questions = await QuizQuestion.findByTopicId(topicId);
        console.log('Found questions:', questions);

        // Lấy options cho mỗi câu hỏi
        const questionsWithOptions = await Promise.all(
            questions.map(async (question) => {
                const options = await QuizOption.findByQuestionId(question.QuestionID);
                return {
                    questionId: question.QuestionID,
                    topicId: question.TopicID,
                    questionText: question.QuestionText,
                    questionType: question.QuestionType,
                    createdAt: question.CreatedAt,
                    options: options.map(opt => ({
                        optionId: opt.OptionID,
                        optionText: opt.OptionText,
                        isCorrect: opt.IsCorrect
                    }))
                };
            })
        );

        res.json(questionsWithOptions);
    } catch (error) {
        console.error('Error fetching questions with options:', error);
        res.status(500).json({ 
            message: 'Error fetching questions with options',
            error: error.message 
        });
    }
};

module.exports = {
    getAllQuestions,
    getQuestionById,
    getQuestionsByTopicId,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionWithOptions,
    getQuestionsWithOptionsByTopicId
}; 