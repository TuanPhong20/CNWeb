/**
 * Script to add multiple saved topics for testing
 * Run: node addSavedTopics.js <userId>
 */

const { pool } = require('../config/db.config');

// Sample topic data for testing
const sampleTopics = [
  { title: 'Basic Vocabulary', description: 'Common everyday words and phrases' },
  { title: 'Business English', description: 'Vocabulary for professional settings' },
  { title: 'Travel Phrases', description: 'Essential phrases for traveling abroad' },
  { title: 'Academic English', description: 'Words and terms used in academic contexts' },
  { title: 'Technology Terms', description: 'Modern technology and computing vocabulary' }
];

async function createTopicsAndSave(userId) {
  try {
    // Check if the user exists
    const [userRows] = await pool.execute('SELECT * FROM Users WHERE UserID = ?', [userId]);
    if (!userRows || userRows.length === 0) {
      console.error(`User with ID ${userId} not found.`);
      return false;
    }

    console.log(`Creating and saving topics for user ID ${userId}...`);
    
    // Create topics and save them for the user
    for (const topicData of sampleTopics) {
      // Insert new topic
      const [result] = await pool.execute(
        'INSERT INTO Topics (Title, Description, UserID, CreatedAt, UpdatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        [topicData.title, topicData.description, userId]
      );
      
      const topicId = result.insertId;
      console.log(`Created topic: "${topicData.title}" with ID ${topicId}`);
      
      // Save the topic for the user
      await pool.execute(
        'INSERT INTO SavedTopics (UserID, TopicID, SavedAt) VALUES (?, ?, NOW())',
        [userId, topicId]
      );
      
      console.log(`Saved topic ID ${topicId} for user ID ${userId}`);
    }
    
    // List all saved topics for the user
    const [savedTopics] = await pool.execute(
      `SELECT t.*, st.SavedAt 
       FROM Topics t
       INNER JOIN SavedTopics st ON t.TopicID = st.TopicID
       WHERE st.UserID = ?`,
      [userId]
    );
    
    console.log(`\nTotal saved topics for user ID ${userId}: ${savedTopics.length}`);
    console.table(savedTopics);
    
    return true;
  } catch (error) {
    console.error('Error creating and saving topics:', error);
    return false;
  }
}

async function main() {
  try {
    // Get user ID from command line arguments
    const userId = process.argv[2];
    
    if (!userId) {
      console.error('Usage: node addSavedTopics.js <userId>');
      process.exit(1);
    }
    
    await createTopicsAndSave(userId);
    
    // Close the database connection
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main(); 