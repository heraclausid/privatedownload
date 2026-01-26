/* --- js/renderer.js (FIXED: TOOLBAR VISIBILITY & Z-INDEX) --- */

function renderCanvas() {
    canvas.innerHTML = '';
    if (pageData.length === 0) {
        canvas.appendChild(emptyState);
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        renderRecursive(pageData, canvas);
        setTimeout(initEditorObserver, 50);
    }
    if (editingId) highlightElement(editingId);
}

// Observer untuk Animasi Masuk
let editorObserver = null;

function initEditorObserver() {
    if (editorObserver) editorObserver.disconnect();
    const options = { root: null, rootMargin: '0px', threshold: 0.1 };
    editorObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target); 
            }
        });
    }, options);
    const targets = document.querySelectorAll('#editorCanvas .has-animation');
    targets.forEach(el => editorObserver.observe(el));
}

function renderRecursive(elements, parentDom) {
    elements.forEach(el => {
        const wrapper = document.createElement('div');
        wrapper.className = 'element-wrapper';
        wrapper.id = el.id;

        // Flex & Layout Setup
        const grow = parseInt(el.styles.flexGrow) || 0;
        let shrink = el.styles.flexShrink !== undefined ? el.styles.flexShrink : 1;
        const basis = grow === 1 ? '0%' : 'auto';
        
        wrapper.style.flex = `${grow} ${shrink} ${basis}`;
        wrapper.style.minWidth = '0';
        wrapper.style.minHeight = '0'; 
        wrapper.style.maxWidth = '100%'; 
        
        // Z-Index Handling:
        // Nav Menu diberi z-index cukup tinggi agar dropdown muncul di atas elemen lain,
        // TAPI harus lebih rendah dari Toolbar (Toolbar di CSS = 2000).
        wrapper.style.zIndex = el.type === 'nav-menu' ? '100' : 'auto'; 

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
        
        // Size Logic
        const aspectRatio = el.styles.aspectRatio || 'auto';
        const rawHeight = el.styles.height; 
        const isFixedSize = rawHeight !== undefined && rawHeight !== "" && parseInt(rawHeight) > 0;

        let cssWidth = '100%'; 
        let cssHeight = 'auto'; 
        let cssOverflow = 'visible'; // Selalu visible agar dropdown/bayangan tidak terpotong

        if (isFixedSize) cssHeight = rawHeight + 'px';
        if (aspectRatio !== 'auto' && isFixedSize) cssWidth = 'auto';
        else if (el.styles.width && el.styles.width !== 'auto' && el.styles.width !== '100%') cssWidth = el.styles.width;

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
            box-sizing: border-box; 
            width: ${cssWidth}; 
            height: ${cssHeight};
            aspect-ratio: ${aspectRatio};
            overflow: ${cssOverflow};
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
            
            const hasChildren = el.children && el.children.length > 0;
            let minH = 'auto';
            if (isFixedSize) minH = '0px'; 
            else if (hasChildren) minH = '0px'; 
            else minH = (el.styles.minHeight > 0) ? `${el.styles.minHeight}px` : 'auto'; 

            domNode.style.cssText = innerStyles + `
                display: flex;
                flex-direction: ${el.layout.direction};
                justify-content: ${el.layout.justify};
                align-items: ${el.layout.alignItems || 'stretch'};
                flex-wrap: ${el.layout.wrap};
                gap: ${el.layout.gap}px;
                min-height: ${minH}; 
                position: relative; 
                text-decoration: none; 
                align-content: flex-start;
                z-index: 1;
            `;
            
            if (hasChildren) renderRecursive(el.children, domNode);
            else {
                const label = document.createElement('div');
                label.className = 'empty-label';
                label.innerText = 'Empty';
                domNode.appendChild(label);
            }
        } 
        
        else if (el.type === 'nav-menu') {
            const isHamburger = String(el.content.hamburger) === 'true';
            
            const nav = document.createElement('nav');
            nav.className = 'builder-element nav-wrapper';
            
            const align = el.styles.textAlign || 'center';
            const vAlign = el.styles.alignItems || 'center';
            
            let justify = 'center';
            if(align === 'left') { justify = 'flex-start'; nav.classList.add('align-left'); }
            else if(align === 'right') { justify = 'flex-end'; nav.classList.add('align-right'); }
            else { nav.classList.add('align-center'); }

            let contentAlign = 'center';
            if (vAlign === 'flex-start') contentAlign = 'flex-start';
            if (vAlign === 'flex-end') contentAlign = 'flex-end';

            nav.style.cssText = innerStyles + `
                display: flex;
                align-items: ${vAlign};
                align-content: ${contentAlign};
                justify-content: ${justify};
                position: relative;
                text-decoration: none;
                flex-wrap: wrap;
                /* Hapus z-index di sini agar mengikuti wrapper, atau set lebih rendah dari toolbar */
            `;

            const rawItems = el.content.menuItems || "Home|#|";
            const items = rawItems.split('\n');
            const hoverEffect = el.content.hoverEffect || 'none';
            const hoverTextColor = el.content.hoverTextColor;
            const hoverBgColor = el.content.hoverBgColor;
            const hoverRadius = el.content.hoverRadius || 0;
            const baseColor = el.styles.textColor || 'inherit';

            const createLinkItem = (item, idx) => {
                const parts = item.split('|');
                const label = parts[0] ? parts[0].trim() : '';
                const url = parts[1] ? parts[1].trim() : '#';
                const iconClass = parts[2] ? parts[2].trim() : '';

                if (!label) return null;

                const link = document.createElement('a');
                link.href = url;
                link.target = el.content.target || '_self';
                link.className = 'el-link-wrapper';
                
                let innerContent = label;
                if (iconClass) {
                    let iconHtml = iconClass.startsWith('ri-') 
                        ? `<i class="${iconClass}" style="margin-right:6px; font-size:1.1em; vertical-align:middle;"></i>`
                        : `<span class="material-symbols-rounded" style="margin-right:6px; font-size:1.1em; vertical-align:middle;">${iconClass}</span>`;
                    innerContent = iconHtml + `<span style="vertical-align:middle;">${label}</span>`;
                }
                link.innerHTML = innerContent;

                link.style.textDecoration = 'none';
                link.style.color = isHamburger ? 'var(--text-dark)' : 'inherit';
                link.style.display = 'inline-flex'; 
                link.style.alignItems = 'center';
                link.style.padding = '8px 12px'; 
                link.style.transition = 'all 0.2s';
                link.style.borderRadius = `${hoverRadius}px`;
                link.style.borderBottom = '2px solid transparent';
                link.style.borderTop = '2px solid transparent';
                
                if(isHamburger) {
                    link.style.width = '100%';
                }

                link.onmouseenter = () => {
                    if(hoverTextColor) link.style.color = hoverTextColor;
                    if(hoverBgColor) link.style.backgroundColor = hoverBgColor;
                    if(!isHamburger) {
                        if (hoverEffect === 'float') link.style.transform = 'translateY(-3px)';
                        else if (hoverEffect === 'scale') link.style.transform = 'scale(1.1)';
                    }
                    if (hoverEffect === 'underline') link.style.borderBottomColor = hoverTextColor || baseColor;
                    else if (hoverEffect === 'overline') link.style.borderTopColor = hoverTextColor || baseColor;
                };

                link.onmouseleave = () => {
                    link.style.color = isHamburger ? 'var(--text-dark)' : 'inherit';
                    link.style.backgroundColor = 'transparent';
                    link.style.transform = 'none';
                    link.style.borderBottomColor = 'transparent';
                    link.style.borderTopColor = 'transparent';
                };

                return link;
            };

            if (isHamburger) {
                const hamburgerWrap = document.createElement('div');
                hamburgerWrap.style.position = 'relative';
                hamburgerWrap.style.display = 'inline-block';

                const btn = document.createElement('button');
                btn.className = 'nav-hamburger-btn';
                btn.innerHTML = `<span class="material-symbols-rounded" style="font-size:24px">menu</span>`;
                btn.style.color = baseColor;
                
                btn.onclick = (e) => {
                    if (!document.body.classList.contains('preview-mode')) {
                        // Di Mode Editor: Biarkan seleksi terjadi
                        e.preventDefault();
                        return;
                    }
                    // Mode Preview: Toggle Menu
                    e.stopPropagation(); 
                    
                    const menu = hamburgerWrap.querySelector('.nav-dropdown-menu');
                    if(menu) {
                        menu.classList.toggle('show');
                        const icon = btn.querySelector('span');
                        icon.innerText = menu.classList.contains('show') ? 'close' : 'menu';
                    }
                };

                hamburgerWrap.appendChild(btn);

                const dropdown = document.createElement('div');
                dropdown.className = 'nav-dropdown-menu';
                dropdown.style.backgroundColor = el.styles.bgColor !== 'transparent' ? el.styles.bgColor : 'var(--surface)';
                dropdown.style.color = 'var(--text-dark)';
                
                items.forEach((item, index) => {
                    const link = createLinkItem(item, index);
                    if(link) dropdown.appendChild(link);
                });

                hamburgerWrap.appendChild(dropdown);
                nav.appendChild(hamburgerWrap);

            } else {
                const dir = el.content.orientation || 'row';
                nav.style.flexDirection = dir;
                nav.style.gap = `${el.layout && el.layout.gap ? el.layout.gap : 20}px`;

                items.forEach((item, index) => {
                    const link = createLinkItem(item, index);
                    if (link) {
                        nav.appendChild(link);
                        
                        const showDiv = String(el.content.showDivider) === 'true';
                        if (showDiv && index < items.length - 1) {
                            const divider = document.createElement('div');
                            const divColor = el.content.dividerColor || 'var(--border)';
                            const divSize = el.content.dividerSize || 16;
                            if (dir === 'row') {
                                divider.style.width = '1px';
                                divider.style.height = divSize + 'px';
                            } else {
                                divider.style.width = divSize + 'px';
                                if(divSize > 100) divider.style.width = '100%'; 
                                divider.style.height = '1px';
                            }
                            divider.style.backgroundColor = divColor;
                            nav.appendChild(divider);
                        }
                    }
                });
            }

            domNode = nav;
        }

        else if (el.type === 'heading' || el.type === 'paragraph') {
            const tag = el.type === 'heading' ? (el.content.tag || 'h2') : 'p';
            domNode = document.createElement(tag);
            domNode.className = 'builder-element';
            domNode.style.cssText = innerStyles + `margin:0; text-overflow: ellipsis;`;
            if (el.content.url) { domNode.innerHTML = `<a href="${el.content.url}" target="${el.content.target || '_self'}" class="el-link-wrapper">${el.content.text}</a>`; } else { domNode.innerText = el.content.text; }
        } 
        else if (el.type === 'button') {
            const btnWrap = document.createElement('div'); 
            btnWrap.style.width = '100%'; btnWrap.style.textAlign = el.styles.textAlign;
            btnWrap.style.minHeight = '0';
            domNode = document.createElement('a'); domNode.className = 'builder-element el-btn btn'; 
            domNode.href = el.content.url || '#'; domNode.target = el.content.target || '_self';
            let iconHtml = ''; if (el.content.icon) { if (el.content.icon.startsWith('ri-')) { iconHtml = `<i class="${el.content.icon}" style="font-size:1.1em;line-height:1;display:block;"></i>`; } else { iconHtml = `<span class="material-symbols-rounded" style="font-size:1.1em;line-height:1;display:block;">${el.content.icon}</span>`; } }
            domNode.innerHTML = `${iconHtml} ${el.content.text}`;
            domNode.style.cssText = innerStyles + `width: auto; display:inline-flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; cursor:pointer; vertical-align:middle; line-height:1;`;
            domNode.onclick = (e) => { e.preventDefault(); };
            btnWrap.appendChild(domNode); domNode = btnWrap;
        } 
        else if (el.type === 'image') {
            const img = document.createElement('img'); 
            img.src = el.content.src; 
            img.style.cssText = innerStyles + `display:block; object-fit:${el.styles.objectFit || 'cover'};`;
            if (el.content.url) { domNode = document.createElement('a'); domNode.className = 'builder-element el-link-wrapper'; domNode.href = el.content.url; domNode.target = el.content.target || '_self'; domNode.style.display = "block"; domNode.appendChild(img); } else { domNode = img; domNode.className = 'builder-element'; }
        } 
        else if (el.type === 'icon') {
            const wrapAlign = document.createElement('div');
            wrapAlign.style.width = '100%'; wrapAlign.style.textAlign = el.styles.textAlign || 'center'; wrapAlign.style.minHeight = '0';
            let iconHtml = el.content.icon ? (el.content.icon.startsWith('ri-') ? `<i class="${el.content.icon}"></i>` : `<span class="material-symbols-rounded">${el.content.icon}</span>`) : `<span class="material-symbols-rounded">sentiment_satisfied</span>`;
            const iconStyle = innerStyles + `display: inline-flex; align-items: center; justify-content: center; width: auto; line-height: 1; text-decoration: none; cursor: pointer;`;
            if (el.content.url) { domNode = document.createElement('a'); domNode.href = el.content.url; domNode.target = el.content.target || '_self'; domNode.className = 'builder-element el-link-wrapper'; domNode.innerHTML = iconHtml; domNode.style.cssText = iconStyle; } else { domNode = document.createElement('div'); domNode.className = 'builder-element'; domNode.innerHTML = iconHtml; domNode.style.cssText = iconStyle; }
            wrapAlign.appendChild(domNode); domNode = wrapAlign; 
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
            domNode.onclick = (e) => { e.stopPropagation(); const iconSpan = domNode.querySelector('.theme-icon'); iconSpan.classList.add('animating'); setTimeout(() => { toggleThemeMode(); }, 300); };
            btnWrap.appendChild(domNode); domNode = btnWrap;
        }

        if (domNode && el.content.elementId) domNode.id = el.content.elementId;

        if (domNode) {
            if (el.animation && el.animation.type && el.animation.type !== 'none') {
                domNode.classList.add('has-animation'); domNode.classList.add(el.animation.type);
                const animStyle = `animation-duration: ${el.animation.duration}s; animation-delay: ${el.animation.delay}s; ${el.animation.infinite ? 'animation-iteration-count: infinite;' : ''}`;
                domNode.style.cssText += animStyle;
            }
            wrapper.onclick = (e) => { 
                if (e.target.closest('.tool-btn') || e.target.closest('.inner-add-btn')) return; 
                e.stopPropagation(); 
                if (!document.body.classList.contains('preview-mode')) { 
                    if(el.type !== 'theme-toggle') { e.preventDefault(); selectElement(el.id); }
                } 
            };
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
