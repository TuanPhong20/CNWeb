const Word = require('../models/Word');
const QuizOption = require('../models/QuizOption');

class QuizGeneratorService {
    static async generateWrongAnswers(word, type = 'meaning', count = 3) {
        try {
            // Lấy tất cả các từ từ database
            const allWords = await Word.findAll();
            
            if (!allWords || allWords.length === 0) {
                console.log('No words found in database');
                return [
                    type === 'meaning' ? 'Không đúng 1' : 'Wrong 1',
                    type === 'meaning' ? 'Không đúng 2' : 'Wrong 2',
                    type === 'meaning' ? 'Không đúng 3' : 'Wrong 3'
                ];
            }
            
            // Lọc bỏ từ hiện tại ra khỏi danh sách
            const otherWords = allWords.filter(w => 
                type === 'meaning' ? w.Meaning !== word.Meaning : w.English !== word.English
            );
            
            if (otherWords.length === 0) {
                console.log('No other words found except the current one');
                return [
                    type === 'meaning' ? 'Không đúng 1' : 'Wrong 1',
                    type === 'meaning' ? 'Không đúng 2' : 'Wrong 2',
                    type === 'meaning' ? 'Không đúng 3' : 'Wrong 3'
                ];
            }
            
            // Trộn ngẫu nhiên mảng và lấy số lượng từ cần thiết
            const shuffled = otherWords.sort(() => 0.5 - Math.random());
            const selectedWords = shuffled.slice(0, Math.min(count, otherWords.length));
            
            // Lấy nghĩa hoặc từ tiếng Anh tùy theo loại câu hỏi
            return selectedWords.map(w => type === 'meaning' ? w.Meaning : w.English);
        } catch (error) {
            console.error('Error generating wrong answers:', error);
            return [
                type === 'meaning' ? 'Không đúng 1' : 'Wrong 1',
                type === 'meaning' ? 'Không đúng 2' : 'Wrong 2',
                type === 'meaning' ? 'Không đúng 3' : 'Wrong 3'
            ];
        }
    }

    static async createQuizOptionsForQuestion(questionId, correctAnswer, wrongAnswers) {
        try {
            console.log('Creating options for question:', questionId);
            console.log('Correct answer:', correctAnswer);
            console.log('Wrong answers:', wrongAnswers);

            // Xóa các options cũ nếu có
            try {
                const existingOptions = await QuizOption.findByQuestionId(questionId);
                if (existingOptions && existingOptions.length > 0) {
                    for (const option of existingOptions) {
                        await QuizOption.delete(option.OptionID);
                    }
                }
            } catch (error) {
                console.error('Error cleaning old options:', error);
            }

            // Tạo mảng chứa tất cả các đáp án
            const allOptions = [
                { text: correctAnswer, isCorrect: 1 },
                ...wrongAnswers.map(answer => ({ text: answer, isCorrect: 0 }))
            ];

            // Trộn ngẫu nhiên vị trí các đáp án
            const shuffledOptions = allOptions.sort(() => 0.5 - Math.random());

            // Tạo các option trong database
            for (const option of shuffledOptions) {
                try {
                    await QuizOption.create({
                        questionId: questionId,
                        optionText: option.text,
                        isCorrect: option.isCorrect
                    });
                } catch (error) {
                    console.error('Error creating option:', error);
                    throw error;
                }
            }

            const createdOptions = await QuizOption.findByQuestionId(questionId);
            console.log('Created options:', createdOptions);

            return createdOptions.length === shuffledOptions.length;
        } catch (error) {
            console.error('Error creating quiz options:', error);
            throw error;
        }
    }
}

module.exports = QuizGeneratorService; 