const sql = require('mssql');

const SavedTopicDTO = {
    // Queries
    SELECT_TOPICS_BY_USER: `
        SELECT t.*, st.SavedAt
        FROM SavedTopics st
        JOIN Topics t ON st.TopicID = t.TopicID
        WHERE st.UserID = @userId
    `,
    SELECT_USERS_BY_TOPIC: `
        SELECT u.*, st.SavedAt
        FROM SavedTopics st
        JOIN Users u ON st.UserID = u.UserID
        WHERE st.TopicID = @topicId
    `,
    INSERT: `
        INSERT INTO SavedTopics (UserID, TopicID, SavedAt)
        VALUES (@userId, @topicId, GETDATE())
    `,
    DELETE: 'DELETE FROM SavedTopics WHERE UserID = @userId AND TopicID = @topicId',

    // Parameters
    createParams: (userId, topicId) => ({
        userId: { type: sql.Int, value: userId },
        topicId: { type: sql.Int, value: topicId }
    }),

    findByUserIdParams: (userId) => ({
        userId: { type: sql.Int, value: userId }
    }),

    findByTopicIdParams: (topicId) => ({
        topicId: { type: sql.Int, value: topicId }
    }),

    deleteParams: (userId, topicId) => ({
        userId: { type: sql.Int, value: userId },
        topicId: { type: sql.Int, value: topicId }
    })
};

module.exports = SavedTopicDTO; 