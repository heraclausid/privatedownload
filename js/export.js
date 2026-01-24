document.getElementById('exportBtn').onclick = () => {
    const editorStyles = document.getElementById('generated-css').innerHTML;
    const clone = document.getElementById('editorCanvas').cloneNode(true);
    
    clone.querySelectorAll('.element-toolbar').forEach(el => el.remove());
    clone.querySelectorAll('.empty-label').forEach(el => el.remove());
    clone.querySelectorAll('.is-editing').forEach(el => el.classList.remove('is-editing'));
    clone.querySelectorAll('.empty-state').forEach(el => el.remove());
    
    clone.querySelectorAll('.el-container').forEach(el => {
        el.style.borderStyle = 'solid'; 
        if (!el.style.borderWidth || el.style.borderWidth === '0px') {
            el.style.border = 'none';
        }
    });
    clone.querySelectorAll('.el-spacer').forEach(el => {
        el.style.background = 'transparent'; 
        el.style.border = 'none';
    });
    
    clone.querySelectorAll('.el-theme-toggle').forEach(btn => {
        btn.setAttribute('onclick', 'handleThemeClick(this)');
    });

    const bodyContent = clone.innerHTML;
    const savedData = JSON.stringify({ page: pageData, config: globalConfig, colors: savedColors });
    const isDarkNow = globalConfig.darkMode;
    const htmlTag = isDarkNow ? '<html lang="id" data-theme="dark">' : '<html lang="id">';

    const htmlContent = `<!DOCTYPE html>
${htmlTag}
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Export</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet"/>
    <link rel="stylesheet" href="style.css">
    
    <style>
        ${editorStyles}
        body { 
            font-family: ${globalConfig.fontFamily} !important; 
            background-color: ${globalConfig.pageBg};
            transition: background-color 0.3s ease, color 0.3s ease;
            min-height: 100vh;
        }
        [data-theme="dark"] body { 
            background-color: #0f172a !important; 
            color: #f8fafc !important;
        }
        @keyframes spin-once { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .theme-icon { display: inline-flex; align-items: center; justify-content: center; }
        .theme-icon.animating { animation: spin-once 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .el-theme-toggle { border:none; background:transparent; cursor:pointer; }
        .el-container:not(.has-bg):not(.card) { border: none !important; }
        a { text-decoration: none; color: inherit; }
    </style>
</head>
<body class="canvas">
    <div class="container" style="padding-top:0px;">
        ${bodyContent}
    </div>
    <script id="soft-builder-data" type="application/json">${savedData}<\/script>
    <script>
        const html = document.documentElement;
        const projectData = JSON.parse(document.getElementById('soft-builder-data').textContent);
        const config = projectData.config || {};
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark') {
            enableDark(true);
        } else if (!savedTheme && config.darkMode) {
            enableDark(true);
        }

        function handleThemeClick(btn) {
            const iconSpan = btn.querySelector('.theme-icon');
            if(iconSpan) iconSpan.classList.add('animating');
            setTimeout(() => {
                toggleTheme();
                if(iconSpan) iconSpan.classList.remove('animating');
            }, 500);
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
            });
        }
    <\/script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    const date = new Date().toISOString().slice(0,10);
    a.download = `project-${date}.html`;
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a); 
    URL.revokeObjectURL(url);
    
    showToast("HTML Berhasil Diexport");
};
