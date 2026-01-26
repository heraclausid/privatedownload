function selectElement(id) { editingId = id; highlightElement(id); }
function highlightElement(id) { document.querySelectorAll('.is-editing').forEach(e => e.classList.remove('is-editing')); const t = document.getElementById(id); if (t) t.classList.add('is-editing'); }
function closeAllSheets() { [addSheet, editSheet, globalSheet, iconSheet, layerSheet, overlay, document.getElementById('pageSheet')].forEach(e => { if(e) e.classList.remove('active'); }); }
if(overlay) overlay.onclick = closeAllSheets;
function openAddMenu(id) { activeContainerId = id; addSheet.classList.add('active'); overlay.classList.add('active'); }

window.togglePreview = function(active) {
    if (active) {
        document.body.classList.add('preview-mode');
        closeAllSheets();
        document.querySelectorAll('.is-editing').forEach(el => el.classList.remove('is-editing'));
        editingId = null;
        showToast("Mode Preview Aktif");
    } else {
        document.body.classList.remove('preview-mode');
    }
};

window.updateGridColumns = function(val) {
    const count = parseInt(val); 
    if (!count || count < 1) return;
    addToHistory(); 
    const el = findNode(editingId); 
    if (!el || el.type !== 'container') return;
    el.layout.direction = 'row'; el.layout.wrap = 'wrap'; 
    const gap = parseInt(el.layout.gap || 0); 
    const cssWidth = `calc((100% - ${(count - 1) * gap}px) / ${count})`;
    if (!el.children) el.children = [];
    const currentCount = el.children.length;
    if (count > currentCount) { 
        for (let i = 0; i < (count - currentCount); i++) { 
            const newCol = { 
                id: generateId(), type: 'container', content: {}, 
                styles: { ...createBaseStyles(), width: cssWidth, minHeight: 0, flexGrow: 0, bgColor: 'transparent', paddingTop:10, paddingBottom:10, paddingLeft:10, paddingRight:10 }, 
                animation: { type:'none', duration:1, delay:0, infinite:false },
                layout: { direction: 'column', gap: 10 }, children: [], hoverStyles:{}, darkStyles:{} 
            }; 
            el.children.push(newCol); 
        } 
    } else if (count < currentCount) { el.children.length = count; }
    el.children.forEach(child => { child.styles.width = cssWidth; child.styles.flexGrow = 0; });
    renderCanvas(); saveData(); showToast(`Layout diubah ke ${count} Kolom`);
};

