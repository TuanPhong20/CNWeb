const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
    getSavedTopicsByUserId,
    getUsersByTopicId,
    saveTopic,
    unsaveTopic
} = require('../controllers/savedTopic.controller');

// Tất cả các routes đều yêu cầu xác thực
router.use(verifyToken);

router.get('/my-topics', getSavedTopicsByUserId);
router.get('/topic/:topicId/users', getUsersByTopicId);
router.post('/', saveTopic);
router.delete('/:topicId', unsaveTopic);

module.exports = router; 