/* --- KONFIGURASI SYSTEM --- */
const STORAGE_KEY = "heraclaus_site_draft"; 

/* 1. LIBRARY ICON LENGKAP (70+ Pilihan) */
const ICON_LIBRARY = [
    // --- UI & NAVIGASI ---
    "fas fa-download", "fas fa-upload", "fas fa-external-link-alt", "fas fa-link", 
    "fas fa-eye", "fas fa-eye-slash", "fas fa-search", "fas fa-home", 
    "fas fa-bars", "fas fa-times", "fas fa-check", "fas fa-check-circle", 
    "fas fa-info-circle", "fas fa-question-circle", "fas fa-exclamation-triangle",
    "fas fa-arrow-right", "fas fa-arrow-left", "fas fa-arrow-down", "fas fa-arrow-up",
    "fas fa-chevron-right", "fas fa-chevron-down", "fas fa-share-alt", "fas fa-cog",

    // --- GAMING & MINECRAFT VIBES ---
    "fas fa-gamepad", "fas fa-ghost", "fas fa-puzzle-piece", "fas fa-cube", 
    "fas fa-cubes", "fas fa-layer-group", "fas fa-shapes", "fas fa-vector-square",
    "fas fa-dragon", "fas fa-dungeon", "fas fa-shield-alt", "fas fa-hammer", 
    "fas fa-scroll", "fas fa-map", "fas fa-hat-wizard", "fas fa-fist-raised",
    "fas fa-bomb", "fas fa-skull-crossbones", "fas fa-crown", "fas fa-trophy",
    
    // --- CODING, SERVER & TEKNIS ---
    "fas fa-code", "fas fa-code-branch", "fas fa-terminal", "fas fa-robot", 
    "fas fa-bug", "fas fa-laptop-code", "fas fa-microchip", "fas fa-server", 
    "fas fa-network-wired", "fas fa-database", "fas fa-file-code", "fas fa-wifi",
    "fas fa-signal", "fas fa-battery-full", "fas fa-memory",
    
    // --- SOCIAL MEDIA & BRAND ---
    "fab fa-discord", "fab fa-youtube", "fab fa-github", "fab fa-twitter", 
    "fab fa-instagram", "fab fa-tiktok", "fab fa-whatsapp", "fab fa-telegram",
    "fab fa-android", "fab fa-apple", "fab fa-windows", "fas fa-globe",
    
    // --- LAINNYA ---
    "fas fa-fire", "fas fa-bolt", "fas fa-gem", "fas fa-star", "fas fa-heart",
    "fas fa-user", "fas fa-users", "fas fa-user-shield", "fas fa-clock", 
    "fas fa-calendar-alt", "fas fa-envelope", "fas fa-comment", "fas fa-bell",
    "fas fa-lock", "fas fa-unlock", "fas fa-key", "fas fa-trash"
];

// 2. DAFTAR WARNA
const COLOR_PALETTE = [
    { color: "#6d5dfc", name: "Ungu Utama" },
    { color: "#2ed573", name: "Hijau Sukses" },
    { color: "#ffa502", name: "Kuning Peringatan" },
    { color: "#ff4757", name: "Merah Bahaya" },
    { color: "#3742fa", name: "Biru Terang" },
    { color: "#1e90ff", name: "Biru Langit" },
    { color: "#00d2d3", name: "Cyan" },
    { color: "#ff6b81", name: "Pink Pastel" },
    { color: "#5352ed", name: "Indigo" },
    { color: "#a4b0be", name: "Abu Terang" },
    { color: "#ffffff", name: "Putih" },
    { color: "#000000", name: "Hitam" }
];

document.addEventListener("DOMContentLoaded", function() {
    checkDraft();
    initAdminPanel();
});

/* --- CEK DRAFT --- */
function checkDraft() {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
        if (confirm("⚠️ Ada editan tersimpan! Lanjutkan editan terakhir?")) {
            document.body.innerHTML = savedContent;
            const oldPanel = document.getElementById("admin-panel");
            if (oldPanel) oldPanel.remove();
            initAdminPanel(); 
        } else {
            if(confirm("Hapus draft dan mulai bersih?")) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }
}

