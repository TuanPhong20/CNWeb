const { pool } = require('../config/db.config');

class Word {
    constructor(wordId, english, meaning, phonetic, audioUrl, imageUrl) {
        this.wordId = wordId;
        this.english = english;
        this.meaning = meaning;
        this.phonetic = phonetic;
        this.audioUrl = audioUrl;
        this.imageUrl = imageUrl;
    }

    static async findAll() {
        try {
            const [rows] = await pool.execute('SELECT * FROM Words');
            return Array.isArray(rows) ? rows : [];
        } catch (error) {
            console.error('Error in findAll:', error);
            return [];
        }
    }

    static async findById(wordId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM Words WHERE WordID = ?',
                [wordId]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(wordData) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO Words (English, Meaning, Phonetic, AudioURL, ImageURL) VALUES (?, ?, ?, ?, ?)',
                [
                    wordData.englishText,
                    wordData.vietnameseText,
                    wordData.pronunciation,
                    wordData.audioUrl,
                    wordData.imageUrl
                ]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(wordId, wordData) {
        try {
            const [result] = await pool.execute(
                'UPDATE Words SET English = ?, Meaning = ?, Phonetic = ?, AudioURL = ?, ImageURL = ? WHERE WordID = ?',
                [
                    wordData.englishText,
                    wordData.vietnameseText,
                    wordData.pronunciation,
                    wordData.audioUrl,
                    wordData.imageUrl,
                    wordId
                ]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(wordId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM Words WHERE WordID = ?',
                [wordId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Word; 