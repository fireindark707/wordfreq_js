import { getLanguageInfo, SPACELESS_SCRIPTS, EXTRA_JAPANESE_CHARACTERS } from './language_info.js';
import { preprocessText } from './preprocess.js';

// JS doesn't have \p{IsIdeo} in standard RegExp yet (some browsers do, but we want compatibility)
// We'll use a range that covers most Han ideographs.
// Han range: \u4E00-\u9FFF, \u3400-\u4DBF, \u20000-\u2A6DF, etc.
const HAN_RANGE = '\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF';
const HIRAGANA_RANGE = '\u3040-\u309F';
const KATAKANA_RANGE = '\u30A0-\u30FF';
const THAI_RANGE = '\u0E00-\u0E7F';
const KHMER_RANGE = '\u1780-\u17FF';
const LAO_RANGE = '\u0E80-\u0EFF';
const BURMESE_RANGE = '\u1000-\u109F';

const SPACELESS_CHARS = HAN_RANGE + HIRAGANA_RANGE + KATAKANA_RANGE + THAI_RANGE + KHMER_RANGE + LAO_RANGE + BURMESE_RANGE + EXTRA_JAPANESE_CHARACTERS;

// Vowels for French/Catalan apostrophe rule
const INITIAL_VOWEL_EXPR = "AEHIOUY\u00C1\u00C9\u00CD\u00D3\u00DA\u00C0\u00C8\u00CC\u00D2\u00D9\u00C2\u00CA\u00CE\u00D4\u00DB\u00C5\u00CF\u00D6\u0152aehiouy\u00E1\u00E9\u00ED\u00F3\u00FA\u00E0\u00E8\u00EC\u00F2\u00F9\u00E2\u00EA\u00EE\u00F4\u00FB\u00E5\u00EF\u00F6\u0153";

const WORD_CHAR = '\\p{L}\\p{M}\\p{N}\\p{So}';

const TOKEN_RE = new RegExp(
    `([${SPACELESS_CHARS}]+)` +
    `|(@s(?![${WORD_CHAR}]))` +
    `|((?:(?=[${WORD_CHAR}])(?![${SPACELESS_CHARS}])(?!([${WORD_CHAR}]{1,2}['’][${INITIAL_VOWEL_EXPR}])).)+)` +
    `|([${WORD_CHAR}]{1,2}['’])`,
    'gu'
);

const TOKEN_RE_WITH_PUNCT = new RegExp(
    `([${SPACELESS_CHARS}]+)` +
    `|(@s(?![${WORD_CHAR}]))` +
    `|([\\p{P}]+)` +
    `|((?:(?=[${WORD_CHAR}])(?![${SPACELESS_CHARS}])(?!([${WORD_CHAR}]{1,2}['’][${INITIAL_VOWEL_EXPR}])).)+)` +
    `|([${WORD_CHAR}]{1,2}['’])`,
    'gu'
);

const PUNCT_RE = /\p{P}+/u;

/**
 * Port of simple_tokenize from Python.
 */
export function simpleTokenize(text: string, includePunctuation: boolean = false): string[] {
    const normText = text.normalize('NFC');
    const re = includePunctuation ? TOKEN_RE_WITH_PUNCT : TOKEN_RE;
    const matches = Array.from(normText.matchAll(re));

    const tokens: string[] = [];
    for (const match of matches) {
        let token = match[0];
        if (!includePunctuation) {
            token = token.replace(/^'+|'+$/g, '').toLowerCase();
        } else {
            token = token.toLowerCase();
        }
        if (token) tokens.push(token);
    }
    return tokens;
}

/**
 * Port of tokenize from Python.
 */
export function tokenize(
    text: string,
    lang: string,
    includePunctuation: boolean = false
): string[] {
    const info = getLanguageInfo(lang);
    const processed = preprocessText(text, lang);

    // User requested to skip complex tokenizers (Jieba/MeCab), 
    // so we always use simpleTokenize which has the SPACELESS_CHARS grouping.
    let tokens = simpleTokenize(processed, includePunctuation);

    return tokens;
}

/**
 * Port of lossy_tokenize from Python.
 */
export function lossyTokenize(
    text: string,
    lang: string,
    includePunctuation: boolean = false
): string[] {
    const uncurl = (t: string) => t.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
    const tokens = tokenize(text, lang, includePunctuation);
    return tokens.map(uncurl);
}
