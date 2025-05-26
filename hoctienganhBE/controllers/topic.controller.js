const Topic = require('../models/Topic');

// Lấy tất cả topics
const getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.findAll();
        res.json(topics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ message: 'Error fetching topics' });
    }
};

// Lấy topic theo ID
const getTopicById = async (req, res) => {
    try {
        const topicId = req.params.id;
        const topic = await Topic.findById(topicId);
        
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        
        res.json(topic);
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({ message: 'Error fetching topic' });
    }
};

// Tạo topic mới
const createTopic = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.userId; // Lấy UserID từ token đã xác thực

        const topicData = {
            title,
            description,
            userId // Thêm UserID vào dữ liệu tạo topic
        };
        
        const topicId = await Topic.create(topicData);
        res.status(201).json({
            message: 'Topic created successfully',
            topicId: topicId
        });
    } catch (error) {
        console.error('Error creating topic:', error);
        res.status(500).json({ message: 'Error creating topic' });
    }
};

// Cập nhật topic
const updateTopic = async (req, res) => {
    try {
        const topicId = req.params.id;
        const { title, description } = req.body;
        const topicData = { title, description };

        const success = await Topic.update(topicId, topicData);
        if (!success) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        res.json({ message: 'Topic updated successfully' });
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({ message: 'Error updating topic' });
    }
};

// Xóa topic
const deleteTopic = async (req, res) => {
    try {
        const topicId = req.params.id;
        const success = await Topic.delete(topicId);
        
        if (!success) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({ message: 'Error deleting topic' });
    }
};

module.exports = {
    getAllTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic
}; 