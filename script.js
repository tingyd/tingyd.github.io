import frames from "./assets/base64/favicon_frames.js";

window.addEventListener("DOMContentLoaded", () => {
    const bg = document.querySelector(".bg-container");
    const body = document.body;
    const audio = document.getElementById("bg-audio");
    const loginArrow = document.getElementById("loginArrow");
    loginArrow?.addEventListener("click", () => {
        login();
    });
    if (bg) {
        // Only fade if coming from login arrow
        if (sessionStorage.getItem("fromLoginArrow")) {
            bg.classList.add("fade-in");
            body.classList.add("fade-content");

            setTimeout(() => {
                bg.classList.remove("fade-in");
                body.classList.remove("fade-content");
            }, 200);

            sessionStorage.removeItem("fromLoginArrow");
        } else {
            bg.style.opacity = 1;
            body.style.opacity = 1;
        }
    }

    if (audio) {
        setTimeout(() => {
            audio.play().catch(err => console.log("Play blocked:", err));
        }, 500);
    }
});

// ---------- login / small utilities ----------
function login() {
    const loginBox = document.querySelector(".login-box");
    const avatar = document.querySelector(".user-avatar-container");
    const name = document.querySelector(".myname");
    const welcome = document.querySelector(".welcome");

    // Hide login UI
    if (loginBox) loginBox.style.display = "none";
    if (avatar) avatar.style.display = "none";
    if (name) name.style.display = "none";
    welcome?.classList.add("show");
    sessionStorage.setItem("fromLoginArrow", "true");

    setTimeout(() => {
        window.location.href = "main.html";  // change to your page
    }, 1750);
}

function openWindow(pdfPath) {
    const frame = document.getElementById("pdf-frame");
    if (!frame) return;
    frame.src = pdfPath + "#zoom=65";
    document.getElementById("pdf-window").classList.remove("hidden");
}
function closeWindow() {
    const win = document.getElementById("pdf-window");
    if (win) win.classList.add("hidden");
    const frame = document.getElementById("pdf-frame");
    if (frame) frame.src = "";
}

function openResume() {
    const resume = document.querySelector(".resume-bar");
    resume?.classList.add("show");
}

// ---------- favicon animation ----------
const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
if (isFirefox) {
    const favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
    favicon.rel = "icon";
    favicon.href = "assets/icons/rotating-earth-slow.gif";
    document.head.appendChild(favicon);
} else {
    const favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    document.head.appendChild(favicon);

    let i = 0;
    function nextFrame() {
        favicon.href = frames[i];
        i = (i + 1) % frames.length;
        setTimeout(nextFrame, 100);
    }
    nextFrame();
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) favicon.href = frames[i];
    });
}

// prevent right-click on images (existing behavior)
document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName === 'IMG') e.preventDefault();
});

document.addEventListener('click', (event) => {
    const clickedElement = event.target;
    if (clickedElement.alt === 'Resume') openResume();
});

// small fade fix (existing)
window.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    setTimeout(() => {
        body.classList.remove("fade-content");
    }, 50);
});

