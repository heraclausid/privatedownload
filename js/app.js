let globalIroPicker = null;
let activeColorInputId = null;

window.addEventListener('DOMContentLoaded', () => {
    
    const bindClick = (id, handler) => {
        const el = document.getElementById(id);
        if (el) el.onclick = handler;
    };

    bindClick('addFab', () => openAddMenu(null));
    
    bindClick('globalBtn', () => {
        const sheet = document.getElementById('globalSheet');
        const overlay = document.getElementById('overlay');
        if(sheet && overlay) {
            if(typeof applyGlobalConfig === 'function') applyGlobalConfig(); 
            sheet.classList.add('active');
            overlay.classList.add('active');
        }
    });

    bindClick('saveGlobalBtn', () => {
        if(typeof globalConfig !== 'undefined') {
            globalConfig.fontFamily = document.getElementById('global-font').value;
            globalConfig.pageBg = document.getElementById('global-bg').value;
            
            globalConfig.pTop = parseInt(document.getElementById('global-pTop').value) || 0;
            globalConfig.pRight = parseInt(document.getElementById('global-pRight').value) || 0;
            globalConfig.pBottom = parseInt(document.getElementById('global-pBottom').value) || 0;
            globalConfig.pLeft = parseInt(document.getElementById('global-pLeft').value) || 0;

            globalConfig.mTop = parseInt(document.getElementById('global-mTop').value) || 0;
            globalConfig.mRight = parseInt(document.getElementById('global-mRight').value) || 0;
            globalConfig.mBottom = parseInt(document.getElementById('global-mBottom').value) || 0;
            globalConfig.mLeft = parseInt(document.getElementById('global-mLeft').value) || 0;
            
            applyGlobalConfig();
            closeAllSheets();
            saveData();
            showToast("Global Settings Disimpan");
        }
    });

    bindClick('resetBtn', () => {
        if (confirm('Yakin ingin menghapus semua elemen di halaman ini?')) {
            if(typeof addToHistory === 'function') addToHistory();
            
            if (Array.isArray(pageData)) {
                pageData.length = 0; 
            } else {
                const activePage = projectData.pages.find(p => p.id === projectData.activePageId);
                if (activePage) {
                    activePage.data = [];
                    pageData = activePage.data;
                }
            }

            saveData();
            renderCanvas();
            showToast("Canvas Direset");
        }
    });

    bindClick('layerBtn', () => {
        if(typeof renderLayerSheet === 'function') renderLayerSheet();
        const sheet = document.getElementById('layerSheet');
        const overlay = document.getElementById('overlay');
        if(sheet && overlay) {
            sheet.classList.add('active');
            overlay.classList.add('active');
        }
    });

    bindClick('importBtn', () => {
        if (pageData.length > 0) {
            if(!confirm("Import akan menimpa pekerjaan saat ini. Lanjutkan?")) return;
        }
        document.getElementById('importInput').click();
    });

    const importInput = document.getElementById('importInput');
    if(importInput) {
        importInput.onchange = (e) => handleFileSelect(e);
    }

    document.querySelectorAll('.grid-item').forEach(b => {
        b.onclick = () => addElement(b.dataset.type);
    });

    document.querySelectorAll('.pill-btn').forEach(b => {
        b.onclick = () => {
            document.querySelectorAll('.pill-btn').forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            b.classList.add('active');
            const target = document.getElementById('tab-' + b.dataset.tab);
            if(target) target.classList.add('active');
        }
    });

    const fabStack = document.querySelector('.fab-stack');
    if (fabStack) makeDraggable(fabStack);

    if (typeof renderIconSheet === 'function') {
        renderIconSheet();
    }

    if(typeof loadData === 'function') loadData();

    const colorCheckBtn = document.querySelector('#colorPickerSheet .close-sheet-btn');
    if(colorCheckBtn) {
        colorCheckBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if(globalIroPicker) {
                saveToPalette(globalIroPicker.color.hexString);
            }
            closeColorPicker();
        };
    }

    if (typeof iro !== 'undefined' && !globalIroPicker) {
        globalIroPicker = new iro.ColorPicker("#iro-picker-container", {
            width: 220,
            color: "#fff",
            borderWidth: 2,
            borderColor: "#fff",
            layout: [
                { component: iro.ui.Wheel, options: {} },
                { component: iro.ui.Slider, options: { sliderType: 'value', marginTop: 20 } }
            ]
        });

        globalIroPicker.on('color:change', function(color) {
            const hex = color.hexString.toUpperCase();

            const sheetPreview = document.getElementById('color-sheet-preview');
            const sheetHex = document.getElementById('color-sheet-hex');
            if(sheetPreview) sheetPreview.style.backgroundColor = hex;
            if(sheetHex) sheetHex.innerText = hex;

            if (activeColorInputId) {
                const input = document.getElementById(activeColorInputId);
                
                if (input) {
                    input.value = hex;
                    
                    if (input.oninput) input.oninput({ target: input });
                    
                    const trigger = document.getElementById('trigger-' + activeColorInputId);
                    if (trigger) trigger.style.backgroundColor = hex;
                    
                    const cleanId = activeColorInputId.replace('input-', '');
                    const pickerSwatch = document.getElementById('preview-' + cleanId);
                    if (pickerSwatch) pickerSwatch.style.backgroundColor = hex;
                }
            }
        });
    }
});

