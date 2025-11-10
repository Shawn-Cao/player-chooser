/**
 * iOS Install Prompt Module
 * Handles iOS Safari detection and install prompt UI
 */

// Detect if user is on iOS Safari (not in standalone mode)
export function isIOSSafari() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true || 
                        window.matchMedia('(display-mode: standalone)').matches;
    return isIOS && !isStandalone;
}

/**
 * Initialize iOS install prompt functionality
 * @param {HTMLElement} installPrompt - The install button element
 * @param {HTMLElement} installModal - The modal element
 * @param {HTMLElement} installClose - The close button element
 */
export function initIOSInstall(installPrompt, installModal, installClose) {
    if (!installPrompt || !installModal || !installClose) {
        return;
    }

    // Install prompt button handler
    installPrompt.addEventListener('click', () => {
        installModal.classList.remove('hidden');
        
        // Try to use Web Share API if available (won't directly add to home screen, but shows share sheet)
        if (navigator.share) {
            navigator.share({
                title: 'Player Chooser',
                text: 'Install Player Chooser to your home screen',
                url: window.location.href
            }).catch(() => {
                // User cancelled or share failed, modal is already shown
            });
        }
    });

    // Close install modal
    installClose.addEventListener('click', () => {
        installModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    installModal.addEventListener('click', (e) => {
        if (e.target === installModal) {
            installModal.classList.add('hidden');
        }
    });
}

/**
 * Show the install prompt button if on iOS Safari
 * @param {HTMLElement} installPrompt - The install button element
 */
export function showInstallPromptIfIOS(installPrompt) {
    if (installPrompt && isIOSSafari()) {
        setTimeout(() => {
            installPrompt.classList.remove('hidden');
        }, 800);
    }
}

/**
 * Hide the install prompt
 * @param {HTMLElement} installPrompt - The install button element
 * @param {HTMLElement} installModal - The modal element
 */
export function hideInstallPrompt(installPrompt, installModal) {
    if (installPrompt) {
        installPrompt.classList.add('hidden');
    }
    if (installModal) {
        installModal.classList.add('hidden');
    }
}

