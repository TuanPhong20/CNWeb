const { pool } = require('../config/db.config');

class TopicWord {
    constructor(topicId, wordId) {
        this.topicId = topicId;
        this.wordId = wordId;
    }

    static async findByTopicId(topicId) {
        try {
            const [rows] = await pool.execute(
                `SELECT w.* 
                FROM Words w
                INNER JOIN TopicWords tw ON w.WordID = tw.WordID
                WHERE tw.TopicID = ?`,
                [topicId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findByWordId(wordId) {
        try {
            const [rows] = await pool.execute(
                `SELECT t.* 
                FROM Topics t
                INNER JOIN TopicWords tw ON t.TopicID = tw.TopicID
                WHERE tw.WordID = ?`,
                [wordId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async create(topicId, wordId) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO TopicWords (TopicID, WordID) VALUES (?, ?)',
                [topicId, wordId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(topicId, wordId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM TopicWords WHERE TopicID = ? AND WordID = ?',
                [topicId, wordId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = TopicWord; 