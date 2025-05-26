const { pool } = require('../config/db.config');

class QuizOption {
    constructor(optionId, questionId, optionText, isCorrect) {
        this.optionId = optionId;
        this.questionId = questionId;
        this.optionText = optionText;
        this.isCorrect = isCorrect;
    }

    static async findById(optionId) {
        try {
            console.log('Finding option by ID:', optionId);
            const [rows] = await pool.execute(
                'SELECT OptionID, QuestionID, OptionText, IsCorrect FROM QuizOptions WHERE OptionID = ?',
                [optionId]
            );
            console.log('Found option:', rows[0]);
            return rows[0];
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    static async findByQuestionId(questionId) {
        try {
            console.log('Finding options for QuestionID:', questionId);
            
            // Kiểm tra tính hợp lệ của questionId
            const parsedId = parseInt(questionId);
            if (isNaN(parsedId) || parsedId <= 0) {
                console.error('Invalid question ID:', questionId);
                return [];
            }
            
            const [rows] = await pool.execute(
                'SELECT OptionID, QuestionID, OptionText, IsCorrect FROM QuizOptions WHERE QuestionID = ?',
                [parsedId]
            );
            
            console.log('Found options:', rows ? rows.length : 0);
            if (rows && rows.length > 0) {
                console.log('First option sample:', rows[0]);
            } else {
                console.log('No options found for question ID:', parsedId);
                
                // Kiểm tra xem câu hỏi có tồn tại không
                const [questionCheck] = await pool.execute(
                    'SELECT QuestionID FROM QuizQuestions WHERE QuestionID = ?',
                    [parsedId]
                );
                console.log('Question exists check:', questionCheck && questionCheck.length > 0 ? 'Yes' : 'No');
            }
            
            return rows || [];
        } catch (error) {
            console.error('Error in findByQuestionId:', error);
            throw error;
        }
    }

    static async create(optionData) {
        try {
            console.log('Creating new option:', optionData);
            const [result] = await pool.execute(
                'INSERT INTO QuizOptions (QuestionID, OptionText, IsCorrect) VALUES (?, ?, ?)',
                [optionData.questionId, optionData.optionText, optionData.isCorrect]
            );
            console.log('Created option with ID:', result.insertId);
            return result.insertId;
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    }

    static async update(optionId, optionData) {
        try {
            const [result] = await pool.execute(
                'UPDATE QuizOptions SET OptionText = ?, IsCorrect = ? WHERE OptionID = ?',
                [optionData.optionText, optionData.isCorrect, optionId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(optionId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM QuizOptions WHERE OptionID = ?',
                [optionId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = QuizOption; 