// ---------- Explorer-specific code (rendering + interactions) ----------
window.addEventListener("DOMContentLoaded", () => {
    const explorerWindow = document.getElementById('explorer-window');
    const directoriesIcon = document.getElementById('project-icon');
    const directoriesTaskbar = document.getElementById('directories-taskbar');
    const explorerCloseButton = document.getElementById('explorer-close-button');
    const filesArea = document.querySelector('.explorer-files-area');
    const detailsTitle = document.querySelector('.explorer-details-title');
    let detailsIcon = document.querySelector('.explorer-details-icon'); // img element in your markup

    // helper: render details meta area (replaces innerHTML of .explorer-details-meta)
    function setDetailsMeta({ type = '--', dateModified = '--', size = '--', contains = '--' } = {}) {
        const meta = document.querySelector('.explorer-details-meta');
        if (!meta) return;
        meta.innerHTML = `
            <div class="explorer-details-label">Type:</div><div>${type}</div>
            <div class="explorer-details-label">Date modified:</div><div>${dateModified}</div>
            <div class="explorer-details-label">Size:</div><div>${size}</div>
            <div class="explorer-details-label">Contains:</div><div>${contains}</div>
        `;
    }

    // Generic renderer for a list of file items.
    // items: array of { name, icon, type, dateModified, size, contains }
    function renderFiles(items = []) {
        filesArea.innerHTML = '';
        if (!items.length) {
            filesArea.innerHTML = '<div style="grid-column: 1/-1; padding: 12px; color:#666;">This folder is empty.</div>';
            return;
        }

        items.forEach(item => {
            const fileItem = document.createElement('div');
            fileItem.className = 'explorer-file-item';
            fileItem.tabIndex = 0; // make focusable
            fileItem.dataset.name = item.name;
            if (item.icon) fileItem.dataset.icon = item.icon;
            if (item.type) fileItem.dataset.type = item.type;
            if (item.dateModified) fileItem.dataset.date = item.dateModified;
            if (item.size) fileItem.dataset.size = item.size;
            if (item.contains) fileItem.dataset.contains = item.contains;

            fileItem.innerHTML = `
                <img src="${item.icon || 'assets/icons/folder.png'}" class="explorer-file-icon" alt="${item.type || 'file'}" />
                <div class="explorer-file-name">${item.name}</div>
            `;

            fileItem.addEventListener('click', function () {

                // select
                document.querySelectorAll('.explorer-file-item').forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');

                // update details title
                const fname = (this.dataset.name || item.name || '').toLowerCase();
                detailsTitle.textContent = fname;

                // update details icon (if your details icon is an <img>)
                const iconSrc = this.dataset.icon || 'assets/icons/folder.png';
                if (detailsIcon && detailsIcon.tagName && detailsIcon.tagName.toLowerCase() === 'img') {
                    detailsIcon.src = iconSrc;
                } else if (detailsIcon) {
                    // replace old element with <img>
                    const img = document.createElement('img');
                    img.className = 'explorer-details-icon';
                    img.src = iconSrc;
                    img.alt = 'Folder Icon';
                    detailsIcon.parentNode.replaceChild(img, detailsIcon);
                    detailsIcon = img;
                }

                // update details meta
                setDetailsMeta({
                    type: this.dataset.type || '--',
                    dateModified: this.dataset.date || '--',
                    size: this.dataset.size || '--',
                    contains: this.dataset.contains || '--'
                });

                if (fname.endsWith(".pdf")) {
                    // pdf files — reuse your openWindow; adjust path if needed
                    openWindow(`assets/docs/${this.dataset.name || item.name}`);
                } else if (fname.endsWith(".mp4") || fname.endsWith(".mov") || fname.endsWith(".webm")) {
                    // video files - open video modal
                    // place your video files under assets/videos/
                    openVideo(`assets/videos/${this.dataset.name || item.name}`);
                }

            });

            // keyboard support: Enter to "open" (click)
            fileItem.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter') fileItem.click();
            });

            filesArea.appendChild(fileItem);
        });
    }

    // ---------- sample data ----------
    const initialFolderItems = [
        { name: 'My Documents', icon: 'assets/icons/folder.png', type: 'Folder', contains: '15 items' },
        { name: 'Personal', icon: 'assets/icons/folder.png', type: 'Folder', contains: '8 items' },
        { name: 'Projects', icon: 'assets/icons/folder.png', type: 'Folder', contains: '25 items' },
        { name: 'Shared', icon: 'assets/icons/folder.png', type: 'Folder', contains: '3 items' }
    ];

    const documentsItems = [
        { name: 'ProjectPlan.pdf', icon: 'assets/icons/pdf.png', type: 'PDF', dateModified: '10/15/2025 9:12 AM', size: '234 KB' },
        { name: 'Screenshot.png', icon: 'assets/icons/image.png', type: 'Image', dateModified: '10/18/2025 1:02 PM', size: '1.2 MB' },
        { name: 'REIDD.mov', icon: 'assets/video.png', type: 'Video', dateModified: '10/10/2025 5:00 PM', size: '23 MB' },
        { name: 'Notes.txt', icon: 'assets/icons/text.png', type: 'Text', dateModified: '10/01/2025 8:00 AM', size: '3 KB' }
    ];

    // initial render: show folder grid (the same as you had)
    renderFiles(initialFolderItems);
    if (detailsTitle) detailsTitle.textContent = 'My Documents';
    if (detailsIcon && detailsIcon.tagName.toLowerCase() === 'img') detailsIcon.src = 'assets/icons/folder.png';
    setDetailsMeta({ type: 'File folder', dateModified: '10/19/2025 3:42 PM', size: '--', contains: '15 items' });

    // ---------- wiring existing UI buttons ----------
    directoriesIcon?.addEventListener('click', () => explorerWindow.classList.add('active'));
    directoriesTaskbar?.addEventListener('click', () => explorerWindow.classList.toggle('active'));
    explorerCloseButton?.addEventListener('click', () => explorerWindow.classList.remove('active'));

    // nav items (Documents, Pictures, Videos...) - when clicked will render appropriate lists
    document.querySelectorAll('.explorer-nav-item').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.explorer-nav-item').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');

            const navName = this.textContent.trim();
            const titleBar = document.querySelector('.explorer-title-bar-text');
            if (titleBar) titleBar.textContent = navName;

            // render content depending on nav
            if (navName === 'Documents') {
                renderFiles(documentsItems);
                if (detailsTitle) detailsTitle.textContent = 'Documents';
                if (detailsIcon && detailsIcon.tagName.toLowerCase() === 'img') detailsIcon.src = 'assets/icons/folder.png';
                setDetailsMeta({ type: 'Folder', dateModified: '--', size: '--', contains: `${documentsItems.length} items` });
            } else if (navName === 'Pictures') {
                // simple example: filter images only from documentsItems OR show different set
                const pictures = documentsItems.filter(d => d.type === 'Image');
                renderFiles(pictures.length ? pictures : [{ name: 'No images', icon: 'assets/icons/image.png', type: 'Info' }]);
                if (detailsTitle) detailsTitle.textContent = 'Pictures';
                setDetailsMeta({ type: 'Folder', dateModified: '--', size: '--', contains: `${pictures.length} items` });
            } else if (navName === 'Videos') {
                const videos = documentsItems.filter(d => d.type === 'Video');
                renderFiles(videos.length ? videos : [{ name: 'No videos', icon: 'assets/icons/video.png', type: 'Info' }]);
                if (detailsTitle) detailsTitle.textContent = 'Videos';
                setDetailsMeta({ type: 'Folder', dateModified: '--', size: '--', contains: `${videos.length} items` });
            } else {
                // fallback - show the initial folder grid
                renderFiles(initialFolderItems);
                if (detailsTitle) detailsTitle.textContent = navName;
                setDetailsMeta({ type: 'Folder', dateModified: '--', size: '--', contains: `${initialFolderItems.length} items` });
            }

            // update breadcrumb if appropriate
            if (['Documents', 'Music', 'Pictures', 'Videos'].includes(navName)) {
                document.querySelector('.explorer-breadcrumb').innerHTML =
                    `<div class="explorer-breadcrumb-item">Libraries</div>
                     <div class="explorer-breadcrumb-arrow">▸</div>
                     <div class="explorer-breadcrumb-item">${navName}</div>`;
            }
        });
    });
});


