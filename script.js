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


function login() {
    const loginBox = document.querySelector(".login-box");
    const avatar = document.querySelector(".user-avatar-container");
    const name = document.querySelector(".myname");
    const welcome = document.querySelector(".welcome");
    console.log(welcome);


    // Hide login UI
    if (loginBox) loginBox.style.display = "none";
    if (avatar) avatar.style.display = "none";
    if (name) name.style.display = "none";
    welcome?.classList.add("show");
    sessionStorage.setItem("fromLoginArrow", "true");


    setTimeout(() => {
        window.location.href = "main.html";  // change to your page

    }, 1750
    );
}


function openWindow(pdfPath) {
    const frame = document.getElementById("pdf-frame");
    frame.src = pdfPath + "#zoom=65";
    document.getElementById("pdf-window").classList.remove("hidden");
}

function closeWindow() {
    document.getElementById("pdf-window").classList.add("hidden");
    document.getElementById("pdf-frame").src = ""; // stop loading
}


function openResume() {
    const resume = document.querySelector(".resume-bar");
    console.log(resume);
    resume?.classList.add("show");

}
const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

if (isFirefox) {
    // Firefox can use a GIF favicon directly
    const favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
    favicon.rel = "icon";
    favicon.href = "assets/icons/rotating-earth-slow.gif"; // your GIF
    document.head.appendChild(favicon);
} else {
    const favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png"; // not GIF
    document.head.appendChild(favicon);

    let i = 0;

    function nextFrame() {
        favicon.href = frames[i];
        i = (i + 1) % frames.length;
        setTimeout(nextFrame, 100); // recursive timeout less throttled in background
    }

    nextFrame();

    // Optional: force update when tab becomes visible
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            favicon.href = frames[i];
        }
    });
}

 document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });