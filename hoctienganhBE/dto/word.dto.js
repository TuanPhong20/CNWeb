const sql = require('mssql');

const WordDTO = {
    // Queries
    SELECT_BY_ID: 'SELECT * FROM Words WHERE WordID = @wordId',
    SELECT_BY_ENGLISH: 'SELECT * FROM Words WHERE English = @english',
    INSERT: `
        INSERT INTO Words (English, Phonetic, Meaning, ImageURL, AudioURL, CreatedAt, UpdatedAt)
        VALUES (@english, @phonetic, @meaning, @imageUrl, @audioUrl, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() AS WordID;
    `,
    UPDATE: `
        UPDATE Words 
        SET Phonetic = @phonetic,
            Meaning = @meaning,
            ImageURL = @imageUrl,
            AudioURL = @audioUrl,
            UpdatedAt = GETDATE()
        WHERE WordID = @wordId
    `,
    DELETE: 'DELETE FROM Words WHERE WordID = @wordId',

    // Parameters
    createParams: (wordData) => ({
        english: { type: sql.VarChar, value: wordData.english },
        phonetic: { type: sql.VarChar, value: wordData.phonetic },
        meaning: { type: sql.VarChar, value: wordData.meaning },
        imageUrl: { type: sql.VarChar, value: wordData.imageUrl },
        audioUrl: { type: sql.VarChar, value: wordData.audioUrl }
    }),

    updateParams: (wordId, wordData) => ({
        wordId: { type: sql.Int, value: wordId },
        phonetic: { type: sql.VarChar, value: wordData.phonetic },
        meaning: { type: sql.VarChar, value: wordData.meaning },
        imageUrl: { type: sql.VarChar, value: wordData.imageUrl },
        audioUrl: { type: sql.VarChar, value: wordData.audioUrl }
    }),

    findByIdParams: (wordId) => ({
        wordId: { type: sql.Int, value: wordId }
    }),

    findByEnglishParams: (english) => ({
        english: { type: sql.VarChar, value: english }
    })
};

module.exports = WordDTO; 