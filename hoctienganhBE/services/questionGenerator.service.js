const QuizQuestion = require('../models/QuizQuestion');
const QuizGeneratorService = require('./quizGenerator.service');
const AnswerGeneratorService = require('./answerGenerator.service');

class QuestionGeneratorService {
    static questionTypes = {
        MEANING: 'meaning',
        PRONUNCIATION: 'pronunciation',
        WORD_SELECTION: 'word_selection',
        AUDIO_MEANING: 'audio_meaning'
    };

    static async generateQuestionsForWord(word, topicId) {
        try {
            const questions = [];
            console.log('Generating questions for word:', word);

            // 1. Câu hỏi về nghĩa của từ
            const meaningQuestion = await this.createMeaningQuestion(word, topicId);
            if (meaningQuestion) {
                console.log('Created meaning question:', meaningQuestion);
                questions.push(meaningQuestion);
            }

            // 2. Câu hỏi về phiên âm
            if (word.Phonetic) {
                const pronunciationQuestion = await this.createPronunciationQuestion(word, topicId);
                if (pronunciationQuestion) {
                    console.log('Created pronunciation question:', pronunciationQuestion);
                    questions.push(pronunciationQuestion);
                }
            }

            // 3. Câu hỏi chọn từ tiếng Anh từ nghĩa tiếng Việt
            const wordSelectionQuestion = await this.createWordSelectionQuestion(word, topicId);
            if (wordSelectionQuestion) {
                console.log('Created word selection question:', wordSelectionQuestion);
                questions.push(wordSelectionQuestion);
            }

            // 4. Câu hỏi nghe audio và chọn nghĩa
            if (word.AudioURL) {
                const audioQuestion = await this.createAudioQuestion(word, topicId);
                if (audioQuestion) {
                    console.log('Created audio question:', audioQuestion);
                    questions.push(audioQuestion);
                }
            }

            console.log('Generated questions:', questions);
            return questions;
        } catch (error) {
            console.error('Error generating questions:', error);
            throw error;
        }
    }

    static async createMeaningQuestion(word, topicId) {
        try {
            console.log('Creating meaning question for word:', word);
            const questionText = `What is the meaning of '${word.English}' in Vietnamese?`;
            
            // Tạo các đáp án sai trước
            const wrongAnswers = await AnswerGeneratorService.generateMeaningAnswers(word);
            if (!wrongAnswers || wrongAnswers.length === 0) {
                console.error('Failed to generate wrong answers for meaning question');
                return null;
            }

            // Tạo câu hỏi trong database
            const questionId = await QuizQuestion.create({
                topicId,
                questionText,
                questionType: this.questionTypes.MEANING,
                correctAnswer: word.Meaning
            });

            // Tạo các options cho câu hỏi
            const success = await QuizGeneratorService.createQuizOptionsForQuestion(
                questionId,
                word.Meaning,
                wrongAnswers
            );

            if (!success) {
                console.error('Failed to create options for meaning question');
                await QuizQuestion.delete(questionId);
                return null;
            }

            return {
                id: questionId,
                type: this.questionTypes.MEANING,
                question: questionText,
                correctAnswer: word.Meaning,
                wrongAnswers
            };
        } catch (error) {
            console.error('Error creating meaning question:', error);
            return null;
        }
    }

