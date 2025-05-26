const TopicWord = require('../models/TopicWord');

const topicWordController = {
    // Lấy tất cả từ vựng của một topic
    getWordsByTopicId: async (req, res) => {
        try {
            const topicId = req.params.topicId;
            const words = await TopicWord.findByTopicId(topicId);
            res.json(words);
        } catch (error) {
            console.error('Error fetching words by topic:', error);
            res.status(500).json({ message: 'Error fetching words' });
        }
    },

    // Lấy tất cả topic của một từ vựng
    getTopicsByWordId: async (req, res) => {
        try {
            const wordId = req.params.wordId;
            const topics = await TopicWord.findByWordId(wordId);
            res.json(topics);
        } catch (error) {
            console.error('Error fetching topics by word:', error);
            res.status(500).json({ message: 'Error fetching topics' });
        }
    },

    // Thêm từ vựng vào topic
    addWordToTopic: async (req, res) => {
        try {
            const { topicId, wordId } = req.body;
            const success = await TopicWord.create(topicId, wordId);
            
            if (success) {
                res.status(201).json({ message: 'Word added to topic successfully' });
            } else {
                res.status(400).json({ message: 'Failed to add word to topic' });
            }
        } catch (error) {
            console.error('Error adding word to topic:', error);
            res.status(500).json({ message: 'Error adding word to topic' });
        }
    },

    // Xóa từ vựng khỏi topic
    removeWordFromTopic: async (req, res) => {
        try {
            const { topicId, wordId } = req.params;
            const success = await TopicWord.delete(topicId, wordId);
            
            if (success) {
                res.json({ message: 'Word removed from topic successfully' });
            } else {
                res.status(404).json({ message: 'Word-topic association not found' });
            }
        } catch (error) {
            console.error('Error removing word from topic:', error);
            res.status(500).json({ message: 'Error removing word from topic' });
        }
    }
};

module.exports = topicWordController; 