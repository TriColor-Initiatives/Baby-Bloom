/**
 * Service Worker for Baby Bloom
 * Handles background notifications and offline support
 */

const CACHE_NAME = 'baby-bloom-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Background sync for reminders
self.addEventListener('sync', (event) => {
    if (event.tag === 'check-reminders') {
        event.waitUntil(checkRemindersInBackground());
    }
});

// Check reminders in background
async function checkRemindersInBackground() {
    try {
        // Get reminders from IndexedDB or send message to main thread
        const reminders = await getStoredReminders();
        const now = Date.now();

        reminders.forEach(reminder => {
            const dueTime = new Date(reminder.dueAt).getTime();
            if (dueTime <= now && dueTime > (now - 60000)) {
                // Show notification
                self.registration.showNotification(reminder.title, {
                    body: reminder.body || reminder.title,
                    icon: reminder.icon || '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    tag: `reminder-${reminder.id}`,
                    requireInteraction: true,
                    data: {
                        reminderId: reminder.id,
                        category: reminder.category
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error checking reminders in background:', error);
    }
}

// Get stored reminders (from IndexedDB or localStorage via message)
async function getStoredReminders() {
    return new Promise((resolve) => {
        // Try to get from IndexedDB first
        if ('indexedDB' in self) {
            // For now, return empty array - will be populated by main thread
            resolve([]);
        } else {
            resolve([]);
        }
    });
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const reminderId = event.notification.data?.reminderId;
    const category = event.notification.data?.category;

    // Open app and navigate to relevant page
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is already open, focus it
                for (let client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        // Navigate to relevant page based on category
                        const pageMap = {
                            feeding: '/feeding',
                            sleep: '/sleep',
                            diaper: '/diaper',
                            health: '/health',
                            medication: '/health',
                            appointment: '/appointments',
                            vaccination: '/vaccinations',
                            general: '/reminders'
                        };
                        const page = pageMap[category] || '/';
                        return client.navigate(page).then(() => client.focus());
                    }
                }
                // If app is not open, open it
                if (clients.openWindow) {
                    const pageMap = {
                        feeding: '/feeding',
                        sleep: '/sleep',
                        diaper: '/diaper',
                        health: '/health',
                        medication: '/health',
                        appointment: '/appointments',
                        vaccination: '/vaccinations',
                        general: '/reminders'
                    };
                    const page = pageMap[category] || '/';
                    return clients.openWindow(self.location.origin + page);
                }
            })
    );
});

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: data.tag,
            requireInteraction: data.requireInteraction || false,
            data: data.data
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CHECK_REMINDERS') {
        checkRemindersInBackground();
    }

    if (event.data && event.data.type === 'SCHEDULE_REMINDER') {
        // Store reminder for background checking
        const reminder = event.data.reminder;
        // In a real implementation, store in IndexedDB
        // For now, just acknowledge
        event.ports[0].postMessage({ success: true });
    }
});

