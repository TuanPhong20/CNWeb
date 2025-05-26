const sql = require('mssql');

const TopicDTO = {
    // Queries
    SELECT_BY_ID: 'SELECT * FROM Topics WHERE TopicID = @topicId',
    SELECT_BY_USER_ID: 'SELECT * FROM Topics WHERE UserID = @userId',
    INSERT: `
        INSERT INTO Topics (UserID, Title, Description, CreatedAt, UpdatedAt)
        VALUES (@userId, @title, @description, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() AS TopicID;
    `,
    UPDATE: `
        UPDATE Topics 
        SET Title = @title,
            Description = @description,
            UpdatedAt = GETDATE()
        WHERE TopicID = @topicId
    `,
    DELETE: 'DELETE FROM Topics WHERE TopicID = @topicId',

    // Parameters
    createParams: (topicData) => ({
        userId: { type: sql.Int, value: topicData.userId },
        title: { type: sql.VarChar, value: topicData.title },
        description: { type: sql.VarChar, value: topicData.description }
    }),

    updateParams: (topicId, topicData) => ({
        topicId: { type: sql.Int, value: topicId },
        title: { type: sql.VarChar, value: topicData.title },
        description: { type: sql.VarChar, value: topicData.description }
    }),

    findByIdParams: (topicId) => ({
        topicId: { type: sql.Int, value: topicId }
    }),

    findByUserIdParams: (userId) => ({
        userId: { type: sql.Int, value: userId }
    })
};

module.exports = TopicDTO; 