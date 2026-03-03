import { useState, useCallback } from 'react';
import { translateText, speakText } from '../utils/translation';

export const useTranslation = () => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const [cache] = useState(new Map());

    const translate = useCallback(async (text, targetLang) => {
        if (!text) return '';

        // Check cache first
        const cacheKey = `${text}_${targetLang}`;
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsTranslating(true);
        try {
            const translated = await translateText(text, targetLang);

            // Cache the result
            cache.set(cacheKey, translated);
            setTranslatedText(translated);

            return translated;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        } finally {
            setIsTranslating(false);
        }
    }, [cache]);

    const speak = useCallback(async (text, language) => {
        setIsSpeaking(true);
        try {
            await speakText(text, language);
        } catch (error) {
            console.error('Speech error:', error);
        } finally {
            setIsSpeaking(false);
        }
    }, []);

    return {
        translate,
        speak,
        isTranslating,
        isSpeaking,
        translatedText
    };
};