/* --- UI PANEL ADMIN --- */
function initAdminPanel() {
    if (document.getElementById("admin-panel")) return;

    const adminPanel = document.createElement("div");
    adminPanel.id = "admin-panel";
    
    Object.assign(adminPanel.style, {
        position: "fixed", top: "20%", right: "20px", width: "auto",
        display: "flex", flexDirection: "column", gap: "12px",
        padding: "15px 12px", background: "rgba(20, 20, 20, 0.85)",
        backdropFilter: "blur(12px)", borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: "9990",
        cursor: "move", userSelect: "none", touchAction: "none"
    });

    adminPanel.innerHTML = `
        <div style="display: flex; justify-content: center; margin-bottom: 5px; opacity: 0.5;">
            <i class="fas fa-grip-lines" style="color: white; font-size: 1.2rem;"></i>
        </div>
        <button id="btn-edit" onclick="toggleEditMode()" title="Mode Edit" style="${btnStyle('#6d5dfc')}"><i class="fas fa-pen"></i></button>
        <button onclick="addNewCard()" title="Tambah Kartu" style="${btnStyle('#3c40c6')}"><i class="fas fa-plus"></i></button>
        <div style="height: 1px; background: rgba(255,255,255,0.2); margin: 5px 0;"></div>
        <button onclick="saveDraft()" title="Simpan Draft" style="${btnStyle('#ffa502', '#1e1e1e')}"><i class="fas fa-cloud-upload-alt"></i></button>
        <button onclick="downloadHTML()" title="Download HTML" style="${btnStyle('#2ed573')}"><i class="fas fa-save"></i></button>
    `;

    document.body.appendChild(adminPanel);
    makeDraggable(adminPanel);
}

function btnStyle(bg, color = 'white') {
    return `background: ${bg}; color: ${color}; border: none; width: 45px; height: 45px; border-radius: 50%; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: transform 0.2s;`;
}

/* --- DRAG LOGIC --- */
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown; element.ontouchstart = dragTouchStart;

    function dragMouseDown(e) { if(e.target.closest('button')) return; e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY; document.onmouseup = closeDragElement; document.onmousemove = elementDrag; }
    function elementDrag(e) { e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY; element.style.top = (element.offsetTop - pos2) + "px"; element.style.left = (element.offsetLeft - pos1) + "px"; element.style.right = 'auto'; }
    function closeDragElement() { document.onmouseup = null; document.onmousemove = null; }
    function dragTouchStart(e) { if(e.target.closest('button')) return; const touch = e.touches[0]; pos3 = touch.clientX; pos4 = touch.clientY; document.ontouchend = closeDragElementTouch; document.ontouchmove = elementDragTouch; }
    function elementDragTouch(e) { const touch = e.touches[0]; pos1 = pos3 - touch.clientX; pos2 = pos4 - touch.clientY; pos3 = touch.clientX; pos4 = touch.clientY; element.style.top = (element.offsetTop - pos2) + "px"; element.style.left = (element.offsetLeft - pos1) + "px"; element.style.right = 'auto'; }
    function closeDragElementTouch() { document.ontouchend = null; document.ontouchmove = null; }
}

let isEditing = false;

/* --- EDIT MODE --- */
function toggleEditMode() {
    isEditing = !isEditing;
    const btn = document.getElementById("btn-edit");
    if (isEditing) { btn.style.background = "#ff4757"; btn.style.transform = "scale(1.1)"; } 
    else { btn.style.background = "#6d5dfc"; btn.style.transform = "scale(1)"; }
    refreshEditableElements();
}

function refreshEditableElements() {
    const editables = document.querySelectorAll("h1, h2, h3, p, span, li, a, .badge, .tag, .v-num, small");
    editables.forEach(el => {
        if (el.closest("#admin-panel") || el.closest(".admin-modal")) return;

        if (isEditing) {
            el.contentEditable = "true";
            el.style.outline = "1px dashed rgba(109, 93, 252, 0.4)";
            
            if (el.tagName === 'A') {
                el.onclick = (e) => {
                    if(e.target.tagName === 'I') return;
                    e.preventDefault(); e.stopPropagation();
                    let newLink = prompt("Edit Link (href):", el.getAttribute("href"));
                    if (newLink !== null) el.setAttribute("href", newLink);
                };
            }
            if (el.matches(".badge, .v-num, .tag, .card-meta span")) {
                el.style.cursor = "pointer";
                el.onmousedown = (e) => {
                    if(e.target !== el) return;
                    e.preventDefault(); e.stopPropagation();
                    openColorPicker(el);
                };
            }
        } else {
            el.contentEditable = "false";
            el.style.outline = "none";
            el.onclick = null; el.onmousedown = null;
        }
    });

    const images = document.querySelectorAll("img");
    images.forEach(img => {
        if (isEditing) {
            img.style.cursor = "pointer";
            img.style.outline = "2px dashed #ff4757";
            img.onclick = (e) => { e.preventDefault(); let newSrc = prompt("URL Gambar Baru:", img.src); if (newSrc) img.src = newSrc; };
        } else { img.style.cursor = "default"; img.style.outline = "none"; img.onclick = null; }
    });

    const icons = document.querySelectorAll("i");
    icons.forEach(icon => {
        if (icon.closest("#admin-panel") || icon.closest(".admin-modal")) return;
        if (isEditing) {
            icon.style.cursor = "pointer"; icon.style.outline = "2px dashed #f1c40f"; icon.style.borderRadius = "4px";
            icon.onclick = (e) => { e.preventDefault(); e.stopPropagation(); openIconPicker(icon); };
        } else { icon.style.cursor = "default"; icon.style.outline = "none"; icon.onclick = null; }
    });
}

