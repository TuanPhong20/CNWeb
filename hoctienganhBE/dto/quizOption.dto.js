const sql = require('mssql');

const QuizOptionDTO = {
    // Queries
    SELECT_BY_ID: 'SELECT * FROM QuizOptions WHERE OptionID = @optionId',
    SELECT_BY_QUESTION_ID: 'SELECT * FROM QuizOptions WHERE QuestionID = @questionId',
    INSERT: `
        INSERT INTO QuizOptions (QuestionID, OptionText, IsCorrect)
        VALUES (@questionId, @optionText, @isCorrect);
        SELECT SCOPE_IDENTITY() AS OptionID;
    `,
    UPDATE: `
        UPDATE QuizOptions 
        SET OptionText = @optionText,
            IsCorrect = @isCorrect
        WHERE OptionID = @optionId
    `,
    DELETE: 'DELETE FROM QuizOptions WHERE OptionID = @optionId',

    // Parameters
    createParams: (optionData) => ({
        questionId: { type: sql.Int, value: optionData.questionId },
        optionText: { type: sql.VarChar, value: optionData.optionText },
        isCorrect: { type: sql.Int, value: optionData.isCorrect }
    }),

    updateParams: (optionId, optionData) => ({
        optionId: { type: sql.Int, value: optionId },
        optionText: { type: sql.VarChar, value: optionData.optionText },
        isCorrect: { type: sql.Int, value: optionData.isCorrect }
    }),

    findByIdParams: (optionId) => ({
        optionId: { type: sql.Int, value: optionId }
    }),

    findByQuestionIdParams: (questionId) => ({
        questionId: { type: sql.Int, value: questionId }
    })
};

module.exports = QuizOptionDTO; 