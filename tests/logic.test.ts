import { describe, it, expect } from 'vitest';
import { Wordfreq, DataFetcher } from '../src/index.js';

class MockFetcher implements DataFetcher {
    async fetch(lang: string, wordlist: string): Promise<Uint8Array> {
        // Return a dummy cBpack (msgpack + gzip)
        // Actually, it's easier to mock the frequency dict if we can, 
        // but the loader decodes it. 
        // For unit testing the frequency logic, let's just bypass the loader in a test-only way 
        // or provide valid msgpack data.
        return new Uint8Array();
    }
}

describe('Wordfreq Logic', () => {
    it('should combine frequencies correctly: 1/f = 1/f1 + 1/f2', async () => {
        const wf = new Wordfreq('en', new MockFetcher(), 'small');
        // Inject mock frequency dict
        (wf as any).freqDict = {
            'heavy': 0.1,
            'metal': 0.1
        };

        // 1/f = 1/0.1 + 1/0.1 = 10 + 10 = 20
        // f = 1/20 = 0.05
        expect(wf.wordFrequency('heavy metal')).toBe(0.05);
    });

    it('should apply CJK inferred space factor', () => {
        const wf = new Wordfreq('zh', new MockFetcher(), 'small');
        (wf as any).freqDict = {
            '你好': 0.1,
            '世界': 0.1
        };

        // Tokens: ['你好', '世界'] (2 tokens)
        // base freq = 0.05
        // CJK factor = 10.0
        // result = 0.05 * 10.0^-(2-1) = 0.005
        expect(wf.wordFrequency('你好世界')).toBe(0.005);
    });

    it('should handle missing tokens by returning minimum', () => {
        const wf = new Wordfreq('en', new MockFetcher(), 'small');
        (wf as any).freqDict = { 'known': 0.1 };
        expect(wf.wordFrequency('known unknown', 0.001)).toBe(0.001);
    });
});
