/* --- js/ui.js (FULL & UPDATED) --- */

function selectElement(id) { editingId = id; highlightElement(id); }
function highlightElement(id) { document.querySelectorAll('.is-editing').forEach(e => e.classList.remove('is-editing')); const t = document.getElementById(id); if (t) t.classList.add('is-editing'); }
function closeAllSheets() { [addSheet, editSheet, globalSheet, iconSheet, layerSheet, overlay].forEach(e => { if(e) e.classList.remove('active'); }); }
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

// --- FUNGSI BARU: UPDATE COLUMNS ---
// Fungsi ini mengubah jumlah kolom dengan memanipulasi width anak
window.updateGridColumns = function(val) {
    const count = parseInt(val); 
    if (!count || count < 1) return;
    
    if(typeof addToHistory === 'function') addToHistory();

    const el = findNode(editingId); 
    if (!el || el.type !== 'container') return;

    // Force layout menjadi baris (row) agar kolom bekerja
    el.layout.direction = 'row'; 
    el.layout.wrap = 'wrap'; 
    
    const gap = parseInt(el.layout.gap || 0); 
    // Kalkulasi Width: (100% - total gap) / jumlah kolom
    const cssWidth = `calc((100% - ${(count - 1) * gap}px) / ${count})`;

    if (!el.children) el.children = [];
    const currentCount = el.children.length;

    // Tambah kolom jika kurang
    if (count > currentCount) { 
        for (let i = 0; i < (count - currentCount); i++) { 
            const newCol = { 
                id: generateId(), 
                type: 'container', 
                content: {}, 
                styles: { 
                    ...createBaseStyles(), 
                    width: cssWidth, 
                    minHeight: 0, 
                    flexGrow: 0, 
                    bgColor: 'transparent', 
                    paddingTop:10, paddingBottom:10, paddingLeft:10, paddingRight:10 
                }, 
                layout: { direction: 'column', gap: 10 }, 
                children: [], hoverStyles:{}, darkStyles:{} 
            }; 
            el.children.push(newCol); 
        } 
    } 
    // Kurangi kolom jika berlebih
    else if (count < currentCount) { 
        el.children.length = count; 
    }

    // Update width semua anak
    el.children.forEach(child => { 
        child.styles.width = cssWidth; 
        child.styles.flexGrow = 0; 
    });

    renderCanvas(); 
    saveData();
    showToast(`Layout diubah ke ${count} Kolom`);
};

// --- EDIT SHEET UTAMA (UPDATED) ---
function openEditSheet(id) {
    editingId = id;
    highlightElement(id);
    const el = findNode(id);
    if (!el) return;

    currentEditState = 'normal';
    // Reset tab ke konten
    if(!document.querySelector('.pill-btn.active[data-tab="content"]')) {
        document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tab="content"]').classList.add('active');
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById('tab-content').classList.add('active');
    }

    let htmlContent = '';

    htmlContent += createPropSection('Tag & Anchor');
    htmlContent += createInput('content-elementId', 'ID Elemen', el.content.elementId || '', '#', 'text', '', 'ID unik untuk tujuan scroll link.');

    if (el.content.text !== undefined && el.type !== 'theme-toggle') { 
        htmlContent += createInput('content-text', 'Isi Teks', el.content.text, '', 'textarea'); 
    }
    if (el.content.src !== undefined) { 
        htmlContent += createInput('content-src', 'URL Gambar', el.content.src, '', 'text'); 
    }
    if (el.type === 'button') { 
        htmlContent += createIconSelector('content-icon', el.content.icon); 
    }
    if (el.type === 'divider') {
        htmlContent += createPropSection('Gaya Garis');
        htmlContent += createToggle('content-style', el.content.style || 'solid', [['solid', 'remove'], ['dashed', 'more_horiz'], ['dotted', 'grain'], ['wavy', 'waves']]);
        htmlContent += createInput('content-thickness', 'Ketebalan (px)', el.content.thickness || 2, '', 'number');
    }
    if (['heading', 'paragraph', 'button', 'image', 'container'].includes(el.type)) {
        htmlContent += createPropSection('Link / Aksi');
        htmlContent += createInput('content-url', 'Link Tujuan', el.content.url, '', 'text');
        htmlContent += `<div class="prop-row"><div class="prop-label">Buka di</div><div class="prop-control"><select id="input-content-target" class="input-field"><option value="_self" ${el.content.target=='_self'?'selected':''}>Tab Sama</option><option value="_blank" ${el.content.target=='_blank'?'selected':''}>Tab Baru</option></select></div></div>`;
    }

    // --- GRID & LAYOUT SECTION (BARU) ---
    if (el.type === 'container') {
        htmlContent += createPropSection('Grid & Layout');
        
        // Input Columns (Dengan tombol Set)
        htmlContent += `<div class="prop-row"><div class="prop-label">Columns</div><div class="prop-control"><div class="input-wrapper"><input type="number" id="input-grid-count" value="${el.children?el.children.length:1}" class="input-field"><span class="input-suffix">cols</span></div><button class="btn-action-light" type="button" style="margin-left:8px" onclick="updateGridColumns(document.getElementById('input-grid-count').value)">Set</button></div></div>`;
        htmlContent += `<div class="prop-info">Tombol 'Set' akan mengatur ulang anak menjadi kolom rata.</div>`;

        // Direction Toggle
        htmlContent += createToggle('layout-direction', el.layout.direction, [['column', 'align_vertical_bottom'], ['row', 'align_horizontal_left']]);
        
        // Justify Content
        htmlContent += createToggle('layout-justify', el.layout.justify, [['flex-start', 'align_justify_flex_start'], ['center', 'align_justify_center'], ['space-between', 'align_justify_space_between'], ['flex-end', 'align_justify_flex_end']]);
        
        // Align Items
        htmlContent += createToggle('layout-alignItems', el.layout.alignItems || 'stretch', [['flex-start', 'vertical_align_top'], ['center', 'vertical_align_center'], ['flex-end', 'vertical_align_bottom'], ['stretch', 'height']]);
        
        // Gap
        htmlContent += createInput('layout-gap', 'Jarak (Gap)', el.layout.gap || 0, 'px', 'number');

        // Wrap Toggle
        htmlContent += createToggle('layout-wrap', el.layout.wrap, [['nowrap', 'hdr_off'], ['wrap', 'hdr_on']]);
    }

    document.getElementById('formContent').innerHTML = htmlContent;
    renderStyleTab(el);
    editSheet.classList.add('active');
    overlay.classList.add('active');
}

