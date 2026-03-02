// Free translation API using MyMemory (no API key required)
export const translateText = async (text, targetLang) => {
    if (!text || targetLang === 'en') return text;

    try {
        // MyMemory Translation API - Free, no key required
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
        );

        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }

        return text;
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
};

// Text-to-Speech function
export const speakText = (text, language) => {
    return new Promise((resolve, reject) => {
        if (!window.speechSynthesis) {
            reject('Text-to-speech not supported');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => resolve();
        utterance.onerror = (error) => reject(error);

        window.speechSynthesis.speak(utterance);
    });
};

// Batch translate multiple texts
export const translateBatch = async (texts, targetLang) => {
    if (targetLang === 'en') return texts;

    try {
        const promises = texts.map(text => translateText(text, targetLang));
        return await Promise.all(promises);
    } catch (error) {
        console.error('Batch translation error:', error);
        return texts;
    }
};