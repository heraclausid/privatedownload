/* --- js/config.js (LENGKAP DENGAN MULTIPAGE SUPPORT) --- */

// 1. Variabel Global Utama
// [NEW] Struktur Data Multi-Page
let projectData = {
    pages: [
        { id: 'home', name: 'Home', slug: 'index', data: [] } // Halaman default
    ],
    activePageId: 'home',
    config: {
        fontFamily: "'Outfit', sans-serif",
        pageBg: "#f1f5f9",
        darkMode: false
    }
};

// [PENTING] pageData sekarang adalah referensi (pointer) ke data halaman yang sedang aktif.
// Ini menjaga kompatibilitas dengan file elements.js dan renderer.js
let pageData = projectData.pages[0].data; 
let globalConfig = projectData.config;

let savedColors = ["#6366f1", "#ffffff", "#1e293b", "#f1f5f9", "#ef4444"];
let activeContainerId = null;
let editingId = null;
let currentEditState = 'normal'; // 'normal', 'hover', 'dark'
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

// 5. Referensi DOM Elements
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

// 6. Inject CSS Tambahan untuk Color Palette
const editorStyle = document.createElement('style');
editorStyle.innerHTML = `
    .palette-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #eee; }
    .color-swatch { width: 24px; height: 24px; border-radius: 4px; cursor: pointer; border: 1px solid rgba(0,0,0,0.1); transition: transform 0.2s; }
    .color-swatch:hover { transform: scale(1.2); border-color: var(--primary); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
`;
document.head.appendChild(editorStyle);
