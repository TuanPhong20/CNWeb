const { pool } = require('../config/db.config');

class SavedTopic {
    constructor(userId, topicId, savedAt) {
        this.userId = userId;
        this.topicId = topicId;
        this.savedAt = savedAt;
    }

    static async findByUserId(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT t.*, st.SavedAt 
                FROM Topics t
                INNER JOIN SavedTopics st ON t.TopicID = st.TopicID
                WHERE st.UserID = ?`,
                [userId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findByTopicId(topicId) {
        try {
            const [rows] = await pool.execute(
                `SELECT u.*, st.SavedAt 
                FROM Users u
                INNER JOIN SavedTopics st ON u.UserID = st.UserID
                WHERE st.TopicID = ?`,
                [topicId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async create(userId, topicId) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO SavedTopics (UserID, TopicID, SavedAt) VALUES (?, ?, NOW())',
                [userId, topicId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(userId, topicId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM SavedTopics WHERE UserID = ? AND TopicID = ?',
                [userId, topicId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SavedTopic; 