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
let iosInstallModule = null; // Cache the loaded module
let desktopClickCounter = 1000; // Counter for desktop clicks (to avoid conflicts with touch IDs)

// Player colors (8 distinct colors for up to 8 players)
const PLAYER_COLORS = [
    { bg: '#FF4444', border: '#FF6666', name: 'Red' },      // Player 1
    { bg: '#4488FF', border: '#66AAFF', name: 'Blue' },     // Player 2
    { bg: '#44FF88', border: '#66FFAA', name: 'Green' },   // Player 3
    { bg: '#FFDD44', border: '#FFEE66', name: 'Yellow' },  // Player 4
    { bg: '#AA44FF', border: '#CC66FF', name: 'Purple' },   // Player 5
    { bg: '#FF8844', border: '#FFAA66', name: 'Orange' },  // Player 6
    { bg: '#FF44AA', border: '#FF66CC', name: 'Pink' },     // Player 7
    { bg: '#44FFDD', border: '#66FFEE', name: 'Cyan' }      // Player 8
];

// Feature detection: check if touch events are supported
const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (supportsTouch) {
    // Touch Events - for mobile devices
    app.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        if (isSelecting) return;
        
        // Add all current touches
        Array.from(e.touches).forEach(touch => {
            if (!activeTouches.has(touch.identifier)) {
                addTouchPoint(touch);
            }
        });
        
        // If we have multiple touches, start/restart countdown
        if (activeTouches.size >= 2) {
            startCountdown();
        }
    });

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
} else {
    // Pointer Events - for desktop trackpads and mice (when touch not supported)
    // For desktop: each click = one player, players stay until game resets
    app.addEventListener('pointerdown', (e) => {
        if (isSelecting) return;
    
        e.preventDefault();
        
        // Create a unique identifier for each desktop click
        // pointerId stays the same for the same mouse, so we use a counter
        const fakePointer = {
            pointerId: desktopClickCounter++,
            clientX: e.clientX,
            clientY: e.clientY
        };
        
        addTouchPoint(fakePointer);
        
        // If we have multiple touches, start/restart countdown
        if (activeTouches.size >= 2) {
            startCountdown();
        }
    });

    // Don't track movement or removal for desktop - players stay until game resets
    // This allows multiple clicks to register as separate players
}


function addTouchPoint(touchOrPointer) {
    // Handle both Touch and Pointer events
    // Touch events have identifier, Pointer events have pointerId
    const identifier = touchOrPointer.identifier !== undefined 
        ? touchOrPointer.identifier 
        : touchOrPointer.pointerId;
    const clientX = touchOrPointer.clientX;
    const clientY = touchOrPointer.clientY;
    
    if (activeTouches.has(identifier)) return;
    
    const playerNumber = activeTouches.size;
    const colorIndex = playerNumber % PLAYER_COLORS.length;
    const playerColor = PLAYER_COLORS[colorIndex];
    
    const touchPoint = document.createElement('div');
    touchPoint.className = 'touch-point';
    touchPoint.id = `touch-${identifier}`;
    touchPoint.setAttribute('data-player', playerNumber + 1);
    
    // Apply player color
    touchPoint.style.background = playerColor.bg;
    touchPoint.style.borderColor = playerColor.border;
    touchPoint.style.color = '#FFFFFF';
    
    touchPoint.style.left = `${clientX}px`;
    touchPoint.style.top = `${clientY}px`;
    
    touchIndicators.appendChild(touchPoint);
    activeTouches.set(identifier, {
        element: touchPoint,
        x: clientX,
        y: clientY,
        playerNumber: playerNumber,
        color: playerColor
    });
    
    // If countdown is running, add pulsing class to new player
    if (countdownTimer) {
        touchPoint.classList.add('pulsing');
    }
    
    // Create ripple effect
    createRipple(clientX, clientY);
}

