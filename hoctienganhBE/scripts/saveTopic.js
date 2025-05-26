/**
 * Script to save a topic for a user
 * Run: node saveTopic.js <userId> <topicId>
 */

const { pool } = require('../config/db.config');

async function saveTopic(userId, topicId) {
    try {
        // Check if the user exists
        const [userRows] = await pool.execute('SELECT * FROM Users WHERE UserID = ?', [userId]);
        if (!userRows || userRows.length === 0) {
            console.error(`User with ID ${userId} not found.`);
            return false;
        }

        // Check if the topic exists
        const [topicRows] = await pool.execute('SELECT * FROM Topics WHERE TopicID = ?', [topicId]);
        if (!topicRows || topicRows.length === 0) {
            console.error(`Topic with ID ${topicId} not found.`);
            return false;
        }

        // Check if the user has already saved this topic
        const [savedRows] = await pool.execute(
            'SELECT * FROM SavedTopics WHERE UserID = ? AND TopicID = ?', 
            [userId, topicId]
        );

        if (savedRows && savedRows.length > 0) {
            console.log(`User ${userId} has already saved topic ${topicId}.`);
            return true;
        }

        // Insert a new record
        const [result] = await pool.execute(
            'INSERT INTO SavedTopics (UserID, TopicID, SavedAt) VALUES (?, ?, NOW())',
            [userId, topicId]
        );

        if (result.affectedRows > 0) {
            console.log(`Successfully saved topic ${topicId} for user ${userId}.`);
            return true;
        } else {
            console.error('Failed to save topic.');
            return false;
        }
    } catch (error) {
        console.error('Error saving topic:', error);
        return false;
    }
}

async function main() {
    try {
        // Get user ID and topic ID from command line arguments
        const userId = process.argv[2];
        const topicId = process.argv[3];

        if (!userId || !topicId) {
            console.error('Usage: node saveTopic.js <userId> <topicId>');
            process.exit(1);
        }

        // Save the topic
        const success = await saveTopic(userId, topicId);

        // List saved topics for the user
        if (success) {
            console.log('Listing saved topics for the user:');
            const [rows] = await pool.execute(
                `SELECT t.*, st.SavedAt 
                FROM Topics t
                INNER JOIN SavedTopics st ON t.TopicID = st.TopicID
                WHERE st.UserID = ?`,
                [userId]
            );

            console.table(rows);
        }

        // Close the database connection
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run the script
main(); 