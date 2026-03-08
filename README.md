# wordfreq-js

A high-performance JavaScript port of the Python [wordfreq](https://github.com/rspeer/wordfreq) library. It provides a way to look up the frequency of words in many languages, using a large, multi-source corpus.

This library is designed to work seamlessly in **Node.js**, **Browsers**, and **Chrome Extensions**.

## Features

- **Multi-language Support**: 40+ languages supported (see table below).
- **Cross-Platform**: Works in any JS environment with `DataFetcher` abstraction.
- **Efficient**: Uses compressed MessagePack data files (`.msgpack.gz`) for minimal size and fast loading.
- **Accurate**: Implements the same frequency combining and normalization logic as the original Python version.
- **CJK Support**: Robust regex-based grouping for spaceless scripts (Chinese, Japanese, Thai, etc.).
- **Numbers & Years**: Special handling for digit sequences using Benford's Law and year-frequency distributions.

## Installation

```bash
npm install wordfreq-js
```

*(Note: Data files are stored in the `./data` directory. Ensure they are accessible to your loader.)*

## Usage

### Node.js

```javascript
import { Wordfreq, NodeDataFetcher } from 'wordfreq-js';
import path from 'path';

// Point to your data directory
const dataDir = path.resolve('./data');
const fetcher = new NodeDataFetcher(dataDir);

const wf = new Wordfreq('en', fetcher, 'small');
await wf.init();

console.log(wf.wordFrequency('the'));      // e.g., 0.0537
console.log(wf.zipfFrequency('the'));      // e.g., 7.73
console.log(await wf.topNList(10));       // Top 10 words
```

### Browser / Chrome Extension

In a browser environment, use the `BrowserDataFetcher` which uses the `fetch` API.

```javascript
import { Wordfreq, BrowserDataFetcher } from 'wordfreq-js';

// URL to your data directory
const dataUrl = 'https://your-domain.com/wordfreq-data';
const fetcher = new BrowserDataFetcher(dataUrl);

const wf = new Wordfreq('en', fetcher, 'small');
await wf.init();

console.log(wf.wordFrequency('hello'));
```

## Supported Languages & Statistics

The following table shows the number of unique words收录 in the `small` and `large` versions of each language corpus.

| Language | Small Count | Large Count |
| :--- | :--- | :--- |
| AR (Arabic) | 56,642 | 620,701 |
| BG (Bulgarian) | 37,325 | - |
| BN (Bengali) | 34,322 | 238,743 |
| CA (Catalan) | 27,173 | 185,353 |
| CS (Czech) | 51,940 | 606,360 |
| DA (Danish) | 29,454 | - |
| DE (German) | 39,277 | 634,502 |
| EL (Greek) | 46,916 | - |
| EN (English) | 28,917 | 321,180 |
| ES (Spanish) | 34,925 | 342,072 |
| FA (Persian) | 31,389 | - |
| FI (Finnish) | 59,359 | 734,205 |
| FIL (Filipino) | 30,270 | - |
| FR (French) | 31,385 | 311,419 |
| HE (Hebrew) | 58,370 | 591,944 |
| HI (Hindi) | 26,653 | - |
| HU (Hungarian) | 46,702 | - |
| ID (Indonesian) | 31,188 | - |
| IS (Icelandic) | 42,304 | - |
| IT (Italian) | 36,106 | 322,796 |
| JA (Japanese) | 30,215 | 214,960 |
| KO (Korean) | 29,988 | - |
| LT (Lithuanian) | 64,162 | - |
| LV (Latvian) | 45,631 | - |
| MK (Macedonian) | 33,966 | 260,128 |
| MS (Malay) | 28,773 | - |
| NB (Norwegian Bokmål) | 26,117 | 318,881 |
| NL (Dutch) | 28,962 | 311,278 |
| PL (Polish) | 49,879 | 453,320 |
| PT (Portuguese) | 33,313 | 267,979 |
| RO (Romanian) | 43,413 | - |
| RU (Russian) | 61,193 | 713,447 |
| SH (Serbo-Croatian) | 54,841 | - |
| SK (Slovak) | 59,644 | - |
| SL (Slovenian) | 54,047 | - |
| SV (Swedish) | 30,676 | 340,815 |
| TA (Tamil) | 68,526 | - |
| TR (Turkish) | 63,345 | - |
| UK (Ukrainian) | 48,149 | 443,616 |
| UR (Urdu) | 23,201 | - |
| VI (Vietnamese) | 10,719 | - |
| ZH (Chinese) | 38,590 | 334,609 |

## Credits

This project is a port of the excellent [wordfreq](https://github.com/rspeer/wordfreq) library created by **Robyn Speer**.

Special thanks to the Luminoso team and all contributors to the original Python version for their hard work in gathering and cleaning the word frequency data.

## License

This port is licensed under the same terms as the original `wordfreq` library (MIT or similar, depending on the data source licenses). See the original repository for details on data licensing.
