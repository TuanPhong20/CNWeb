const Word = require('../models/Word');

class AnswerGeneratorService {
    // Tạo đáp án sai cho câu hỏi về nghĩa
    static async generateMeaningAnswers(correctWord, count = 3) {
        try {
            const allWords = await Word.findAll();
            if (!allWords || allWords.length === 0) {
                return this.generateFallbackAnswers('vi', count);
            }

            // Lọc bỏ từ hiện tại và lấy các nghĩa tiếng Việt
            const otherMeanings = allWords
                .filter(word => word.Meaning !== correctWord.Meaning)
                .map(word => word.Meaning);

            if (otherMeanings.length === 0) {
                return this.generateFallbackAnswers('vi', count);
            }

            // Trộn và lấy số lượng cần thiết
            return this.shuffleAndSlice(otherMeanings, count);
        } catch (error) {
            console.error('Error generating meaning answers:', error);
            return this.generateFallbackAnswers('vi', count);
        }
    }

    // Tạo đáp án sai cho câu hỏi về từ tiếng Anh
    static async generateEnglishAnswers(correctWord, count = 3) {
        try {
            const allWords = await Word.findAll();
            if (!allWords || allWords.length === 0) {
                return this.generateFallbackAnswers('en', count);
            }

            // Lọc bỏ từ hiện tại và lấy các từ tiếng Anh
            const otherWords = allWords
                .filter(word => word.English !== correctWord.English)
                .map(word => word.English);

            if (otherWords.length === 0) {
                return this.generateFallbackAnswers('en', count);
            }

            // Trộn và lấy số lượng cần thiết
            return this.shuffleAndSlice(otherWords, count);
        } catch (error) {
            console.error('Error generating English answers:', error);
            return this.generateFallbackAnswers('en', count);
        }
    }

    // Tạo đáp án sai cho câu hỏi về phát âm
    static generatePronunciationAnswers(correctPronunciation, count = 3) {
        try {
            console.log('Generating wrong pronunciations for:', correctPronunciation);

            const commonMistakes = {
                'ə': ['a', 'ʌ', 'e'],
                'ː': ['', ':', '.'],
                'æ': ['a', 'ʌ', 'e'],
                'ʌ': ['a', 'æ', 'ə'],
                'ɪ': ['i', 'i:', 'e'],
                'ʊ': ['u', 'u:', 'o'],
                'ɒ': ['o', 'ɔ', 'ʌ'],
                'ɔ': ['o', 'ɒ', 'ʊ'],
                'ɜ': ['ə', 'e', 'ʌ'],
                'ŋ': ['n', 'ng', 'ŋg'],
                'θ': ['t', 'th', 'f'],
                'ð': ['d', 'th', 'v'],
                'ʃ': ['s', 'sh', 'tʃ'],
                'ʒ': ['z', 'zh', 'dʒ'],
                'tʃ': ['t', 'ts', 'ʃ'],
                'dʒ': ['d', 'dz', 'ʒ'],
                'i:': ['i', 'ɪ', 'e'],
                'u:': ['u', 'ʊ', 'o'],
                'r': ['ɹ', 'l', 'w'],
                't': ['d', 'ʔ', 'th'],
                'iː': ['i', 'ɪ', 'e'],
                'ɹ': ['r', 'l', 'w'],
                'tɹ': ['tr', 't', 'dr']
            };

            const wrongPronunciations = [];
            let attempts = 0;
            const maxAttempts = 15;  // Tăng số lần thử

            while (wrongPronunciations.length < count && attempts < maxAttempts) {
                let wrongPron = correctPronunciation;
                
                // Tìm các ký tự IPA trong phát âm đúng
                const ipaChars = Object.keys(commonMistakes).filter(char => 
                    correctPronunciation.includes(char)
                );

                if (ipaChars.length > 0) {
                    // Chọn ngẫu nhiên một ký tự IPA để thay đổi
                    const randomChar = ipaChars[Math.floor(Math.random() * ipaChars.length)];
                    const replacements = commonMistakes[randomChar];
                    const replacement = replacements[Math.floor(Math.random() * replacements.length)];
                    
                    wrongPron = wrongPron.replace(new RegExp(randomChar, 'g'), replacement);

                    // Chỉ thêm vào nếu khác với phát âm đúng và chưa có trong danh sách
                    if (wrongPron !== correctPronunciation && !wrongPronunciations.includes(wrongPron)) {
                        wrongPronunciations.push(wrongPron);
                    }
                }
                
                attempts++;
            }

            // Nếu không đủ số lượng, thêm các phát âm mặc định
            if (wrongPronunciations.length < count) {
                console.log('Not enough variations generated, adding default wrong pronunciations');
                
                // Tạo các biến thể mặc định dựa trên phát âm đúng
                const defaultVariations = [
                    correctPronunciation.replace('ɹ', 'r'),
                    correctPronunciation.replace('iː', 'i'),
                    correctPronunciation.replace('tɹ', 'tr'),
                    correctPronunciation.replace('iː', 'ia'),
                    correctPronunciation.replace('iː', 'i.')
                ];

                for (const variation of defaultVariations) {
                    if (wrongPronunciations.length >= count) break;
                    if (!wrongPronunciations.includes(variation) && variation !== correctPronunciation) {
                        wrongPronunciations.push(variation);
                    }
                }
            }

            // Nếu vẫn chưa đủ, thêm biến thể đơn giản
            while (wrongPronunciations.length < count) {
                const simpleVariation = correctPronunciation.replace(/[əːæʌɪʊɒɔɜŋθðʃʒ]/g, 'a');
                if (!wrongPronunciations.includes(simpleVariation)) {
                    wrongPronunciations.push(simpleVariation);
                } else {
                    wrongPronunciations.push(correctPronunciation + ".");
                }
            }

            console.log('Generated wrong pronunciations:', wrongPronunciations);
            return wrongPronunciations;
        } catch (error) {
            console.error('Error generating pronunciation answers:', error);
            // Trả về một số phát âm mặc định an toàn
            return [
                correctPronunciation.replace(/[əːæʌɪʊɒɔɜŋθðʃʒ]/g, 'a'),
                correctPronunciation + ".",
                correctPronunciation.replace(/ː/g, '')
            ];
        }
    }

    // Tạo đáp án sai cho câu hỏi nghe audio
    static async generateAudioAnswers(correctWord, count = 3) {
        // Với câu hỏi nghe, ta cần trả về nghĩa tiếng Việt sai
        return await this.generateMeaningAnswers(correctWord, count);
    }

    // Hàm hỗ trợ tạo đáp án mặc định khi không có dữ liệu
    static generateFallbackAnswers(language = 'en', count = 3) {
        if (language === 'vi') {
            return Array.from({ length: count }, (_, i) => `Không đúng ${i + 1}`);
        }
        return Array.from({ length: count }, (_, i) => `Wrong ${i + 1}`);
    }

    // Hàm hỗ trợ trộn mảng và lấy số phần tử cần thiết
    static shuffleAndSlice(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

module.exports = AnswerGeneratorService; 