/* --- POPUP ICON --- */
function openIconPicker(targetIcon) {
    createModal("Pilih Icon (" + ICON_LIBRARY.length + ")", (content, modal) => {
        const grid = document.createElement("div");
        Object.assign(grid.style, { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginTop: "15px" });
        ICON_LIBRARY.forEach(iconClass => {
            const btn = document.createElement("div");
            Object.assign(btn.style, {
                backgroundColor: "#2d2d2d", color: "white", borderRadius: "10px", height: "45px",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.2rem"
            });
            btn.innerHTML = `<i class="${iconClass}"></i>`;
            btn.onclick = () => { targetIcon.className = iconClass; modal.remove(); };
            grid.appendChild(btn);
        });
        content.appendChild(grid);
    });
}

/* --- POPUP WARNA --- */
function openColorPicker(targetElement) {
    createModal("Pilih Warna", (content, modal) => {
        const grid = document.createElement("div");
        Object.assign(grid.style, { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "15px" });
        COLOR_PALETTE.forEach(item => {
            const btn = document.createElement("div");
            Object.assign(btn.style, {
                backgroundColor: item.color, borderRadius: "50%", height: "50px", width: "50px",
                cursor: "pointer", border: "2px solid rgba(255,255,255,0.2)", margin: "0 auto"
            });
            btn.title = item.name;
            btn.onclick = () => {
                if (targetElement.classList.contains('badge') || targetElement.classList.contains('tag')) {
                    targetElement.style.backgroundColor = item.color; targetElement.style.color = "#ffffff";
                } else {
                    targetElement.style.color = item.color; targetElement.style.backgroundColor = "transparent";
                }
                modal.remove();
            };
            grid.appendChild(btn);
        });
        content.appendChild(grid);
    });
}

/* --- MODAL HELPER --- */
function createModal(titleText, contentBuilder) {
    const oldModal = document.querySelector(".admin-modal"); if (oldModal) oldModal.remove();
    const modal = document.createElement("div");
    modal.className = "admin-modal";
    Object.assign(modal.style, {
        position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.8)", zIndex: "10000",
        display: "flex", justifyContent: "center", alignItems: "center", padding: "20px"
    });
    const content = document.createElement("div");
    Object.assign(content.style, {
        backgroundColor: "#1e1e1e", borderRadius: "20px", padding: "20px",
        maxWidth: "400px", width: "100%", maxHeight: "80vh", overflowY: "auto",
        border: "1px solid #444", boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
    });
    content.innerHTML = `<h3 style="color:white; margin-top:0; text-align:center; border-bottom:1px solid #444; padding-bottom:10px;">${titleText}</h3>`;
    contentBuilder(content, modal);
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "Batal";
    Object.assign(closeBtn.style, { width: "100%", padding: "12px", marginTop: "20px", background: "#ff4757", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" });
    closeBtn.onclick = () => modal.remove();
    content.appendChild(closeBtn);
    modal.appendChild(content);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
}

/* --- COMMON ACTIONS --- */
function addNewCard() {
    let grid = document.querySelector('.addon-grid') || document.querySelector('.card')?.parentElement;
    if (!grid) { alert("Grid tidak ditemukan."); return; }
    const templateCard = grid.querySelector('.card');
    if (!templateCard) { alert("Template tidak ditemukan."); return; }
    const newCard = templateCard.cloneNode(true);
    const title = newCard.querySelector('h2, h3'); if (title) title.innerText = "Project Baru";
    const desc = newCard.querySelector('p'); if (desc) desc.innerText = "Deskripsi...";
    const img = newCard.querySelector('img'); if (img) img.src = "https://via.placeholder.com/400x250?text=New";
    newCard.querySelectorAll('a').forEach(a => a.href = "#");
    grid.appendChild(newCard);
    if (!isEditing) toggleEditMode();
    refreshEditableElements();
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function saveDraft() {
    const wasEditing = isEditing; if (isEditing) toggleEditMode();
    document.querySelectorAll(".admin-modal, #admin-panel").forEach(e => e.remove());
    localStorage.setItem(STORAGE_KEY, document.body.innerHTML);
    initAdminPanel(); if (wasEditing) toggleEditMode();
    alert("Draft Tersimpan!");
}
function downloadHTML() {
    const wasEditing = isEditing; if (isEditing) toggleEditMode();
    document.querySelectorAll(".admin-modal, #admin-panel").forEach(e => e.remove());
    const htmlContent = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = location.pathname.split("/").pop() || "index.html";
    a.click();
    initAdminPanel(); if (wasEditing) toggleEditMode();
    if(confirm("Hapus draft agar sesi berikutnya bersih?")) localStorage.removeItem(STORAGE_KEY);
}
