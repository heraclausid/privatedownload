/* --- js/pagemanager.js (FULL WITH HISTORY TRIGGERS) --- */

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

    addToHistory(); // [HISTORY] Catat sebelum tambah halaman

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

function deletePage(pageId) {
    if (projectData.pages.length <= 1) {
        alert("Project harus memiliki minimal satu halaman!");
        return;
    }
    
    if (!confirm("Apakah Anda yakin ingin menghapus halaman ini secara permanen?")) return;

    addToHistory(); // [HISTORY] Catat sebelum hapus halaman

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
        
        const leftSide = document.createElement('div');
        leftSide.style.display = 'flex';
        leftSide.style.alignItems = 'center';
        leftSide.style.gap = '10px';
        leftSide.style.flex = '1';
        
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
        
        leftSide.onclick = () => switchPage(p.id);
        item.appendChild(leftSide);

        if (projectData.pages.length > 1) {
            const delBtn = document.createElement('button');
            delBtn.className = 'icon-btn';
            delBtn.style.width = '28px';
            delBtn.style.height = '28px';
            delBtn.title = "Hapus Halaman";
            delBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px; color:var(--danger)">delete</span>';
            delBtn.onclick = (e) => { e.stopPropagation(); deletePage(p.id); };
            item.appendChild(delBtn);
        }

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
