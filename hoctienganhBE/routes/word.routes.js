const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
    getAllWords,
    getWordById,
    createWord,
    updateWord,
    deleteWord
} = require('../controllers/word.controller');

// Public routes
router.get('/', getAllWords);
router.get('/:id', getWordById);

// Protected routes
router.post('/', verifyToken, createWord);
router.put('/:id', verifyToken, updateWord);
router.delete('/:id', verifyToken, deleteWord);

module.exports = router; 