// Frequencies of leading digits, according to Benford's law, sort of.
const DIGIT_FREQS = [0.009, 0.300, 0.175, 0.124, 0.096, 0.078, 0.066, 0.057, 0.050, 0.045];

const YEAR_LOG_PEAK = -1.9185;
const NOT_YEAR_PROB = 0.1;
const REFERENCE_YEAR = 2019;
const PLATEAU_WIDTH = 20;

const DIGIT_RE = /\d/g;
const MULTI_DIGIT_RE = /\d[\d.,]+/g;
const PURE_DIGIT_RE = /\d+/g;

export function benfordFreq(text: string): number {
    const firstDigit = parseInt(text[0], 10);
    return DIGIT_FREQS[firstDigit] / Math.pow(10, text.length - 1);
}

export function yearFreq(text: string): number {
    const year = parseInt(text, 10);
    let yearLogFreq: number;

    if (year <= REFERENCE_YEAR) {
        yearLogFreq = YEAR_LOG_PEAK - 0.0083 * (REFERENCE_YEAR - year);
    } else if (year <= REFERENCE_YEAR + PLATEAU_WIDTH) {
        yearLogFreq = YEAR_LOG_PEAK;
    } else {
        yearLogFreq = YEAR_LOG_PEAK - 0.2 * (year - (REFERENCE_YEAR + PLATEAU_WIDTH));
    }

    const yearProb = Math.pow(10, yearLogFreq);
    const notYearProb = NOT_YEAR_PROB * benfordFreq(text);
    return yearProb + notYearProb;
}

export function digitFreq(text: string): number {
    let freq = 1.0;
    const matches = text.match(MULTI_DIGIT_RE);
    if (matches) {
        for (const match of matches) {
            const submatches = match.match(PURE_DIGIT_RE);
            if (submatches) {
                for (const submatch of submatches) {
                    if (submatch.length === 4) {
                        freq *= yearFreq(submatch);
                    } else {
                        freq *= benfordFreq(submatch);
                    }
                }
            }
        }
    }
    return freq;
}

export function hasDigitSequence(text: string): boolean {
    return MULTI_DIGIT_RE.test(text);
}

export function smashNumbers(text: string): string {
    return text.replace(MULTI_DIGIT_RE, (match) => {
        return match.replace(DIGIT_RE, '0');
    });
}
