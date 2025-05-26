-- Drop existing tables if they exist
DROP TABLE IF EXISTS `QuizOptions`;
DROP TABLE IF EXISTS `QuizQuestions`;
DROP TABLE IF EXISTS `SavedTopics`;
DROP TABLE IF EXISTS `TopicWords`;
DROP TABLE IF EXISTS `Words`;
DROP TABLE IF EXISTS `Topics`;
DROP TABLE IF EXISTS `Users`;

-- Create Users table first since it's referenced by others
CREATE TABLE `Users` (
    `UserID` INT NOT NULL AUTO_INCREMENT,
    `Email` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `DisplayName` VARCHAR(100) NULL,
    PRIMARY KEY(`UserID`)
);
ALTER TABLE `Users` ADD UNIQUE `users_email_unique`(`Email`);

-- Create Topics table with reference to Users
CREATE TABLE `Topics` (
    `TopicID` INT NOT NULL AUTO_INCREMENT,
    `UserID` INT NOT NULL,
    `Title` VARCHAR(255) NOT NULL,
    `Description` VARCHAR(500) NULL,
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `UpdatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(`TopicID`),
    CONSTRAINT `fk_topics_userid` FOREIGN KEY(`UserID`) REFERENCES `Users`(`UserID`) ON DELETE CASCADE
);
ALTER TABLE `Topics` ADD INDEX `topics_userid_index`(`UserID`);

-- Create Words table
CREATE TABLE `Words` (
    `WordID` INT NOT NULL AUTO_INCREMENT,
    `English` VARCHAR(100) NOT NULL,
    `Phonetic` VARCHAR(100) NULL,
    `Meaning` VARCHAR(255) NULL,
    `ImageURL` VARCHAR(500) NULL,
    `AudioURL` VARCHAR(500) NULL,
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `UpdatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(`WordID`)
);
ALTER TABLE `Words` ADD INDEX `words_english_index`(`English`);

-- Create TopicWords junction table
CREATE TABLE `TopicWords` (
    `TopicID` INT NOT NULL,
    `WordID` INT NOT NULL,
    PRIMARY KEY(`TopicID`, `WordID`),
    CONSTRAINT `fk_topicwords_topicid` FOREIGN KEY(`TopicID`) REFERENCES `Topics`(`TopicID`) ON DELETE CASCADE,
    CONSTRAINT `fk_topicwords_wordid` FOREIGN KEY(`WordID`) REFERENCES `Words`(`WordID`) ON DELETE CASCADE
);

-- Create SavedTopics junction table
CREATE TABLE `SavedTopics` (
    `UserID` INT NOT NULL,
    `TopicID` INT NOT NULL,
    `SavedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`UserID`, `TopicID`),
    CONSTRAINT `fk_savedtopics_userid` FOREIGN KEY(`UserID`) REFERENCES `Users`(`UserID`) ON DELETE CASCADE,
    CONSTRAINT `fk_savedtopics_topicid` FOREIGN KEY(`TopicID`) REFERENCES `Topics`(`TopicID`) ON DELETE CASCADE
);

-- Create QuizQuestions table
CREATE TABLE `QuizQuestions` (
    `QuestionID` INT NOT NULL AUTO_INCREMENT,
    `TopicID` INT NOT NULL,
    `QuestionText` VARCHAR(500) NOT NULL,
    `QuestionType` VARCHAR(50) NOT NULL,
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`QuestionID`),
    CONSTRAINT `fk_quizquestions_topicid` FOREIGN KEY(`TopicID`) REFERENCES `Topics`(`TopicID`) ON DELETE CASCADE
);

-- Create QuizOptions table
CREATE TABLE `QuizOptions` (
    `OptionID` INT NOT NULL AUTO_INCREMENT,
    `QuestionID` INT NOT NULL,
    `OptionText` VARCHAR(255) NOT NULL,
    `IsCorrect` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY(`OptionID`),
    CONSTRAINT `fk_quizoptions_questionid` FOREIGN KEY(`QuestionID`) REFERENCES `QuizQuestions`(`QuestionID`) ON DELETE CASCADE
);

-- Insert a default admin user
INSERT INTO `Users` (`Email`, `passwordHash`, `DisplayName`) 
VALUES ('admin@example.com', '$2b$10$6jM7G7eIqWvUb9DkL4pK8.ek.QJCpB1UFaCK.k6GtB.ZWetB4o93O', 'Admin');