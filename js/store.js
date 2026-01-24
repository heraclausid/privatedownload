/* --- js/store.js (FULL CONTENT - NO ABBREVIATIONS) --- */

let historyStack = [];
let redoStack = [];
const MAX_HISTORY = 50;

function showToast(msg) {
    const t = document.getElementById('toast');
    if(t) {
        t.innerText = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    }
}

window.addToHistory = function() {
    const snapshot = JSON.stringify(projectData);
    historyStack.push(snapshot);
    if (historyStack.length > MAX_HISTORY) historyStack.shift();
    redoStack = [];
    updateUndoRedoButtons();
};

window.undo = function() {
    if (historyStack.length === 0) return;
    const currentSnapshot = JSON.stringify(projectData);
    redoStack.push(currentSnapshot);
    const prevSnapshot = historyStack.pop();
    const data = JSON.parse(prevSnapshot);
    restoreProjectState(data);
    showToast("Undo");
};

window.redo = function() {
    if (redoStack.length === 0) return;
    const currentSnapshot = JSON.stringify(projectData);
    historyStack.push(currentSnapshot);
    const nextSnapshot = redoStack.pop();
    const data = JSON.parse(nextSnapshot);
    restoreProjectState(data);
    showToast("Redo");
};

function restoreProjectState(data) {
    projectData = data;
    globalConfig = projectData.config;
    const activePage = projectData.pages.find(p => p.id === projectData.activePageId);
    
    if (activePage) {
        pageData = activePage.data;
    } else {
        if (projectData.pages.length > 0) {
            projectData.activePageId = projectData.pages[0].id;
            pageData = projectData.pages[0].data;
        } else {
            pageData = [];
        }
    }

    applyGlobalConfig();
    saveData(true); 
    renderCanvas();
    closeAllSheets();
    updateUndoRedoButtons();
    
    const btn = document.getElementById('pageManagerBtn');
    if(btn) btn.innerHTML = `<span class="material-symbols-rounded">layers</span>`;
}

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

function saveData(skipHistory = false) {
    localStorage.setItem('softBuilderProject', JSON.stringify(projectData));
    updateGlobalStyles();
}

function loadData() {
    const savedProject = localStorage.getItem('softBuilderProject');
    if (savedProject) {
        try {
            const data = JSON.parse(savedProject);
            if (data.pages && Array.isArray(data.pages)) {
                projectData = data;
            } else {
                projectData.pages[0].data = data.page || []; 
                if(data.config) projectData.config = data.config;
            }
        } catch (e) { console.error("Load Error:", e); }
    }
    
    globalConfig = projectData.config;
    const activePage = projectData.pages.find(p => p.id === projectData.activePageId);
    pageData = activePage ? activePage.data : projectData.pages[0].data;

    applyGlobalConfig();
    renderCanvas();
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
    showToast(globalConfig.darkMode ? "Mode Gelap" : "Mode Terang");
}

function updateGlobalStyles() {
    let css = '';
    projectData.pages.forEach(p => { processNodeCss(p.data); });

    function processNodeCss(nodes) {
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
            if (el.children) processNodeCss(el.children);
        });
    }
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
    const resetInput = () => { event.target.value = ''; };

    if (file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                const data = JSON.parse(content);
                addToHistory();
                let finalData = data;
                if (!data.pages && data.page) {
                     finalData = {
                        pages: [{ id: 'home', name: 'Home', slug: 'index', data: data.page }],
                        activePageId: 'home',
                        config: data.config || {}
                     };
                }
                restoreProjectState(finalData);
                showToast("Project JSON Berhasil Di-import!");
            } catch (err) { alert("Gagal membaca file JSON: " + err.message); }
        };
        reader.readAsText(file);
    } 
    else if (file.name.endsWith('.zip')) {
        if (typeof JSZip === 'undefined') {
            alert("Library JSZip belum dimuat.");
            resetInput();
            return;
        }
        addToHistory();
        JSZip.loadAsync(file).then(function(zip) {
            if (zip.file("project.json")) {
                return zip.file("project.json").async("string");
            } else {
                throw new Error("File 'project.json' tidak ditemukan dalam ZIP!");
            }
        }).then(function(jsonContent) {
            const data = JSON.parse(jsonContent);
            restoreProjectState(data);
            showToast("Project ZIP Berhasil Di-import!");
        }).catch(function(err) {
            alert("Gagal Import ZIP: " + err.message);
        });
    } else {
        alert("Format file tidak didukung.");
    }
    resetInput();
}
