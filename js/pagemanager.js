/* --- js/pagemanager.js (COMPLETE WITH EDIT & DUPLICATE) --- */

function getActivePage() {
    return projectData.pages.find(p => p.id === projectData.activePageId);
}

function switchPage(pageId) {
    const target = projectData.pages.find(p => p.id === pageId);
    if (!target) return;

    if (editingId) {
        const el = document.getElementById(editingId);
        if (el) el.classList.remove('is-editing');
    }

    projectData.activePageId = pageId;
    pageData = target.data; 

    activeContainerId = null;
    editingId = null;
    currentEditState = 'normal';
    
    closeAllSheets();
    renderCanvas();
    
    const btn = document.getElementById('pageManagerBtn');
    if(btn) {
        btn.innerHTML = `<span class="material-symbols-rounded">layers</span>`;
    }
    
    showToast(`Halaman Aktif: ${target.name}`);
}

function addNewPagePrompt() {
    const name = prompt("Nama Halaman Baru (Contoh: About Us, Kontak):");
    if (!name) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    if (projectData.pages.some(p => p.slug === slug)) {
        alert("Halaman dengan nama file (slug) serupa sudah ada! Silakan gunakan nama lain.");
        return;
    }

    if(typeof addToHistory === 'function') addToHistory();

    const newId = 'pg_' + Math.random().toString(36).substr(2, 6);
    const newPage = {
        id: newId,
        name: name,
        slug: slug,
        data: [] 
    };

    projectData.pages.push(newPage);
    
    saveData();
    switchPage(newId);
    renderPageList(); 
}

// [NEW] FUNGSI RENAME HALAMAN
function renamePage(pageId) {
    const target = projectData.pages.find(p => p.id === pageId);
    if (!target) return;

    const newName = prompt("Masukkan nama baru untuk halaman:", target.name);
    if (!newName || newName === target.name) return;

    // Generate slug baru
    const newSlug = newName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    // Cek duplikasi slug (kecuali punya sendiri)
    if (projectData.pages.some(p => p.slug === newSlug && p.id !== pageId)) {
        alert("Nama halaman ini sudah digunakan (slug konflik). Coba nama lain.");
        return;
    }

    if(typeof addToHistory === 'function') addToHistory();

    target.name = newName;
    
    // Jangan ubah slug jika halaman utama (index) agar tidak error saat load
    if (target.slug !== 'index') {
        target.slug = newSlug;
    }

    saveData();
    renderPageList();
    showToast(`Halaman diubah menjadi: ${newName}`);
}

// [NEW] FUNGSI DUPLIKAT HALAMAN
function duplicatePage(pageId) {
    const original = projectData.pages.find(p => p.id === pageId);
    if (!original) return;

    if(typeof addToHistory === 'function') addToHistory();

    // 1. Deep Copy Data Halaman
    const dataCopy = JSON.parse(JSON.stringify(original.data));

    // 2. Regenerate ID untuk semua elemen di dalam data copy
    // Ini PENTING agar elemen di halaman baru tidak memiliki ID yang sama dengan halaman lama
    function regenerateIdsRecursive(nodes) {
        nodes.forEach(node => {
            node.id = generateId(); // Fungsi generateId dari config.js
            if (node.children && node.children.length > 0) {
                regenerateIdsRecursive(node.children);
            }
        });
    }
    regenerateIdsRecursive(dataCopy);

    // 3. Setup Halaman Baru
    const newName = `${original.name} Copy`;
    let newSlug = `${original.slug}-copy`;
    
    // Pastikan slug unik jika di-copy berkali-kali
    let counter = 1;
    while (projectData.pages.some(p => p.slug === newSlug)) {
        newSlug = `${original.slug}-copy-${counter}`;
        counter++;
    }

    const newId = 'pg_' + Math.random().toString(36).substr(2, 6);
    const newPage = {
        id: newId,
        name: newName,
        slug: newSlug,
        data: dataCopy
    };

    projectData.pages.push(newPage);
    saveData();
    renderPageList();
    showToast("Halaman Berhasil Diduplikat");
}

