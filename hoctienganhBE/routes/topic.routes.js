const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
    getAllTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic
} = require('../controllers/topic.controller');

// Public routes
router.get('/', getAllTopics);
router.get('/:id', getTopicById);

// Protected routes
router.post('/', verifyToken, createTopic);
router.put('/:id', verifyToken, updateTopic);
router.delete('/:id', verifyToken, deleteTopic);

module.exports = router; 