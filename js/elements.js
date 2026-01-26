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
    
    const defaultAnim = {
        type: 'none',       
        duration: 1.0,      
        delay: 0,           
        infinite: false     
    };
    
    const newEl = { 
        id: generateId(), 
        type: type === 'grid-row' ? 'container' : type, 
        content: {}, 
        styles: styles, 
        animation: { ...defaultAnim },
        hoverStyles: {}, 
        darkStyles: {}, 
        layout: {} 
    };

    if (type === 'grid-row') {
        newEl.type = 'container';
        newEl.styles.width = '100%';
        newEl.layout = { direction: 'row', justify: 'space-between', alignItems: 'stretch', gap: 10, wrap: 'wrap' };
        
        const col1 = { 
            id: generateId(), 
            type: 'container', 
            content: {}, 
            styles: { ...createBaseStyles(), width: '48%', flexGrow: 1, padding:10 }, 
            animation: { ...defaultAnim },
            hoverStyles: {}, 
            darkStyles: {},
            layout: { direction: 'column', gap: 10 }, 
            children: [] 
        };
        
        const col2 = { 
            id: generateId(), 
            type: 'container', 
            content: {}, 
            styles: { ...createBaseStyles(), width: '48%', flexGrow: 1, padding:10 }, 
            animation: { ...defaultAnim },
            hoverStyles: {}, 
            darkStyles: {},
            layout: { direction: 'column', gap: 10 }, 
            children: [] 
        };
        
        newEl.children = [col1, col2];
    } 
    else if (type === 'container') {
        newEl.styles.width = '100%';
        newEl.styles.minHeight = 100;
        newEl.styles.paddingTop = 20; newEl.styles.paddingBottom = 20; newEl.styles.paddingLeft = 20; newEl.styles.paddingRight = 20;
        newEl.layout = { direction: 'column', justify: 'flex-start', alignItems: 'stretch', gap: 10, wrap: 'nowrap' };
        newEl.children = [];
    }
   else if (type === 'nav-menu') {
        newEl.content.menuItems = "Home|#\nAbout|#\nServices|#\nContact|#";
        newEl.content.orientation = "row";
        newEl.content.showDivider = false;
        newEl.content.dividerColor = "var(--border)";
        newEl.content.dividerSize = 16;
        newEl.content.hamburger = false;

        newEl.styles.fontSize = 14;
        newEl.styles.fontWeight = 500;
        newEl.styles.textColor = "var(--text-dark)";
        newEl.styles.textAlign = "center";
        newEl.styles.paddingTop = 10; newEl.styles.paddingBottom = 10;
        newEl.layout = { gap: 24 };
    }
    else if (type === 'card') {
        newEl.type = 'container';
        newEl.styles.width = '100%';
        newEl.styles.bgColor = 'var(--surface)';
        newEl.styles.paddingTop = 20; newEl.styles.paddingBottom = 20; newEl.styles.paddingLeft = 20; newEl.styles.paddingRight = 20;
        newEl.styles.radius = 12;
        newEl.styles.shadowY = 4; newEl.styles.shadowBlur = 20; newEl.styles.shadowColor = 'rgba(0,0,0,0.05)';
        newEl.layout = { direction: 'column', justify: 'flex-start', alignItems: 'stretch', gap: 10 };
        newEl.children = [];
    }
    else if (type === 'heading') { 
        newEl.content.text = "Heading Baru"; 
        newEl.content.tag = "h2"; 
        newEl.styles.fontSize = 28; 
        newEl.styles.fontWeight = 700; 
        newEl.styles.textColor = "var(--text-dark)";
    } 
    else if (type === 'paragraph') { 
        newEl.content.text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore."; 
        newEl.styles.fontSize = 16; 
        newEl.styles.textColor = "var(--text-gray)";
        newEl.styles.lineHeight = 1.6;
    } 
    else if (type === 'button') { 
        newEl.content.text = "Klik Saya"; 
        newEl.content.url = "#"; 
        newEl.styles.bgColor = "var(--primary)"; 
        newEl.styles.textColor = "#ffffff"; 
        newEl.styles.paddingTop = 10; newEl.styles.paddingBottom = 10; newEl.styles.paddingLeft = 24; newEl.styles.paddingRight = 24;
        newEl.styles.radius = 50; 
        newEl.styles.textAlign = "center"; 
        newEl.styles.fontWeight = 600; 
    } 
    else if (type === 'image') { 
        newEl.content.src = "https://via.placeholder.com/400x200"; 
        newEl.styles.width = "100%"; 
        newEl.styles.radius = 12; 
        newEl.styles.objectFit = "cover";
        newEl.styles.aspectRatio = "auto";
    } 
    else if (type === 'icon') {
        newEl.content.icon = "star";
        newEl.styles.fontSize = 48;
        newEl.styles.textColor = "var(--primary)";
        newEl.styles.textAlign = "center";
        newEl.styles.paddingTop = 0;
        newEl.styles.paddingBottom = 0;
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
        newEl.styles.textAlign = "center"; 
        newEl.styles.bgColor = "var(--bg-surface-2)"; 
        newEl.styles.textColor = "var(--primary)"; 
        newEl.styles.borderWidth = 1; 
        newEl.styles.borderColor = "var(--border)"; 
        newEl.styles.radius = 50; 
    }

    pushToData(newEl);
}

function pushToData(el) {
    if (activeContainerId === null) {
        pageData.push(el);
    } else {
        const parent = findNode(activeContainerId);
        if (parent && parent.children) {
            parent.children.push(el);
        } else {
            pageData.push(el);
        }
    }
    renderCanvas();
    renderLayerSheet();
    saveData();
    closeAllSheets();
    
    setTimeout(() => openEditSheet(el.id), 100);
}
