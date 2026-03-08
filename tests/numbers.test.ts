import { describe, it, expect } from 'vitest';
import { benfordFreq, yearFreq, smashNumbers, digitFreq } from '../src/numbers.js';

describe('Numbers', () => {
    it('should estimate Benford frequency', () => {
        // 1xxx should be around 0.3 / 1000 = 0.0003
        expect(benfordFreq('100')).toBeCloseTo(0.003, 5);
        expect(benfordFreq('200')).toBeCloseTo(0.00175, 5);
    });

    it('should estimate Year frequency peaking around 2019-2039', () => {
        const freq2020 = yearFreq('2020');
        const freq1980 = yearFreq('1980');
        const freq2050 = yearFreq('2050');

        expect(freq2020).toBeGreaterThan(freq1980);
        expect(freq2020).toBeGreaterThan(freq2050);
    });

    it('should smash multi-digit sequences', () => {
        expect(smashNumbers('1234')).toBe('0000');
        expect(smashNumbers('version 1.2.3')).toBe('version 0.0.0');
        expect(smashNumbers('price 1,234.56')).toBe('price 0,000.00');
    });

    it('should combine digit frequencies', () => {
        // 1985 is 4 digits -> yearFreq
        // 123 is 3 digits -> benfordFreq
        expect(digitFreq('1985')).toBe(yearFreq('1985'));
        expect(digitFreq('123')).toBe(benfordFreq('123'));
    });
});
