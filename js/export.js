/* --- js/export.js (COMPLETE WITH FULL ANIMATION LIBRARY) --- */

document.getElementById('exportBtn').onclick = async () => {
    // Cek library JSZip
    if (typeof JSZip === 'undefined') {
        alert("Library JSZip belum dimuat. Pastikan koneksi internet lancar.");
        return;
    }

    showToast("Memproses Export...");
    const zip = new JSZip();

    // --- 1. PROJECT DATA ---
    const projectJson = JSON.stringify(projectData, null, 2);
    zip.file("project.json", projectJson);


    // --- 2. CSS GLOBAL ---
    const generatedCss = document.getElementById('generated-css').innerHTML;
    
    // [UPDATED] CSS ANIMASI LENGKAP UNTUK EXPORT
    const animationCss = `
/* --- ANIMATION KEYFRAMES --- */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
@keyframes zoomOut { from { opacity: 0; transform: scale(1.2); } to { opacity: 1; transform: scale(1); } }
@keyframes bounceIn { 
    0% { opacity: 0; transform: scale(0.3); } 
    50% { opacity: 1; transform: scale(1.05); } 
    70% { transform: scale(0.9); } 
    100% { transform: scale(1); } 
}
@keyframes flipInX { from { opacity: 0; transform: perspective(400px) rotateX(90deg); } to { opacity: 1; transform: perspective(400px) rotateX(0deg); } }
@keyframes flipInY { from { opacity: 0; transform: perspective(400px) rotateY(90deg); } to { opacity: 1; transform: perspective(400px) rotateY(0deg); } }

/* Initial States */
.anim-fade-in { opacity: 0; }
.anim-slide-up { opacity: 0; transform: translateY(40px); }
.anim-slide-down { opacity: 0; transform: translateY(-40px); }
.anim-slide-left { opacity: 0; transform: translateX(-40px); }
.anim-slide-right { opacity: 0; transform: translateX(40px); }
.anim-zoom-in { opacity: 0; transform: scale(0.8); }
.anim-zoom-out { opacity: 0; transform: scale(1.2); }
.anim-bounce-in { opacity: 0; transform: scale(0.3); }
.anim-flip-x { opacity: 0; transform: perspective(400px) rotateX(90deg); }
.anim-flip-y { opacity: 0; transform: perspective(400px) rotateY(90deg); }

/* Active State (Triggered by JS Observer) */
.has-animation.is-visible {
    opacity: 1; 
    transform: translate(0) scale(1) rotate(0);
    animation-fill-mode: forwards;
    animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Mapping Classes to Keyframes */
.anim-fade-in.is-visible { animation-name: fadeIn; }
.anim-slide-up.is-visible { animation-name: slideUp; }
.anim-slide-down.is-visible { animation-name: slideDown; }
.anim-slide-left.is-visible { animation-name: slideLeft; }
.anim-slide-right.is-visible { animation-name: slideRight; }
.anim-zoom-in.is-visible { animation-name: zoomIn; }
.anim-zoom-out.is-visible { animation-name: zoomOut; }
.anim-bounce-in.is-visible { animation-name: bounceIn; animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); }
.anim-flip-x.is-visible { animation-name: flipInX; }
.anim-flip-y.is-visible { animation-name: flipInY; }

/* Interactive UI Effects */
.btn, .el-btn, .icon-btn { transition: transform 0.1s; cursor: pointer; }
.btn:active, .el-btn:active, .icon-btn:active { transform: scale(0.92); }

.el-container.card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.el-container.card:hover { transform: translateY(-4px); box-shadow: 0 12px 25px rgba(0,0,0,0.1) !important; }

.theme-icon { transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55); display: inline-block; }
.theme-icon.animating { transform: rotate(180deg) scale(0.5); opacity: 0; }

a.el-link-wrapper { transition: opacity 0.2s; }
a.el-link-wrapper:hover { opacity: 0.7; }
`;

    // CSS Dasar
    let baseCss = `:root {
    --primary: #6366f1; --primary-light: #e0e7ff; --text-dark: #1e293b; --text-gray: #64748b;
    --bg-app: #f8fafc; --surface: #ffffff; --border: #e2e8f0; --input-bg: #f1f5f9;
    --danger: #ef4444; --danger-light: #fee2e2; --font-main: 'Outfit', sans-serif;
    --radius-m: 12px; --radius-s: 8px; --shadow-soft: 0 4px 20px rgba(0,0,0,0.05);
    --shadow-hover: 0 10px 25px rgba(0,0,0,0.1);
}
[data-theme="dark"] {
    --primary: #818cf8; --primary-light: #1e293b; --text-dark: #f8fafc; --text-gray: #94a3b8;
    --bg-app: #0f172a; --surface: #1e293b; --border: #334155; --input-bg: #020617;
    --danger-light: #450a0a; --shadow-soft: 0 4px 20px rgba(0,0,0,0.4);
    --shadow-hover: 0 10px 25px rgba(0,0,0,0.6);
}
html { scroll-behavior: smooth; }
* { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font-main); -webkit-tap-highlight-color: transparent; outline: none; }
body { background: var(--bg-app); color: var(--text-dark); min-height: 100vh; overflow-x: hidden; transition: background 0.3s, color 0.3s; }
a { text-decoration: none; color: inherit; }
.el-container { display: flex; flex-wrap: wrap; position: relative; transition: 0.2s; }
.el-container.card { background: var(--surface); box-shadow: var(--shadow-soft); border-radius: var(--radius-m); }
.el-theme-toggle { cursor: pointer; border: none; background: transparent; }
.btn { cursor: pointer; }
.el-link-wrapper { text-decoration: none; color: inherit; display: block; }
.el-spacer { width: 100%; min-height: 10px; }
.el-divider { width: 100%; display: flex; align-items: center; justify-content: center; }
img { max-width: 100%; display: block; transition: 0.3s; }
`;

    try {
        const response = await fetch('style.css');
        if (response.ok) {
            let fetchedCss = await response.text();
            fetchedCss = fetchedCss
                .replace(/\.is-editing.*?\}/g, '')
                .replace(/\.element-toolbar.*?\}/g, '')
                .replace(/\.tool-btn.*?\}/g, '')
                .replace(/\.empty-label.*?\}/g, '')
                .replace(/\.empty-state.*?\}/g, '')
                .replace(/\.grid-item.*?\}/g, '')
                .replace(/\.fab-stack.*?\}/g, '')
                .replace(/\.bottom-sheet.*?\}/g, '');
            baseCss += "\n" + fetchedCss;
        }
    } catch (e) { console.warn("Offline Mode"); }

    const finalCssContent = `/* --- BASE STYLES --- */\n${baseCss}\n\n${animationCss}\n\n/* --- GENERATED STYLES --- */\n${generatedCss}`;
    zip.file("style.css", finalCssContent);


    // --- 3. HTML GENERATION ---
    
    const cleanDom = (root) => {
        root.querySelectorAll('.element-toolbar').forEach(el => el.remove());
        root.querySelectorAll('.empty-label').forEach(el => el.remove());
        root.querySelectorAll('.empty-state').forEach(el => el.remove());
        root.querySelectorAll('.is-editing').forEach(el => el.classList.remove('is-editing'));
        
        root.querySelectorAll('.el-container').forEach(el => {
            if (!el.style.borderWidth || el.style.borderWidth === '0px') el.style.border = 'none';
        });
        root.querySelectorAll('.el-spacer').forEach(el => {
            el.style.background = 'transparent'; el.style.border = 'none';
        });
        
        root.querySelectorAll('.el-theme-toggle').forEach(btn => {
            btn.removeAttribute('onclick');
            btn.setAttribute('onclick', 'toggleTheme()');
        });
        
        // Catatan: Class .has-animation dan inline style sudah otomatis dirender oleh renderer.js
        // Jadi kita tidak perlu inject manual di sini.
    };

    const isDarkNow = globalConfig.darkMode;
    const htmlTag = isDarkNow ? '<html lang="id" data-theme="dark">' : '<html lang="id">';
    
    const pT = globalConfig.pTop !== undefined ? globalConfig.pTop : 24;
    const pR = globalConfig.pRight !== undefined ? globalConfig.pRight : 24;
    const pB = globalConfig.pBottom !== undefined ? globalConfig.pBottom : 24;
    const pL = globalConfig.pLeft !== undefined ? globalConfig.pLeft : 24;
    const mT = globalConfig.mTop || 0;
    const mR = globalConfig.mRight || 0;
    const mB = globalConfig.mBottom || 0;
    const mL = globalConfig.mLeft || 0;

    const generateHtml = (pageName, bodyContent) => {
        return `<!DOCTYPE html>
${htmlTag}
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageName}</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet"/>
    <link rel="stylesheet" href="style.css">
    
    <style>
        body, html { margin: 0; padding: 0; width: 100%; min-height: 100%; overflow-x: hidden; }
        .canvas { padding: 0 !important; height: auto !important; overflow: visible !important; display: block !important; }
        .element-wrapper { width: 100%; }
        body { padding: ${pT}px ${pR}px ${pB}px ${pL}px; margin: ${mT}px ${mR}px ${mB}px ${mL}px; box-sizing: border-box; }
    </style>
</head>
<body>
    ${bodyContent}

    <script>
        // 1. THEME TOGGLE LOGIC
        function toggleTheme() {
            const html = document.documentElement;
            const isDark = html.getAttribute('data-theme') === 'dark';
            const icons = document.querySelectorAll('.theme-icon');
            
            icons.forEach(icon => icon.classList.add('animating'));
            
            setTimeout(() => {
                if (isDark) {
                    html.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                    updateIcons(false);
                } else {
                    html.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                    updateIcons(true);
                }
                icons.forEach(icon => icon.classList.remove('animating'));
            }, 300); 
        }
        
        function updateIcons(isDark) {
            document.querySelectorAll('.theme-icon').forEach(i => {
                i.innerText = isDark ? 'light_mode' : 'dark_mode';
            });
        }

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && ${globalConfig.darkMode})) {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateIcons(true);
        }

        // 2. [UPDATED] SCROLL REVEAL OBSERVER
        document.addEventListener("DOMContentLoaded", function() {
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); 
                    }
                });
            }, observerOptions);

            const targets = document.querySelectorAll('.has-animation');
            targets.forEach(target => observer.observe(target));
        });
    <\/script>
</body>
</html>`;
    };

    projectData.pages.forEach(page => {
        const tempContainer = document.createElement('div');
        if (typeof renderRecursive === 'function') renderRecursive(page.data, tempContainer);
        cleanDom(tempContainer);
        const fullHtml = generateHtml(page.name, tempContainer.innerHTML);
        const fileName = (page.slug === 'index') ? 'index.html' : `${page.slug}.html`;
        zip.file(fileName, fullHtml);
    });

    zip.generateAsync({ type: "blob" }).then(function(content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0,10);
        a.download = `project-multipage-${date}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast("ZIP Export Selesai");
    });
};
