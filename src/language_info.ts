export type TokenizerType = 'regex' | 'jieba' | 'mecab' | null;

export interface LanguageInfo {
  script: string;
  tokenizer: TokenizerType;
  normalForm: 'NFC' | 'NFKC';
  removeMarks: boolean;
  dotlessI: boolean;
  diacriticsUnder: 'cedillas' | 'commas' | null;
  transliteration: 'sr-Latn' | 'az-Latn' | null;
  lookupTransliteration: 'zh-Hans' | null;
}

export const SPACELESS_SCRIPTS = [
  'Hira', // Hiragana
  'Kana', // Katakana
  'Thai', // Thai script
  'Khmr', // Khmer script
  'Laoo', // Lao script
  'Mymr', // Burmese script
  'Tale', // Tai Le script
  'Talu', // Tai Lü script
  'Lana', // Lanna script
];

export const EXTRA_JAPANESE_CHARACTERS = "ー々〻〆";

const SCRIPT_DATA: Record<string, string> = {
  'en': 'Latn',
  'de': 'Latn',
  'fr': 'Latn',
  'es': 'Latn',
  'it': 'Latn',
  'pt': 'Latn',
  'nl': 'Latn',
  'sv': 'Latn',
  'nb': 'Latn',
  'da': 'Latn',
  'fi': 'Latn',
  'ru': 'Cyrl',
  'uk': 'Cyrl',
  'bg': 'Cyrl',
  'mk': 'Cyrl',
  'be': 'Cyrl',
  'el': 'Grek',
  'zh': 'Hans',
  'ja': 'Jpan',
  'ko': 'Kore',
  'ar': 'Arab',
  'fa': 'Arab',
  'ur': 'Arab',
  'he': 'Hebr',
  'hi': 'Deva',
  'bn': 'Beng',
  'tr': 'Latn',
  'ro': 'Latn',
  'id': 'Latn',
  'ms': 'Latn',
  'vi': 'Latn',
  'th': 'Thai',
  'cs': 'Latn',
  'pl': 'Latn',
  'hu': 'Latn',
  'sk': 'Latn',
  'sl': 'Latn',
  'lt': 'Latn',
  'lv': 'Latn',
};

export function getLanguageInfo(lang: string): LanguageInfo {
  // Simplified langcode handling for now
  const baseLang = lang.split('-')[0].toLowerCase();
  const script = SCRIPT_DATA[baseLang] || 'Latn';

  const info: LanguageInfo = {
    script: script,
    tokenizer: 'regex',
    normalForm: 'NFKC',
    removeMarks: false,
    dotlessI: false,
    diacriticsUnder: null,
    transliteration: null,
    lookupTransliteration: null,
  };

  if (baseLang === 'ja' || baseLang === 'ko') {
    // We'll use regex fallback as per user request
    info.tokenizer = 'regex'; 
  } else if (baseLang === 'zh' || baseLang === 'yue') {
    info.tokenizer = 'regex';
  } else if (SPACELESS_SCRIPTS.includes(script)) {
    info.tokenizer = null;
  }

  if (['Latn', 'Grek', 'Cyrl'].includes(script)) {
    info.normalForm = 'NFC';
  }

  if (['Arab', 'Hebr'].includes(script)) {
    info.removeMarks = true;
  }

  if (['tr', 'az', 'kk'].includes(baseLang)) {
    info.dotlessI = true;
    info.diacriticsUnder = 'cedillas';
  } else if (baseLang === 'ro') {
    info.diacriticsUnder = 'commas';
  }

  if (baseLang === 'sr') {
    info.transliteration = 'sr-Latn';
  } else if (baseLang === 'az') {
    info.transliteration = 'az-Latn';
  }

  if (baseLang === 'zh' && !lang.toLowerCase().includes('hant')) {
    info.lookupTransliteration = 'zh-Hans';
  }

  return info;
}
