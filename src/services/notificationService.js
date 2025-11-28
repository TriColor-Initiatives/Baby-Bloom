/**
 * Centralized Notification Service for Baby Bloom
 * Handles browser notifications, reminder scheduling, and background checks
 */

// Notification permission state
let permissionStatus = 'default';

// Active notification IDs to prevent duplicates
const activeNotifications = new Set();

// Reminder check interval (check every minute)
let reminderCheckInterval = null;

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return 'unsupported';
    }

    if (Notification.permission === 'granted') {
        permissionStatus = 'granted';
        return 'granted';
    }

    if (Notification.permission === 'denied') {
        permissionStatus = 'denied';
        return 'denied';
    }

    try {
        const permission = await Notification.requestPermission();
        permissionStatus = permission;
        return permission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = () => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
};

/**
 * Show a browser notification
 */
export const showNotification = (title, options = {}) => {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return null;
    }

    if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
    }

    const notificationId = options.id || `${Date.now()}-${Math.random()}`;

    // Prevent duplicate notifications
    if (activeNotifications.has(notificationId)) {
        return null;
    }

    activeNotifications.add(notificationId);

    const notification = new Notification(title, {
        icon: options.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        body: options.body || '',
        tag: options.tag || notificationId,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        ...options
    });

    // Clean up after notification closes
    notification.onclose = () => {
        activeNotifications.delete(notificationId);
    };

    // Auto-close after 10 seconds if not requiring interaction
    if (!options.requireInteraction) {
        setTimeout(() => {
            notification.close();
        }, 10000);
    }

    return notification;
};

/**
 * Schedule a reminder notification
 */
export const scheduleReminder = (reminderData) => {
    const {
        id,
        title,
        dueAt,
        body,
        icon,
        category,
        onTrigger
    } = reminderData;

    if (!id || !title || !dueAt) {
        console.error('Invalid reminder data:', reminderData);
        return null;
    }

    const dueTime = new Date(dueAt).getTime();
    const now = Date.now();
    const delay = dueTime - now;

    // If reminder is in the past, don't schedule
    if (delay < 0) {
        return null;
    }

    // Store reminder for background checking
    const reminders = getScheduledReminders();
    reminders.push({
        id,
        title,
        dueAt,
        body,
        icon,
        category,
        scheduledAt: new Date().toISOString()
    });
    saveScheduledReminders(reminders);

    // Schedule notification
    const timeoutId = setTimeout(() => {
        showNotification(title, {
            id,
            body: body || title,
            icon: icon || getCategoryIcon(category),
            tag: `reminder-${id}`,
            requireInteraction: true
        });

        // Call custom trigger handler if provided
        if (onTrigger && typeof onTrigger === 'function') {
            onTrigger();
        }

        // Remove from scheduled reminders
        removeScheduledReminder(id);
    }, delay);

    return timeoutId;
};

/**
 * Cancel a scheduled reminder
 */
export const cancelReminder = (reminderId) => {
    const reminders = getScheduledReminders();
    const filtered = reminders.filter(r => r.id !== reminderId);
    saveScheduledReminders(filtered);
    removeScheduledReminder(reminderId);
};

/**
 * Get all scheduled reminders from localStorage
 */
export const getScheduledReminders = () => {
    try {
        const stored = localStorage.getItem('baby-bloom-scheduled-reminders');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading scheduled reminders:', error);
        return [];
    }
};

/**
 * Save scheduled reminders to localStorage
 */
const saveScheduledReminders = (reminders) => {
    try {
        localStorage.setItem('baby-bloom-scheduled-reminders', JSON.stringify(reminders));
    } catch (error) {
        console.error('Error saving scheduled reminders:', error);
    }
};

/**
 * Remove a scheduled reminder
 */
const removeScheduledReminder = (reminderId) => {
    const reminders = getScheduledReminders();
    const filtered = reminders.filter(r => r.id !== reminderId);
    saveScheduledReminders(filtered);
};

/**
 * Get icon for reminder category
 */
const getCategoryIcon = (category) => {
    const icons = {
        feeding: '🍼',
        sleep: '😴',
        diaper: '🧷',
        health: '🩺',
        medication: '💊',
        appointment: '📅',
        vaccination: '💉',
        general: '⏰'
    };
    return icons[category] || '⏰';
};

/**
 * Check and trigger due reminders
 * This runs periodically to check for reminders that are due
 */
export const checkDueReminders = () => {
    const reminders = getScheduledReminders();
    const now = Date.now();
    const dueReminders = reminders.filter(r => {
        const dueTime = new Date(r.dueAt).getTime();
        return dueTime <= now && dueTime > (now - 60000); // Due within last minute
    });

    dueReminders.forEach(reminder => {
        showNotification(reminder.title, {
            id: reminder.id,
            body: reminder.body || reminder.title,
            icon: reminder.icon || getCategoryIcon(reminder.category),
            tag: `reminder-${reminder.id}`,
            requireInteraction: true
        });

        // Remove after showing
        removeScheduledReminder(reminder.id);
    });
};

/**
 * Start the reminder checking system
 * Checks for due reminders every minute
 */
export const startReminderChecker = () => {
    if (reminderCheckInterval) {
        return; // Already running
    }

    // Check immediately
    checkDueReminders();

    // Then check every minute
    reminderCheckInterval = setInterval(() => {
        checkDueReminders();
    }, 60000); // 1 minute
};

/**
 * Stop the reminder checking system
 */
export const stopReminderChecker = () => {
    if (reminderCheckInterval) {
        clearInterval(reminderCheckInterval);
        reminderCheckInterval = null;
    }
};

/**
 * Register service worker for background notifications
 */
export const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            // Try to register custom service worker, fallback to default PWA worker
            let registration;
            try {
                registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                console.log('Custom Service Worker registered:', registration);
            } catch (swError) {
                // If custom SW fails, the PWA plugin will handle it
                console.log('Custom service worker not found, using PWA default');
                // Check if PWA service worker is already registered
                registration = await navigator.serviceWorker.ready;
            }

            // Check for updates
            if (registration) {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('New service worker available');
                            }
                        });
                    }
                });
            }

            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }
    return null;
};

/**
 * Initialize notification service
 * Should be called when app starts
 */
export const initializeNotificationService = async () => {
    // Register service worker for background notifications
    await registerServiceWorker();

    // Request permission if not already granted/denied
    if (Notification.permission === 'default') {
        // Don't auto-request, let user request it manually
        console.log('Notification permission is default. User can enable in settings.');
    }

    // Start reminder checker
    startReminderChecker();

    // Re-schedule any existing reminders from localStorage
    rescheduleStoredReminders();
};

/**
 * Re-schedule reminders from stored data
 */
const rescheduleStoredReminders = () => {
    // This will be called by individual reminder systems
    // Each feature will handle its own reminder scheduling
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = () => {
    activeNotifications.clear();
    if ('serviceWorker' in navigator && 'Notification' in window) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
                registration.getNotifications().then(notifications => {
                    notifications.forEach(notification => notification.close());
                });
            });
        });
    }
};

/**
 * Format time until reminder
 */
export const getTimeUntil = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const future = new Date(dateStr);
    const diffMs = future - now;
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins <= 0) return 'Due now';
    if (diffMins < 60) return `In ${diffMins} min`;

    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;

    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
};