function updateTouchPoint(touchOrPointer) {
    const identifier = touchOrPointer.identifier !== undefined 
        ? touchOrPointer.identifier 
        : touchOrPointer.pointerId !== undefined
        ? touchOrPointer.pointerId
        : null;
    
    if (identifier === null) return;
    
    const touchData = activeTouches.get(identifier);
    if (touchData) {
        touchData.x = touchOrPointer.clientX;
        touchData.y = touchOrPointer.clientY;
        touchData.element.style.left = `${touchOrPointer.clientX}px`;
        touchData.element.style.top = `${touchOrPointer.clientY}px`;
    }
}

function removeTouchPoint(identifier) {
    const touchData = activeTouches.get(identifier);
    if (touchData) {
        touchData.element.remove();
        activeTouches.delete(identifier);
    }
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
    // If countdown is already running, restart it (new player joined)
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    
    let seconds = 3;
    countdown.textContent = seconds;
    
    // Add pulsing class to all touch points
    activeTouches.forEach((touchData) => {
        touchData.element.classList.add('pulsing');
    });
    
    countdownTimer = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            countdown.textContent = seconds;
        } else {
            countdown.textContent = '';
            // Remove pulsing from all touch points
            activeTouches.forEach((touchData) => {
                touchData.element.classList.remove('pulsing');
            });
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
    // Remove pulsing from all touch points
    activeTouches.forEach((touchData) => {
        touchData.element.classList.remove('pulsing');
    });
}

function selectWinner() {
    if (activeTouches.size === 0 || isSelecting) return;
    
    isSelecting = true;
    instructions.style.opacity = '0.2';
    
    // Dim all touch points first
    activeTouches.forEach((touchData) => {
        touchData.element.classList.add('dimmed');
    });
    
    // After a brief delay, select winner
    setTimeout(() => {
        const touchArray = Array.from(activeTouches.values());
        const randomIndex = Math.floor(Math.random() * touchArray.length);
        const winnerTouch = touchArray[randomIndex];
        
        // Mark winner - this will make it very prominent
        winnerTouch.element.classList.remove('dimmed');
        winnerTouch.element.classList.add('winner');
        
        // Set CSS variable for winner's original color in glow effect
        const winnerColor = winnerTouch.color?.bg || '#ffd700';
        winnerTouch.element.style.setProperty('--player-bg', winnerColor);
        
        // Dynamically load and show install button on iOS Safari after winner is shown
        setTimeout(() => {
            loadAndShowIOSInstallPrompt();
        }, 500);
        
        // Reset after 4 seconds (longer to appreciate the chosen player)
        setTimeout(() => {
            resetGame();
        }, 4000);
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
    
    // Remove all classes from touch points before removing them
    activeTouches.forEach((touchData) => {
        touchData.element.classList.remove('winner', 'dimmed', 'active');
        touchData.element.remove();
    });
    activeTouches.clear();
    
    // Reset UI
    instructions.style.opacity = '1';
    countdown.textContent = '';
    
    // Hide install prompt if module was loaded
    if (iosInstallModule) {
        iosInstallModule.hideInstallPrompt(installPrompt, installModal);
    }
    
    isSelecting = false;
}

// Dynamically load iOS install module only when needed
async function loadAndShowIOSInstallPrompt() {
    try {
        // Only load if not already loaded
        if (!iosInstallModule) {
            iosInstallModule = await import('./ios-install.js');
            // Initialize handlers once module is loaded
            iosInstallModule.initIOSInstall(installPrompt, installModal, installClose);
        }
        // Show the prompt
        iosInstallModule.showInstallPromptIfIOS(installPrompt);
    } catch (error) {
        console.warn('Failed to load iOS install module:', error);
        // Silently fail - non-iOS users won't need this anyway
    }
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
        navigator.serviceWorker.register('/player-chooser/service-worker.js', {
            scope: '/player-chooser/'
        })
            .then((registration) => {
                console.log('ServiceWorker registration successful:', registration.scope);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available, reload to use it
                            console.log('New service worker available, reloading...');
                            window.location.reload();
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

