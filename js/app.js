/* --- js/app.js (FULL & UPDATED) --- */

document.querySelectorAll('.pill-btn').forEach(b => {
    b.onclick = () => {
        document.querySelectorAll('.pill-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById('tab-' + b.dataset.tab).classList.add('active');
    }
});

const addFab = document.getElementById('addFab');
if(addFab) addFab.onclick = () => openAddMenu(null);

const globalBtn = document.getElementById('globalBtn');
if(globalBtn) {
    globalBtn.onclick = () => {
        globalSheet.classList.add('active');
        overlay.classList.add('active');
    };
}

const saveGlobalBtn = document.getElementById('saveGlobalBtn');
if(saveGlobalBtn) {
    saveGlobalBtn.onclick = () => {
        globalConfig.fontFamily = document.getElementById('global-font').value;
        globalConfig.pageBg = document.getElementById('global-bg').value;
        applyGlobalConfig();
        closeAllSheets();
        saveData();
        showToast("Global Settings Disimpan");
    };
}

const resetBtn = document.getElementById('resetBtn');
if(resetBtn) {
    resetBtn.onclick = () => {
        if (confirm('Yakin ingin menghapus semua elemen?')) {
            if(typeof addToHistory === 'function') addToHistory();
            pageData = [];
            saveData();
            renderCanvas();
        }
    };
}

const layerBtn = document.getElementById('layerBtn');
if(layerBtn) {
    layerBtn.onclick = () => {
        renderLayerSheet();
        layerSheet.classList.add('active');
        overlay.classList.add('active');
    };
}

document.querySelectorAll('.grid-item').forEach(b => {
    b.onclick = () => addElement(b.dataset.type);
});

const importBtn = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');

if(importBtn && importInput) {
    importBtn.onclick = () => {
        if (pageData.length > 0) {
            if(!confirm("Import akan menimpa pekerjaan saat ini. Lanjutkan?")) return;
        }
        importInput.click();
    };
    importInput.onchange = (e) => {
        handleFileSelect(e);
    };
}

// Initial Load & Draggable Init
window.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Init Draggable FAB Stack
    const fabStack = document.querySelector('.fab-stack');
    if (fabStack) makeDraggable(fabStack);
});

// --- DRAGGABLE LOGIC ---
function makeDraggable(element) {
    let xOffset = 0;
    let yOffset = 0;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let isDragging = false;

    // Event Listeners (Support Touch & Mouse)
    element.addEventListener("touchstart", dragStart, { passive: false });
    element.addEventListener("touchend", dragEnd, { passive: false });
    element.addEventListener("touchmove", drag, { passive: false });

    element.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (element.contains(e.target)) {
            isDragging = true;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, element);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
}
