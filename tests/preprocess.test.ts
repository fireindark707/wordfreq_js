import { describe, it, expect } from 'vitest';
import { preprocessText, casefoldWithIDots, removeMarks } from '../src/preprocess';

describe('Preprocessing', () => {
    it('should casefold English correctly', () => {
        expect(preprocessText('Word', 'en')).toBe('word');
    });

    it('should handle German sharp S', () => {
        expect(preprocessText('groß', 'de')).toBe('gross');
    });

    it('should handle Turkish dotless I', () => {
        expect(preprocessText('HAKKINDA İSTANBUL', 'tr')).toBe('hakkında istanbul');
        expect(casefoldWithIDots('I')).toBe('ı');
    });

    it('should remove Arabic marks', () => {
        expect(removeMarks('كَلِمَة')).toBe('كلمة');
        expect(removeMarks('الحمــــــد')).toBe('الحمد');
    });

    it('should handle Romanian commas', () => {
        expect(preprocessText('ACELAŞI', 'ro')).toBe('același');
    });
});
