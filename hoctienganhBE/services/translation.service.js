const axios = require('axios');
const { translate } = require('@vitalets/google-translate-api');

class TranslationService {
    static async getWordInfo(englishWord) {
        try {
            // Lấy phiên âm từ Free Dictionary API
            const pronunciationResponse = await axios.get(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${englishWord}`
            );
            
            // Lấy phiên âm IPA từ nhiều vị trí có thể có
            let phonetic = '';
            const data = pronunciationResponse.data[0];
            
            if (data) {
                // Thử lấy từ trường phonetic trực tiếp
                if (data.phonetic) {
                    phonetic = data.phonetic;
                }
                // Nếu không có, thử lấy từ mảng phonetics
                else if (data.phonetics && data.phonetics.length > 0) {
                    // Tìm phiên âm có text
                    const phoneticEntry = data.phonetics.find(p => p.text);
                    if (phoneticEntry) {
                        phonetic = phoneticEntry.text;
                    }
                }
            }

            // Lấy audio URL từ mảng phonetics (ưu tiên phát âm UK)
            let audioUrl = '';
            if (data && data.phonetics) {
                // Tìm audio UK trước
                const ukPhonetic = data.phonetics.find(p => p.audio && p.audio.includes('-uk.'));
                // Nếu không có audio UK, lấy audio đầu tiên có sẵn
                const anyPhonetic = data.phonetics.find(p => p.audio);
                audioUrl = (ukPhonetic || anyPhonetic)?.audio || '';
            }

            // Dịch sang tiếng Việt
            const { text: meaning } = await translate(englishWord, { to: 'vi' });

            return {
                englishText: englishWord,
                vietnameseText: meaning,
                pronunciation: phonetic,
                audioUrl,
                imageUrl: '' // Có thể tích hợp API hình ảnh sau này
            };
        } catch (error) {
            console.error('Error fetching word information:', error);
            throw new Error('Could not fetch word information: ' + error.message);
        }
    }
}

module.exports = TranslationService; 