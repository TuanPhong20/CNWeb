const mysql = require('mysql2/promise');
require('dotenv').config();

// Cấu hình kết nối MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'hoctienganh',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Log cấu hình database (không hiển thị password)
console.log('Database configuration:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port
});

// Tạo pool kết nối
const pool = mysql.createPool(dbConfig);

// Kiểm tra kết nối
const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL database connected!');
        connection.release();
        return true;
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
        
        // Hiển thị thông tin lỗi chi tiết hơn
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error(`Database '${dbConfig.database}' does not exist. Please create it first.`);
        } else if (error.code === 'ECONNREFUSED') {
            console.error(`Cannot connect to MySQL server at ${dbConfig.host}:${dbConfig.port}. Is the server running?`);
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error(`Access denied for user '${dbConfig.user}'. Check your credentials.`);
        }
        
        throw error;
    }
};

module.exports = { connectDB, pool }; 