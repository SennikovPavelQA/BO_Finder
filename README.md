# BO Finder - Chrome Extension

A minimalist Google Chrome extension that extracts, alphabetically sorts, and beautifully displays bookmarks from a specific target folder. Designed for speed, simplicity, and ease of use.

## ✨ Features

* **Alphabetical Grouping:** Automatically fetches bookmarks from a designated folder and groups them by their starting letter.
* **Smart Search:** Fast, real-time search filtering exclusively by bookmark titles to prevent URL clutter.
* **Text Highlighting:** Soft, Material-style highlighting for search matches.
* **Auto Dark Mode:** Seamlessly adapts to your system or browser's dark/light theme preferences using native CSS media queries (`prefers-color-scheme`).
* **Minimalist UI:** Clean interface with no distractions, focusing entirely on your links and search input.
* **Input Validation:** Prevents invalid character inputs (like Cyrillic) with a native visual shake animation.

## 🚀 Installation (Developer Mode)

Since this extension is not currently published in the Chrome Web Store, you can install it manually:

1. Clone this repository or download the ZIP file and extract it.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle switch in the top right corner).
4. Click the **Load unpacked** button in the top left.
5. Select the folder containing the extension files.
6. The extension icon will appear in your browser toolbar!

## ⚙️ Configuration

By default, the extension looks for a bookmark folder named **"BO"**. 
To change the target folder, open `popup.js` and modify the constant at the top of the file:

```javascript
// Change this to your desired bookmark folder name
const TARGET_FOLDER_NAME = "YourFolderName";