function deletePage(pageId) {
    if (projectData.pages.length <= 1) {
        alert("Project harus memiliki minimal satu halaman!");
        return;
    }
    
    const target = projectData.pages.find(p => p.id === pageId);
    if (!confirm(`Hapus halaman "${target.name}" secara permanen?`)) return;

    if(typeof addToHistory === 'function') addToHistory();

    const idx = projectData.pages.findIndex(p => p.id === pageId);
    if (idx > -1) {
        projectData.pages.splice(idx, 1);
        
        if (pageId === projectData.activePageId) {
            switchPage(projectData.pages[0].id);
        } else {
            saveData();
        }
        renderPageList(); 
        showToast("Halaman Dihapus");
    }
}

// [UPDATED] RENDER LIST DENGAN TOMBOL EDIT & DUPLICATE
function renderPageList() {
    const list = document.getElementById('pageList');
    if (!list) return;
    list.innerHTML = '';

    projectData.pages.forEach(p => {
        const isActive = p.id === projectData.activePageId;
        const item = document.createElement('div');
        item.className = `layer-item ${isActive ? 'active' : ''}`;
        item.style.justifyContent = 'space-between';
        item.style.cursor = 'pointer';
        
        // Bagian Kiri (Icon + Text)
        const leftSide = document.createElement('div');
        leftSide.style.display = 'flex';
        leftSide.style.alignItems = 'center';
        leftSide.style.gap = '10px';
        leftSide.style.flex = '1';
        leftSide.onclick = () => switchPage(p.id); // Klik area teks untuk pindah
        
        const iconName = p.slug === 'index' ? 'home' : 'web';
        const pageName = p.name;
        const fileName = `${p.slug}.html`;

        leftSide.innerHTML = `
            <span class="material-symbols-rounded layer-icon">${iconName}</span>
            <div style="display:flex; flex-direction:column">
                <span class="layer-text" style="font-size:13px; font-weight:600">${pageName}</span>
                <span style="font-size:10px; color:var(--text-gray)">/${fileName}</span>
            </div>
        `;
        
        item.appendChild(leftSide);

        // Bagian Kanan (Actions)
        const actionsDiv = document.createElement('div');
        actionsDiv.style.display = 'flex';
        actionsDiv.style.gap = '4px';

        // 1. Tombol Rename
        const editBtn = document.createElement('button');
        editBtn.className = 'icon-btn';
        editBtn.style.width = '28px'; editBtn.style.height = '28px';
        editBtn.title = "Ubah Nama";
        editBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px;">edit</span>';
        editBtn.onclick = (e) => { e.stopPropagation(); renamePage(p.id); };
        actionsDiv.appendChild(editBtn);

        // 2. Tombol Duplicate
        const dupBtn = document.createElement('button');
        dupBtn.className = 'icon-btn';
        dupBtn.style.width = '28px'; dupBtn.style.height = '28px';
        dupBtn.title = "Duplikat Halaman";
        dupBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px;">content_copy</span>';
        dupBtn.onclick = (e) => { e.stopPropagation(); duplicatePage(p.id); };
        actionsDiv.appendChild(dupBtn);

        // 3. Tombol Delete (Hanya jika > 1 halaman)
        if (projectData.pages.length > 1) {
            const delBtn = document.createElement('button');
            delBtn.className = 'icon-btn';
            delBtn.style.width = '28px'; delBtn.style.height = '28px';
            delBtn.title = "Hapus Halaman";
            delBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px; color:var(--danger)">delete</span>';
            delBtn.onclick = (e) => { e.stopPropagation(); deletePage(p.id); };
            actionsDiv.appendChild(delBtn);
        }

        item.appendChild(actionsDiv);
        list.appendChild(item);
    });
}

function openPageSheet() {
    renderPageList();
    const sheet = document.getElementById('pageSheet');
    const overlay = document.getElementById('overlay');
    if(sheet) sheet.classList.add('active');
    if(overlay) overlay.classList.add('active');
}
