/**
 * File chính của ứng dụng Express
 * FIXED VERSION: Xử lý trực tiếp route /api/quiz-questions/:id/options 
 * mà không qua router hay middleware thông thường
 */

const express = require('express');
const cors = require('cors');
const { connectDB, pool } = require('./config/db.config');

// Import routes
const authRoutes = require('./routes/auth.routes');
const topicRoutes = require('./routes/topic.routes');
const wordRoutes = require('./routes/word.routes');
const quizQuestionRoutes = require('./routes/quizQuestion.routes');
const quizOptionRoutes = require('./routes/quizOption.routes');
const topicWordRoutes = require('./routes/topicWord.routes');
const savedTopicRoutes = require('./routes/savedTopic.routes');

// Import direct controller
const handleOptionsRequest = require('./controllers/directOptionsRoute');

// Create express app
const app = express();

// Basic middlewares
app.use(cors({
  origin: '*', // Cho phép tất cả các origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const reqId = Date.now();
    console.log(`[${timestamp}][${reqId}] Request: ${req.method} ${req.url}`);
    
    // Track response time
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${timestamp}][${reqId}] Response: ${res.statusCode} - ${duration}ms`);
    });
    
    next();
});

// ===== CRITICAL ROUTE HANDLER =====
// XỬ LÝ TRỰC TIẾP route /api/quiz-questions/:id/options KHÔNG QUA ROUTER
// Define this route OUTSIDE of any router
app.get('/api/quiz-questions/:id/options', handleOptionsRequest);

// Add debug route for SavedTopics
app.get('/api/saved-topics/debug', (req, res) => {
    console.log('DEBUG ROUTE: /api/saved-topics/debug accessed');
    res.json({
        message: 'SavedTopics debug route is working',
        routes: [
            '/api/saved-topics/my-topics',
            '/api/saved-topics/topic/:topicId/users',
            '/api/saved-topics (POST)',
            '/api/saved-topics/:topicId (DELETE)'
        ],
        status: 'Routes are registered correctly'
    });
});

// Add logging middleware specifically for saved-topics routes
app.use('/api/saved-topics', (req, res, next) => {
    console.log(`[SAVED-TOPICS] ${req.method} ${req.url} - Headers:`, JSON.stringify(req.headers));
    
    // Store original send method
    const originalSend = res.send;
    
    // Override send method to log response
    res.send = function(body) {
        console.log(`[SAVED-TOPICS] Response:`, body);
        return originalSend.apply(res, arguments);
    };
    
    next();
});

// ===== OTHER ROUTES =====
// Ensure all other routes are registered AFTER the critical one
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/topic-words', topicWordRoutes);
app.use('/api/quiz-options', quizOptionRoutes);
app.use('/api/saved-topics', savedTopicRoutes);

// This MUST be the LAST router registered
app.use('/api/quiz-questions', quizQuestionRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to English Learning API' });
});

// Clean-up middleware to catch any trailing errors
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Not Found',
        path: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('ERROR:', err);
    res.status(500).json({
        message: 'Server Error',
        error: err.message
    });
});

// Server port
const PORT = process.env.PORT || 3000;

// Start server 
const startServer = async () => {
    try {
        await connectDB();
        console.log('Database connected successfully');
        
        // Close existing server if it exists
        if (app.server) {
            app.server.close();
            console.log('Closed existing server');
        }
        
        // Create new server
        app.server = app.listen(PORT, () => {
            console.log(`==================================================`);
            console.log(`SERVER RUNNING ON PORT ${PORT}`);
            console.log(`DIRECT ROUTE HANDLER ACTIVE FOR /api/quiz-questions/:id/options`);
            console.log(`CORS enabled for all origins`);
            console.log(`==================================================`);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

// Export for testing
module.exports = app; 