import { Wordfreq, BrowserDataFetcher } from '../src_ts/index.ts';

async function runBrowserTest() {
    const resultDiv = document.getElementById('result');
    const log = (msg) => {
        console.log(msg);
        resultDiv.innerHTML += `<div>${msg}</div>`;
    };

    try {
        log("🚀 Starting Browser Environment Test...");

        // In browser, we use the relative path to the data folder served by the server
        const fetcher = new BrowserDataFetcher('./data');
        const wf = new Wordfreq('en', fetcher, 'small');

        log("⏳ Initializing Wordfreq (fetching small_en.msgpack.gz)...");
        await wf.init();
        log("✅ Initialized.");

        const word = 'javascript';
        const freq = wf.wordFrequency(word);
        const zipf = wf.zipfFrequency(word);

        log(`📊 Results for "${word}":`);
        log(`- Frequency: ${freq.toExponential(2)}`);
        log(`- Zipf Score: ${zipf}`);

        if (freq > 0) {
            log("🎉 BROWSER TEST SUCCESSFUL!");
            resultDiv.style.color = '#00ff00';
        } else {
            throw new Error("Frequency lookup returned 0");
        }
    } catch (error) {
        log(`❌ BROWSER TEST FAILED: ${error.message}`);
        resultDiv.style.color = '#ff0000';
        console.error(error);
    }
}

runBrowserTest();
