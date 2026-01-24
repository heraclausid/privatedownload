/* --- js/app.js (FIXED: BUTTON CLICK LISTENER) --- */

window.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. INISIALISASI TOMBOL HEADER & MENU ---
    
    // Gunakan helper function agar kode lebih bersih & aman
    const bindClick = (id, handler) => {
        const el = document.getElementById(id);
        if (el) el.onclick = handler;
    };

    bindClick('addFab', () => openAddMenu(null));
    
    bindClick('globalBtn', () => {
        const sheet = document.getElementById('globalSheet');
        const overlay = document.getElementById('overlay');
        if(sheet && overlay) {
            sheet.classList.add('active');
            overlay.classList.add('active');
        }
    });

    bindClick('saveGlobalBtn', () => {
        if(typeof globalConfig !== 'undefined') {
            globalConfig.fontFamily = document.getElementById('global-font').value;
            globalConfig.pageBg = document.getElementById('global-bg').value;
            applyGlobalConfig();
            closeAllSheets();
            saveData();
            showToast("Global Settings Disimpan");
        }
    });

    bindClick('resetBtn', () => {
        if (confirm('Yakin ingin menghapus semua elemen?')) {
            if(typeof addToHistory === 'function') addToHistory();
            pageData = [];
            saveData();
            renderCanvas();
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

    // Event listener untuk input file import
    const importInput = document.getElementById('importInput');
    if(importInput) {
        importInput.onchange = (e) => handleFileSelect(e);
    }

    // Event listener untuk tombol di dalam menu Add Widget
    document.querySelectorAll('.grid-item').forEach(b => {
        b.onclick = () => addElement(b.dataset.type);
    });

    // Logic Tab (Pill Buttons)
    document.querySelectorAll('.pill-btn').forEach(b => {
        b.onclick = () => {
            document.querySelectorAll('.pill-btn').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            const target = document.getElementById('tab-' + b.dataset.tab);
            if(target) target.classList.add('active');
        }
    });

    // --- 2. FITUR DOWNLOAD CSS ---
    bindClick('downloadCssBtn', () => {
        const blob = new Blob([fullStyleCSS], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'style.css';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const menu = document.getElementById('mainMenuDropdown');
        if(menu) menu.classList.remove('active');
        showToast("style.css Berhasil Diunduh");
    });

    // --- 3. INIT DRAGGABLE FAB ---
    const fabStack = document.querySelector('.fab-stack');
    if (fabStack) makeDraggable(fabStack);

    // --- 4. LOAD DATA ---
    if(typeof loadData === 'function') loadData();
});


// --- LOGIKA DRAGGABLE DENGAN THRESHOLD (TOLERANSI) ---
function makeDraggable(element) {
    let xOffset = 0;
    let yOffset = 0;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    
    // Variabel untuk mendeteksi klik vs geser
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let isMoving = false; // Flag jika benar-benar bergerak

    // 1. Tangani Mouse/Touch Down
    const dragStart = (e) => {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
            startX = e.touches[0].clientX; // Simpan posisi awal murni
            startY = e.touches[0].clientY;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            startX = e.clientX;
            startY = e.clientY;
        }

        if (element.contains(e.target)) {
            isDragging = true;
            isMoving = false; // Reset status bergerak
        }
    };

    // 2. Tangani Mouse/Touch End
    const dragEnd = (e) => {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        
        // Reset status moving sedikit terlambat agar event click sempat dicek
        setTimeout(() => { isMoving = false; }, 50);
    };

    // 3. Tangani Gerakan (Move)
    const drag = (e) => {
        if (!isDragging) return;

        let clientX, clientY;
        if (e.type === "touchmove") {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // [PENTING] Hitung jarak geser (Pythagoras)
        // Jika geser < 5px, anggap sebagai getaran tangan/klik biasa
        const diffX = clientX - startX;
        const diffY = clientY - startY;
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);

        if (distance > 5) {
            isMoving = true; // Konfirmasi bahwa ini adalah drag
            e.preventDefault(); // Matikan scroll layar hanya jika fix drag

            currentX = clientX - initialX;
            currentY = clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, element);
        }
    };

    const setTranslate = (xPos, yPos, el) => {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    };

    // 4. Mencegah Klik jika sedang Dragging
    // Menggunakan capture phase (true) untuk mencegat event click sebelum sampai ke tombol
    element.addEventListener("click", (e) => {
        if (isMoving) {
            e.preventDefault();
            e.stopPropagation(); // Stop! Jangan klik tombol jika sedang digeser
        }
    }, true);

    element.addEventListener("touchstart", dragStart, { passive: false });
    element.addEventListener("touchend", dragEnd, { passive: false });
    element.addEventListener("touchmove", drag, { passive: false });

    element.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);
}