    static async createPronunciationQuestion(word, topicId) {
        try {
            console.log('Creating pronunciation question for word:', word);
            
            if (!word.Phonetic) {
                console.log('No phonetic transcription available for word:', word.English);
                return null;
            }

            // Normalize phonetic transcription
            const normalizedPhonetic = word.Phonetic.trim().replace(/^\/|\/$/g, '');
            
            const questionText = `What is the correct pronunciation of '${word.English}'?`;
            console.log('Question text:', questionText);

            // Tạo câu hỏi trong database
            const questionId = await QuizQuestion.create({
                topicId,
                questionText,
                questionType: this.questionTypes.PRONUNCIATION
            });
            console.log('Created question with ID:', questionId);

            // Tạo các phiên âm sai
            try {
                const wrongPronunciations = AnswerGeneratorService.generatePronunciationAnswers(normalizedPhonetic);
                console.log('Generated wrong pronunciations:', wrongPronunciations);

                // Thêm dấu / vào đầu và cuối của các phiên âm
                const formattedCorrectAnswer = `/${normalizedPhonetic}/`;
                const formattedWrongAnswers = wrongPronunciations.map(p => `/${p}/`);

                // Kiểm tra xem có đủ đáp án sai không
                if (!formattedWrongAnswers || formattedWrongAnswers.length === 0) {
                    console.error('Failed to generate wrong pronunciations');
                    return null;
                }

                // Tạo các options cho câu hỏi
                const success = await QuizGeneratorService.createQuizOptionsForQuestion(
                    questionId,
                    formattedCorrectAnswer,
                    formattedWrongAnswers
                );

                if (!success) {
                    console.error('Failed to create options for pronunciation question');
                    return null;
                }

                return {
                    id: questionId,
                    type: this.questionTypes.PRONUNCIATION,
                    question: questionText,
                    correctAnswer: formattedCorrectAnswer,
                    wrongAnswers: formattedWrongAnswers
                };
            } catch (error) {
                console.error('Error generating pronunciation answers:', error);
                // Xóa câu hỏi nếu không tạo được đáp án
                try {
                    await QuizQuestion.delete(questionId);
                } catch (deleteError) {
                    console.error('Error deleting failed question:', deleteError);
                }
                return null;
            }
        } catch (error) {
            console.error('Error creating pronunciation question:', error);
            return null;
        }
    }

    static async createWordSelectionQuestion(word, topicId) {
        try {
            console.log('Creating word selection question for word:', word);
            const questionText = `Which English word means '${word.Meaning}'?`;
            
            // Tạo các đáp án sai trước
            const wrongAnswers = await AnswerGeneratorService.generateEnglishAnswers(word);
            if (!wrongAnswers || wrongAnswers.length === 0) {
                console.error('Failed to generate wrong answers for word selection question');
                return null;
            }

            // Tạo câu hỏi trong database
            const questionId = await QuizQuestion.create({
                topicId,
                questionText,
                questionType: this.questionTypes.WORD_SELECTION,
                correctAnswer: word.English
            });

            // Tạo các options cho câu hỏi
            const success = await QuizGeneratorService.createQuizOptionsForQuestion(
                questionId,
                word.English,
                wrongAnswers
            );

            if (!success) {
                console.error('Failed to create options for word selection question');
                await QuizQuestion.delete(questionId);
                return null;
            }

            return {
                id: questionId,
                type: this.questionTypes.WORD_SELECTION,
                question: questionText,
                correctAnswer: word.English,
                wrongAnswers
            };
        } catch (error) {
            console.error('Error creating word selection question:', error);
            return null;
        }
    }

    static async createAudioQuestion(word, topicId) {
        try {
            console.log('Creating audio question for word:', word);
            const questionText = `Listen to the audio and select the correct meaning: <audio src="${word.AudioURL}"></audio>`;
            
            // Tạo các đáp án sai trước
            const wrongAnswers = await AnswerGeneratorService.generateAudioAnswers(word);
            if (!wrongAnswers || wrongAnswers.length === 0) {
                console.error('Failed to generate wrong answers for audio question');
                return null;
            }

            // Tạo câu hỏi trong database
            const questionId = await QuizQuestion.create({
                topicId,
                questionText,
                questionType: this.questionTypes.AUDIO_MEANING,
                correctAnswer: word.Meaning
            });

            // Tạo các options cho câu hỏi
            const success = await QuizGeneratorService.createQuizOptionsForQuestion(
                questionId,
                word.Meaning,
                wrongAnswers
            );

            if (!success) {
                console.error('Failed to create options for audio question');
                await QuizQuestion.delete(questionId);
                return null;
            }

            return {
                id: questionId,
                type: this.questionTypes.AUDIO_MEANING,
                question: questionText,
                correctAnswer: word.Meaning,
                wrongAnswers
            };
        } catch (error) {
            console.error('Error creating audio question:', error);
            return null;
        }
    }
}

module.exports = QuestionGeneratorService; 