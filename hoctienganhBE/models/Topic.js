const { pool } = require('../config/db.config');

class Topic {
    constructor(topicId, title, description) {
        this.topicId = topicId;
        this.title = title;
        this.description = description;
    }

    static async findAll() {
        try {
            const [rows] = await pool.execute('SELECT * FROM Topics');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(topicId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM Topics WHERE TopicID = ?',
                [topicId]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(topicData) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO Topics (Title, Description, UserID) VALUES (?, ?, ?)',
                [topicData.title, topicData.description, topicData.userId]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(topicId, topicData) {
        try {
            const [result] = await pool.execute(
                'UPDATE Topics SET Title = ?, Description = ? WHERE TopicID = ?',
                [topicData.title, topicData.description, topicId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(topicId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM Topics WHERE TopicID = ?',
                [topicId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Topic; 