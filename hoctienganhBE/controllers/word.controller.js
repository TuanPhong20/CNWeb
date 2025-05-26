const Word = require('../models/Word');
const TopicWord = require('../models/TopicWord');
const TranslationService = require('../services/translation.service');
const QuestionGeneratorService = require('../services/questionGenerator.service');

// Lấy tất cả words
const getAllWords = async (req, res) => {
    try {
        const words = await Word.findAll();
        res.json(words);
    } catch (error) {
        console.error('Error fetching words:', error);
        res.status(500).json({ message: 'Error fetching words' });
    }
};

// Lấy word theo ID
const getWordById = async (req, res) => {
    try {
        const wordId = req.params.id;
        const word = await Word.findById(wordId);
        
        if (!word) {
            return res.status(404).json({ message: 'Word not found' });
        }
        
        res.json(word);
    } catch (error) {
        console.error('Error fetching word:', error);
        res.status(500).json({ message: 'Error fetching word' });
    }
};

// Tạo word mới
const createWord = async (req, res) => {
    try {
        const { englishText, topicId } = req.body;

        if (!englishText || !topicId) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['englishText', 'topicId']
            });
        }
        
        // Lấy thông tin từ từ các API
        const wordInfo = await TranslationService.getWordInfo(englishText);
        
        // Tạo từ mới với thông tin đã lấy được
        const wordId = await Word.create(wordInfo);

        // Liên kết từ với topic
        await TopicWord.create(topicId, wordId);

        // Lấy thông tin từ vừa tạo
        const word = await Word.findById(wordId);
        
        // Chuyển đổi tên thuộc tính cho phù hợp với code
        const wordForQuestions = {
            ...word,
            English: word.English,
            Meaning: word.Meaning,
            Phonetic: word.Phonetic,
            AudioURL: word.AudioURL,
            ImageURL: word.ImageURL
        };

        // Tự động tạo các câu hỏi cho từ mới
        const questions = await QuestionGeneratorService.generateQuestionsForWord(wordForQuestions, topicId);
        
        res.status(201).json({
            message: 'Word and quiz questions created successfully',
            wordId: wordId,
            wordInfo,
            questions
        });
    } catch (error) {
        console.error('Error creating word:', error);
        res.status(500).json({ 
            message: 'Error creating word',
            error: error.message 
        });
    }
};

// Cập nhật word
const updateWord = async (req, res) => {
    try {
        const wordId = req.params.id;
        const { englishText, vietnameseText, pronunciation, audioUrl, imageUrl } = req.body;
        const wordData = {
            englishText,
            vietnameseText,
            pronunciation,
            audioUrl,
            imageUrl
        };

        const success = await Word.update(wordId, wordData);
        if (!success) {
            return res.status(404).json({ message: 'Word not found' });
        }

        res.json({ message: 'Word updated successfully' });
    } catch (error) {
        console.error('Error updating word:', error);
        res.status(500).json({ message: 'Error updating word' });
    }
};

// Xóa word
const deleteWord = async (req, res) => {
    try {
        const wordId = req.params.id;
        const success = await Word.delete(wordId);
        
        if (!success) {
            return res.status(404).json({ message: 'Word not found' });
        }

        res.json({ message: 'Word deleted successfully' });
    } catch (error) {
        console.error('Error deleting word:', error);
        res.status(500).json({ message: 'Error deleting word' });
    }
};

module.exports = {
    getAllWords,
    getWordById,
    createWord,
    updateWord,
    deleteWord
}; 