function openEditSheet(id) {
    editingId = id; highlightElement(id); const el = findNode(id); if (!el) return;
    currentEditState = 'normal';
    document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-tab="content"]').classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-content').classList.add('active');

    let htmlContent = '';
    htmlContent += createPropSection('Tag & Anchor');
    htmlContent += createInput('content-elementId', 'ID Elemen', el.content.elementId || '', '#', 'text', '', 'ID unik untuk tujuan scroll link.');

    if (el.type === 'nav-menu') {
        htmlContent += createPropSection('Daftar Menu');
        htmlContent += `<div id="menu-editor-root"></div>`; 
        
        htmlContent += createPropSection('Layout & Orientasi');
        htmlContent += createToggle('content-hamburger', String(el.content.hamburger || false), [['false', 'menu_open'], ['true', 'menu']]);
        htmlContent += `<div class="prop-info" style="margin-bottom:10px">Aktifkan mode ikon menu (mobile style).</div>`;

        htmlContent += createToggle('content-orientation', el.content.orientation || 'row', [['row', 'view_column'], ['column', 'view_list']]);
        htmlContent += createToggle('styles-textAlign', el.styles.textAlign || 'center', [['left', 'format_align_left'], ['center', 'format_align_center'], ['right', 'format_align_right']]);
        htmlContent += createToggle('styles-alignItems', el.styles.alignItems || 'center', [['flex-start', 'vertical_align_top'], ['center', 'vertical_align_center'], ['flex-end', 'vertical_align_bottom']]);

        htmlContent += createInput('layout-gap', 'Jarak Item', el.layout && el.layout.gap ? el.layout.gap : 20, 'px', 'number');

        htmlContent += createPropSection('Interaksi & Style Hover');
        const hoverEffects = [
            ['none', 'Tidak Ada'],
            ['float', 'Float Up (Naik)'],
            ['scale', 'Scale (Membesar)'],
            ['underline', 'Underline (Garis Bawah)'],
            ['overline', 'Overline (Garis Atas)'],
            ['bg-fade', 'Background Fade']
        ];
        let hoverOpts = ''; 
        hoverEffects.forEach(opt => { 
            const sel = (el.content.hoverEffect === opt[0]) ? 'selected' : '';
            hoverOpts += `<option value="${opt[0]}" ${sel}>${opt[1]}</option>`; 
        });
        htmlContent += `<div class="prop-row"><div class="prop-label">Efek Hover</div><div class="prop-control"><div class="input-wrapper"><select id="input-content-hoverEffect" class="input-field">${hoverOpts}</select></div></div></div>`;
        
        htmlContent += createColor('content-hoverTextColor', 'Warna Teks Hover', el.content.hoverTextColor);
        htmlContent += createColor('content-hoverBgColor', 'Warna BG Hover', el.content.hoverBgColor);
        htmlContent += createInput('content-hoverRadius', 'Radius BG Hover', el.content.hoverRadius || 4, 'px', 'number');

        htmlContent += createPropSection('Divider (Pemisah)');
        const isDiv = String(el.content.showDivider) === 'true';
        htmlContent += `<div class="prop-row"><div class="prop-label">Tampilkan</div><div class="prop-control"><div class="toggle-group">
            <button type="button" class="toggle-btn ${!isDiv?'active':''}" onclick="document.getElementById('input-content-showDivider').value='false'; this.nextElementSibling.classList.remove('active'); this.classList.add('active');"><span class="material-symbols-rounded">close</span></button>
            <button type="button" class="toggle-btn ${isDiv?'active':''}" onclick="document.getElementById('input-content-showDivider').value='true'; this.previousElementSibling.classList.remove('active'); this.classList.add('active');"><span class="material-symbols-rounded">check</span></button>
        </div><input type="hidden" id="input-content-showDivider" value="${isDiv}"></div></div>`;
        htmlContent += createColor('content-dividerColor', 'Warna Divider', el.content.dividerColor);
        htmlContent += createInput('content-dividerSize', 'Panjang Divider', el.content.dividerSize || 16, 'px', 'number');
    }

    if (el.content.text !== undefined && el.type !== 'theme-toggle') { htmlContent += createInput('content-text', 'Isi Teks', el.content.text, '', 'textarea'); }
    
    if (el.type === 'image') {
        htmlContent += createPropSection('Pengaturan Gambar');
        htmlContent += createInput('content-src', 'URL Gambar', el.content.src, '', 'text');
        const ratios = [['auto', 'Auto (Asli)'], ['1 / 1', '1:1 (Square)'], ['16 / 9', '16:9 (Video)'], ['4 / 3', '4:3 (Standard)'], ['3 / 4', '3:4 (Portrait)'], ['9 / 16', '9:16 (Story)']];
        let ratioOpts = ''; ratios.forEach(r => { const sel = (el.styles.aspectRatio || 'auto') === r[0] ? 'selected' : ''; ratioOpts += `<option value="${r[0]}" ${sel}>${r[1]}</option>`; });
        htmlContent += `<div class="prop-row"><div class="prop-label">Aspect Ratio</div><div class="prop-control"><div class="input-wrapper"><select id="input-styles-aspectRatio" class="input-field">${ratioOpts}</select></div></div></div>`;
        htmlContent += createToggle('styles-objectFit', el.styles.objectFit || 'cover', [['cover', 'crop'], ['contain', 'fit_screen'], ['fill', 'aspect_ratio']]);
    }
    
    if (el.type === 'button') { htmlContent += createIconSelector('content-icon', el.content.icon); }
    if (el.type === 'icon') { htmlContent += createPropSection('Pengaturan Icon'); htmlContent += createIconSelector('content-icon', el.content.icon); htmlContent += createPropSection('Posisi'); htmlContent += createToggle('styles-textAlign', el.styles.textAlign || 'center', [['left', 'format_align_left'], ['center', 'format_align_center'], ['right', 'format_align_right']]); }
    if (el.type === 'divider') { htmlContent += createPropSection('Gaya Garis'); htmlContent += createToggle('content-style', el.content.style || 'solid', [['solid', 'remove'], ['dashed', 'more_horiz'], ['dotted', 'grain'], ['wavy', 'waves']]); htmlContent += createInput('content-thickness', 'Ketebalan (px)', el.content.thickness || 2, '', 'number'); }

    if (['heading', 'paragraph', 'button', 'image', 'container', 'icon'].includes(el.type)) {
        htmlContent += createPropSection('Navigasi / Link');
        const currentUrl = el.content.url || ''; let isInternal = false; if (currentUrl.startsWith('#')) { const potentialId = currentUrl.substring(1); if (projectData.pages.some(p => p.id === potentialId)) isInternal = true; }
        htmlContent += `<div class="prop-row"><div class="prop-label">Tipe Link</div><div class="prop-control"><div class="toggle-group"><button type="button" class="toggle-btn ${!isInternal?'active':''}" onclick="toggleLinkType('external')"><span style="font-size:12px; font-weight:600">Website URL</span></button><button type="button" class="toggle-btn ${isInternal?'active':''}" onclick="toggleLinkType('internal')"><span style="font-size:12px; font-weight:600">Halaman</span></button></div></div></div>`;
        htmlContent += `<div id="link-external-wrap" style="display:${!isInternal?'block':'none'}">${createInput('content-url', 'https://...', isInternal ? '' : currentUrl, '', 'text')}</div>`;
        let pageOpts = '<option value="">-- Pilih Halaman --</option>'; projectData.pages.forEach(p => { const val = `#${p.id}`; const isSel = currentUrl === val ? 'selected' : ''; pageOpts += `<option value="${val}" ${isSel}>${p.name} (/ ${p.slug}.html)</option>`; });
        htmlContent += `<div id="link-internal-wrap" style="display:${isInternal?'block':'none'}"><div class="prop-row"><div class="prop-label">Ke Halaman</div><div class="prop-control"><div class="input-wrapper"><select id="input-internal-selector" class="input-field" onchange="syncInternalLink(this.value)">${pageOpts}</select></div></div></div></div>`;
        htmlContent += `<div class="prop-row"><div class="prop-label">Buka di</div><div class="prop-control"><select id="input-content-target" class="input-field"><option value="_self" ${el.content.target=='_self'?'selected':''}>Tab Sama</option><option value="_blank" ${el.content.target=='_blank'?'selected':''}>Tab Baru</option></select></div></div>`;
    }

    if (el.type === 'container') {
        htmlContent += createPropSection('Layout & Rasio');
        const ratios = [['auto', 'Auto (Default)'], ['1 / 1', '1:1 (Square)'], ['16 / 9', '16:9 (Landscape)'], ['4 / 3', '4:3 (Rect)'], ['3 / 4', '3:4 (Portrait)'], ['9 / 16', '9:16 (Story)']];
        let ratioOpts = ''; ratios.forEach(r => { const sel = (el.styles.aspectRatio || 'auto') === r[0] ? 'selected' : ''; ratioOpts += `<option value="${r[0]}" ${sel}>${r[1]}</option>`; });
        htmlContent += `<div class="prop-row"><div class="prop-label">Aspect Ratio</div><div class="prop-control"><div class="input-wrapper"><select id="input-styles-aspectRatio" class="input-field">${ratioOpts}</select></div></div></div>`;
        htmlContent += `<div class="prop-row"><div class="prop-label">Columns</div><div class="prop-control" style="display:flex; gap:8px"><div class="input-wrapper"><input type="number" id="input-grid-count" value="${el.children?el.children.length:1}" class="input-field"><div class="input-unit">cols</div></div><button class="btn-action-light" type="button" onclick="updateGridColumns(document.getElementById('input-grid-count').value)">Set</button></div></div>`;
        htmlContent += createToggle('layout-direction', el.layout.direction, [['column', 'align_vertical_bottom'], ['row', 'align_horizontal_left']]);
        htmlContent += createToggle('layout-justify', el.layout.justify, [['flex-start', 'align_justify_flex_start'], ['center', 'align_justify_center'], ['space-between', 'align_justify_space_between'], ['flex-end', 'align_justify_flex_end']]);
        htmlContent += createToggle('layout-alignItems', el.layout.alignItems || 'stretch', [['flex-start', 'vertical_align_top'], ['center', 'vertical_align_center'], ['flex-end', 'vertical_align_bottom'], ['stretch', 'height']]);
        htmlContent += createInput('layout-gap', 'Jarak (Gap)', el.layout.gap || 0, 'px', 'number');
        htmlContent += createToggle('layout-wrap', el.layout.wrap, [['nowrap', 'hdr_off'], ['wrap', 'hdr_on']]);
    }

    document.getElementById('formContent').innerHTML = htmlContent;
    
    if (el.type === 'nav-menu') renderMenuEditor(el);

    renderStyleTab(el);
    editSheet.classList.add('active');
    overlay.classList.add('active');
}

