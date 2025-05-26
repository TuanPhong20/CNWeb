const sql = require('mssql');

const UserDTO = {
    // Queries
    SELECT_BY_ID: 'SELECT * FROM Users WHERE UserID = @userId',
    SELECT_BY_EMAIL: 'SELECT * FROM Users WHERE Email = @email',
    INSERT: `
        INSERT INTO Users (Email, PasswordHash, DisplayName)
        VALUES (@email, @passwordHash, @displayName);
        SELECT SCOPE_IDENTITY() AS UserID;
    `,
    UPDATE: `
        UPDATE Users 
        SET DisplayName = @displayName,
            PasswordHash = @passwordHash
        WHERE UserID = @userId
    `,
    DELETE: 'DELETE FROM Users WHERE UserID = @userId',

    // Parameters
    createParams: (userData) => ({
        email: { type: sql.VarChar, value: userData.email },
        passwordHash: { type: sql.VarChar, value: userData.passwordHash },
        displayName: { type: sql.VarChar, value: userData.displayName }
    }),

    updateParams: (userId, userData) => ({
        userId: { type: sql.Int, value: userId },
        displayName: { type: sql.VarChar, value: userData.displayName },
        passwordHash: { type: sql.VarChar, value: userData.passwordHash }
    }),

    findByIdParams: (userId) => ({
        userId: { type: sql.Int, value: userId }
    }),

    findByEmailParams: (email) => ({
        email: { type: sql.VarChar, value: email }
    })
};

module.exports = UserDTO; 