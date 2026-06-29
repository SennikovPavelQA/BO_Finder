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
        document.getElementById('content').innerHTML = `<p style="color:red">Folder "${TARGET_FOLDER_NAME}" not found.</p>`;
        return;
    }

    // Извлекаем все ссылки из папки
    allBookmarks = extractLinks(folderNode);
    
    // Первичная отрисовка
    renderUI(allBookmarks);

    // Слушатель для строки поиска
    searchInput.addEventListener('input', (e) => {
        const originalValue = e.target.value;
        const sanitizedValue = originalValue.replace(/[^a-zA-Z0-9\s.,?!/@:_\-]/g, '');
        
        // Визуальная ошибка при вводе кириллицы
        if (originalValue !== sanitizedValue) {
            e.target.value = sanitizedValue;
            searchInput.classList.remove('input-error');
            void searchInput.offsetWidth; 
            searchInput.classList.add('input-error');
            setTimeout(() => searchInput.classList.remove('input-error'), 300);
        }
        
        const query = e.target.value.toLowerCase().trim();

        // БЕСТ ПРАКТИС 1: Если поле пустое, возвращаем все закладки
        if (query.length === 0) {
            renderUI(allBookmarks);
            return;
        }

        // БЕСТ ПРАКТИС 2: Ждем ввода минимум 2 символов
        if (query.length === 1) {
            return; // Ничего не делаем, ждем вторую букву
        }

        // БЕСТ ПРАКТИС 3: Умный поиск (только по заголовкам)
        const filtered = allBookmarks.filter(bm => {
            return bm.title.toLowerCase().includes(query);
        });
        
        renderUI(filtered, query);
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
function renderUI(bookmarks, query = '') {
    const content = document.getElementById('content');
    
    if (bookmarks.length === 0) {
        content.innerHTML = '<p style="color:#5f6368">No bookmarks found.</p>';
        return;
    }

    // Группируем и сортируем закладки
    const groups = groupAndSort(bookmarks);
    let contentHTML = '';

    // Формируем HTML через шаблонные строки
    for (const letter of Object.keys(groups).sort()) {
        contentHTML += `
            <div class="letter-group" id="group-${letter}">
                <div class="letter-title">${letter}</div>
        `;

        groups[letter].forEach(bm => {
            let displayTitle = bm.title || bm.url;
            displayTitle = displayTitle.replace(/www\./gi, '').trim();
            
            if (displayTitle && !/^\d/.test(displayTitle)) {
                displayTitle = displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1);
            }

            // Применяем мягкую подсветку только для заголовка
            const highlightedTitle = highlightText(displayTitle, query);

            contentHTML += `
                <a class="bookmark-item" href="${bm.url}" target="_blank">
                    <img class="favicon" src="${getFaviconUrl(bm.url)}" alt="">
                    <div class="bookmark-text-container">
                        <div class="bookmark-title">${highlightedTitle}</div>
                        <span class="bookmark-url">${bm.url}</span>
                    </div>
                </a>
            `;
        });

        contentHTML += `</div>`;
    }

    // Вставляем сформированный HTML в DOM
    content.innerHTML = contentHTML;
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

// Экранирование спецсимволов для регулярного выражения
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Функция подсветки совпадений
function highlightText(text, query) {
    if (!query) return text;
    // gi - глобальный поиск без учета регистра
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    // Оборачиваем найденное (сохраняя оригинальный регистр текста)
    return text.replace(regex, '<span class="highlight">$1</span>');
}