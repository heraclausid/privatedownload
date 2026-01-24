function renderCanvas() {
    canvas.innerHTML = '';
    if (pageData.length === 0) {
        canvas.appendChild(emptyState);
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        renderRecursive(pageData, canvas);
    }
    if (editingId) highlightElement(editingId);
}

function renderRecursive(elements, parentDom) {
    elements.forEach(el => {
        const wrapper = document.createElement('div');
        wrapper.className = 'element-wrapper';
        wrapper.id = el.id;

        const grow = parseInt(el.styles.flexGrow) || 0;
        let shrink = el.styles.flexShrink !== undefined ? el.styles.flexShrink : 1;
        const basis = grow === 1 ? '0%' : 'auto';
        
        wrapper.style.flex = `${grow} ${shrink} ${basis}`;
        wrapper.style.minWidth = '0';
        wrapper.style.maxWidth = '100%'; 
        
        if (el.styles.alignSelf && el.styles.alignSelf !== 'auto') {
            wrapper.style.alignSelf = el.styles.alignSelf;
        }
        
        wrapper.style.marginTop = `${el.styles.marginTop || 0}px`;
        wrapper.style.marginRight = `${el.styles.marginRight || 0}px`;
        wrapper.style.marginBottom = `${el.styles.marginBottom || 0}px`;
        wrapper.style.marginLeft = `${el.styles.marginLeft || 0}px`;
        wrapper.style.width = el.styles.width || 'auto';

        const toolbar = createToolbar(el);
        wrapper.appendChild(toolbar);

        let domNode = null;
        
        const innerStyles = `
            background-color: ${el.styles.bgColor}; 
            color: ${el.styles.textColor || 'inherit'}; 
            font-family: ${el.styles.fontFamily || 'inherit'};
            font-size: ${el.styles.fontSize || 16}px; 
            font-weight: ${el.styles.fontWeight || 400}; 
            line-height: ${el.styles.lineHeight || 1.5};
            letter-spacing: ${el.styles.letterSpacing || 0}px;
            text-align: ${el.styles.textAlign || 'left'}; 
            text-transform: ${el.styles.textTransform || 'none'}; 
            padding: ${el.styles.paddingTop || 0}px ${el.styles.paddingRight || 0}px ${el.styles.paddingBottom || 0}px ${el.styles.paddingLeft || 0}px; 
            border-radius: ${el.styles.radius || 0}px; 
            opacity: ${el.styles.opacity ?? 1}; 
            border: ${el.styles.borderWidth || 0}px ${el.styles.borderStyle || 'solid'} ${el.styles.borderColor || 'transparent'}; 
            box-shadow: ${el.styles.shadowX || 0}px ${el.styles.shadowY || 0}px ${el.styles.shadowBlur || 0}px ${el.styles.shadowColor || 'transparent'}; 
            width: 100%; 
            transition: 0.2s;
        `;

        if (el.type === 'container') {
            const isLink = el.content.url && el.content.url.length > 0;
            const tag = isLink ? 'a' : 'div';
            domNode = document.createElement(tag);
            
            const isCard = (el.styles.shadowBlur > 0 || (el.styles.bgColor && el.styles.bgColor !== 'transparent'));
            domNode.className = `el-container ${isCard ? 'card' : ''} ${el.styles.bgColor ? 'has-bg' : ''}`;

            if (isLink) {
                domNode.href = el.content.url;
                domNode.target = el.content.target || '_self';
            }
            
            const minH = el.styles.minHeight > 0 ? `${el.styles.minHeight}px` : 'auto';
            const alignItems = el.layout.alignItems || 'stretch';

            domNode.style.cssText = innerStyles + `
                display: flex;
                flex-direction: ${el.layout.direction};
                justify-content: ${el.layout.justify};
                align-items: ${alignItems};
                flex-wrap: ${el.layout.wrap};
                gap: ${el.layout.gap}px;
                min-height: ${minH}; 
                position: relative; 
                text-decoration: none; 
                align-content: flex-start;
            `;
            
            if (el.children && el.children.length > 0) {
                renderRecursive(el.children, domNode);
            } else {
                const label = document.createElement('div');
                label.className = 'empty-label';
                label.innerText = 'Empty';
                domNode.appendChild(label);
            }
        } 
        else if (el.type === 'heading') {
            domNode = document.createElement(el.content.tag || 'h2');
            domNode.className = 'builder-element';
            domNode.style.cssText = innerStyles + 'margin:0;';
            if (el.content.url) { domNode.innerHTML = `<a href="${el.content.url}" target="${el.content.target || '_self'}" class="el-link-wrapper">${el.content.text}</a>`; } else { domNode.innerText = el.content.text; }
        } 
        else if (el.type === 'paragraph') {
            domNode = document.createElement('p');
            domNode.className = 'builder-element';
            domNode.style.cssText = innerStyles + 'margin:0;';
            if (el.content.url) { domNode.innerHTML = `<a href="${el.content.url}" target="${el.content.target || '_self'}" class="el-link-wrapper">${el.content.text}</a>`; } else { domNode.innerText = el.content.text; }
        } 
        else if (el.type === 'button') {
            const btnWrap = document.createElement('div'); btnWrap.style.width = '100%'; btnWrap.style.textAlign = el.styles.textAlign;
            domNode = document.createElement('a'); domNode.className = 'builder-element el-btn btn'; domNode.href = el.content.url || '#'; domNode.target = el.content.target || '_self';
            let iconHtml = ''; if (el.content.icon) { if (el.content.icon.startsWith('ri-')) { iconHtml = `<i class="${el.content.icon}" style="font-size:1.1em;line-height:1;display:block;"></i>`; } else { iconHtml = `<span class="material-symbols-rounded" style="font-size:1.1em;line-height:1;display:block;">${el.content.icon}</span>`; } }
            domNode.innerHTML = `${iconHtml} ${el.content.text}`;
            domNode.style.cssText = innerStyles + `display:inline-flex; align-items:center; justify-content:center; gap:8px; width:auto; text-decoration:none; cursor:pointer; vertical-align:middle; line-height:1;`;
            btnWrap.appendChild(domNode); domNode = btnWrap;
        } 
        else if (el.type === 'image') {
            const img = document.createElement('img'); img.src = el.content.src; img.style.cssText = innerStyles + `display:block; width:${el.styles.width || '100%'}; height:${el.styles.height || 'auto'}; object-fit:${el.styles.objectFit || 'cover'};`;
            if (el.content.url) { domNode = document.createElement('a'); domNode.className = 'builder-element el-link-wrapper'; domNode.href = el.content.url; domNode.target = el.content.target || '_self'; domNode.style.display = "block"; domNode.appendChild(img); } else { domNode = img; domNode.className = 'builder-element'; }
        } 
        else if (el.type === 'spacer') { domNode = document.createElement('div'); domNode.className = 'el-spacer'; domNode.style.height = (el.styles.height || 40) + 'px'; } 
        else if (el.type === 'divider') {
            domNode = document.createElement('div'); domNode.className = 'builder-element el-divider';
            const style = el.content.style || 'solid'; const color = el.styles.bgColor || 'var(--border)'; const thickness = el.content.thickness || 2; 
            if (style === 'wavy') { domNode.innerHTML = `<svg width="100%" height="${Math.max(thickness * 3, 10)}" viewBox="0 0 100 10" preserveAspectRatio="none" style="display:block; overflow:visible;"><path d="M0 5 Q 2.5 0 5 5 T 10 5 T 15 5 T 20 5 T 25 5 T 30 5 T 35 5 T 40 5 T 45 5 T 50 5 T 55 5 T 60 5 T 65 5 T 70 5 T 75 5 T 80 5 T 85 5 T 90 5 T 95 5 T 100 5" stroke="${color}" stroke-width="${thickness}" fill="none" vector-effect="non-scaling-stroke" /></svg>`; } else { domNode.innerHTML = `<hr style="border:none; border-top: ${thickness}px ${style} ${color}; width:100%; margin:0; opacity: 1;">`; }
        } 
        else if (el.type === 'theme-toggle') {
            const btnWrap = document.createElement('div'); btnWrap.style.width = '100%'; btnWrap.style.textAlign = el.styles.textAlign;
            domNode = document.createElement('button'); domNode.className = 'el-theme-toggle builder-element icon-btn';
            domNode.style.cssText = innerStyles + `display:inline-flex; align-items:center; justify-content:center; cursor:pointer; vertical-align:middle; line-height:1; width:40px; height:40px; padding:0; border-radius:50%;`;
            const isDark = globalConfig.darkMode; const currentIcon = isDark ? 'light_mode' : 'dark_mode';
            
            domNode.innerHTML = `<span class="material-symbols-rounded theme-icon">${currentIcon}</span>`;
            
            domNode.onclick = (e) => { 
                if (document.body.classList.contains('preview-mode')) { 
                    e.stopPropagation(); 
                    
                    const iconSpan = domNode.querySelector('.theme-icon'); 
                    iconSpan.classList.add('animating');
                    
                    setTimeout(() => { 
                        toggleThemeMode(); 
                        const newIsDark = globalConfig.darkMode; 
                        iconSpan.innerText = newIsDark ? 'light_mode' : 'dark_mode'; 
                        iconSpan.classList.remove('animating');
                    }, 500); 
                } else { 
                    e.stopPropagation(); 
                    selectElement(el.id); 
                } 
            };
            btnWrap.appendChild(domNode); domNode = btnWrap;
        }

        if (domNode && el.content.elementId) { domNode.id = el.content.elementId; }

        if (domNode) {
            wrapper.onclick = (e) => { e.stopPropagation(); if (e.target.closest('.tool-btn') || e.target.closest('.inner-add-btn')) return; if (!document.body.classList.contains('preview-mode')) { e.preventDefault(); selectElement(el.id); } };
            wrapper.appendChild(domNode);
        }
        parentDom.appendChild(wrapper);
    });
}

