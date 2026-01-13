/* --- js/export.js (LENGKAP) --- */

document.getElementById('exportBtn').onclick = () => {
    // 1. Ambil CSS Global
    const editorStyles = document.getElementById('generated-css').innerHTML;
    
    // 2. Clone Canvas untuk dibersihkan
    const clone = document.getElementById('editorCanvas').cloneNode(true);
    
    // 3. Bersihkan elemen editor (toolbar, empty state, highlight)
    clone.querySelectorAll('.element-toolbar').forEach(el => el.remove());
    clone.querySelectorAll('.empty-label').forEach(el => el.remove());
    clone.querySelectorAll('.is-editing').forEach(el => el.classList.remove('is-editing'));
    
    // 4. Pastikan Theme Toggle bekerja di file export
    clone.querySelectorAll('.el-theme-toggle').forEach(btn => {
        btn.setAttribute('onclick', 'toggleTheme()');
    });

    const bodyContent = clone.innerHTML;
    
    // 5. Simpan data JSON di dalam file agar bisa di-Import kembali
    const savedData = JSON.stringify({ page: pageData, config: globalConfig, colors: savedColors });

    // 6. Template HTML Export
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Export</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Courier+Prime&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&family=Poppins:wght@400;600&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet"/>
    
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; transition: background 0.3s, color 0.3s; }
        .element-wrapper { position: relative; width: 100%; }
        
        /* Inject Generated CSS */
        ${editorStyles}
        
        body { 
            font-family: ${globalConfig.fontFamily} !important; 
            background-color: ${globalConfig.pageBg};
        }
        
        /* Dark Mode Styles */
        [data-theme="dark"] body { background-color: #121212; color: #ffffff; }
        
        .el-theme-toggle { border:none; background:transparent; cursor:pointer; }
        .el-container { border-style: solid; }
        /* Hilangkan border dashed container saat export */
        .el-container:not(.has-bg):not(.card) { border: none !important; }
        
        a { text-decoration: none; color: inherit; }
    </style>
</head>
<body>
    
    <div class="container" style="min-height:100vh;">
        ${bodyContent}
    </div>

    <script id="soft-builder-data" type="application/json">${savedData}<\/script>

    <script>
        const body = document.body;
        const html = document.documentElement;
        
        // Cek LocalStorage Theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            enableDark(true);
        }

        function toggleTheme() {
            const isDark = html.getAttribute('data-theme') === 'dark';
            if (isDark) {
                disableDark();
            } else {
                enableDark();
            }
        }

        function enableDark(skipAnim = false) {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateIcons(true, skipAnim);
        }

        function disableDark() {
            html.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            updateIcons(false);
        }
        
        function updateIcons(isDark, skipAnim = false) {
            document.querySelectorAll('.theme-icon').forEach(i => {
                i.innerText = isDark ? 'light_mode' : 'dark_mode';
                if(!skipAnim) {
                    i.style.transition = 'transform 0.5s';
                    i.style.transform = 'rotate(360deg)';
                    setTimeout(() => i.style.transform = 'rotate(0deg)', 500);
                }
            });
        }
    <\/script>
</body>
</html>`;

    // 7. Download Logic
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = 'soft-builder-project.html';
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a); 
    URL.revokeObjectURL(url);
};
