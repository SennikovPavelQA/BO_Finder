<h1>
  <img src="icon.png" width="48" align="absmiddle" alt="BO Finder Logo">&nbsp;&nbsp;BO Finder - Chrome Extension
</h1>

A minimalist Google Chrome extension that extracts, alphabetically sorts, and beautifully displays bookmarks from a specific target folder. Designed for speed, simplicity, and ease of use.

## ✨ Features

* **Alphabetical Grouping:** Automatically fetches bookmarks from a designated folder and groups them by their starting letter.
* **Smart Search:** Fast, real-time search filtering exclusively by bookmark titles to prevent URL clutter.
* **Text Highlighting:** Soft, Material-style highlighting for search matches.
* **Auto Dark Mode:** Seamlessly adapts to your system or browser's dark/light theme preferences using native CSS media queries (`prefers-color-scheme`).
* **Minimalist UI:** Clean interface with no distractions, focusing entirely on your links and search input.
* **Input Validation:** Prevents invalid character inputs (like Cyrillic) with a native visual shake animation.

## 🚀 Installation

1. Go to the **[Releases](https://github.com/SennikovPavelQA/BO_Finder/releases/tag/v1.0.0)** page of this repository.
2. Download the `BO_Finder.zip` file from the latest release.
3. Extract the downloaded ZIP archive to any folder on your computer.
4. Open Google Chrome and navigate to `chrome://extensions/`.
5. Enable **Developer mode** (toggle switch in the top right corner).
6. Click the **Load unpacked** button in the top left.
7. Select the folder where you extracted the files.
8. The extension is now installed and ready to use!

## ⚙️ Configuration

By default, the extension looks for a bookmark folder named **"BO"**. 
To change the target folder, open `popup.js` and modify the constant at the top of the file:

```javascript
// Change this to your desired bookmark folder name
const TARGET_FOLDER_NAME = "YourFolderName";