function openVideo(videoPath, autoplay = true) {
    const win = document.getElementById('video-window');
    const v = document.getElementById('video-frame');
    if (!v) return console.error('openVideo: #video-frame missing');

    // show modal
    if (win) { win.classList.remove('hidden'); win.style.display = 'block'; win.style.visibility = 'visible'; win.style.zIndex = 9999; }

    // ensure visible styling
    Object.assign(v.style, { display: 'block', visibility: 'visible', width: '100%', height: 'auto', objectFit: 'contain', background: '#000' });

    // remove previous listeners to avoid duplicates
    v.onloadedmetadata = v.onloadeddata = v.onplay = v.onerror = null;

    // diagnostics
    function log(prefix) {
        console.log('VIDEO LOG:', prefix, { src: v.currentSrc || v.src, readyState: v.readyState, networkState: v.networkState, videoWidth: v.videoWidth, videoHeight: v.videoHeight, error: v.error });
    }
    v.onloadedmetadata = () => log('loadedmetadata');
    v.onloadeddata = () => log('loadeddata');
    v.onplay = () => log('play');
    v.onerror = (e) => { log('error'); console.error('video element error:', v.error, e); };

    // set src directly and load
    v.pause();
    v.src = videoPath;
    v.load();
    log('after set src & load');

    // keep a short timeout to restore src if something clears it
    const restoreToken = Symbol('restore');
    v._restoreToken = restoreToken;
    setTimeout(() => {
        // if someone cleared src after we set it, restore it once
        if ((v.currentSrc === '' || !v.currentSrc) && v._restoreToken === restoreToken) {
            console.warn('VIDEO WATCHDOG: src was cleared; restoring once.');
            v.src = videoPath;
            v.load();
            // try play if autoplay desired
            if (autoplay) v.play().catch(() => { });
        }
    }, 120);

    // try autoplay
    if (autoplay) {
        v.play().then(() => log('autoplay success')).catch(err => { console.warn('autoplay failed:', err); log('autoplay failed'); });
    }
}

