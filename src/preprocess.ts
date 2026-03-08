import { getLanguageInfo } from './language_info.js';
import { transliterate } from './transliterate.js';

const MARK_RE = /[\p{Mn}\u0640]/gu; // Mn: Non-spacing mark, \u0640: Arabic Tatweel

export function preprocessText(text: string, lang: string): string {
    const info = getLanguageInfo(lang);

    // Unicode normalization
    let processed = text.normalize(info.normalForm);

    // Transliteration
    if (info.transliteration) {
        processed = transliterate(info.transliteration, processed);
    }

    // Abjad mark removal
    if (info.removeMarks) {
        processed = removeMarks(processed);
    }

    // Case folding
    if (info.dotlessI) {
        processed = casefoldWithIDots(processed);
    } else {
        processed = processed.toLowerCase();
    }

    // Fixing of diacritics
    if (info.diacriticsUnder === 'commas') {
        processed = cedillasToCommas(processed);
    } else if (info.diacriticsUnder === 'cedillas') {
        processed = commasToCedillas(processed);
    }

    return processed;
}

export function removeMarks(text: string): string {
    return text.replace(MARK_RE, '');
}

export function casefoldWithIDots(text: string): string {
    // Turkish dotless I handling
    // İ -> i, I -> ı
    return text.normalize('NFC')
        .replace(/\u0130/g, 'i') // İ
        .replace(/I/g, '\u0131') // I -> ı
        .toLowerCase();
}

export function commasToCedillas(text: string): string {
    // Preferred in Turkish
    return text
        .replace(/\u0219/g, '\u015F') // ș -> ş
        .replace(/\u021B/g, '\u0163'); // ț -> ţ
}

export function cedillasToCommas(text: string): string {
    // Preferred in Romanian
    return text
        .replace(/\u015F/g, '\u0219') // ş -> ș
        .replace(/\u0163/g, '\u021B'); // ţ -> ț
}
