const sql = require('mssql');

const QuizQuestionDTO = {
    // Queries
    SELECT_BY_ID: 'SELECT * FROM QuizQuestions WHERE QuestionID = @questionId',
    SELECT_BY_TOPIC_ID: 'SELECT * FROM QuizQuestions WHERE TopicID = @topicId',
    INSERT: `
        INSERT INTO QuizQuestions (TopicID, QuestionText, QuestionType, CreatedAt)
        VALUES (@topicId, @questionText, @questionType, GETDATE());
        SELECT SCOPE_IDENTITY() AS QuestionID;
    `,
    UPDATE: `
        UPDATE QuizQuestions 
        SET QuestionText = @questionText
        WHERE QuestionID = @questionId
    `,
    DELETE: 'DELETE FROM QuizQuestions WHERE QuestionID = @questionId',

    // Parameters
    createParams: (questionData) => ({
        topicId: { type: sql.Int, value: questionData.topicId },
        questionText: { type: sql.VarChar, value: questionData.questionText },
        questionType: { type: sql.VarChar, value: questionData.questionType }
    }),

    updateParams: (questionId, questionData) => ({
        questionId: { type: sql.Int, value: questionId },
        questionText: { type: sql.VarChar, value: questionData.questionText }
    }),

    findByIdParams: (questionId) => ({
        questionId: { type: sql.Int, value: questionId }
    }),

    findByTopicIdParams: (topicId) => ({
        topicId: { type: sql.Int, value: topicId }
    })
};

module.exports = QuizQuestionDTO; 