function renderStyleTab(el) {
    let targetObj;
    if (currentEditState === 'hover') targetObj = el.hoverStyles || {};
    else if (currentEditState === 'dark') targetObj = el.darkStyles || {};
    else targetObj = el.styles;
    
    let html = `<div class="state-switcher"><button class="state-btn ${currentEditState==='normal'?'active':''}" onclick="changeEditState('normal')">Normal</button><button class="state-btn ${currentEditState==='hover'?'active':''}" onclick="changeEditState('hover')">Hover</button><button class="state-btn ${currentEditState==='dark'?'active':''}" onclick="changeEditState('dark')">Dark Mode</button></div>`;
    
    html += createPropSection(currentEditState === 'normal' ? 'Dimensi' : 'Override Dimensi');
    
    if (currentEditState === 'normal') {
        const flexVal = parseInt(el.styles.flexGrow) || 0;
        html += createToggle('styles-flexGrow', flexVal, [['0', 'crop_portrait'], ['1', 'open_in_full']]);
        html += `<div class="prop-info">Set 1 untuk mengisi sisa ruang kosong.</div>`;

        html += createPropSection('Posisi (Align Self)');
        html += createToggle('styles-alignSelf', targetObj.alignSelf || 'auto', [['auto', 'hdr_auto'], ['flex-start', 'vertical_align_top'], ['center', 'vertical_align_center'], ['flex-end', 'vertical_align_bottom']]);
        
        if (el.type !== 'divider') {
            html += `<div class="prop-row"><div class="input-wrapper"><input type="text" id="input-styles-width" value="${targetObj.width||''}" class="input-field"><span class="input-suffix">W</span></div><div style="width:10px"></div><div class="input-wrapper"><input type="number" id="input-styles-height" value="${targetObj.height||targetObj.minHeight||''}" class="input-field"><span class="input-suffix">H</span></div></div>`;
        }
        
        html += createBoxModel('padding', 'Padding', targetObj);
        html += createBoxModel('margin', 'Margin', targetObj);
    } else {
        html += `<div class="empty-label" style="text-align:left; margin-bottom:10px">Dimensi dikunci di mode state.</div>`;
    }
    
    if (['heading', 'paragraph', 'button', 'theme-toggle'].includes(el.type)) {
        html += createPropSection('Tipografi');
        let fontOpts = `<option value="">Default App Font</option>`;
        if (typeof fontLibrary !== 'undefined') { fontLibrary.forEach(font => { const selected = targetObj.fontFamily === font.value ? 'selected' : ''; fontOpts += `<option value="${font.value}" ${selected}>${font.name}</option>`; }); }
        html += `<div class="prop-row"><div class="prop-label">Font Family</div><div class="prop-control"><div class="input-wrapper"><select id="input-styles-fontFamily" class="input-field">${fontOpts}</select></div></div></div>`;

        if (currentEditState === 'normal') {
            html += createInput('styles-fontSize', 'Ukuran Font', targetObj.fontSize, 'px', 'number');
            html += `<div class="prop-row"><div class="prop-label">Ketebalan</div><div class="prop-control"><select id="input-styles-fontWeight" class="input-field"><option value="100" ${targetObj.fontWeight==100?'selected':''}>100 - Thin</option><option value="200" ${targetObj.fontWeight==200?'selected':''}>200 - Extra Light</option><option value="300" ${targetObj.fontWeight==300?'selected':''}>300 - Light</option><option value="400" ${targetObj.fontWeight==400||!targetObj.fontWeight?'selected':''}>400 - Regular</option><option value="500" ${targetObj.fontWeight==500?'selected':''}>500 - Medium</option><option value="600" ${targetObj.fontWeight==600?'selected':''}>600 - Semi Bold</option><option value="700" ${targetObj.fontWeight==700?'selected':''}>700 - Bold</option><option value="800" ${targetObj.fontWeight==800?'selected':''}>800 - Extra Bold</option><option value="900" ${targetObj.fontWeight==900?'selected':''}>900 - Black</option></select></div></div>`;
            html += createInput('styles-lineHeight', 'Jarak Baris', targetObj.lineHeight || 1.5, '', 'number');
            html += createInput('styles-letterSpacing', 'Jarak Huruf', targetObj.letterSpacing || 0, 'px', 'number');
            html += createToggle('styles-textAlign', targetObj.textAlign, [['left', 'format_align_left'], ['center', 'format_align_center'], ['right', 'format_align_right'], ['justify', 'format_align_justify']]);
        }
        html += createColor('styles-textColor', 'Warna Teks', targetObj.textColor);
    }
    
    html += createPropSection('Tampilan');
    html += createColor('styles-bgColor', 'Background', targetObj.bgColor);
    
    // PENGATURAN SHADOW (DARI VERSI SEBELUMNYA TETAP DIJAAGA)
    if (currentEditState === 'normal') {
        html += createPropSection('Bayangan (Box Shadow)');
        html += `<div class="box-grid">
            <div class="box-cell"><input type="number" id="input-styles-shadowX" value="${targetObj.shadowX||0}" class="input-field"><span>X</span></div>
            <div class="box-cell"><input type="number" id="input-styles-shadowY" value="${targetObj.shadowY||0}" class="input-field"><span>Y</span></div>
            <div class="box-cell"><input type="number" id="input-styles-shadowBlur" value="${targetObj.shadowBlur||0}" class="input-field"><span>Blur</span></div>
        </div>`;
        html += `<div style="height:8px"></div>`; 
        html += createColor('styles-shadowColor', 'Warna Bayangan', targetObj.shadowColor);

        html += createSlider('styles-opacity', 'Opacity', (targetObj.opacity || 1) * 100, 0, 100);
        html += createSlider('styles-radius', 'Radius', targetObj.radius, 0, 100);
        if (el.type !== 'divider') { html += createPropSection('Border'); html += createInput('styles-borderWidth', 'Tebal', targetObj.borderWidth, 'px', 'number'); html += createToggle('styles-borderStyle', targetObj.borderStyle, [['solid', 'check_box_outline_blank'], ['dashed', 'more_horiz']]); html += createColor('styles-borderColor', 'Warna', targetObj.borderColor); }
    }
    document.getElementById('formStyle').innerHTML = html;
}