(function initWindowControls() {
    // small helpers
    const getAction = (btn) => {
        if (!btn) return null;
        return (btn.dataset && btn.dataset.action) || (btn.getAttribute('aria-label') || '').toLowerCase();
    };

    const findWindowEl = (el) => {
        return el.closest('.explorer-window') || el.closest('.window') || el.closest('.window-container') || el.closest('.window-root');
    };

    const saveRestoreState = (win) => {
        // Save only once (when maximizing) so restore can bring it back
        if (!win._restoreState) {
            const rect = win.getBoundingClientRect();
            win._restoreState = {
                left: win.style.left || rect.left + 'px',
                top: win.style.top || rect.top + 'px',
                width: win.style.width || rect.width + 'px',
                height: win.style.height || rect.height + 'px',
                transform: win.style.transform || getComputedStyle(win).transform || ''
            };
        }
    };

    const restoreState = (win) => {
        if (!win._restoreState) return;
        const s = win._restoreState;
        // restore style values
        win.style.left = s.left;
        win.style.top = s.top;
        win.style.width = s.width;
        win.style.height = s.height;
        win.style.transform = s.transform;
        win.classList.remove('maximized');
        delete win._restoreState;
    };

    const maximizeWindow = (win) => {
        if (!win) return;
        // If already maximized -> restore
        if (win.classList.contains('maximized')) {
            restoreState(win);
            return;
        }

        saveRestoreState(win);

        // Make window fill viewport (you can adjust margins)
        Object.assign(win.style, {
            left: '10px',
            top: '10px',
            width: `calc(100vw - 20px)`,
            height: `calc(100vh - 20px)`,
            transform: 'none',
        });
        win.classList.add('maximized');
        // ensure visible and active
        win.classList.add('active');
        win.style.zIndex = 9999;
    };

    const minimizeWindow = (win) => {
        if (!win) return;
        // For a simple minimize, hide the window (but keep state)
        win.classList.remove('active');
        win.classList.add('minimized');
        // optional: visually shrink or animate; we'll set display none
        win.style.display = 'none';
    };

    const closeWindow = (win) => {
        if (!win) return;
        // If window contains a <video>, stop it and free the src
        const v = win.querySelector('video');
        if (v) {
            try {
                v.pause();
                // remove children sources to stop network activity
                v.removeAttribute('src');
                while (v.firstChild) v.removeChild(v.firstChild);
                v.load();
            } catch (err) { /* ignore */ }
        }

        // If window contains an iframe (pdf window) stop it too
        const iframe = win.querySelector('iframe#pdf-frame, frame#pdf-frame');
        if (iframe) {
            try { iframe.src = ''; } catch (e) { /* ignore */ }
        }

        // Hide window and mark as closed
        win.classList.remove('active');
        win.classList.add('closed');
        win.style.display = 'none';
        win.setAttribute('aria-hidden', 'true');
    };

    // Event delegation for all title bar control buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.title-bar-controls button, .title-bar .button');
        if (!btn) return;
        const action = getAction(btn);
        if (!action) return;

        const win = findWindowEl(btn);
        if (!win) {
            console.warn('Title-bar control clicked but window root not found for:', btn);
            return;
        }

        switch (action) {
            case 'minimize':
            case 'min':
                minimizeWindow(win);
                break;
            case 'maximize':
            case 'max':
            case 'restore':
            case 'is-restore':
                maximizeWindow(win); // toggle maximize/restore
                break;
            case 'close':
            case 'is-close':
                closeWindow(win);
                break;
            case 'help':
                // example: open help or show alert — customize as you like
                alert('Help requested for window: ' + (win.querySelector('.title-bar-text')?.textContent || ''));
                break;
            default:
                console.warn('Unknown title-bar action:', action);
        }
    });

    // Optional keyboard support: Esc closes focused window
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // close the topmost active window
            const top = Array.from(document.querySelectorAll('.explorer-window.active, .window.active'))
                .sort((a, b) => (parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0)))[0];
            if (top) closeWindow(top);
        }
    });

    // Restore display when somebody "unminimizes" via taskbar icon: provide helper
    window.restoreWindow = function (win) {
        if (!win) return;
        win.style.display = ''; // remove inline none
        win.classList.remove('minimized', 'closed');
        win.classList.add('active');
        win.style.zIndex = 9999;
        // if we had saved a restore state and it's not maximized, keep it
        if (win._restoreState && !win.classList.contains('maximized')) {
            // nothing to do — keep previous
        }
    };

    // Example helper to show a window by id (used by taskbar icons)
    window.showWindowById = function (id) {
        const win = document.getElementById(id);
        if (!win) return;
        restoreWindow(win);
    };
})();
document.addEventListener('DOMContentLoaded', function () {
    // Update time in system tray
    function updateTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        const timeString = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
        document.getElementById('tray-time').textContent = timeString;
    }

    updateTime();
    setInterval(updateTime, 60000); // Update every minute

    // Explorer window functionality
    const explorerWindow = document.getElementById('explorer-window');
    const directoriesIcon = document.getElementById('project-icon');
    const directoriesTaskbar = document.getElementById('directories-taskbar');
    const explorerClose = document.querySelector('.explorer-close');

    // Open explorer when clicking the desktop icon
    directoriesIcon.addEventListener('click', function () {
        explorerWindow.classList.add('active');
    });

    // Open explorer when clicking the taskbar icon
    directoriesTaskbar.addEventListener('click', function () {
        if (explorerWindow.classList.contains('active')) {
            explorerWindow.classList.remove('active');
        } else {
            explorerWindow.classList.add('active');
        }
    });

    // Close explorer when clicking the close button
    const explorerCloseButton = document.getElementById('explorer-close-button');
    explorerCloseButton.addEventListener('click', function () {
        explorerWindow.classList.remove('active');
    });

    // Make explorer window draggable
    let isDragging = false;
    let offsetX, offsetY;

    const explorerTitleBar = document.querySelector('#explorer-window .title-bar');

    explorerTitleBar.addEventListener('mousedown', function (e) {
        isDragging = true;
        offsetX = e.clientX - explorerWindow.getBoundingClientRect().left;
        offsetY = e.clientY - explorerWindow.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            explorerWindow.style.left = (e.clientX - offsetX) + 'px';
            explorerWindow.style.top = (e.clientY - offsetY) + 'px';
            explorerWindow.style.transform = 'none'; // Remove the transform once we start dragging
        }
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });

    // Handle file item selection
    const fileItems = document.querySelectorAll('.explorer-file-item');
    fileItems.forEach(item => {
        item.addEventListener('click', function () {
            // Remove selected class from all items
            fileItems.forEach(i => i.classList.remove('selected'));
            // Add selected class to clicked item
            this.classList.add('selected');

            // Update details pane
            const fileName = this.querySelector('.explorer-file-name').textContent;
            document.querySelector('.explorer-details-title').textContent = fileName;
        });
    });

    // Handle nav item selection
    const navItems = document.querySelectorAll('.explorer-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            // Remove selected class from all items
            navItems.forEach(i => i.classList.remove('selected'));
            // Add selected class tob clicked item
            this.classList.add('selected');

            // Update title bar
            const navName = this.textContent.trim();
            document.querySelector('.explorer-title-bar-text').textContent = navName;

            // Update breadcrumb if it's in a library
            if (['Documents', 'Music', 'Pictures', 'Videos'].includes(navName)) {
                document.querySelector('.explorer-breadcrumb').innerHTML =
                    `<div class="explorer-breadcrumb-item">Libraries</div>
                            <div class="explorer-breadcrumb-arrow">▸</div>
                            <div class="explorer-breadcrumb-item">${navName}</div>`;
            }
        });
    });
});