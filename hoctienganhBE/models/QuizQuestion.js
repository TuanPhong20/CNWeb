const { pool } = require('../config/db.config');

class QuizQuestion {
    constructor(questionId, topicId, questionText, questionType) {
        this.questionId = questionId;
        this.topicId = topicId;
        this.questionText = questionText;
        this.questionType = questionType;
    }

    static async findAll() {
        try {
            const [rows] = await pool.execute('SELECT * FROM QuizQuestions');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(questionId) {
        try {
            console.log('Finding question by ID:', questionId);
            const [rows] = await pool.execute(
                'SELECT QuestionID, TopicID, QuestionText, QuestionType, CreatedAt FROM QuizQuestions WHERE QuestionID = ?',
                [questionId]
            );
            console.log('Found question:', rows[0]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    static async findByTopicId(topicId) {
        try {
            console.log('Finding questions by TopicID:', topicId);
            const [rows] = await pool.execute(
                'SELECT QuestionID, TopicID, QuestionText, QuestionType, CreatedAt FROM QuizQuestions WHERE TopicID = ?',
                [topicId]
            );
            console.log('Found questions:', rows);
            return rows;
        } catch (error) {
            console.error('Error in findByTopicId:', error);
            throw error;
        }
    }

    static async create(questionData) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO QuizQuestions (TopicID, QuestionText, QuestionType) VALUES (?, ?, ?)',
                [questionData.topicId, questionData.questionText, questionData.questionType]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(questionId, questionData) {
        try {
            const [result] = await pool.execute(
                'UPDATE QuizQuestions SET QuestionText = ? WHERE QuestionID = ?',
                [questionData.questionText, questionId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(questionId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM QuizQuestions WHERE QuestionID = ?',
                [questionId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = QuizQuestion; 