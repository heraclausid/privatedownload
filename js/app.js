/* --- js/app.js (COMPLETE & FIXED) --- */

window.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. HELPER FUNCTION ---
    const bindClick = (id, handler) => {
        const el = document.getElementById(id);
        if (el) el.onclick = handler;
    };

    // --- 2. HEADER & MENU ACTIONS ---

    // Tombol Floating Action Button (Add)
    bindClick('addFab', () => openAddMenu(null));
    
    // Tombol Global Settings (Buka Menu)
    bindClick('globalBtn', () => {
        const sheet = document.getElementById('globalSheet');
        const overlay = document.getElementById('overlay');
        if(sheet && overlay) {
            // Populate nilai saat ini ke input field sebelum menampilkan sheet
            if(typeof applyGlobalConfig === 'function') applyGlobalConfig(); 
            sheet.classList.add('active');
            overlay.classList.add('active');
        }
    });

    // Tombol Simpan Global Settings
    bindClick('saveGlobalBtn', () => {
        if(typeof globalConfig !== 'undefined') {
            globalConfig.fontFamily = document.getElementById('global-font').value;
            globalConfig.pageBg = document.getElementById('global-bg').value;
            
            // [NEW] Capture 4-Side Padding & Margin
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
            saveData(); // Simpan ke LocalStorage
            showToast("Global Settings Disimpan");
        }
    });

    // [FIXED] Tombol Reset (Hapus Semua)
    bindClick('resetBtn', () => {
        if (confirm('Yakin ingin menghapus semua elemen di halaman ini?')) {
            if(typeof addToHistory === 'function') addToHistory();
            
            // PERBAIKAN UTAMA: 
            // Jangan gunakan 'pageData = []' karena itu memutus referensi variable.
            // Gunakan '.length = 0' untuk mengosongkan array yang sama.
            if (Array.isArray(pageData)) {
                pageData.length = 0; 
            } else {
                // Fallback protection jika struktur corrupt
                const activePage = projectData.pages.find(p => p.id === projectData.activePageId);
                if (activePage) {
                    activePage.data = [];
                    pageData = activePage.data;
                }
            }

            saveData(); // Simpan perubahan array kosong ke LocalStorage
            renderCanvas();
            showToast("Canvas Direset");
        }
    });

    // Tombol Layer
    bindClick('layerBtn', () => {
        if(typeof renderLayerSheet === 'function') renderLayerSheet();
        const sheet = document.getElementById('layerSheet');
        const overlay = document.getElementById('overlay');
        if(sheet && overlay) {
            sheet.classList.add('active');
            overlay.classList.add('active');
        }
    });

    // Tombol Import Project
    bindClick('importBtn', () => {
        if (pageData.length > 0) {
            if(!confirm("Import akan menimpa pekerjaan saat ini. Lanjutkan?")) return;
        }
        document.getElementById('importInput').click();
    });

    // Event Listener Input File Import
    const importInput = document.getElementById('importInput');
    if(importInput) {
        importInput.onchange = (e) => handleFileSelect(e);
    }

    // --- 3. WIDGET MENU ACTIONS ---
    document.querySelectorAll('.grid-item').forEach(b => {
        b.onclick = () => addElement(b.dataset.type);
    });

    // --- 4. TAB LOGIC (Content / Style) ---
    document.querySelectorAll('.pill-btn').forEach(b => {
        b.onclick = () => {
            // Reset active state
            document.querySelectorAll('.pill-btn').forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            // Set new active state
            b.classList.add('active');
            const target = document.getElementById('tab-' + b.dataset.tab);
            if(target) target.classList.add('active');
        }
    });

    // --- 5. INITIALIZATION ---
    
    // Init Draggable FAB
    const fabStack = document.querySelector('.fab-stack');
    if (fabStack) makeDraggable(fabStack);

    // Init Icon Grid
    if (typeof renderIconSheet === 'function') {
        renderIconSheet();
    }

    // Load Data Terakhir
    if(typeof loadData === 'function') loadData();
});


// --- LOGIKA DRAGGABLE (FAB) ---
function makeDraggable(element) {
    let xOffset = 0;
    let yOffset = 0;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    
    // Variabel state
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let isMoving = false; // Flag untuk membedakan klik vs geser

    // 1. Start Drag
    const dragStart = (e) => {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
            startX = e.touches[0].clientX; 
            startY = e.touches[0].clientY;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            startX = e.clientX;
            startY = e.clientY;
        }

        if (element.contains(e.target)) {
            isDragging = true;
            isMoving = false; // Reset status
        }
    };

    // 2. End Drag
    const dragEnd = (e) => {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        
        // Delay reset isMoving agar event click sempat diproses jika bukan drag
        setTimeout(() => { isMoving = false; }, 50);
    };

    // 3. Moving
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

        // Hitung jarak geser (Pythagoras)
        const diffX = clientX - startX;
        const diffY = clientY - startY;
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);

        // Hanya anggap drag jika geser lebih dari 5px (mengurangi accidental drag saat klik)
        if (distance > 5) {
            isMoving = true; 
            e.preventDefault(); // Mencegah scroll layar saat drag tombol

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
    // Gunakan capture phase (true)
    element.addEventListener("click", (e) => {
        if (isMoving) {
            e.preventDefault();
            e.stopPropagation(); // Stop! Jangan eksekusi klik tombol
        }
    }, true);

    // Event Listeners
    element.addEventListener("touchstart", dragStart, { passive: false });
    element.addEventListener("touchend", dragEnd, { passive: false });
    element.addEventListener("touchmove", drag, { passive: false });

    element.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);
}
