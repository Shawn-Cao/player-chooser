import { 
    initIOSInstall, 
    showInstallPromptIfIOS, 
    hideInstallPrompt 
} from './ios-install.js';

const app = document.getElementById('app');
const instructions = document.getElementById('instructions');
const countdown = document.getElementById('countdown');
const touchIndicators = document.getElementById('touch-indicators');
const winner = document.getElementById('winner');
const installPrompt = document.getElementById('install-prompt');
const installModal = document.getElementById('install-modal');
const installClose = document.getElementById('install-close');

let activeTouches = new Map();
let countdownTimer = null;
let selectionTimer = null;
let isSelecting = false;

// Initialize iOS install functionality
initIOSInstall(installPrompt, installModal, installClose);

// Touch start handler
app.addEventListener('touchstart', (e) => {
    e.preventDefault();
    
    if (isSelecting) return;
    
    // Add all current touches
    Array.from(e.touches).forEach(touch => {
        if (!activeTouches.has(touch.identifier)) {
            addTouchPoint(touch);
        }
    });
    
    // If we have multiple touches, start countdown
    if (activeTouches.size >= 2 && !countdownTimer) {
        startCountdown();
    }
});

// Touch move handler
app.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    if (isSelecting) return;
    
    // Update touch positions
    Array.from(e.touches).forEach(touch => {
        if (activeTouches.has(touch.identifier)) {
            updateTouchPoint(touch);
        }
    });
});

// Touch end handler
app.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    if (isSelecting) return;
    
    // Remove ended touches
    Array.from(e.changedTouches).forEach(touch => {
        removeTouchPoint(touch.identifier);
    });
    
    // If we have less than 2 touches, reset
    if (activeTouches.size < 2) {
        resetCountdown();
    }
});

// Touch cancel handler
app.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    
    if (isSelecting) return;
    
    Array.from(e.changedTouches).forEach(touch => {
        removeTouchPoint(touch.identifier);
    });
    
    if (activeTouches.size < 2) {
        resetCountdown();
    }
});

function addTouchPoint(touch) {
    const touchPoint = document.createElement('div');
    touchPoint.className = 'touch-point';
    touchPoint.id = `touch-${touch.identifier}`;
    touchPoint.textContent = activeTouches.size + 1;
    
    touchPoint.style.left = `${touch.clientX}px`;
    touchPoint.style.top = `${touch.clientY}px`;
    
    touchIndicators.appendChild(touchPoint);
    activeTouches.set(touch.identifier, {
        element: touchPoint,
        x: touch.clientX,
        y: touch.clientY
    });
    
    // Create ripple effect
    createRipple(touch.clientX, touch.clientY);
}

function updateTouchPoint(touch) {
    const touchData = activeTouches.get(touch.identifier);
    if (touchData) {
        touchData.x = touch.clientX;
        touchData.y = touch.clientY;
        touchData.element.style.left = `${touch.clientX}px`;
        touchData.element.style.top = `${touch.clientY}px`;
    }
}

function removeTouchPoint(identifier) {
    const touchData = activeTouches.get(identifier);
    if (touchData) {
        touchData.element.remove();
        activeTouches.delete(identifier);
    }
    
    // Update numbers on remaining touch points
    updateTouchPointNumbers();
}

function updateTouchPointNumbers() {
    let index = 1;
    activeTouches.forEach((touchData) => {
        touchData.element.textContent = index;
        index++;
    });
}

function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    app.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

function startCountdown() {
    let seconds = 2;
    countdown.textContent = seconds;
    
    countdownTimer = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            countdown.textContent = seconds;
        } else {
            countdown.textContent = '';
            clearInterval(countdownTimer);
            countdownTimer = null;
            selectWinner();
        }
    }, 1000);
}

function resetCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    countdown.textContent = '';
}

function selectWinner() {
    if (activeTouches.size === 0 || isSelecting) return;
    
    isSelecting = true;
    instructions.style.opacity = '0.3';
    
    // Highlight all touch points
    activeTouches.forEach((touchData) => {
        touchData.element.classList.add('active');
    });
    
    // After a brief delay, select winner
    setTimeout(() => {
        const touchArray = Array.from(activeTouches.values());
        const randomIndex = Math.floor(Math.random() * touchArray.length);
        const winnerTouch = touchArray[randomIndex];
        
        // Mark winner
        winnerTouch.element.classList.add('winner');
        
        // Show winner screen
        setTimeout(() => {
            winner.classList.remove('hidden');
            
            // Show install button on iOS Safari after a short delay
            showInstallPromptIfIOS(installPrompt);
        }, 300);
        
        // Reset after 3 seconds
        setTimeout(() => {
            resetGame();
        }, 3000);
    }, 500);
}

function resetGame() {
    // Clear all timers
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    if (selectionTimer) {
        clearTimeout(selectionTimer);
        selectionTimer = null;
    }
    
    // Remove all touch points
    activeTouches.forEach((touchData) => {
        touchData.element.remove();
    });
    activeTouches.clear();
    
    // Reset UI
    instructions.style.opacity = '1';
    countdown.textContent = '';
    winner.classList.add('hidden');
    hideInstallPrompt(installPrompt, installModal);
    isSelecting = false;
}

// Prevent default touch behaviors
document.addEventListener('touchstart', (e) => {
    if (e.target === app || e.target.closest('#app')) {
        // Allow default for app area
    }
}, { passive: false });

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful:', registration.scope);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

