const QuizOption = require('../models/QuizOption');

// Lấy tất cả các lựa chọn của một câu hỏi
const getOptionsByQuestionId = async (req, res) => {
    try {
        // Đảm bảo ID là số
        const rawQuestionId = req.params.questionId;
        const questionId = parseInt(rawQuestionId);
        console.log('Getting options for question ID:', questionId, 'Raw ID:', rawQuestionId);

        if (isNaN(questionId) || questionId <= 0) {
            console.error('Invalid question ID provided:', rawQuestionId);
            return res.status(400).json({ message: 'Invalid question ID' });
        }

        try {
            // Truy vấn trực tiếp vào DB để đảm bảo lấy được dữ liệu chính xác
            const { pool } = require('../config/db.config');
            const [directOptions] = await pool.execute(
                'SELECT OptionID, QuestionID, OptionText, IsCorrect FROM QuizOptions WHERE QuestionID = ?',
                [questionId]
            );
            console.log('Direct DB query found options:', directOptions ? directOptions.length : 0);

            // Format kết quả để đảm bảo tính nhất quán
            const formattedOptions = directOptions.map(opt => ({
                optionId: opt.OptionID,
                questionId: opt.QuestionID,
                optionText: opt.OptionText,
                isCorrect: opt.IsCorrect === 1 ? true : false
            }));

            res.json(formattedOptions);
        } catch (dbError) {
            console.error('Error querying options directly from DB:', dbError);
            
            // Nếu truy vấn DB lỗi, thử dùng model
            console.log('Falling back to model for question ID:', questionId);
            const options = await QuizOption.findByQuestionId(questionId);
            
            // Format kết quả để đảm bảo tính nhất quán
            const formattedOptions = options.map(opt => ({
                optionId: opt.OptionID,
                questionId: opt.QuestionID,
                optionText: opt.OptionText,
                isCorrect: opt.IsCorrect === 1 ? true : false
            }));
            
            res.json(formattedOptions);
        }
    } catch (error) {
        console.error('Error fetching options by question:', error);
        res.status(500).json({ message: 'Error fetching options' });
    }
};

// Lấy lựa chọn theo ID
const getOptionById = async (req, res) => {
    try {
        const optionId = req.params.id;
        const option = await QuizOption.findById(optionId);
        
        if (!option) {
            return res.status(404).json({ message: 'Option not found' });
        }
        
        res.json(option);
    } catch (error) {
        console.error('Error fetching option:', error);
        res.status(500).json({ message: 'Error fetching option' });
    }
};

// Tạo lựa chọn mới
const createOption = async (req, res) => {
    try {
        const { questionId, optionText, isCorrect } = req.body;
        const optionData = {
            questionId,
            optionText,
            isCorrect
        };
        
        const optionId = await QuizOption.create(optionData);
        res.status(201).json({
            message: 'Option created successfully',
            optionId: optionId
        });
    } catch (error) {
        console.error('Error creating option:', error);
        res.status(500).json({ message: 'Error creating option' });
    }
};

// Cập nhật lựa chọn
const updateOption = async (req, res) => {
    try {
        const optionId = req.params.id;
        const { optionText, isCorrect } = req.body;
        const optionData = {
            optionText,
            isCorrect
        };

        const success = await QuizOption.update(optionId, optionData);
        if (!success) {
            return res.status(404).json({ message: 'Option not found' });
        }

        res.json({ message: 'Option updated successfully' });
    } catch (error) {
        console.error('Error updating option:', error);
        res.status(500).json({ message: 'Error updating option' });
    }
};

// Xóa lựa chọn
const deleteOption = async (req, res) => {
    try {
        const optionId = req.params.id;
        const success = await QuizOption.delete(optionId);
        
        if (!success) {
            return res.status(404).json({ message: 'Option not found' });
        }

        res.json({ message: 'Option deleted successfully' });
    } catch (error) {
        console.error('Error deleting option:', error);
        res.status(500).json({ message: 'Error deleting option' });
    }
};

module.exports = {
    getOptionsByQuestionId,
    getOptionById,
    createOption,
    updateOption,
    deleteOption
}; 