// --- CSS CONTENT (UPDATED) ---
const fullStyleCSS = `:root {
    --primary: #6366f1;
    --primary-light: #e0e7ff;
    --text-dark: #1e293b;
    --text-gray: #64748b;
    --bg-app: #f8fafc;
    --surface: #ffffff;
    --border: #e2e8f0;
    --input-bg: #f1f5f9;
    --danger: #ef4444;
    --danger-light: #fee2e2;
    --font-main: 'Outfit', sans-serif;
    --radius-m: 12px;
    --radius-s: 8px;
    --shadow-soft: 0 4px 20px rgba(0,0,0,0.05);
    --shadow-hover: 0 10px 25px rgba(0,0,0,0.1);
}

[data-theme="dark"] {
    --primary: #818cf8;
    --primary-light: #1e293b;
    --text-dark: #f8fafc;
    --text-gray: #94a3b8;
    --bg-app: #0f172a;
    --surface: #1e293b;
    --border: #334155;
    --input-bg: #020617;
    --danger-light: #450a0a;
    --shadow-soft: 0 4px 20px rgba(0,0,0,0.4);
    --shadow-hover: 0 10px 25px rgba(0,0,0,0.6);
}

html { scroll-behavior: smooth; }
* { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font-main); -webkit-tap-highlight-color: transparent; }
body { background: var(--bg-app); color: var(--text-dark); height: 100vh; display: flex; flex-direction: column; overflow: hidden; transition: background 0.3s ease, color 0.3s ease; }

.top-bar { height: 56px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; background: var(--surface); border-bottom: 1px solid var(--border); position: relative; z-index: 1000; }
.logo-area { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 16px; }
.logo-circle { width: 28px; height: 28px; background: var(--primary-light); color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.header-actions { display: flex; gap: 6px; align-items: center; }

.icon-btn { width: 32px; height: 32px; border: none; background: transparent; border-radius: 6px; color: var(--text-gray); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.icon-btn:hover { background: var(--bg-app); color: var(--primary); transform: scale(1.1); }
.icon-btn:active { transform: scale(0.9); }
.divider-v { width: 1px; height: 16px; background: var(--border); margin: 0 4px; }

.canvas { flex: 1; overflow-y: auto; padding: 24px; padding-bottom: 100px; display: flex; flex-direction: column; gap: 8px; transition: padding 0.3s; scroll-behavior: smooth; }
.empty-state { height: 60%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-gray); text-align: center; }
.illustration { font-size: 48px; color: var(--primary); margin-bottom: 12px; opacity: 0.5; }

.fab-stack {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    z-index: 95; 
    transition: transform 0.1s; 
    cursor: grab;
    touch-action: none;
    user-select: none;
    background: var(--surface); 
    padding: 8px; 
    border-radius: 50px; 
    border: 1px solid var(--border); 
    box-shadow: var(--shadow-hover);
}

.fab-stack:active {
    cursor: grabbing;
    transition: none;
    transform: scale(1.02);
    box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.fab { 
    width: 48px; height: 48px; 
    border-radius: 50%; 
    background: var(--text-dark); 
    color: var(--bg-app); 
    border: none; 
    box-shadow: none; 
    display: flex; align-items: center; justify-content: center; 
    font-size: 24px; cursor: pointer; 
    transition: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
}
.fab:hover { transform: rotate(90deg) scale(1.1); background: var(--primary); color: white; }
.fab:active { transform: scale(0.9); }

.mini-fab {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: var(--bg-app); 
    color: var(--text-dark);
    border: 1px solid var(--border);
    box-shadow: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.mini-fab:hover { background: var(--primary-light); color: var(--primary); border-color: var(--primary); transform: scale(1.1); }
.mini-fab:active { transform: scale(0.9); }
.mini-fab span { font-size: 18px; }

body.preview-mode .top-bar,
body.preview-mode .fab-stack,
body.preview-mode .element-toolbar, 
body.preview-mode .inner-add-btn, 
body.preview-mode .empty-label { display: none !important; }

body.preview-mode .el-container { border: none !important; }
body.preview-mode .el-spacer { background: transparent !important; border: none !important; }
body.preview-mode .is-editing > .el-container, body.preview-mode .is-editing > .builder-element { outline: none !important; box-shadow: none !important; }
body.preview-mode .element-wrapper { pointer-events: none; }
body.preview-mode .element-wrapper > * { pointer-events: auto; }

.exit-preview-btn { 
    position: fixed; bottom: -60px; left: 50%; transform: translateX(-50%); 
    background: var(--text-dark); color: var(--bg-app); padding: 10px 20px; 
    border-radius: 30px; border: 1px solid var(--border); 
    display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; 
    box-shadow: var(--shadow-soft); z-index: 9999; opacity: 0; pointer-events: none; 
    transition: 0.3s; cursor: pointer; 
}
body.preview-mode .exit-preview-btn { bottom: 24px; opacity: 1; pointer-events: auto; }
body.preview-mode .canvas { padding-top: 0; padding-bottom: 0; }
.exit-preview-btn:hover { transform: translateX(-50%) scale(1.05); }
.exit-preview-btn:active { transform: translateX(-50%) scale(0.95); }

a.builder-element, button.el-theme-toggle { transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important; cursor: pointer; display: inline-flex; }
a.builder-element:hover, button.el-theme-toggle:hover { 
    transform: scale(1.02); 
    filter: brightness(1.05); 
    box-shadow: var(--shadow-hover); 
    z-index: 10; 
}
a.builder-element:active, button.el-theme-toggle:active { transform: scale(0.95); filter: brightness(0.95); }

@keyframes spin-once {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.theme-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px; 
    height: 24px;
}

.theme-icon.animating {
    animation: spin-once 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-theme-toggle { overflow: hidden; }

.el-link-wrapper { text-decoration: none; color: inherit; display: block; transition: 0.2s; }

.element-wrapper { position: relative; min-width: 0; transition: 0.2s; }
.element-toolbar { position: absolute; top: 4px; right: 4px; background: var(--primary); border-radius: 6px; display: flex; gap: 2px; padding: 2px; opacity: 0; pointer-events: none; transition: 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); transform: scale(0.8); box-shadow: 0 4px 10px rgba(0,0,0,0.15); z-index: 50; }
.is-editing > .element-toolbar { opacity: 1; pointer-events: auto; transform: scale(1); }

.tool-btn { width: 24px; height: 24px; border: none; background: rgba(255,255,255,0.15); border-radius: 4px; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
.tool-btn:hover { background: white; color: var(--primary); transform: scale(1.1); }
.tool-btn:active { transform: scale(0.9); }
.tool-btn.del:hover { background: #ef4444; color: white; }
.tool-btn span { font-size: 14px; display: block; transition: transform 0.2s; }
.tool-btn:hover span { transform: scale(1.2); }
.tool-btn.del:hover span { animation: shakeIcon 0.4s ease-in-out; color: #fee2e2; }

@keyframes shakeIcon {
    0% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.2) rotate(-15deg); }
    50% { transform: scale(1.2) rotate(15deg); }
    75% { transform: scale(1.2) rotate(-5deg); }
    100% { transform: scale(1.2) rotate(0deg); }
}

.is-editing > .el-container, .is-editing > .builder-element { outline: 2px solid var(--primary); outline-offset: -1px; border-radius: var(--radius-s); }
.el-container { display: flex; flex-wrap: wrap; min-height: auto; padding: 10px; border: 1px dashed var(--border); border-radius: var(--radius-m); position: relative; transition: 0.2s; align-content: flex-start; }
.el-container.has-bg { border: 1px solid transparent; }
.empty-label { width: 100%; text-align: center; font-size: 10px; color: var(--text-gray); text-transform: uppercase; font-weight: 700; padding: 20px 0; pointer-events: none; opacity: 0.6; }

.inner-add-btn { width: 100%; min-height: 50px; border: 1px dashed var(--border); border-radius: var(--radius-m); background: var(--bg-app); color: var(--text-gray); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; margin: 0; }
.inner-add-btn:hover { background: var(--surface); color: var(--primary); border-color: var(--primary); transform: scale(1.02); }
.inner-add-btn:active { transform: scale(0.98); }

.builder-element { border: 1px solid transparent; position: relative; border-radius: var(--radius-s); }
.el-spacer { width: 100%; min-height: 10px; background: transparent; position: relative; }
.is-editing .el-spacer, .element-wrapper:hover .el-spacer { background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(100,100,100,0.05) 10px, rgba(100,100,100,0.05) 20px); border: 1px dashed var(--border); }
.el-divider { width: 100%; display: flex; align-items: center; justify-content: center; }
.el-theme-toggle { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 16px; border-radius: 50px; cursor: pointer; user-select: none; background: var(--surface); color: var(--text-dark); border: 1px solid var(--border); }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100; opacity: 0; pointer-events: none; transition: 0.2s; }
.overlay.active { opacity: 1; pointer-events: auto; }

.bottom-sheet { position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-radius: 20px 20px 0 0; padding: 0; z-index: 200; transform: translateY(110%); transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); max-height: 85vh; display: flex; flex-direction: column; border-top: 1px solid var(--border); box-shadow: 0 -10px 40px rgba(0,0,0,0.1); }
.bottom-sheet.active { transform: translateY(0); }
.sheet-header { padding: 16px; text-align: center; border-bottom: 1px solid var(--border); position: relative; }
.sheet-handle { width: 36px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 8px; }
.sheet-title { font-size: 14px; font-weight: 600; color: var(--text-dark); }
.sheet-body { flex: 1; overflow-y: auto; padding: 20px; }

.close-sheet-btn { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; background: transparent; color: var(--text-gray); border: 1px solid var(--border); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; z-index: 10; }
.close-sheet-btn:hover { background: var(--danger-light); color: var(--danger); border-color: var(--danger); }
.close-sheet-btn:active { transform: translateY(-50%) scale(0.9); }
.close-sheet-btn span { font-size: 18px; font-weight: 700; }

.grid-menu { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 0; }
.grid-item { background: var(--bg-app); border: 1px solid var(--border); padding: 16px; border-radius: var(--radius-m); display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; color: var(--text-dark); transition: all 0.2s; height: 100%; }
.grid-item:hover { background: var(--surface); border-color: var(--primary); box-shadow: var(--shadow-soft); }
.grid-item:active { transform: scale(0.95); }
.grid-item .icon-box { color: var(--primary); width: 36px; height: 36px; background: var(--primary-light); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s, color 0.2s; }
.grid-item:hover .icon-box { transform: scale(1.15) rotate(-8deg); background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
.grid-item .icon-box span { font-size: 22px; }
.grid-item span { font-size: 11px; font-weight: 600; text-align: center; line-height: 1.2; width: 100%; }

.pill-tabs { display: flex; padding: 12px 16px 0; gap: 16px; border-bottom: 1px solid var(--border); }
.pill-btn { padding-bottom: 12px; border: none; background: transparent; font-weight: 600; font-size: 13px; color: var(--text-gray); cursor: pointer; position: relative; transition: 0.2s; }
.pill-btn:hover { color: var(--primary); }
.pill-btn.active { color: var(--primary); }
.pill-btn.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--primary); border-radius: 2px 2px 0 0; }
.tab-pane { display: none; } .tab-pane.active { display: block; }

.prop-section { margin-bottom: 24px; padding-top: 4px; } 
.prop-section:not(:first-child) { border-top: 1px dashed var(--border); padding-top: 20px; }
.prop-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.prop-title { font-size: 11px; font-weight: 700; color: var(--text-gray); text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
.prop-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.prop-label { font-size: 13px; color: var(--text-dark); font-weight: 500; flex: 1; min-width: 100px; }
.prop-control { flex: 1.5; display: flex; justify-content: flex-end; min-width: 140px; }

.input-wrapper { position: relative; width: 100%; display: flex; align-items: center; }
.input-field { width: 100%; padding: 8px 10px; padding-right: 50px; border: 1px solid var(--border); background: var(--input-bg); border-radius: 6px; font-size: 12px; outline: none; color: var(--text-dark); transition: 0.2s; text-align: right; }
.input-field:focus { border-color: var(--primary); background: var(--surface); }
.input-suffix { position: absolute; right: 10px; font-size: 10px; color: var(--text-gray); pointer-events: none; font-weight: 600; }
.prop-info { width: 100%; font-size: 11px; color: var(--text-gray); margin-top: -6px; margin-bottom: 12px; line-height: 1.4; padding-left: 2px; }

.toggle-group { display: flex; background: var(--input-bg); border-radius: 6px; padding: 2px; border: 1px solid var(--border); width: 100%; }
.toggle-btn { flex: 1; border: none; background: transparent; padding: 6px; border-radius: 4px; color: var(--text-gray); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.1s; }
.toggle-btn:active { transform: scale(0.95); }
.toggle-btn.active { background: var(--surface); color: var(--primary); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.toggle-btn span { font-size: 16px; }

.slider-wrapper { width: 100%; display: flex; align-items: center; gap: 8px; }
.slider-range { flex: 1; height: 4px; background: var(--border); border-radius: 2px; outline: none; -webkit-appearance: none; }
.slider-range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: var(--primary); border-radius: 50%; cursor: pointer; }

.color-compact { display: flex; align-items: center; gap: 8px; width: 100%; }
.color-preview { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); overflow: hidden; position: relative; cursor: pointer; flex-shrink: 0; }
.color-preview input { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; cursor: pointer; padding: 0; border: none; }
.color-empty-state span { font-size: 10px; color: var(--text-gray); margin-right: 8px; }
.btn-add-color { padding: 4px 8px; font-size: 10px; border-radius: 4px; border: 1px solid var(--primary); color: var(--primary); background: transparent; cursor: pointer; }
.icon-action { width: 32px; height: 32px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; background: var(--bg-app); cursor: pointer; color: var(--text-gray); flex-shrink: 0; transition: 0.2s; }
.icon-action:active { transform: scale(0.9); }
.link-btn { width: 24px; height: 24px; border: none; background: transparent; border-radius: 4px; color: var(--text-gray); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.link-btn.active { background: var(--primary-light); color: var(--primary); }

.box-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: var(--input-bg); padding: 8px; border-radius: 8px; border: 1px solid var(--border); }
.box-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.box-cell input { text-align: center; padding: 6px 2px; font-size: 12px; background: var(--surface); width: 100%; border: 1px solid var(--border); border-radius: 4px; color: var(--text-dark); padding-right: 2px; }
.box-cell span { font-size: 9px; font-weight: 700; color: var(--text-gray); text-transform: uppercase; }

.btn-save { width: 100%; padding: 14px; background: var(--text-dark); color: var(--bg-app); border: none; border-radius: 0; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-save:hover { opacity: 0.9; }
.btn-save:active { transform: scale(0.98); }
.btn-action-light { width: 100%; padding: 8px; background: var(--bg-app); color: var(--primary); border: 1px solid var(--primary); border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; transition: 0.2s; }
.btn-action-light:active { transform: scale(0.95); }

.state-switcher { display: flex; background: var(--input-bg); padding: 4px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--border); }
.state-btn { flex: 1; border: none; background: transparent; padding: 8px; font-size: 11px; font-weight: 600; color: var(--text-gray); border-radius: 6px; cursor: pointer; transition: 0.2s; }
.state-btn.active { background: var(--surface); color: var(--primary); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

.menu-wrapper { position: relative; display: inline-flex; align-items: center; }
.main-menu-dropdown { display: none; position: absolute; top: calc(100% + 12px); right: 0; width: 240px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-m); box-shadow: 0 10px 40px rgba(0,0,0,0.1); padding: 8px; flex-direction: column; gap: 4px; z-index: 1100; }
.main-menu-dropdown.active { display: flex; animation: fadeInMenu 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeInMenu { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
.menu-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px; border: none; background: transparent; color: var(--text-dark); font-family: var(--font-main); font-size: 13px; font-weight: 500; cursor: pointer; border-radius: var(--radius-s); text-align: left; white-space: nowrap; transition: all 0.2s; }
.menu-item:hover { background: var(--input-bg); color: var(--primary); }
.menu-item:active { transform: scale(0.98); }
.menu-item span { font-size: 20px; color: var(--text-gray); transition: 0.2s; }
.menu-item:hover span { color: var(--primary); }
.menu-divider { height: 1px; background: var(--border); margin: 6px 0; width: 100%; }
.primary-text { color: var(--primary); font-weight: 600; }
.primary-text:hover { background: var(--primary-light); }
[data-theme="dark"] .main-menu-dropdown { background: var(--surface); border-color: var(--border); box-shadow: 0 10px 40px rgba(0,0,0,0.5); }

.layer-controls { display: flex; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border); align-items: center; justify-content: center; background: var(--bg-app); }
.layer-ctrl-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-dark); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.layer-ctrl-btn:hover { background: var(--primary-light); color: var(--primary); border-color: var(--primary); }
.layer-ctrl-btn:active { transform: scale(0.9); }
.layer-list { display: flex; flex-direction: column; padding: 16px; gap: 8px; overflow-y: auto; max-height: 60vh; }
.layer-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: 0.2s; }
.layer-item:hover { background: var(--surface); border-color: var(--primary); }
.layer-item.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
.layer-icon { font-size: 18px; color: var(--text-gray); }
.layer-text { font-size: 12px; font-weight: 500; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.layer-indent { width: 16px; height: 1px; display: inline-block; }

.icon-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; padding-bottom: 20px; }
.icon-option { background: var(--bg-app); border: 1px solid var(--border); aspect-ratio: 1; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-gray); font-size: 24px; transition: 0.2s; }
.icon-option:hover { background: var(--primary-light); color: var(--primary); border-color: var(--primary); }
.icon-option.no-icon span { font-size: 12px; font-weight: 600; text-transform: uppercase; }

#undoBtn:hover span { transform: rotate(-45deg) scale(1.1); }
#redoBtn:hover span { transform: rotate(45deg) scale(1.1); }
.icon-btn span { transition: transform 0.2s; }
.icon-btn:hover span { transform: scale(1.15); }
#resetBtn:hover span { transform: scale(1.15) rotate(15deg); color: var(--danger); }`;