function renderMenuEditor(el) {
    const root = document.getElementById('menu-editor-root');
    if (!root) return;

    let items = [];
    const raw = el.content.menuItems || "Home|#|"; 
    
    items = raw.split('\n').map(line => {
        const parts = line.split('|');
        return { 
            label: parts[0] ? parts[0].trim() : '', 
            url: parts[1] ? parts[1].trim() : '#',
            icon: parts[2] ? parts[2].trim() : ''
        };
    });

    function buildUI() {
        if (!document.getElementById('menu-editor-css')) {
            const style = document.createElement('style');
            style.id = 'menu-editor-css';
            style.innerHTML = `
                .menu-manager-wrap { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
                .menu-item-row { display: flex; align-items: center; gap: 6px; background: var(--input-bg); padding: 6px; border: 1px solid var(--border); border-radius: 6px; }
                .menu-item-row .input-wrapper { height: 32px; border-color: transparent; background: var(--surface); width: 100%; }
                .btn-icon-item { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; cursor: pointer; flex-shrink: 0; }
                .btn-remove-item { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--danger-light); color: var(--danger); border: none; border-radius: 4px; cursor: pointer; flex-shrink: 0; }
                .btn-add-item { width: 100%; padding: 10px; background: var(--bg-app); border: 1px dashed var(--primary); color: var(--primary); border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
            `;
            document.head.appendChild(style);
        }

        root.innerHTML = '';
        const listWrap = document.createElement('div');
        listWrap.className = 'menu-manager-wrap';

        items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'menu-item-row';
            
            const labelDiv = document.createElement('div'); labelDiv.className = 'input-wrapper'; labelDiv.style.flex = "1";
            const labelInput = document.createElement('input'); labelInput.className = 'input-field'; labelInput.placeholder = 'Label'; labelInput.value = item.label; labelInput.style.textAlign = 'left';
            labelInput.oninput = (e) => { items[index].label = e.target.value; syncData(); };
            labelDiv.appendChild(labelInput);

            const urlDiv = document.createElement('div'); urlDiv.className = 'input-wrapper'; urlDiv.style.flex = "1";
            const urlInput = document.createElement('input'); urlInput.className = 'input-field'; urlInput.placeholder = 'Link'; urlInput.value = item.url; urlInput.style.textAlign = 'left';
            urlInput.oninput = (e) => { items[index].url = e.target.value; syncData(); };
            urlDiv.appendChild(urlInput);

            const iconBtn = document.createElement('button');
            iconBtn.className = 'btn-icon-item';
            iconBtn.title = "Pilih Icon";
            
            if (item.icon) {
                const isRemix = item.icon.startsWith('ri-');
                iconBtn.innerHTML = isRemix ? `<i class="${item.icon}"></i>` : `<span class="material-symbols-rounded" style="font-size:18px">${item.icon}</span>`;
            } else {
                iconBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px; opacity:0.5">add_reaction</span>';
            }

            const iconHiddenInput = document.createElement('input');
            iconHiddenInput.type = 'hidden';
            iconHiddenInput.id = `input-menu-icon-${index}`;
            iconHiddenInput.value = item.icon;
            
            iconHiddenInput.oninput = () => {
                items[index].icon = iconHiddenInput.value;
                buildUI(); 
                syncData();
            };

            iconBtn.onclick = () => {
                openIconPicker(iconHiddenInput.id);
            };

            const btnRemove = document.createElement('button'); btnRemove.className = 'btn-remove-item';
            btnRemove.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px">close</span>';
            btnRemove.onclick = () => { items.splice(index, 1); buildUI(); syncData(); };

            row.appendChild(labelDiv);
            row.appendChild(urlDiv);
            row.appendChild(iconBtn);
            row.appendChild(iconHiddenInput); 
            row.appendChild(btnRemove);
            listWrap.appendChild(row);
        });

        root.appendChild(listWrap);

        const btnAdd = document.createElement('button');
        btnAdd.className = 'btn-add-item';
        btnAdd.innerHTML = '<span class="material-symbols-rounded">add</span> Tambah Menu';
        btnAdd.onclick = () => { items.push({ label: 'Menu', url: '#', icon: '' }); buildUI(); syncData(); };
        root.appendChild(btnAdd);
    }

    function syncData() {
        el.content.menuItems = items.map(i => `${i.label}|${i.url}|${i.icon}`).join('\n');
        renderCanvas();
    }

    buildUI();
}

