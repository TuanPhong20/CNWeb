const { pool } = require('../config/db.config');

class User {
    constructor(userId, email, passwordHash, displayName) {
        this.userId = userId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
    }

    static async findById(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM Users WHERE UserID = ?',
                [userId]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM Users WHERE Email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(userData) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO Users (Email, PasswordHash, DisplayName) VALUES (?, ?, ?)',
                [userData.email, userData.passwordHash, userData.displayName]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(userId, userData) {
        try {
            const [result] = await pool.execute(
                'UPDATE Users SET DisplayName = ?, PasswordHash = ? WHERE UserID = ?',
                [userData.displayName, userData.passwordHash, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User; 