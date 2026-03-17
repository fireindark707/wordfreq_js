# Wordfreq-js Chrome 插件使用教程

`wordfreq-js` 被设计为高度兼容浏览器和 Chrome 插件环境。在扩展程序中，主要面临两个环境：**Service Worker** (后台脚本) 和 **Content Script** (注入到网页的脚本) / **Popup** (弹窗脚本)。

为了在这两种环境中使用它，你需要加载核心的构建包 (`wordfreq.bundle.js` 或 `wordfreq.iife.js`)，并允许插件加载存在本地的分析数据 (`.msgpack.gz`)。

---

## 步骤 1：准备文件层次结构

将 `wordfreq-js` 引入你的插件项目中。典型的目录结构如下：

```text
my-chrome-extension/
├── manifest.json
├── background.js              # 你的 Service Worker
├── content.js                 # 你的 Content Script
├── dist/
│   ├── wordfreq.bundle.js     # ESM 格式构建包（用于 Service Worker）
│   └── wordfreq.iife.js       # 全局变量格式构建包（用于 Content Script/Popup）
└── data/                      # 词库数据目录
    ├── small_en.msgpack.gz
    ├── small_zh.msgpack.gz
    └── ...
```

你可以直接从本项目把生成的 `dist/` 文件夹和装有对应语言词库的 `data/` 文件夹（不需要全部语言，只保留你业务需要的即可，以缩小插件体积）复制到你的插件目录下。

---

## 步骤 2：配置 `manifest.json`

最关键的一步是，如果你使用的是基于 `fetch` 加载本地数据（在浏览器中这是唯一的办法），你必须将数据文件夹标记为对拓展可访问的内容 (`web_accessible_resources`)，否则由于安全策略会导致无法加载 `msgpack.gz`。

```json
{
  "manifest_version": 3,
  "name": "My Wordfreq Extension",
  "version": "1.0",
  "background": {
    "service_worker": "background.js",
    "type": "module" 
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["dist/wordfreq.iife.js", "content.js"]
    }
  ],
  "web_accessible_resources": [
    {
      "resources": [
        "data/*.msgpack.gz"
      ],
      "matches": ["<all_urls>"]
    }
  ]
}
```

*注意：`background.type: "module"` 是必须的，因为 `wordfreq.bundle.js` 是 ESM (ES Modules) 格式。对于 Content Script，你可以按顺序引入 `iife` 构建包文件，它会暴露 `WordfreqLib` 全局变量。*

---

## 步骤 3：在 Service Worker (`background.js`) 中使用

服务工作线程 (Service Worker) 支持 ESM 模块，因此你可以直接 `import`。加载数据时，需要利用 `chrome.runtime.getURL()` 将相对路径转为插件的绝对路径。

```javascript
// background.js
import { Wordfreq, BrowserDataFetcher } from './dist/wordfreq.bundle.js';

// 1. 获取插件内 data 目录的基础绝对路径
const dataBaseUrl = chrome.runtime.getURL('data');

// 2. 初始化抓取器
const fetcher = new BrowserDataFetcher(dataBaseUrl);

// 3. 初始化需要查询的语言实例
const wf = new Wordfreq('en', fetcher, 'small');

async function initialize() {
  await wf.init();
  console.log("English Wordfreq initialized in Background.");
  
  // 4. 查词
  const freq = wf.wordFrequency('hello');
  console.log('Frequency of "hello":', freq);
  
  const zipf = wf.zipfFrequency('hello');
  console.log('Zipf scale for "hello":', zipf);
}

initialize();
```

---

## 步骤 4：在 Content Script (`content.js`) 或 Popup 中使用

Content Script 和普通的 Web 页面、Popup 弹窗最适合使用全局变量构建版本 `wordfreq.iife.js`。

在你的 `manifest.json` 中，由于 `"js": ["dist/wordfreq.iife.js", "content.js"]` 的加载顺序，`WordfreqLib` 将在 `content.js` 执行前挂载到 `window` / 全局作用域下。

```javascript
// content.js
// WordfreqLib 由之前注入的 dist/wordfreq.iife.js 暴露

(async () => {
    try {
        const { Wordfreq, BrowserDataFetcher } = WordfreqLib;
        
        // 1. 获取 data 目录的基础路径
        const dataBaseUrl = chrome.runtime.getURL('data');
        const fetcher = new BrowserDataFetcher(dataBaseUrl);
        
        // 2. 初始化查询实例
        const wf = new Wordfreq('en', fetcher, 'small');
        await wf.init();
        
        console.log("Wordfreq initialized in Content Script.");

        // 测试一个页面上的词汇
        const wordToCheck = 'website';
        console.log(`Frequency for ${wordToCheck}:`, wf.wordFrequency(wordToCheck));
        
    } catch (e) {
        console.error("Failed to initialize Wordfreq: ", e);
    }
})();
```

---

## Q&A: 优化插件体积

`data/` 目录非常庞大，包含数十个上百兆的压缩包。若要发布扩展，强烈建议**只保留你确定支持的语言**。

例如，若你的插件只查英文小语料，可以将 `data` 目录精简到只留下：
`data/small_en.msgpack.gz`（仅仅 100 多 KB 的大小），这将极大地优化用户的安装体验。