window.toggleLinkType = function(type) {
    const ext = document.getElementById('link-external-wrap'); const int = document.getElementById('link-internal-wrap'); const realInput = document.getElementById('input-content-url'); const intSelector = document.getElementById('input-internal-selector'); const btns = document.querySelectorAll('#formContent .toggle-btn');
    if(btns.length >= 2) { if(type === 'internal') { btns[0].classList.remove('active'); btns[1].classList.add('active'); } else { btns[1].classList.remove('active'); btns[0].classList.add('active'); } }
    if (type === 'internal') { ext.style.display = 'none'; int.style.display = 'block'; realInput.value = intSelector.value; } else { ext.style.display = 'block'; int.style.display = 'none'; realInput.value = ''; }
};
window.syncInternalLink = function(val) { const realInput = document.getElementById('input-content-url'); if(realInput) realInput.value = val; }

function renderStyleTab(el) {
    let targetObj; if (currentEditState === 'hover') targetObj = el.hoverStyles || {}; else if (currentEditState === 'dark') targetObj = el.darkStyles || {}; else targetObj = el.styles;
    let html = `<div class="state-switcher"><button class="state-btn ${currentEditState==='normal'?'active':''}" onclick="changeEditState('normal')">Normal</button><button class="state-btn ${currentEditState==='hover'?'active':''}" onclick="changeEditState('hover')">Hover</button><button class="state-btn ${currentEditState==='dark'?'active':''}" onclick="changeEditState('dark')">Dark Mode</button></div>`;
    
    html += createPropSection(currentEditState === 'normal' ? 'Dimensi' : 'Override Dimensi');
    if (currentEditState === 'normal') {
        const flexVal = parseInt(el.styles.flexGrow) || 0;
        html += createToggle('styles-flexGrow', flexVal, [['0', 'crop_portrait'], ['1', 'open_in_full']]);
        html += createPropSection('Posisi (Align Self)');
        html += createToggle('styles-alignSelf', targetObj.alignSelf || 'auto', [['auto', 'hdr_auto'], ['flex-start', 'vertical_align_top'], ['center', 'vertical_align_center'], ['flex-end', 'vertical_align_bottom']]);
        if (el.type !== 'divider') { html += `<div class="prop-row"><div class="input-wrapper"><input type="text" id="input-styles-width" value="${targetObj.width||''}" class="input-field"><div class="input-unit">W</div></div><div style="width:10px"></div><div class="input-wrapper"><input type="number" id="input-styles-height" value="${targetObj.height||targetObj.minHeight||''}" class="input-field"><div class="input-unit">H</div></div></div>`; }
        html += createBoxModel('padding', 'Padding', targetObj);
        html += createBoxModel('margin', 'Margin', targetObj);
    } else { html += `<div class="empty-label" style="text-align:left; margin-bottom:10px">Dimensi dikunci di mode state.</div>`; }

    if (currentEditState === 'normal') {
        if (!el.animation) el.animation = { type:'none', duration:1, delay:0, infinite:false };
        html += createPropSection('Animasi Masuk (Entrance)');
        let animOpts = ''; if (typeof animationLibrary !== 'undefined') { animationLibrary.forEach(a => { const sel = (el.animation.type === a.value) ? 'selected' : ''; animOpts += `<option value="${a.value}" ${sel}>${a.name}</option>`; }); } else { animOpts = '<option value="none">None</option>'; }
        html += `<div class="prop-row"><div class="prop-label">Tipe</div><div class="prop-control"><div class="input-wrapper"><select id="input-animation-type" class="input-field">${animOpts}</select></div></div></div>`;
        html += createSlider('animation-duration', 'Durasi', (el.animation.duration||1) * 10, 1, 100, 's'); 
        html += createSlider('animation-delay', 'Delay', (el.animation.delay||0) * 10, 0, 100, 's');
    }
    
    if (['heading', 'paragraph', 'button', 'theme-toggle', 'icon', 'nav-menu'].includes(el.type)) {
        html += createPropSection('Tipografi');
        let fontOpts = `<option value="">Default App Font</option>`;
        if (typeof fontLibrary !== 'undefined') { fontLibrary.forEach(font => { const selected = targetObj.fontFamily === font.value ? 'selected' : ''; fontOpts += `<option value="${font.value}" ${selected}>${font.name}</option>`; }); }
        if (el.type !== 'icon') { html += `<div class="prop-row"><div class="prop-label">Font Family</div><div class="prop-control"><div class="input-wrapper"><select id="input-styles-fontFamily" class="input-field">${fontOpts}</select></div></div></div>`; }
        if (el.type !== 'icon') { html += createInput('styles-fontSize', 'Ukuran Font', targetObj.fontSize, 'px', 'number'); } else { html += createInput('styles-fontSize', 'Ukuran Icon', targetObj.fontSize, 'px', 'number'); }
        
        if (el.type !== 'icon' && el.type !== 'theme-toggle') {
            html += `<div class="prop-row"><div class="prop-label">Ketebalan</div><div class="prop-control"><select id="input-styles-fontWeight" class="input-field"><option value="100" ${targetObj.fontWeight==100?'selected':''}>100 - Thin</option><option value="200" ${targetObj.fontWeight==200?'selected':''}>200 - Extra Light</option><option value="300" ${targetObj.fontWeight==300?'selected':''}>300 - Light</option><option value="400" ${targetObj.fontWeight==400||!targetObj.fontWeight?'selected':''}>400 - Regular</option><option value="500" ${targetObj.fontWeight==500?'selected':''}>500 - Medium</option><option value="600" ${targetObj.fontWeight==600?'selected':''}>600 - Semi Bold</option><option value="700" ${targetObj.fontWeight==700?'selected':''}>700 - Bold</option><option value="800" ${targetObj.fontWeight==800?'selected':''}>800 - Extra Bold</option><option value="900" ${targetObj.fontWeight==900?'selected':''}>900 - Black</option></select></div></div>`;
            if (el.type !== 'nav-menu') {
                html += createInput('styles-lineHeight', 'Jarak Baris', targetObj.lineHeight || 1.5, '', 'number');
                html += createInput('styles-letterSpacing', 'Jarak Huruf', targetObj.letterSpacing || 0, 'px', 'number');
                html += createToggle('styles-textAlign', targetObj.textAlign, [['left', 'format_align_left'], ['center', 'format_align_center'], ['right', 'format_align_right'], ['justify', 'format_align_justify']]);
            }
        }
    }
    
    html += createPropSection('Tampilan / Warna');
    html += createColor('styles-bgColor', 'Background', targetObj.bgColor);
    if (!['spacer', 'divider', 'image'].includes(el.type)) { html += createColor('styles-textColor', el.type === 'icon' ? 'Warna Icon' : 'Warna Teks', targetObj.textColor); }
    
    html += createPropSection('Bayangan (Box Shadow)');
    html += `<div class="box-grid">
        <div class="box-cell"><div class="input-wrapper"><input type="number" id="input-styles-shadowX" value="${targetObj.shadowX||0}" class="input-field"></div><span>X</span></div>
        <div class="box-cell"><div class="input-wrapper"><input type="number" id="input-styles-shadowY" value="${targetObj.shadowY||0}" class="input-field"></div><span>Y</span></div>
        <div class="box-cell"><div class="input-wrapper"><input type="number" id="input-styles-shadowBlur" value="${targetObj.shadowBlur||0}" class="input-field"></div><span>Blur</span></div>
    </div>`;
    html += `<div style="height:8px"></div>`; 
    html += createColor('styles-shadowColor', 'Warna Bayangan', targetObj.shadowColor);
    
    html += createSlider('styles-opacity', 'Opacity', (targetObj.opacity !== undefined ? targetObj.opacity : 1) * 100, 0, 100, '%');
    html += createSlider('styles-radius', 'Radius', targetObj.radius, 0, 100, 'px');
    if (el.type !== 'divider') { html += createPropSection('Border'); html += createInput('styles-borderWidth', 'Tebal', targetObj.borderWidth, 'px', 'number'); html += createToggle('styles-borderStyle', targetObj.borderStyle, [['solid', 'check_box_outline_blank'], ['dashed', 'more_horiz']]); html += createColor('styles-borderColor', 'Warna', targetObj.borderColor); }

    document.getElementById('formStyle').innerHTML = html;
}