function createToolbar(el) {
    const toolbar = document.createElement('div');
    toolbar.className = 'element-toolbar';
    if (el.type === 'container') { const add = document.createElement('button'); add.className = 'tool-btn add'; add.innerHTML = '<span class="material-symbols-rounded">add</span>'; add.onclick = (e) => { e.stopPropagation(); openAddMenu(el.id); }; toolbar.appendChild(add); }
    const edit = document.createElement('button'); edit.className = 'tool-btn'; edit.innerHTML = '<span class="material-symbols-rounded">edit</span>'; edit.onclick = (e) => { e.stopPropagation(); openEditSheet(el.id); }; toolbar.appendChild(edit);
    const dup = document.createElement('button'); dup.className = 'tool-btn'; dup.innerHTML = '<span class="material-symbols-rounded">content_copy</span>'; dup.onclick = (e) => { e.stopPropagation(); duplicateNode(el.id); }; toolbar.appendChild(dup);
    const del = document.createElement('button'); del.className = 'tool-btn del'; del.innerHTML = '<span class="material-symbols-rounded">delete</span>'; del.onclick = (e) => { e.stopPropagation(); if(confirm("Hapus elemen ini?")) { deleteNode(el.id); saveData(); renderCanvas(); closeAllSheets(); showToast("Elemen Dihapus"); } }; toolbar.appendChild(del);
    return toolbar;
}
