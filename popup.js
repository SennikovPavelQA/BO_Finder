// ====== НАСТРОЙКА ======
// Укажите точное название папки с закладками (с учетом регистра)
const TARGET_FOLDER_NAME = "BO"; 
// =======================

let allBookmarks = [];

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    
    // Принудительно ставим курсор в поле поиска
    searchInput.focus();

    // Получаем все закладки
    const tree = await chrome.bookmarks.getTree();
    
    // Ищем нужную папку
    const folderNode = findFolderNode(tree, TARGET_FOLDER_NAME);
    
    if (!folderNode) {
        document.getElementById('content').innerHTML = `<p style="color:red">Папка "${TARGET_FOLDER_NAME}" не найдена.</p>`;
        return;
    }

    // Извлекаем все ссылки из папки
    allBookmarks = extractLinks(folderNode);
    
    // Первичная отрисовка
    renderUI(allBookmarks);

    // Слушатель для строки поиска
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allBookmarks.filter(bm => 
            bm.title.toLowerCase().includes(query) || 
            bm.url.toLowerCase().includes(query)
        );
        renderUI(filtered);
    });
});

// Рекурсивный поиск папки по дереву
function findFolderNode(nodes, folderName) {
    for (let node of nodes) {
        if (!node.url && node.title === folderName) {
            return node;
        }
        if (node.children) {
            let found = findFolderNode(node.children, folderName);
            if (found) return found;
        }
    }
    return null;
}

// Рекурсивное извлечение ссылок (включая ссылки в подпапках, если есть)
function extractLinks(node) {
    let links = [];
    if (node.url) {
        links.push({ title: node.title, url: node.url, id: node.id });
    }
    if (node.children) {
        node.children.forEach(child => links.push(...extractLinks(child)));
    }
    return links;
}

// Отрисовка интерфейса
function renderUI(bookmarks) {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    
    sidebar.innerHTML = '';
    content.innerHTML = '';

    if (bookmarks.length === 0) {
        content.innerHTML = '<p style="color:#5f6368">Ничего не найдено.</p>';
        return;
    }

    // Группируем и сортируем закладки
    const groups = groupAndSort(bookmarks);

    // Создаем элементы DOM
    for (const letter of Object.keys(groups).sort()) {
        // Создаем букву в боковом меню
        const letterNav = document.createElement('div');
        letterNav.textContent = letter;
        letterNav.addEventListener('click', () => {
            const section = document.getElementById(`group-${letter}`);
            if (section) section.scrollIntoView();
        });
        sidebar.appendChild(letterNav);

        // Создаем блок контента для этой буквы
        const groupDiv = document.createElement('div');
        groupDiv.className = 'letter-group';
        groupDiv.id = `group-${letter}`;

        const groupTitle = document.createElement('div');
        groupTitle.className = 'letter-title';
        groupTitle.textContent = letter;
        groupDiv.appendChild(groupTitle);

        groups[letter].forEach(bm => {
            const linkElement = document.createElement('a');
            linkElement.className = 'bookmark-item';
            linkElement.href = bm.url;
            linkElement.target = '_blank'; // открывать в новой вкладке

            // 1. Создаем иконку
            const iconImg = document.createElement('img');
            iconImg.className = 'favicon';
            iconImg.src = getFaviconUrl(bm.url);
            iconImg.alt = ''; // пустой alt, так как это декоративный элемент

            // 2. Создаем контейнер для текста
            const textContainer = document.createElement('div');
            textContainer.className = 'bookmark-text-container';

            // 3. Создаем заголовок безопасно (через textContent)
            const titleDiv = document.createElement('div');
            titleDiv.className = 'bookmark-title';
            titleDiv.textContent = bm.title || bm.url;

            // 4. Создаем подпись со ссылкой безопасно
            const urlSpan = document.createElement('span');
            urlSpan.className = 'bookmark-url';
            urlSpan.textContent = bm.url;

            // Собираем матрешку
            textContainer.appendChild(titleDiv);
            textContainer.appendChild(urlSpan);
            
            linkElement.appendChild(iconImg);
            linkElement.appendChild(textContainer);
            
            groupDiv.appendChild(linkElement);
        });

        content.appendChild(groupDiv);
    }
}

// Логика группировки по первой букве
function groupAndSort(bookmarks) {
    const groups = {};
    
    bookmarks.forEach(bm => {
        let firstChar = bm.title ? bm.title.trim().charAt(0).toUpperCase() : bm.url.replace(/^https?:\/\//, '').charAt(0).toUpperCase();
        
        // Если это не буква (кириллица или латиница), группируем в символ "#"
        if (!/[A-ZА-Я]/.test(firstChar)) {
            firstChar = '#';
        }

        if (!groups[firstChar]) {
            groups[firstChar] = [];
        }
        groups[firstChar].push(bm);
    });

    // Сортируем закладки внутри каждой группы по алфавиту
    for (let key in groups) {
        groups[key].sort((a, b) => a.title.localeCompare(b.title));
    }

    return groups;
}

// Функция для безопасного получения иконки сайта в Chrome
function getFaviconUrl(url) {
    const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"));
    faviconUrl.searchParams.set("pageUrl", url);
    faviconUrl.searchParams.set("size", "32");
    return faviconUrl.toString();
}