window.changeEditState = (newState) => { const el = findNode(editingId); if (el) { saveCurrentInputsToNode(el); currentEditState = newState; renderStyleTab(el); } }
function saveCurrentInputsToNode(el) { const inputs = document.getElementById('formStyle').querySelectorAll('input, select, textarea'); let targetObj; if (currentEditState === 'hover') { if (!el.hoverStyles) el.hoverStyles = {}; targetObj = el.hoverStyles; } else if (currentEditState === 'dark') { if (!el.darkStyles) el.darkStyles = {}; targetObj = el.darkStyles; } else targetObj = el.styles; inputs.forEach(inp => { if (inp.id.startsWith('picker-') || inp.id.startsWith('input-layout') || inp.id.startsWith('input-animation')) return; const parts = inp.id.split('-'); if (parts.length < 3) return; const key = parts[2]; let val = inp.value; if (key === 'opacity') val = parseFloat(val) / 100; if (val === '') val = undefined; targetObj[key] = val; }); }

document.getElementById('saveEditBtn').onclick = () => { 
    addToHistory(); 
    const el = findNode(editingId); 
    if (!el) return; 
    const contentInputs = document.getElementById('formContent').querySelectorAll('input, select, textarea'); 
    
    contentInputs.forEach(inp => { 
        if (inp.id.startsWith('picker-') || inp.id === 'input-grid-count' || inp.id === 'input-internal-selector') return; 
        const parts = inp.id.split('-'); 
        if (parts.length < 3) return; 
        const cat = parts[1]; 
        const key = parts[2]; 
        let val = inp.value; 
        if(['gap', 'thickness', 'fontSize', 'dividerSize', 'hoverRadius'].includes(key)) val = parseFloat(val); 
        if (val === '') val = undefined; 
        
        if (cat === 'content') el.content[key] = val; 
        else if(cat === 'layout') el.layout[key] = val; 
        else if (cat === 'styles') el.styles[key] = val; 
    }); 
    
    if (currentEditState === 'normal') {
        const animType = document.getElementById('input-animation-type'); const animDur = document.getElementById('input-animation-duration'); const animDel = document.getElementById('input-animation-delay');
        if (animType && animDur && animDel) { 
            if (!el.animation) el.animation = {}; 
            el.animation.type = animType.value; 
            el.animation.duration = parseFloat(animDur.value); 
            el.animation.delay = parseFloat(animDel.value); 
        }
    }
    saveCurrentInputsToNode(el); renderCanvas(); closeAllSheets(); updateGlobalStyles(); saveData(); showToast("Perubahan Disimpan"); 
};

