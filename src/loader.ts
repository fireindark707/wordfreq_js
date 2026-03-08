import * as msgpack from '@msgpack/msgpack';
import pako from 'pako';

export interface CBPackHeader {
    format: 'cB';
    version: number;
}

export type FrequencyList = string[][];

export interface DataFetcher {
    fetch(lang: string, wordlist: string): Promise<Uint8Array>;
}

/**
 * Node.js fetcher that reads from the local filesystem.
 */
export class NodeDataFetcher implements DataFetcher {
    private dataDir: string;

    constructor(dataDir: string) {
        this.dataDir = dataDir;
    }

    async fetch(lang: string, wordlist: string): Promise<Uint8Array> {
        // In a real environment, we'd use 'fs'
        // For this port, we'll assume the browser tool can handle the dual nature.
        // I'll implement a dynamic import for 'fs' to avoid crashing in the browser.
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const filename = `${wordlist}_${lang}.msgpack.gz`;
            const filePath = path.join(this.dataDir, filename);
            const buffer = await fs.readFile(filePath);
            return new Uint8Array(buffer);
        } catch (e) {
            throw new Error(`Failed to read wordlist ${wordlist} for ${lang} from disk: ${e}`);
        }
    }
}

/**
 * Browser fetcher that uses the fetch API.
 */
export class BrowserDataFetcher implements DataFetcher {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async fetch(lang: string, wordlist: string): Promise<Uint8Array> {
        const filename = `${wordlist}_${lang}.msgpack.gz`;
        const url = `${this.baseUrl}/${filename}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch wordlist ${wordlist} for ${lang} from ${url}`);
        }
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    }
}

export class WordfreqLoader {
    private fetcher: DataFetcher;
    private cache: Map<string, FrequencyList> = new Map();

    constructor(fetcher: DataFetcher) {
        this.fetcher = fetcher;
    }

    async getFrequencyList(lang: string, wordlist: string = 'small'): Promise<FrequencyList> {
        const cacheKey = `${lang}_${wordlist}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        const compressed = await this.fetcher.fetch(lang, wordlist);
        const decompressed = pako.ungzip(compressed);
        const data = msgpack.decode(decompressed) as any[];

        const header = data[0] as CBPackHeader;
        if (header.format !== 'cB' || header.version !== 1) {
            throw new Error(`Invalid cBpack header: ${JSON.stringify(header)}`);
        }

        const freqList = data.slice(1) as FrequencyList;
        this.cache.set(cacheKey, freqList);
        return freqList;
    }

    async getFrequencyDict(lang: string, wordlist: string = 'small'): Promise<Record<string, number>> {
        const list = await this.getFrequencyList(lang, wordlist);
        const dict: Record<string, number> = {};
        for (let i = 0; i < list.length; i++) {
            const bucket = list[i];
            const freq = Math.pow(10, -i / 100);
            for (const word of bucket) {
                dict[word] = freq;
            }
        }
        return dict;
    }
}
