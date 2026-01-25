/* --- js/config.js (FIXED: SLIDER INPUT WIDTH & PADDING) --- */

// 1. Variabel Global Utama
let projectData = {
    pages: [
        { id: 'home', name: 'Home', slug: 'index', data: [] }
    ],
    activePageId: 'home',
    config: {
        fontFamily: "'Outfit', sans-serif",
        pageBg: "#f1f5f9",
        darkMode: false,
        pTop: 24, pRight: 24, pBottom: 24, pLeft: 24,
        mTop: 0, mRight: 0, mBottom: 0, mLeft: 0
    }
};

let pageData = projectData.pages[0].data; 
let globalConfig = projectData.config;

let savedColors = ["#6366f1", "#ffffff", "#1e293b", "#f1f5f9", "#ef4444"];
let activeContainerId = null;
let editingId = null;
let currentEditState = 'normal'; 
let targetIconInputId = null;

// 2. Fungsi Generate ID
const generateId = () => 'el_' + Math.random().toString(36).substr(2, 6);

// 3. Library Font
const fontLibrary = [
    { name: "Default (Outfit)", value: "'Outfit', sans-serif" },
    { name: "Poppins (Geometris)", value: "'Poppins', sans-serif" },
    { name: "Roboto (Neutral)", value: "'Roboto', sans-serif" },
    { name: "Open Sans (Readable)", value: "'Open Sans', sans-serif" },
    { name: "Lato (Friendly)", value: "'Lato', sans-serif" },
    { name: "Montserrat (Urban)", value: "'Montserrat', sans-serif" },
    { name: "Playfair Display (Elegant)", value: "'Playfair Display', serif" },
    { name: "Merriweather (Classic)", value: "'Merriweather', serif" },
    { name: "Courier Prime (Code)", value: "'Courier Prime', monospace" }
];

// 4. Library Icons
const materialIcons = [
    "home", "search", "settings", "menu", "close", "add", "check", "favorite", "star", "person", "delete", "edit", "share", "download", "upload", "image", "movie", "music_note", "mail", "call", "location_on", "info", "help", "warning", 
    "shopping_cart", "shopping_bag", "sell", "payments", "local_offer", "storefront", "credit_card", "receipt", "inventory_2", "local_shipping", "redeem", "savings", "diamond",
    "code", "terminal", "bug_report", "extension", "build", "api", "webhook", "integration_instructions", "dns", "database", "verified", "shield", "lock", "key", "fingerprint",
    "ri-youtube-fill", "ri-youtube-line", "ri-discord-fill", "ri-discord-line", "ri-instagram-fill", "ri-instagram-line", "ri-tiktok-fill", "ri-tiktok-line", "ri-whatsapp-fill", "ri-whatsapp-line", "ri-telegram-fill", "ri-telegram-line", "ri-facebook-circle-fill", "ri-facebook-circle-line", "ri-twitter-x-fill", "ri-twitter-x-line", "ri-github-fill", "ri-github-line", "ri-linkedin-fill", "ri-linkedin-line", "ri-twitch-fill", "ri-twitch-line", "ri-global-line", "ri-link"
];

// 5. Library Animasi
const animationLibrary = [
    { name: "None (Tidak Ada)", value: "none" },
    { name: "Fade In", value: "anim-fade-in" },
    { name: "Slide Up", value: "anim-slide-up" },
    { name: "Slide Down", value: "anim-slide-down" },
    { name: "Slide Left", value: "anim-slide-left" },
    { name: "Slide Right", value: "anim-slide-right" },
    { name: "Zoom In", value: "anim-zoom-in" },
    { name: "Zoom Out", value: "anim-zoom-out" },
    { name: "Bounce In", value: "anim-bounce-in" },
    { name: "Flip In X", value: "anim-flip-x" },
    { name: "Flip In Y", value: "anim-flip-y" }
];

// 6. Referensi DOM Elements
const canvas = document.getElementById('editorCanvas');
const emptyState = document.getElementById('emptyState');
const addSheet = document.getElementById('addSheet');
const editSheet = document.getElementById('editSheet');
const iconSheet = document.getElementById('iconSheet');
const globalSheet = document.getElementById('globalSheet');
const layerSheet = document.getElementById('layerSheet');
const overlay = document.getElementById('overlay');
const generatedCss = document.getElementById('generated-css');
const toast = document.getElementById('toast');

// 7. Inject CSS Tambahan
const editorStyle = document.createElement('style');
editorStyle.innerHTML = `
    /* Palette */
    .palette-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #eee; }
    .color-swatch { width: 24px; height: 24px; border-radius: 4px; cursor: pointer; border: 1px solid rgba(0,0,0,0.1); transition: transform 0.2s; }
    .color-swatch:hover { transform: scale(1.2); border-color: var(--primary); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }

    /* --- INPUT UI FIXES --- */
    
    .prop-row {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        gap: 10px;
        width: 100%;
    }
    .prop-label {
        width: 85px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-gray);
        flex-shrink: 0;
    }
    .prop-control {
        flex: 1;
        min-width: 0;
    }

    /* Input Group */
    .input-wrapper {
        display: flex;
        align-items: stretch;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        overflow: hidden;
        width: 100%;
        transition: border-color 0.2s;
        height: 36px;
    }
    .input-wrapper:focus-within {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px var(--primary-light);
    }
    
    .input-field {
        flex: 1;
        min-width: 0;
        border: none;
        padding: 0 6px; /* [FIX] Padding dikurangi agar area ketik lebih luas */
        font-size: 13px;
        background: transparent;
        outline: none;
        color: var(--text-dark);
        height: 100%;
    }

    /* Unit / Suffix */
    .input-unit {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px; /* [FIX] Padding dikurangi */
        background: var(--input-bg);
        border-left: 1px solid var(--border);
        color: var(--text-gray);
        font-size: 11px;
        font-weight: 600;
        user-select: none;
        flex-shrink: 0;
    }

    textarea.input-field {
        height: auto;
        padding: 8px 10px;
        resize: vertical;
        font-family: inherit;
    }

    /* --- BOX GRID --- */
    .box-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
    }
    .box-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 0;
    }
    .box-cell .input-wrapper {
        border-radius: 6px;
        height: 32px;
        padding: 0;
    }
    .box-cell .input-field {
        text-align: center;
        padding: 0 2px !important;
        font-size: 12px;
        width: 100%;
    }
    .box-cell span {
        font-size: 10px;
        color: var(--text-gray);
        text-transform: uppercase;
        font-weight: 700;
    }

    /* Hapus Spinner Input Number */
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
        -webkit-appearance: none; 
        margin: 0; 
    }
    input[type=number] {
        -moz-appearance: textfield;
    }

    /* --- ANIMATION KEYFRAMES --- */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
    @keyframes zoomOut { from { opacity: 0; transform: scale(1.2); } to { opacity: 1; transform: scale(1); } }
    @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }
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

    /* Active State */
    .has-animation.is-visible {
        opacity: 1; 
        transform: translate(0) scale(1) rotate(0);
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
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

    .btn, .el-btn, .icon-btn { transition: transform 0.1s; }
    .btn:active, .el-btn:active, .icon-btn:active { transform: scale(0.92); }
`;
document.head.appendChild(editorStyle);
