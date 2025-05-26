const sql = require('mssql');

const TopicWordDTO = {
    // Queries
    SELECT_WORDS_BY_TOPIC: `
        SELECT w.* 
        FROM TopicWords tw
        JOIN Words w ON tw.WordID = w.WordID
        WHERE tw.TopicID = @topicId
    `,
    SELECT_TOPICS_BY_WORD: `
        SELECT t.* 
        FROM TopicWords tw
        JOIN Topics t ON tw.TopicID = t.TopicID
        WHERE tw.WordID = @wordId
    `,
    INSERT: `
        INSERT INTO TopicWords (TopicID, WordID)
        VALUES (@topicId, @wordId)
    `,
    DELETE: 'DELETE FROM TopicWords WHERE TopicID = @topicId AND WordID = @wordId',

    // Parameters
    createParams: (topicId, wordId) => ({
        topicId: { type: sql.Int, value: topicId },
        wordId: { type: sql.Int, value: wordId }
    }),

    findByTopicIdParams: (topicId) => ({
        topicId: { type: sql.Int, value: topicId }
    }),

    findByWordIdParams: (wordId) => ({
        wordId: { type: sql.Int, value: wordId }
    }),

    deleteParams: (topicId, wordId) => ({
        topicId: { type: sql.Int, value: topicId },
        wordId: { type: sql.Int, value: wordId }
    })
};

module.exports = TopicWordDTO; 