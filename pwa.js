(() => {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
        });
    });
})();
