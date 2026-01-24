/* --- js/elements.js (FULL CONTENT - NO ABBREVIATIONS) --- */

function createBaseStyles() {
    return {
        bgColor: 'transparent',
        textColor: undefined,
        fontFamily: undefined,
        lineHeight: 1.5,
        letterSpacing: 0,
        paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
        marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
        radius: 0,
        opacity: 1,
        borderWidth: 0, borderStyle: 'solid', borderColor: '#e2e8f0',
        shadowX: 0, shadowY: 0, shadowBlur: 0, shadowColor: 'transparent',
        flexGrow: 0, 
        flexShrink: 1, 
        width: 'auto', 
        alignSelf: 'auto',
        minHeight: 0,
        aspectRatio: 'auto', 
        objectFit: 'cover'
    };
}

function addElement(type) {
    if(typeof addToHistory === 'function') addToHistory();

    const styles = createBaseStyles();
    
    const newEl = { 
        id: generateId(), 
        type: type === 'grid-row' ? 'container' : type, 
        content: {}, 
        styles: styles, 
        hoverStyles: {}, 
        darkStyles: {}, 
        layout: {} 
    };

    if (type === 'grid-row') {
        newEl.type = 'container';
        newEl.styles.width = '100%';
        newEl.styles.paddingLeft = 10;
        newEl.styles.paddingRight = 10;
        newEl.layout = { direction: 'row', justify: 'flex-start', alignItems: 'stretch', wrap: 'wrap', gap: 10 };
        newEl.children = [];
        const col1 = { id: generateId(), type: 'container', content: {}, styles: { ...createBaseStyles(), width: 'calc(50% - 5px)', minHeight: 0, flexGrow: 1, flexShrink: 1, bgColor: 'transparent', paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10 }, layout: { direction: 'column', alignItems: 'stretch', gap: 10 }, children: [], hoverStyles:{}, darkStyles:{} };
        const col2 = JSON.parse(JSON.stringify(col1));
        col2.id = generateId();
        newEl.children.push(col1, col2);
        pushToData(newEl);
        return;
    }
    else if (type === 'container' || type === 'card') {
        newEl.type = 'container'; 
        newEl.children = [];
        newEl.styles.width = '100%';
        newEl.styles.minHeight = 0;
        newEl.styles.paddingTop = 10; newEl.styles.paddingBottom = 10; newEl.styles.paddingRight = 10; newEl.styles.paddingLeft = 10;
        newEl.layout = { direction: 'column', justify: 'flex-start', alignItems: 'stretch', wrap: 'nowrap', gap: 10 };
        if (type === 'card') {
            newEl.styles.bgColor = 'var(--surface)'; 
            newEl.styles.radius = 12;
            newEl.styles.shadowY = 4;
            newEl.styles.shadowBlur = 15;
            newEl.styles.shadowColor = 'rgba(0,0,0,0.05)';
        }
    } 
    else if (type === 'heading') { 
        newEl.content.text = "Heading Baru"; 
        newEl.content.tag = "h2"; 
        newEl.styles.fontSize = 28; 
        newEl.styles.fontWeight = 700; 
        newEl.styles.textColor = "var(--text-main)"; 
    } 
    else if (type === 'paragraph') { 
        newEl.content.text = "Tulis teks di sini..."; 
        newEl.styles.textColor = "var(--text-muted)"; 
    } 
    else if (type === 'button') { 
        newEl.content.text = "Button"; 
        newEl.styles.bgColor = "var(--primary)"; 
        newEl.styles.textColor = "#ffffff"; 
        newEl.styles.paddingTop=12; 
        newEl.styles.paddingBottom=12; 
        newEl.styles.paddingLeft=24; 
        newEl.styles.paddingRight=24; 
        newEl.styles.radius = 50; 
        newEl.styles.textAlign = "center"; 
        newEl.styles.fontWeight=600; 
    } 
    else if (type === 'image') { 
        newEl.content.src = "https://via.placeholder.com/400x200"; 
        newEl.styles.width = "100%"; 
        newEl.styles.radius = 12; 
        newEl.styles.objectFit = "cover";
        newEl.styles.aspectRatio = "auto";
    } 
    else if (type === 'spacer') { 
        newEl.styles.height = 40; 
        newEl.styles.width = "100%"; 
    } 
    else if (type === 'divider') { 
        newEl.content.style = "solid"; 
        newEl.content.thickness = 2; 
        newEl.styles.width = "100%"; 
        newEl.styles.bgColor = "var(--border)"; 
    } 
    else if (type === 'theme-toggle') { 
        newEl.styles.textAlign="center"; 
        newEl.styles.bgColor="var(--bg-surface-2)"; 
        newEl.styles.textColor="var(--primary)"; 
        newEl.styles.borderWidth=1; 
        newEl.styles.borderColor="var(--border)"; 
        newEl.styles.radius=50; 
    }

    pushToData(newEl);
}

function pushToData(el) {
    if (activeContainerId === null) { pageData.push(el); } 
    else {
        const parent = findNode(activeContainerId);
        if (parent) { if (!parent.children) parent.children = []; parent.children.push(el); } 
        else { pageData.push(el); }
    }
    renderCanvas();
    closeAllSheets();
    setTimeout(() => { if(typeof selectElement === 'function') selectElement(el.id); }, 50);
    showToast("Elemen Ditambahkan");
    saveData();
}
