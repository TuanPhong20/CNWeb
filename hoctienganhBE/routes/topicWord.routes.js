const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
    getWordsByTopicId,
    getTopicsByWordId,
    addWordToTopic,
    removeWordFromTopic
} = require('../controllers/topicWord.controller');

// Public routes
router.get('/topic/:topicId/words', getWordsByTopicId);
router.get('/word/:wordId/topics', getTopicsByWordId);

// Protected routes
router.post('/', verifyToken, addWordToTopic);
router.delete('/:topicId/:wordId', verifyToken, removeWordFromTopic);

module.exports = router; 