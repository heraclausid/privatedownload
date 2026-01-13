/* --- js/store.js (GLOBAL UNDO/REDO) --- */

let historyStack = [];
let redoStack = [];
const MAX_HISTORY = 20;

function showToast(msg) {
    if(typeof toast !== 'undefined' && toast) {
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
}

// [PENTING] EXPOSE KE WINDOW AGAR BISA DIPANGGIL HTML
window.addToHistory = function() {
    const snapshot = JSON.stringify({ page: pageData, config: globalConfig });
    historyStack.push(snapshot);
    if (historyStack.length > MAX_HISTORY) historyStack.shift();
    redoStack = [];
    updateUndoRedoButtons();
};

window.undo = function() {
    if (historyStack.length === 0) return;

    // Simpan state sekarang ke Redo
    const currentSnapshot = JSON.stringify({ page: pageData, config: globalConfig });
    redoStack.push(currentSnapshot);

    // Ambil state sebelumnya
    const previousSnapshot = historyStack.pop();
    const data = JSON.parse(previousSnapshot);

    // Restore
    pageData = data.page;
    globalConfig = data.config;

    // Refresh UI
    applyGlobalConfig();
    saveData(true); // Skip recording history saat undo
    renderCanvas();
    closeAllSheets();
    updateUndoRedoButtons();
    showToast("Undo");
};

window.redo = function() {
    if (redoStack.length === 0) return;

    // Simpan state sekarang ke History
    const currentSnapshot = JSON.stringify({ page: pageData, config: globalConfig });
    historyStack.push(currentSnapshot);

    // Ambil state masa depan
    const nextSnapshot = redoStack.pop();
    const data = JSON.parse(nextSnapshot);

    // Restore
    pageData = data.page;
    globalConfig = data.config;

    // Refresh UI
    applyGlobalConfig();
    saveData(true);
    renderCanvas();
    closeAllSheets();
    updateUndoRedoButtons();
    showToast("Redo");
};

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if(undoBtn) {
        undoBtn.style.opacity = historyStack.length > 0 ? '1' : '0.3';
        undoBtn.style.pointerEvents = historyStack.length > 0 ? 'auto' : 'none';
    }
    if(redoBtn) {
        redoBtn.style.opacity = redoStack.length > 0 ? '1' : '0.3';
        redoBtn.style.pointerEvents = redoStack.length > 0 ? 'auto' : 'none';
    }
}

// --- SAVE & LOAD SYSTEM ---

function saveData(skipHistory = false) {
    const data = {
        page: pageData,
        config: globalConfig,
        colors: savedColors
    };
    localStorage.setItem('softBuilderData', JSON.stringify(data));
    updateGlobalStyles();
}

function loadData() {
    const saved = localStorage.getItem('softBuilderData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            pageData = data.page || [];
            if (data.config) globalConfig = { ...globalConfig, ...data.config };
            if (data.colors && Array.isArray(data.colors)) savedColors = data.colors;
            applyGlobalConfig();
        } catch (e) {
            console.error("Gagal memuat data:", e);
        }
    }
    if(typeof renderCanvas === 'function') renderCanvas();
    if(typeof renderIconSheet === 'function') renderIconSheet();
    updateGlobalStyles();
    updateUndoRedoButtons();
}

function applyGlobalConfig() {
    document.body.style.fontFamily = globalConfig.fontFamily;
    const fontInput = document.getElementById('global-font');
    const bgInput = document.getElementById('global-bg');
    if(fontInput) fontInput.value = globalConfig.fontFamily;
    if(bgInput) bgInput.value = globalConfig.pageBg;

    if (globalConfig.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.style.backgroundColor = '#0f172a';
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.body.style.backgroundColor = globalConfig.pageBg;
    }
}

function toggleThemeMode() {
    addToHistory();
    globalConfig.darkMode = !globalConfig.darkMode;
    applyGlobalConfig();
    saveData();
    renderCanvas();
    showToast(globalConfig.darkMode ? "Mode Gelap Aktif" : "Mode Terang Aktif");
}

function updateGlobalStyles() {
    let css = '';
    function processNode(nodes) {
        nodes.forEach(el => {
            const buildCss = (styles) => {
                let str = '';
                if (styles.bgColor) str += `background-color: ${styles.bgColor} !important;`;
                if (styles.textColor) str += `color: ${styles.textColor} !important;`;
                if (styles.borderColor) str += `border-color: ${styles.borderColor} !important;`;
                return str;
            };
            let selector = `#${el.id}`;
            if (el.type === 'button' || el.type === 'theme-toggle' || el.type === 'image') {
                selector = `#${el.id} .builder-element`;
            } else if (['heading', 'paragraph'].includes(el.type) && el.content.url) {
                selector = `#${el.id} a`;
            }
            if (el.hoverStyles && Object.keys(el.hoverStyles).length > 0) {
                const rules = buildCss(el.hoverStyles);
                if (rules) css += `${selector}:hover { ${rules} } \n`;
            }
            if (el.darkStyles && Object.keys(el.darkStyles).length > 0) {
                const rules = buildCss(el.darkStyles);
                if (rules) css += `[data-theme="dark"] ${selector} { ${rules} } \n`;
            }
            if (el.children) processNode(el.children);
        });
    }
    processNode(pageData);
    if(typeof generatedCss !== 'undefined') generatedCss.innerHTML = css;
}

function findNode(id, list = pageData) {
    for (let node of list) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNode(id, node.children);
            if (found) return found;
        }
    }
    return null;
}

function deleteNode(id, list = pageData) {
    const index = list.findIndex(n => n.id === id);
    if (index > -1) {
        list.splice(index, 1);
        return true;
    }
    for (let node of list) {
        if (node.children && deleteNode(id, node.children)) return true;
    }
    return false;
}

function duplicateNode(id) {
    addToHistory();
    const original = findNode(id);
    if (!original) return;
    const copy = JSON.parse(JSON.stringify(original));
    const regenerateIds = (node) => {
        node.id = generateId();
        if (node.children) node.children.forEach(regenerateIds);
    };
    regenerateIds(copy);
    const insertAfterOriginal = (targetId, newNode, list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === targetId) {
                list.splice(i + 1, 0, newNode);
                return true;
            }
            if (list[i].children && insertAfterOriginal(targetId, newNode, list[i].children)) {
                return true;
            }
        }
        return false;
    };
    insertAfterOriginal(id, copy, pageData);
    renderCanvas();
    saveData();
    showToast("Elemen Diduplikasi");
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    addToHistory();
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const dataScript = doc.getElementById('soft-builder-data');
            if (!dataScript) { alert("File tidak valid!"); return; }
            const data = JSON.parse(dataScript.textContent);
            if (data.page) pageData = data.page;
            if (data.config) globalConfig = { ...globalConfig, ...data.config };
            if (data.colors) savedColors = data.colors;
            saveData();
            loadData();
            showToast("Project Berhasil Di-import!");
        } catch (err) {
            console.error(err);
            alert("Gagal membaca file project.");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}