function moveLayer(action) { 
    if (!editingId) return alert("Pilih elemen dulu!"); addToHistory(); 
    let parentArray = pageData, index = -1, parentNode = null; 
    function findInArray(arr, parent) { for (let i = 0; i < arr.length; i++) { if (arr[i].id === editingId) { parentArray = arr; index = i; parentNode = parent; return true; } if (arr[i].children && findInArray(arr[i].children, arr[i])) return true; } return false; } 
    findInArray(pageData, null); if (index === -1) { historyStack.pop(); updateUndoRedoButtons(); return; } const el = parentArray[index]; let changed = false;
    if (action === 'up') { if (index > 0) { [parentArray[index], parentArray[index - 1]] = [parentArray[index - 1], parentArray[index]]; changed = true; } } else if (action === 'down') { if (index < parentArray.length - 1) { [parentArray[index], parentArray[index + 1]] = [parentArray[index + 1], parentArray[index]]; changed = true; } } else if (action === 'in') { if (index > 0 && parentArray[index - 1].children) { parentArray.splice(index, 1); parentArray[index - 1].children.push(el); changed = true; } else { alert("Tidak bisa masuk"); } } else if (action === 'out') { if (parentNode) { let grandParentArray = pageData, parentIndex = -1; function findParentArr(arr) { for (let i = 0; i < arr.length; i++) { if (arr[i].id === parentNode.id) { grandParentArray = arr; parentIndex = i; return true; } if (arr[i].children && findParentArr(arr[i].children)) return true; } return false; } if (pageData.includes(parentNode)) { grandParentArray = pageData; parentIndex = pageData.indexOf(parentNode); } else { findParentArr(pageData); } parentArray.splice(index, 1); grandParentArray.splice(parentIndex + 1, 0, el); changed = true; } else { alert("Sudah di level teratas"); } } 
    if (changed) { saveData(); renderCanvas(); renderLayerSheet(); setTimeout(() => highlightElement(editingId), 50); showToast("Posisi Diubah"); } else { historyStack.pop(); updateUndoRedoButtons(); }
}

function createPropSection(t) { return `<div class="prop-section"><div class="prop-header"><div class="prop-title">${t}</div></div></div>`; }
function createInput(k, l, v, s = '', t = 'text', changeFn = '', info = '') { const onChangeAttr = changeFn ? `onchange="${changeFn}"` : ''; let html = ''; if (t === 'textarea') { html = `<div class="prop-row" style="display:block"><div class="prop-label" style="margin-bottom:6px">${l}</div><div class="input-wrapper"><textarea id="input-${k}" rows="3" class="input-field" style="text-align:left" ${onChangeAttr}>${v||''}</textarea></div></div>`; } else { html = `<div class="prop-row"><div class="prop-label">${l}</div><div class="prop-control"><div class="input-wrapper"><input type="${t}" id="input-${k}" value="${v!==undefined?v:''}" class="input-field" ${onChangeAttr}>${s?`<div class="input-unit">${s}</div>`:''}</div></div></div>`; } if (info) html += `<div class="prop-info">${info}</div>`; return html; }
function createToggle(k, v, opts) { const btns = opts.map(o => `<button type="button" class="toggle-btn ${o[0]==v?'active':''}" onclick="selectToggle('${k}','${o[0]}')"><span class="material-symbols-rounded">${o[1]}</span></button>`).join(''); let l = 'Style'; if (k === 'styles-flexGrow') l = 'Expand'; else if(k.startsWith('layout')) l = k.replace('layout-',''); return `<div class="prop-row"><div class="prop-label" style="text-transform:capitalize">${l}</div><div class="prop-control"><div class="toggle-group" id="group-${k}">${btns}</div><input type="hidden" id="input-${k}" value="${v}"></div></div>`; }
window.selectToggle = (k, v) => { document.getElementById(`input-${k}`).value = v; Array.from(document.getElementById(`group-${k}`).children).forEach(b => b.classList.remove('active')); event.currentTarget.classList.add('active'); };