function makeDraggable(element) {
    let xOffset = 0, yOffset = 0, currentX = 0, currentY = 0, initialX = 0, initialY = 0;
    let startX = 0, startY = 0, isDragging = false, isMoving = false;

    const dragStart = (e) => {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
            startX = e.touches[0].clientX; startY = e.touches[0].clientY;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            startX = e.clientX; startY = e.clientY;
        }
        if (element.contains(e.target)) { isDragging = true; isMoving = false; }
    };

    const dragEnd = (e) => {
        initialX = currentX; initialY = currentY; isDragging = false;
        setTimeout(() => { isMoving = false; }, 50);
    };

    const drag = (e) => {
        if (!isDragging) return;
        let clientX, clientY;
        if (e.type === "touchmove") { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; } 
        else { clientX = e.clientX; clientY = e.clientY; }

        const diffX = clientX - startX;
        const diffY = clientY - startY;
        if (Math.sqrt(diffX*diffX + diffY*diffY) > 5) {
            isMoving = true; e.preventDefault();
            currentX = clientX - initialX; currentY = clientY - initialY;
            xOffset = currentX; yOffset = currentY;
            element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
    };

    element.addEventListener("click", (e) => { if (isMoving) { e.preventDefault(); e.stopPropagation(); } }, true);
    element.addEventListener("touchstart", dragStart, { passive: false });
    element.addEventListener("touchend", dragEnd, { passive: false });
    element.addEventListener("touchmove", drag, { passive: false });
    element.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);
}

window.openColorPicker = function(inputId) {
    activeColorInputId = inputId;
    const sheet = document.getElementById('colorPickerSheet');
    const overlay = document.getElementById('overlay');
    const input = document.getElementById(inputId);

    if (sheet && overlay && globalIroPicker) {
        let currentColor = input ? input.value : '#ffffff';
        if (!currentColor.startsWith('#')) currentColor = '#ffffff';
        
        globalIroPicker.color.set(currentColor);
        
        const sheetPreview = document.getElementById('color-sheet-preview');
        const sheetHex = document.getElementById('color-sheet-hex');
        if(sheetPreview) sheetPreview.style.backgroundColor = currentColor;
        if(sheetHex) sheetHex.innerText = currentColor.toUpperCase();

        sheet.classList.add('active');
        overlay.classList.add('active');
        sheet.style.zIndex = "3001"; 
    }
};

window.closeColorPicker = function() {
    const sheet = document.getElementById('colorPickerSheet');
    if (sheet) sheet.classList.remove('active');
    
    const editSheet = document.getElementById('editSheet');
    const globalSheet = document.getElementById('globalSheet');
    if ((!editSheet || !editSheet.classList.contains('active')) && 
        (!globalSheet || !globalSheet.classList.contains('active'))) {
        const overlay = document.getElementById('overlay');
        if(overlay) overlay.classList.remove('active');
    }
    activeColorInputId = null;
};

window.updateGlobalBg = function(val) {
    if (!val) return;
    if (!val.startsWith('#')) val = '#' + val;
    if (typeof globalConfig !== 'undefined') globalConfig.pageBg = val;
    const text = document.getElementById('global-bg');
    if (text && text.value.toUpperCase() !== val.toUpperCase()) text.value = val.toUpperCase();
    const trigger = document.getElementById('trigger-global-bg');
    if (trigger) trigger.style.backgroundColor = val;
    if (typeof applyGlobalConfig === 'function') applyGlobalConfig();
};

window.saveToPalette = function(val) {
    if (!val || val === 'transparent') return;
    if (!val.startsWith('#')) val = '#' + val;
    val = val.toUpperCase();
    if (typeof savedColors !== 'undefined' && !savedColors.includes(val)) {
        savedColors.push(val);
        if (savedColors.length > 12) savedColors.shift();
        if (typeof saveData === 'function') saveData();
        renderAllPalettes(); 
    }
};

window.renderAllPalettes = function() {
    const paletteHtml = savedColors.map(sc => 
        `<div class="color-swatch" style="background:${sc}" onclick="updateColorFromPalette('${sc}')" title="${sc}"></div>`
    ).join('');
    document.querySelectorAll('.palette-row').forEach(el => el.innerHTML = paletteHtml);
};

window.updateColorFromPalette = function(color) {
    const globalSheet = document.getElementById('globalSheet');
    if (globalSheet && globalSheet.classList.contains('active')) {
        updateGlobalBg(color);
        const bgInput = document.getElementById('global-bg');
        if(bgInput) bgInput.value = color;
    } else {
        const activeInput = document.querySelector('#editSheet .color-compact[style*="flex"] input[type="text"]');
        if(activeInput) {
            const key = activeInput.id.replace('input-', '');
            updateColor(key, color);
        }
    }
};
