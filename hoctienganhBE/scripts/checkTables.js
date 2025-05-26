/**
 * Script to check if the SavedTopics table exists
 * Run: node checkTables.js
 */

const { pool } = require('../config/db.config');

async function checkTables() {
    try {
        // Check all tables in the database
        console.log('Checking database tables...');
        const [tables] = await pool.execute('SHOW TABLES');
        
        console.log('Tables in the database:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`- ${tableName}`);
        });
        
        // Check specifically for SavedTopics table
        const hasTable = tables.some(table => {
            const tableName = Object.values(table)[0];
            return tableName.toLowerCase() === 'savedtopics';
        });
        
        if (hasTable) {
            console.log('\nSavedTopics table exists. Checking structure...');
            const [columns] = await pool.execute('DESCRIBE SavedTopics');
            console.log('SavedTopics table structure:');
            console.table(columns);
            
            // Check for existing data
            const [count] = await pool.execute('SELECT COUNT(*) as count FROM SavedTopics');
            console.log(`\nSavedTopics has ${count[0].count} records.`);
            
            if (count[0].count > 0) {
                const [records] = await pool.execute('SELECT * FROM SavedTopics LIMIT 10');
                console.log('Sample records:');
                console.table(records);
            }
        } else {
            console.log('\nSavedTopics table DOES NOT EXIST! Creating it...');
            
            // Create SavedTopics table
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS SavedTopics (
                    UserID INT NOT NULL,
                    TopicID INT NOT NULL,
                    SavedAt DATETIME NOT NULL,
                    PRIMARY KEY (UserID, TopicID),
                    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
                    FOREIGN KEY (TopicID) REFERENCES Topics(TopicID) ON DELETE CASCADE
                )
            `);
            
            console.log('SavedTopics table created successfully.');
        }
        
    } catch (error) {
        console.error('Error checking tables:', error);
    } finally {
        // Close the connection pool
        process.exit(0);
    }
}

// Run the script
checkTables(); 