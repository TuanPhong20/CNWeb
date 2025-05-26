const SavedTopic = require('../models/SavedTopic');

const savedTopicController = {
    // Lấy danh sách topic đã lưu của user
    getSavedTopicsByUserId: async (req, res) => {
        try {
            const userId = req.user.userId; // From auth middleware
            const topics = await SavedTopic.findByUserId(userId);
            res.json(topics);
        } catch (error) {
            console.error('Error fetching saved topics:', error);
            res.status(500).json({ message: 'Error fetching saved topics' });
        }
    },

    // Lấy danh sách user đã lưu topic
    getUsersByTopicId: async (req, res) => {
        try {
            const topicId = req.params.topicId;
            const users = await SavedTopic.findByTopicId(topicId);
            res.json(users);
        } catch (error) {
            console.error('Error fetching users by topic:', error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    },

    // Lưu topic
    saveTopic: async (req, res) => {
        try {
            const userId = req.user.userId; // From auth middleware
            const { topicId } = req.body;
            const success = await SavedTopic.create(userId, topicId);
            
            if (success) {
                res.status(201).json({ message: 'Topic saved successfully' });
            } else {
                res.status(400).json({ message: 'Failed to save topic' });
            }
        } catch (error) {
            console.error('Error saving topic:', error);
            res.status(500).json({ message: 'Error saving topic' });
        }
    },

    // Bỏ lưu topic
    unsaveTopic: async (req, res) => {
        try {
            const userId = req.user.userId; // From auth middleware
            const topicId = req.params.topicId;
            const success = await SavedTopic.delete(userId, topicId);
            
            if (success) {
                res.json({ message: 'Topic unsaved successfully' });
            } else {
                res.status(404).json({ message: 'Saved topic not found' });
            }
        } catch (error) {
            console.error('Error unsaving topic:', error);
            res.status(500).json({ message: 'Error unsaving topic' });
        }
    }
};

module.exports = savedTopicController; 