function createSlider(k, l, v, min = 0, max = 100, unit = '') { 
    const displayVal = k.includes('animation') ? (v/10).toFixed(1) : v;
    return `<div class="prop-row"><div class="prop-label">${l}</div><div class="prop-control" style="flex:2"><div class="slider-wrapper"><input type="range" min="${min}" max="${max}" value="${v||0}" class="slider-range" oninput="document.getElementById('input-${k}').value = this.id.includes('animation') ? (this.value/10).toFixed(1) : this.value"><div class="input-wrapper" style="width:75px"><input type="number" id="input-${k}" value="${displayVal}" class="input-field" oninput="let val = this.value * (this.id.includes('animation')?10:1); this.closest('.slider-wrapper').querySelector('input[type=range]').value = val">${unit ? `<div class="input-unit">${unit}</div>` : ''}</div></div></div></div>`; 
}

function createColor(k, l, v) { 
    const isSet = v && v !== ''; 
    const c = isSet ? v : '#000000'; 
    const palette = savedColors.map(sc => 
        `<div class="color-swatch" style="background:${sc}" onclick="updateColor('${k}','${sc}')" title="${sc}"></div>`
    ).join(''); 
    
    const inputId = `input-${k}`; 

    return `
    <div class="prop-row" style="flex-wrap:wrap">
        <div class="prop-label" style="width:100%">${l}</div>
        <div class="prop-control" style="width:100%; margin-bottom:8px">
            
            <div class="color-empty-state" id="empty-${k}" style="display:${isSet?'none':'flex'};align-items:center;gap:8px">
                <span>None</span>
                <button type="button" class="btn-add-color" onclick="updateColor('${k}','#6366f1'); saveToPalette('#6366f1')">Set</button>
            </div>

            <div class="color-compact" id="active-${k}" style="display:${isSet?'flex':'none'}">
                
                <div class="color-preview" id="preview-${k}" 
                     style="background-color:${isSet?c:'transparent'}; cursor:pointer;"
                     onclick="openColorPicker('${inputId}')">
                </div>

                <div class="input-wrapper">
                    <input type="text" id="${inputId}" value="${isSet?c:''}" placeholder="#Hex" class="input-field" 
                           oninput="updateColor('${k}',this.value)" 
                           onchange="saveToPalette(this.value)" maxlength="7">
                </div>

                <button type="button" class="icon-action remove" onclick="updateColor('${k}','')" style="width:28px;height:28px">
                    <span class="material-symbols-rounded" style="font-size:16px">close</span>
                </button>
            </div>
        </div>
        
        <div class="palette-row" style="width:100%; display:flex; gap:5px; flex-wrap:wrap;">${palette}</div>
    </div>`; 
}

window.updateColor = function(k, v) { 
    const has = v && v !== ''; 
    document.getElementById(`empty-${k}`).style.display = has ? 'none' : 'flex'; 
    document.getElementById(`active-${k}`).style.display = has ? 'flex' : 'none'; 
    
    const input = document.getElementById(`input-${k}`);
    if(input && document.activeElement !== input) input.value = v; 
    
    const preview = document.getElementById(`preview-${k}`);
    if (preview && has) { 
        preview.style.backgroundColor = v; 
    } 
    
    const el = findNode(editingId); 
    if (el) { 
        let targetObj; 
        if (currentEditState === 'hover') { if (!el.hoverStyles) el.hoverStyles = {}; targetObj = el.hoverStyles; } 
        else if (currentEditState === 'dark') { if (!el.darkStyles) el.darkStyles = {}; targetObj = el.darkStyles; } 
        else targetObj = el.styles; 
        
        const propName = k.split('-')[1]; 
        targetObj[propName] = v; 
        
        renderCanvas(); 
        updateGlobalStyles(); 
    } 
};

