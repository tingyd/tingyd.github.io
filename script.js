import frames from "./asset/base64/favicon_frames.js";

document.addEventListener('DOMContentLoaded', () => {
    const themeWrapper = document.getElementById('theme-wrapper');
    const lightBtn = document.getElementById('light-mode');
    const darkBtn = document.getElementById('dark-mode');
    const buttons = [lightBtn, darkBtn].filter(Boolean);

    const textElement = document.getElementById('typing-text');
    const heroSubtext = document.getElementById('hero-subtext');
    const subTextContent = "Hi! My name is Ting, and I'm passionate about building meaningful, impactful software. Welcome to my portfolio!";

    const subtextFadeDurationMs = 1200;
    if (heroSubtext) {
        heroSubtext.textContent = '';
        heroSubtext.classList.remove('visible'); // keep it hidden at start
        heroSubtext.setAttribute('aria-hidden', 'true');
    }

    if (!textElement) {
        console.error('Missing #typing-text — typing animation cannot run.');
        return;
    }

    function updateActiveButton(activeId) {
        buttons.forEach(btn => {
            if (btn.id === activeId) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    function setTheme(theme) {
        if (!themeWrapper) return;
        themeWrapper.classList.remove('light', 'dark');
        themeWrapper.classList.add(theme);
        updateActiveButton(`${theme}-mode`);
    }

    // Color cycling
    let colorCycleInterval = null;
    // Google Color Palette (Blue, Red, Yellow, Green)
    const cycleColors = ['#4285F4', '#DB4437', '#FFEB3B', '#0F9D58'];
    const cycleIntervalMs = 11000;
    const transitionDuration = '3.5s';

    function startColorCycling() {
        if (!themeWrapper) return;
        if (colorCycleInterval) {
            clearInterval(colorCycleInterval);
            colorCycleInterval = null;
        }

        let colorIndex = 0;
        themeWrapper.style.setProperty('--accent-color', cycleColors[colorIndex]);
        if (textElement) textElement.style.color = cycleColors[colorIndex];

        colorCycleInterval = setInterval(() => {
            colorIndex = (colorIndex + 1) % cycleColors.length;
            const nextColor = cycleColors[colorIndex];
            themeWrapper.style.setProperty('--accent-color', nextColor);
            if (textElement) textElement.style.color = nextColor;
        }, cycleIntervalMs);
    }

    // Typing animation
    function startTypingAnimation() {
        const textToType = "Hello World";
        let i = 0;
        const typingSpeed = 260;


        const initialColor = cycleColors[0];
        if (themeWrapper) themeWrapper.style.setProperty('--accent-color', initialColor);

        // Reset and prepare for typing
        textElement.style.transition = 'none';
        textElement.textContent = '';
        textElement.style.borderRightColor = 'var(--accent-color)';
        textElement.style.animation = 'blink-caret .75s step-end infinite';

        if (heroSubtext) {
            heroSubtext.textContent = subTextContent;
            heroSubtext.style.opacity = 0;
        }

        function typeWriter() {
            if (i < textToType.length) {
                textElement.textContent += textToType.charAt(i);
                i++;
                setTimeout(typeWriter, typingSpeed);
            } else {
                // Hide cursor and set text transition
                textElement.style.animation = 'none';
                textElement.style.borderRightColor = 'transparent';
                textElement.style.transition = `color ${transitionDuration} ease-in-out`;

                if (heroSubtext) {
                    heroSubtext.textContent = subTextContent;
                    heroSubtext.setAttribute('aria-hidden', 'false');
                    heroSubtext.style.opacity = '';
                    heroSubtext.style.visibility = '';
                    heroSubtext.classList.add('visible');
                }

                // Wait for the fade-in duration before enabling scroll and starting color cycle
                setTimeout(() => {
                    document.body.style.overflowY = 'scroll';
                    startColorCycling();
                }, subtextFadeDurationMs);
            }
        }

        typeWriter();
    }

    // --- INITIALIZATION AND EVENT HANDLERS ---

    // Theme buttons
    if (lightBtn) lightBtn.addEventListener('click', () => setTheme('light'));
    if (darkBtn) darkBtn.addEventListener('click', () => setTheme('dark'));

    // Set initial theme
    setTheme('light');
    const hasVisited = localStorage.getItem('hasVisited');

    if (!hasVisited) {
        localStorage.setItem('hasVisited', 'true');
        startTypingAnimation();
    } else {
        textElement.textContent = "Hello World";
        if (heroSubtext) {
            heroSubtext.style.transition = 'none';  
            heroSubtext.style.visibility = 'visible'; 
            heroSubtext.textContent = subTextContent;
            heroSubtext.style.opacity = 1;
        }
        document.body.style.overflowY = 'scroll'; 
        startColorCycling();
    }

    // --- Favicon Animation Logic ---
    function startFaviconAnimation() {
        if (frames.length === 0) {
            console.warn('Favicon frames array is empty. Animation skipped.');
            return;
        }

        const favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
        favicon.rel = "icon";
        favicon.type = "image/svg+xml";
        document.head.appendChild(favicon);

        let i = 0;

        function nextFrame() {
            if (frames.length > 0) {
                favicon.href = frames[i];
                i = (i + 1) % frames.length;
                setTimeout(nextFrame, 100);
            }
        }

        const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
        if (!isFirefox) {
            nextFrame();
            document.addEventListener("visibilitychange", () => {
                if (!document.hidden && frames.length > 0) {
                    favicon.href = frames[i];
                }
            });
        }
    }

    startFaviconAnimation();
});