window.changeEditState = (newState) => { const el = findNode(editingId); if (el) { saveCurrentInputsToNode(el); currentEditState = newState; renderStyleTab(el); } }
function saveCurrentInputsToNode(el) { const inputs = document.getElementById('formStyle').querySelectorAll('input, select, textarea'); let targetObj; if (currentEditState === 'hover') { if (!el.hoverStyles) el.hoverStyles = {}; targetObj = el.hoverStyles; } else if (currentEditState === 'dark') { if (!el.darkStyles) el.darkStyles = {}; targetObj = el.darkStyles; } else targetObj = el.styles; inputs.forEach(inp => { if (inp.id.startsWith('picker-') || inp.id.startsWith('input-layout')) return; const parts = inp.id.split('-'); if (parts.length < 3) return; const key = parts[2]; let val = inp.value; if (key === 'opacity') val = parseFloat(val) / 100; if (val === '') val = undefined; targetObj[key] = val; }); }
document.getElementById('saveEditBtn').onclick = () => { const el = findNode(editingId); if (!el) return; const contentInputs = document.getElementById('formContent').querySelectorAll('input, select, textarea'); contentInputs.forEach(inp => { if (inp.id.startsWith('picker-') || inp.id === 'input-grid-count') return; const parts = inp.id.split('-'); if (parts.length < 3) return; const cat = parts[1]; const key = parts[2]; let val = inp.value; if(['gap', 'thickness'].includes(key)) val = parseFloat(val); if (val === '') val = undefined; if (cat === 'content') el.content[key] = val; else if(cat === 'layout') el.layout[key] = val; }); saveCurrentInputsToNode(el); renderCanvas(); closeAllSheets(); updateGlobalStyles(); saveData(); showToast("Perubahan Disimpan"); };

