import { WordfreqLoader, DataFetcher, NodeDataFetcher, BrowserDataFetcher } from './loader.js';
import { lossyTokenize } from './tokens.js';
import { smashNumbers, digitFreq } from './numbers.js';
import { getLanguageInfo } from './language_info.js';

export { NodeDataFetcher, BrowserDataFetcher, DataFetcher };

export class Wordfreq {
    private loader: WordfreqLoader;
    private lang: string;
    private wordlistName: string;
    private freqDict: Record<string, number> | null = null;
    private inferredSpaceFactor = 10.0;

    constructor(lang: string, fetcher: DataFetcher, wordlist: string = 'small') {
        this.lang = lang;
        this.wordlistName = wordlist;
        this.loader = new WordfreqLoader(fetcher);
    }

    async init() {
        this.freqDict = await this.loader.getFrequencyDict(this.lang, this.wordlistName);
    }

    /**
     * Get the frequency of a word.
     */
    wordFrequency(word: string, minimum: number = 0.0): number {
        if (!this.freqDict) {
            throw new Error("Wordfreq not initialized. Call init() first.");
        }

        const tokens = lossyTokenize(word, this.lang);
        if (tokens.length === 0) return minimum;

        let oneOverResult = 0.0;
        for (const token of tokens) {
            const smashed = smashNumbers(token);
            let freq = this.freqDict[smashed];
            if (freq === undefined) return minimum;

            if (smashed !== token) {
                freq *= digitFreq(token);
            }
            oneOverResult += 1.0 / freq;
        }

        let freq = 1.0 / oneOverResult;

        // Inferred space factor for languages that usually need specific tokenizers (ZH, JA, KO)
        const info = getLanguageInfo(this.lang);
        const needsFactor = ['zh', 'ja', 'ko'].some(l => this.lang.startsWith(l));
        if (info.tokenizer === 'regex' && needsFactor) {
            freq *= Math.pow(this.inferredSpaceFactor, -(tokens.length - 1));
        }

        const unrounded = Math.max(freq, minimum);
        if (unrounded === 0) return 0;

        // Rounding to 3 significant digits
        const leadingZeroes = Math.floor(-Math.log10(unrounded));
        const precision = leadingZeroes + 3;
        const factor = Math.pow(10, precision);
        return Math.round(unrounded * factor) / factor;
    }

    /**
     * Get the frequency on the Zipf scale.
     */
    zipfFrequency(word: string, minimum: number = 0.0): number {
        const freqMin = this.zipfToFreq(minimum);
        const freq = this.wordFrequency(word, freqMin);
        return Math.round(this.freqToZipf(freq) * 100) / 100;
    }

    private zipfToFreq(zipf: number): number {
        return Math.pow(10, zipf) / 1e9;
    }

    private freqToZipf(freq: number): number {
        return Math.log10(freq) + 9;
    }

    async topNList(n: number, asciiOnly: boolean = false): Promise<string[]> {
        const results: string[] = [];
        for await (const word of this.iterWordlist()) {
            if (asciiOnly && ![...word].every(c => c <= '~')) continue;
            if (!smashNumbers(word).includes('0')) { // simplified has_digit_sequence
                results.push(word);
                if (results.length >= n) return results;
            }
        }
        return results;
    }

    async *iterWordlist(): AsyncIterableIterator<string> {
        const list = await this.loader.getFrequencyList(this.lang, this.wordlistName);
        for (const bucket of list) {
            for (const word of bucket) {
                yield word;
            }
        }
    }

    async randomWords(nWords: number = 5, bitsPerWord: number = 12, asciiOnly: boolean = false): Promise<string> {
        const nChoices = Math.pow(2, bitsPerWord);
        const choices = await this.topNList(nChoices, asciiOnly);
        if (choices.length < nChoices) {
            throw new Error(`Not enough words in wordlist to provide ${bitsPerWord} bits of entropy.`);
        }
        const result: string[] = [];
        for (let i = 0; i < nWords; i++) {
            const idx = Math.floor(Math.random() * choices.length);
            result.push(choices[idx]);
        }
        return result.join(' ');
    }
}

/**
 * Convenience function for static use if one-off is needed.
 */
export async function createWordfreq(
    lang: string,
    fetcher: DataFetcher,
    wordlist: string = 'small'
): Promise<Wordfreq> {
    const wf = new Wordfreq(lang, fetcher, wordlist);
    await wf.init();
    return wf;
}
