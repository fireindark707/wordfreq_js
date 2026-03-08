import { describe, it, expect } from 'vitest';
import { transliterate } from '../src/transliterate.js';

describe('Transliteration', () => {
    it('should transliterate Serbian Cyrillic to Latin', () => {
        expect(transliterate('sr-Latn', 'схваташ')).toBe('shvataš');
        expect(transliterate('sr-Latn', 'культуры')).toBe("kul'tury");
        expect(transliterate('sr-Latn', 'АБВГ')).toBe('ABVG');
    });

    it('should transliterate Azerbaijani Cyrillic to Latin', () => {
        expect(transliterate('az-Latn', 'бағырты')).toBe('bağırtı');
        expect(transliterate('az-Latn', 'Ҹәб')).toBe('Cəb');
    });

    it('should pass through unknown characters', () => {
        expect(transliterate('sr-Latn', 'Hello 123')).toBe('Hello 123');
    });
});