// HELPER COMPONENTS
function createPropSection(t) { return `<div class="prop-section"><div class="prop-header"><div class="prop-title">${t}</div></div></div>`; }
function createInput(k, l, v, s = '', t = 'text', changeFn = '', info = '') { const onChangeAttr = changeFn ? `onchange="${changeFn}"` : ''; let html = ''; if (t === 'textarea') { html = `<div class="prop-row" style="display:block"><div class="prop-label" style="margin-bottom:6px">${l}</div><div class="input-wrapper"><textarea id="input-${k}" rows="3" class="input-field" style="text-align:left" ${onChangeAttr}>${v||''}</textarea></div></div>`; } else { html = `<div class="prop-row"><div class="prop-label">${l}</div><div class="prop-control"><div class="input-wrapper"><input type="${t}" id="input-${k}" value="${v!==undefined?v:''}" class="input-field" ${onChangeAttr}>${s?`<span class="input-suffix">${s}</span>`:''}</div></div></div>`; } if (info) html += `<div class="prop-info">${info}</div>`; return html; }
function createToggle(k, v, opts) { const btns = opts.map(o => `<button type="button" class="toggle-btn ${o[0]==v?'active':''}" onclick="selectToggle('${k}','${o[0]}')"><span class="material-symbols-rounded">${o[1]}</span></button>`).join(''); let l = 'Style'; if (k === 'styles-flexGrow') l = 'Expand'; else if(k.startsWith('layout')) l = k.replace('layout-',''); return `<div class="prop-row"><div class="prop-label" style="text-transform:capitalize">${l}</div><div class="prop-control"><div class="toggle-group" id="group-${k}">${btns}</div><input type="hidden" id="input-${k}" value="${v}"></div></div>`; }
window.selectToggle = (k, v) => { document.getElementById(`input-${k}`).value = v; Array.from(document.getElementById(`group-${k}`).children).forEach(b => b.classList.remove('active')); event.currentTarget.classList.add('active'); };
function createSlider(k, l, v, min = 0, max = 100) { return `<div class="prop-row"><div class="prop-label">${l}</div><div class="prop-control" style="flex:2"><div class="slider-wrapper"><input type="range" min="${min}" max="${max}" value="${v||0}" class="slider-range" oninput="document.getElementById('input-${k}').value=this.value"><div class="input-wrapper" style="width:50px"><input type="number" id="input-${k}" value="${v||0}" class="input-field" oninput="this.closest('.slider-wrapper').querySelector('input[type=range]').value=this.value"></div></div></div></div>`; }
function createColor(k, l, v) { const isSet = v && v !== ''; const c = isSet ? v : '#000000'; const palette = savedColors.map(sc => `<div class="color-swatch" style="background:${sc}" onclick="updateColor('${k}','${sc}')" title="${sc}"></div>`).join(''); return `<div class="prop-row" style="flex-wrap:wrap"><div class="prop-label" style="width:100%">${l}</div><div class="prop-control" style="width:100%; margin-bottom:8px"><div class="color-empty-state" id="empty-${k}" style="display:${isSet?'none':'flex'};align-items:center;gap:8px"><span>None</span><button type="button" class="btn-add-color" onclick="updateColor('${k}','#6366f1')">Set</button></div><div class="color-compact" id="active-${k}" style="display:${isSet?'flex':'none'}"><div class="color-preview" id="preview-${k}" style="background-color:${isSet?c:'transparent'}"><input type="color" id="picker-${k}" value="${isSet&&c.startsWith('#')?c:'#000000'}" oninput="updateColor('${k}',this.value)"></div><div class="input-wrapper"><input type="text" id="input-${k}" value="${isSet?c:''}" placeholder="#Hex" class="input-field" onchange="updateColor('${k}',this.value)"></div><button type="button" class="icon-action remove" onclick="updateColor('${k}','')" style="width:28px;height:28px"><span class="material-symbols-rounded" style="font-size:16px">close</span></button></div></div><div class="palette-row" style="width:100%; display:flex; gap:5px; flex-wrap:wrap;">${palette}</div></div>`; }
window.updateColor = (k, v) => { if (v && v !== '' && v !== 'transparent' && !savedColors.includes(v)) { savedColors.push(v); if (savedColors.length > 12) savedColors.shift(); saveData(); } const has = v && v !== ''; document.getElementById(`empty-${k}`).style.display = has ? 'none' : 'flex'; document.getElementById(`active-${k}`).style.display = has ? 'flex' : 'none'; document.getElementById(`input-${k}`).value = v; if (has) { document.getElementById(`preview-${k}`).style.backgroundColor = v; const p = document.getElementById(`picker-${k}`); if (p && v.startsWith('#') && v.length === 7) p.value = v; } const el = findNode(editingId); if (el) { let targetObj; if (currentEditState === 'hover') { if (!el.hoverStyles) el.hoverStyles = {}; targetObj = el.hoverStyles; } else if (currentEditState === 'dark') { if (!el.darkStyles) el.darkStyles = {}; targetObj = el.darkStyles; } else targetObj = el.styles; const propName = k.split('-')[1]; targetObj[propName] = v; renderCanvas(); updateGlobalStyles(); saveData(); } };
function createBoxModel(t, l, s) { return `<div class="prop-section"><div class="prop-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div class="prop-title" style="margin:0">${l}</div><button class="link-btn" id="link-${t}" type="button" onclick="toggleLink('${t}')"><span class="material-symbols-rounded">link_off</span></button></div><div class="box-grid"><div class="box-cell"><input type="number" id="input-styles-${t}Top" value="${s[t+'Top']||0}" oninput="syncBox('${t}','Top',this.value)"><span>Top</span></div><div class="box-cell"><input type="number" id="input-styles-${t}Right" value="${s[t+'Right']||0}" oninput="syncBox('${t}','Right',this.value)"><span>Right</span></div><div class="box-cell"><input type="number" id="input-styles-${t}Bottom" value="${s[t+'Bottom']||0}" oninput="syncBox('${t}','Bottom',this.value)"><span>Btm</span></div><div class="box-cell"><input type="number" id="input-styles-${t}Left" value="${s[t+'Left']||0}" oninput="syncBox('${t}','Left',this.value)"><span>Left</span></div></div></div>`; }
window.toggleLink = (t) => { const b = document.getElementById(`link-${t}`); const a = b.classList.toggle('active'); b.innerHTML = a ? '<span class="material-symbols-rounded">link</span>' : '<span class="material-symbols-rounded">link_off</span>'; };
window.syncBox = (t, s, v) => { if (document.getElementById(`link-${t}`).classList.contains('active')) { ['Top', 'Right', 'Bottom', 'Left'].forEach(side => { if (side !== s) document.getElementById(`input-styles-${t}${side}`).value = v }) } };
function renderIconSheet() { const g = document.getElementById('iconGrid'); g.innerHTML = ''; const no = document.createElement('div'); no.className = 'icon-option no-icon'; no.innerHTML = '<span>None</span>'; no.onclick = () => selectIcon(''); g.appendChild(no); materialIcons.forEach(i => { const d = document.createElement('div'); d.className = 'icon-option'; d.innerHTML = `<span class="${i.startsWith('ri-')?i:'material-symbols-rounded'}">${i.startsWith('ri-')?'':i}</span>`; d.onclick = () => selectIcon(i); g.appendChild(d); }); }
function createIconSelector(k, v) { const i = v ? `<span class="${v.startsWith('ri-')?v:'material-symbols-rounded'}" style="font-size:20px">${v.startsWith('ri-')?'':v}</span>` : '<span>None</span>'; return `<div class="prop-row"><div class="prop-label">Icon</div><div class="prop-control"><button type="button" class="btn-action-light" style="display:flex;align-items:center;gap:8px;width:100%;justify-content:center" onclick="openIconPicker('input-${k}')">${i} Change</button><input type="hidden" id="input-${k}" value="${v||''}"></div></div>`; }
function openIconPicker(id) { targetIconInputId = id; iconSheet.classList.add('active'); overlay.classList.add('active'); }
function selectIcon(v) { if (targetIconInputId) { document.getElementById(targetIconInputId).value = v; const btn = document.getElementById(targetIconInputId).previousElementSibling; btn.innerHTML = v ? `<span class="${v.startsWith('ri-')?v:'material-symbols-rounded'}" style="font-size:20px">${v.startsWith('ri-')?'':v}</span> Change` : '<span>None</span> Change'; } iconSheet.classList.remove('active'); }
function toggleMainMenu() { const menu = document.getElementById('mainMenuDropdown'); menu.classList.toggle('active'); }
document.addEventListener('click', function(event) { const menu = document.getElementById('mainMenuDropdown'); const btn = document.getElementById('menuBtn'); if (menu && btn) { if (menu.classList.contains('active') && !menu.contains(event.target) && !btn.contains(event.target)) { menu.classList.remove('active'); } } });
document.querySelectorAll('.menu-item').forEach(item => { item.addEventListener('click', () => { const menu = document.getElementById('mainMenuDropdown'); if (menu) menu.classList.remove('active'); }); });
function renderLayerSheet() { const list = document.getElementById('layerList'); list.innerHTML = ''; function buildTree(nodes, indent) { nodes.forEach(el => { const item = document.createElement('div'); item.className = `layer-item ${editingId === el.id ? 'active' : ''}`; let iconName = 'check_box_outline_blank'; if (el.type === 'container') iconName = 'crop_free'; else if (el.type === 'heading') iconName = 'title'; else if (el.type === 'paragraph') iconName = 'text_fields'; else if (el.type === 'button') iconName = 'smart_button'; else if (el.type === 'image') iconName = 'image'; else if (el.type === 'theme-toggle') iconName = 'contrast'; else if (el.type === 'spacer') iconName = 'space_bar'; else if (el.type === 'divider') iconName = 'horizontal_rule'; let indentDivs = ''; for (let i = 0; i < indent; i++) indentDivs += '<div class="layer-indent"></div>'; const text = el.content.text ? el.content.text : el.type.charAt(0).toUpperCase() + el.type.slice(1); item.innerHTML = `${indentDivs}<span class="material-symbols-rounded layer-icon">${iconName}</span> <span class="layer-text">${text}</span>`; item.onclick = () => { selectElement(el.id); renderLayerSheet(); }; list.appendChild(item); if (el.children && el.children.length > 0) buildTree(el.children, indent + 1); }); } if (pageData.length === 0) list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-gray)">Belum ada layer</div>'; else buildTree(pageData, 0); }
function moveLayer(action) { if (!editingId) return alert("Pilih elemen dulu!"); let parentArray = pageData, index = -1, parentNode = null; function findInArray(arr, parent) { for (let i = 0; i < arr.length; i++) { if (arr[i].id === editingId) { parentArray = arr; index = i; parentNode = parent; return true; } if (arr[i].children && findInArray(arr[i].children, arr[i])) return true; } return false; } findInArray(pageData, null); if (index === -1) return; const el = parentArray[index]; if (action === 'up') { if (index > 0) { [parentArray[index], parentArray[index - 1]] = [parentArray[index - 1], parentArray[index]]; } } else if (action === 'down') { if (index < parentArray.length - 1) { [parentArray[index], parentArray[index + 1]] = [parentArray[index + 1], parentArray[index]]; } } else if (action === 'in') { if (index > 0 && parentArray[index - 1].children) { parentArray.splice(index, 1); parentArray[index - 1].children.push(el); } else { alert("Tidak bisa masuk"); } } else if (action === 'out') { if (parentNode) { let grandParentArray = pageData, parentIndex = -1; function findParentArr(arr) { for (let i = 0; i < arr.length; i++) { if (arr[i].id === parentNode.id) { grandParentArray = arr; parentIndex = i; return true; } if (arr[i].children && findParentArr(arr[i].children)) return true; } return false; } if (pageData.includes(parentNode)) { grandParentArray = pageData; parentIndex = pageData.indexOf(parentNode); } else { findParentArr(pageData); } parentArray.splice(index, 1); grandParentArray.splice(parentIndex + 1, 0, el); } else { alert("Sudah di level teratas"); } } saveData(); renderCanvas(); renderLayerSheet(); setTimeout(() => highlightElement(editingId), 50); showToast("Posisi Diubah"); }
