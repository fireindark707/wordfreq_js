import { describe, it, expect } from 'vitest';
import { tokenize, simpleTokenize } from '../src/tokens';

describe('Tokenization', () => {
    it('should tokenize English correctly', () => {
        expect(tokenize("This is a test.", "en")).toEqual(["this", "is", "a", "test"]);
    });

    it('should handle French apostrophes', () => {
        expect(tokenize("l'arc", "fr")).toEqual(["l'", "arc"]);
    });

    it('should group Chinese/Japanese characters (Spaceless logic)', () => {
        // Standard wordfreq-python behavior without jieba/mecab
        expect(tokenize("今天天气不错", "zh")).toEqual(["今天天气不错"]);
        expect(tokenize("Uターン", "ja")).toEqual(["uターン"]);
    });

    it('should handle mixed scripts', () => {
        expect(tokenize("Hello 世界", "en")).toEqual(["hello", "世界"]);
    });
});