function createBoxModel(t, l, s) { return `<div class="prop-section"><div class="prop-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div class="prop-title" style="margin:0">${l}</div><button class="link-btn" id="link-${t}" type="button" onclick="toggleLink('${t}')"><span class="material-symbols-rounded">link_off</span></button></div><div class="box-grid"><div class="box-cell"><div class="input-wrapper"><input type="number" id="input-styles-${t}Top" value="${s[t+'Top']||0}" class="input-field" oninput="syncBox('${t}','Top',this.value)"></div><span>Top</span></div><div class="box-cell"><div class="input-wrapper"><input type="number" id="input-styles-${t}Right" value="${s[t+'Right']||0}" class="input-field" oninput="syncBox('${t}','Right',this.value)"></div><span>Right</span></div><div class="box-cell"><div class="input-wrapper"><input type="number" id="input-styles-${t}Bottom" value="${s[t+'Bottom']||0}" class="input-field" oninput="syncBox('${t}','Bottom',this.value)"></div><span>Btm</span></div><div class="box-cell"><div class="input-wrapper"><input type="number" id="input-styles-${t}Left" value="${s[t+'Left']||0}" class="input-field" oninput="syncBox('${t}','Left',this.value)"></div><span>Left</span></div></div></div>`; }
window.toggleLink = (t) => { const b = document.getElementById(`link-${t}`); const a = b.classList.toggle('active'); b.innerHTML = a ? '<span class="material-symbols-rounded">link</span>' : '<span class="material-symbols-rounded">link_off</span>'; };
window.syncBox = (t, s, v) => { if (document.getElementById(`link-${t}`).classList.contains('active')) { ['Top', 'Right', 'Bottom', 'Left'].forEach(side => { if (side !== s) document.getElementById(`input-styles-${t}${side}`).value = v }) } };
function renderIconSheet() { const g = document.getElementById('iconGrid'); g.innerHTML = ''; const no = document.createElement('div'); no.className = 'icon-option no-icon'; no.innerHTML = '<span>None</span>'; no.onclick = () => selectIcon(''); g.appendChild(no); materialIcons.forEach(i => { const d = document.createElement('div'); d.className = 'icon-option'; d.innerHTML = `<span class="${i.startsWith('ri-')?i:'material-symbols-rounded'}">${i.startsWith('ri-')?'':i}</span>`; d.onclick = () => selectIcon(i); g.appendChild(d); }); }
function createIconSelector(k, v) { const i = v ? `<span class="${v.startsWith('ri-')?v:'material-symbols-rounded'}" style="font-size:20px">${v.startsWith('ri-')?'':v}</span>` : '<span>None</span>'; return `<div class="prop-row"><div class="prop-label">Icon</div><div class="prop-control"><button type="button" class="btn-action-light" style="display:flex;align-items:center;gap:8px;width:100%;justify-content:center" onclick="openIconPicker('input-${k}')">${i} Change</button><input type="hidden" id="input-${k}" value="${v||''}"></div></div>`; }
function openIconPicker(id) { targetIconInputId = id; iconSheet.classList.add('active'); overlay.classList.add('active'); }
function selectIcon(v) { 
    if (targetIconInputId) { 
        const input = document.getElementById(targetIconInputId);
        input.value = v; 
        
        if(input.id.startsWith('input-menu-icon-')) {
            const btn = input.previousElementSibling;
            if (v) {
                const isRemix = v.startsWith('ri-');
                btn.innerHTML = isRemix ? `<i class="${v}"></i>` : `<span class="material-symbols-rounded" style="font-size:18px">${v}</span>`;
            } else {
                btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px; opacity:0.5">add_reaction</span>';
            }
            input.dispatchEvent(new Event('input'));
        } else {
            const btn = input.previousElementSibling; 
            btn.innerHTML = v ? `<span class="${v.startsWith('ri-')?v:'material-symbols-rounded'}" style="font-size:20px">${v.startsWith('ri-')?'':v}</span> Change` : '<span>None</span> Change'; 
        }
    } 
    iconSheet.classList.remove('active'); 
}
function toggleMainMenu() { const menu = document.getElementById('mainMenuDropdown'); menu.classList.toggle('active'); }
document.addEventListener('click', function(event) { const menu = document.getElementById('mainMenuDropdown'); const btn = document.getElementById('menuBtn'); if (menu && btn) { if (menu.classList.contains('active') && !menu.contains(event.target) && !btn.contains(event.target)) { menu.classList.remove('active'); } } });
document.querySelectorAll('.menu-item').forEach(item => { item.addEventListener('click', () => { const menu = document.getElementById('mainMenuDropdown'); if (menu) menu.classList.remove('active'); }); });
function renderLayerSheet() { const list = document.getElementById('layerList'); list.innerHTML = ''; function buildTree(nodes, indent) { nodes.forEach(el => { const item = document.createElement('div'); item.className = `layer-item ${editingId === el.id ? 'active' : ''}`; let iconName = 'check_box_outline_blank'; 
    if (el.type === 'container') iconName = 'crop_free'; 
    else if (el.type === 'heading') iconName = 'title'; 
    else if (el.type === 'paragraph') iconName = 'text_fields'; 
    else if (el.type === 'button') iconName = 'smart_button'; 
    else if (el.type === 'image') iconName = 'image'; 
    else if (el.type === 'theme-toggle') iconName = 'contrast'; 
    else if (el.type === 'spacer') iconName = 'space_bar'; 
    else if (el.type === 'divider') iconName = 'horizontal_rule'; 
    else if (el.type === 'icon') iconName = 'sentiment_satisfied';
    else if (el.type === 'nav-menu') iconName = 'menu';
    let indentDivs = ''; for (let i = 0; i < indent; i++) indentDivs += '<div class="layer-indent"></div>'; const text = el.content.text ? el.content.text : el.type.charAt(0).toUpperCase() + el.type.slice(1); item.innerHTML = `${indentDivs}<span class="material-symbols-rounded layer-icon">${iconName}</span> <span class="layer-text">${text}</span>`; item.onclick = () => { selectElement(el.id); renderLayerSheet(); }; list.appendChild(item); if (el.children && el.children.length > 0) buildTree(el.children, indent + 1); }); } if (pageData.length === 0) list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-gray)">Belum ada layer</div>'; else buildTree(pageData, 0); }
