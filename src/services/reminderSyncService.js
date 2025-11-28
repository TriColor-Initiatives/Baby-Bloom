/**
 * Unified Reminder Sync Service
 * Aggregates reminders from all features and syncs them to the Reminders page
 */

const REMINDERS_STORAGE_KEY = 'baby-bloom-reminders';
const SYNCED_REMINDERS_KEY = 'baby-bloom-synced-reminders';

/**
 * Get all reminders from all sources and merge them
 */
export const getAllReminders = () => {
    // Get manual reminders
    const manualReminders = JSON.parse(localStorage.getItem(REMINDERS_STORAGE_KEY) || '[]');

    // Get synced reminders from all features
    const syncedReminders = getSyncedReminders();

    // Merge and deduplicate
    const allReminders = [...manualReminders, ...syncedReminders];

    // Sort by due date
    return allReminders.sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
};

/**
 * Get synced reminders from all features
 */
const getSyncedReminders = () => {
    try {
        const synced = JSON.parse(localStorage.getItem(SYNCED_REMINDERS_KEY) || '[]');
        return Array.isArray(synced) ? synced : [];
    } catch (error) {
        console.error('Error loading synced reminders:', error);
        return [];
    }
};

/**
 * Save synced reminders
 */
const saveSyncedReminders = (reminders) => {
    try {
        localStorage.setItem(SYNCED_REMINDERS_KEY, JSON.stringify(reminders));
    } catch (error) {
        console.error('Error saving synced reminders:', error);
    }
};

/**
 * Add or update a synced reminder
 */
export const syncReminder = (reminderData) => {
    const synced = getSyncedReminders();
    const existingIndex = synced.findIndex(r => r.sourceId === reminderData.sourceId && r.sourceType === reminderData.sourceType);

    const reminder = {
        id: reminderData.id || `synced-${reminderData.sourceType}-${reminderData.sourceId}`,
        title: reminderData.title,
        dueAt: reminderData.dueAt,
        category: reminderData.category,
        icon: reminderData.icon || getCategoryIcon(reminderData.category),
        notes: reminderData.notes || '',
        completed: false,
        sourceType: reminderData.sourceType, // 'feeding', 'sleep', 'appointment', etc.
        sourceId: reminderData.sourceId, // ID of the source record
        isSynced: true, // Mark as synced reminder
        createdAt: reminderData.createdAt || new Date().toISOString()
    };

    if (existingIndex >= 0) {
        synced[existingIndex] = reminder;
    } else {
        synced.push(reminder);
    }

    saveSyncedReminders(synced);
    notifyRemindersUpdated();
};

/**
 * Remove a synced reminder
 */
export const removeSyncedReminder = (sourceType, sourceId) => {
    const synced = getSyncedReminders();
    const filtered = synced.filter(r => !(r.sourceType === sourceType && r.sourceId === sourceId));
    saveSyncedReminders(filtered);
    notifyRemindersUpdated();
};

/**
 * Sync feeding reminders
 */
export const syncFeedingReminders = (feedings, reminderSettings) => {
    if (!reminderSettings?.enabled || !feedings || feedings.length === 0) {
        // Remove all feeding reminders
        const synced = getSyncedReminders();
        const filtered = synced.filter(r => r.sourceType !== 'feeding');
        saveSyncedReminders(filtered);
        notifyRemindersUpdated();
        return;
    }

    // Get last feeding
    const sorted = [...feedings].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const lastFeeding = sorted[0];
    const lastFeedingTime = new Date(lastFeeding.timestamp);

    let intervalHours = reminderSettings.interval || 3;

    // Adaptive interval
    if (reminderSettings.adaptive && sorted.length > 3) {
        const recentFeedings = sorted.slice(0, 4);
        const intervals = [];
        for (let i = 1; i < recentFeedings.length; i++) {
            const diff = (new Date(recentFeedings[i - 1].timestamp) - new Date(recentFeedings[i].timestamp)) / (1000 * 60 * 60);
            intervals.push(diff);
        }
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        intervalHours = Math.max(2, Math.min(4, Math.round(avgInterval * 10) / 10));
    }

    const nextTime = new Date(lastFeedingTime.getTime() + intervalHours * 60 * 60 * 1000);

    syncReminder({
        sourceType: 'feeding',
        sourceId: 'next-feeding',
        title: '🍼 Time for Feeding',
        dueAt: nextTime.toISOString(),
        category: 'feeding',
        notes: `Next feeding in ${intervalHours.toFixed(1)} hours`,
        icon: '🍼'
    });
};

/**
 * Sync sleep reminders
 */
export const syncSleepReminders = (reminderSettings) => {
    if (!reminderSettings?.enabled) {
        const synced = getSyncedReminders();
        const filtered = synced.filter(r => r.sourceType !== 'sleep');
        saveSyncedReminders(filtered);
        notifyRemindersUpdated();
        return;
    }

    const today = new Date();
    const reminders = [];

    // Nap reminder
    if (reminderSettings.napReminders) {
        const [napHour, napMin] = (reminderSettings.napTime || '14:00').split(':').map(Number);
        const napTime = new Date(today);
        napTime.setHours(napHour, napMin, 0, 0);
        if (napTime < today) napTime.setDate(napTime.getDate() + 1);

        reminders.push({
            sourceType: 'sleep',
            sourceId: 'nap-daily',
            title: '😴 Nap Time',
            dueAt: napTime.toISOString(),
            category: 'sleep',
            notes: 'Time for your baby\'s nap',
            icon: '😴'
        });
    }

    // Bedtime reminder
    if (reminderSettings.bedtimeReminders) {
        const [bedHour, bedMin] = (reminderSettings.bedtime || '20:00').split(':').map(Number);
        const bedtime = new Date(today);
        bedtime.setHours(bedHour, bedMin, 0, 0);
        if (bedtime < today) bedtime.setDate(bedtime.getDate() + 1);

        reminders.push({
            sourceType: 'sleep',
            sourceId: 'bedtime-daily',
            title: '🌙 Bedtime',
            dueAt: bedtime.toISOString(),
            category: 'sleep',
            notes: 'Time to start bedtime routine',
            icon: '🌙'
        });
    }

    // Replace old sleep reminders
    const synced = getSyncedReminders();
    const filtered = synced.filter(r => r.sourceType !== 'sleep');
    saveSyncedReminders([...filtered, ...reminders.map(r => ({
        ...r,
        id: `synced-${r.sourceType}-${r.sourceId}`,
        completed: false,
        isSynced: true,
        createdAt: new Date().toISOString()
    }))]);
    notifyRemindersUpdated();
};

/**
 * Sync appointment reminders
 */
export const syncAppointmentReminders = (appointments) => {
    if (!appointments || appointments.length === 0) {
        const synced = getSyncedReminders();
        const filtered = synced.filter(r => r.sourceType !== 'appointment');
        saveSyncedReminders(filtered);
        notifyRemindersUpdated();
        return;
    }

    const reminders = [];
    const now = new Date();

    appointments.forEach(apt => {
        if (!apt.reminder) return;

        const appointmentDate = new Date(`${apt.date}T${apt.time}`);
        if (appointmentDate <= now) return;

        const icon = getAppointmentIcon(apt.type);
        const title = apt.reason || 'Appointment';

        // 24 hours before
        const reminder24h = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
        if (reminder24h > now) {
            reminders.push({
                sourceType: 'appointment',
                sourceId: `${apt.id}-24h`,
                title: `📅 ${title} - Tomorrow`,
                dueAt: reminder24h.toISOString(),
                category: 'appointment',
                notes: `Appointment with ${apt.doctor} at ${apt.location}`,
                icon: icon
            });
        }

        // 1 hour before
        const reminder1h = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
        if (reminder1h > now) {
            reminders.push({
                sourceType: 'appointment',
                sourceId: `${apt.id}-1h`,
                title: `📅 ${title} - In 1 Hour`,
                dueAt: reminder1h.toISOString(),
                category: 'appointment',
                notes: `Appointment with ${apt.doctor} at ${apt.location}`,
                icon: icon
            });
        }

        // Day of (30 min before)
        const reminderDay = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
        if (reminderDay > now) {
            reminders.push({
                sourceType: 'appointment',
                sourceId: `${apt.id}-day`,
                title: `📅 ${title} - Starting Soon`,
                dueAt: reminderDay.toISOString(),
                category: 'appointment',
                notes: `Appointment with ${apt.doctor} at ${apt.location}`,
                icon: icon
            });
        }
    });

    // Replace appointment reminders
    const synced = getSyncedReminders();
    const filtered = synced.filter(r => r.sourceType !== 'appointment');
    saveSyncedReminders([...filtered, ...reminders.map(r => ({
        ...r,
        id: `synced-${r.sourceType}-${r.sourceId}`,
        completed: false,
        isSynced: true,
        createdAt: new Date().toISOString()
    }))]);
    notifyRemindersUpdated();
};

/**
 * Sync vaccination reminders
 */
export const syncVaccinationReminders = (vaccines, babyBirthDate) => {
    if (!babyBirthDate || !vaccines || vaccines.length === 0) {
        const synced = getSyncedReminders();
        const filtered = synced.filter(r => r.sourceType !== 'vaccination');
        saveSyncedReminders(filtered);
        notifyRemindersUpdated();
        return;
    }

    const reminders = [];
    const birthDate = new Date(babyBirthDate);
    const today = new Date();

    vaccines.forEach(vaccine => {
        if (vaccine.status === 'completed') return;

        const dueDate = new Date(birthDate);
        dueDate.setMonth(dueDate.getMonth() + vaccine.months);
        if (dueDate <= today) return;

        // 1 week before
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - 7);

        const reminderTime = reminderDate > today ? reminderDate : new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
        if (reminderTime <= today) return;

        reminders.push({
            sourceType: 'vaccination',
            sourceId: vaccine.id,
            title: `💉 Upcoming: ${vaccine.name}`,
            dueAt: reminderTime.toISOString(),
            category: 'vaccination',
            notes: `${vaccine.name} (${vaccine.dose}) is due soon`,
            icon: '💉'
        });
    });

    // Replace vaccination reminders
    const synced = getSyncedReminders();
    const filtered = synced.filter(r => r.sourceType !== 'vaccination');
    saveSyncedReminders([...filtered, ...reminders.map(r => ({
        ...r,
        id: `synced-${r.sourceType}-${r.sourceId}`,
        completed: false,
        isSynced: true,
        createdAt: new Date().toISOString()
    }))]);
    notifyRemindersUpdated();
};

/**
 * Sync medication reminders
 */
export const syncMedicationReminders = (medications) => {
    if (!medications || medications.length === 0) {
        const synced = getSyncedReminders();
        const filtered = synced.filter(r => r.sourceType !== 'medication');
        saveSyncedReminders(filtered);
        notifyRemindersUpdated();
        return;
    }

    const reminders = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    medications.forEach(med => {
        if (!med.enabled) return;

        const startDate = new Date(med.startDate);
        const endDate = med.endDate ? new Date(med.endDate) : null;
        if (startDate > today || (endDate && endDate < today)) return;

        const times = med.times || ['09:00'];
        times.forEach((time, index) => {
            const [hours, minutes] = time.split(':').map(Number);
            const reminderTime = new Date();
            reminderTime.setHours(hours, minutes, 0, 0);
            if (reminderTime < new Date()) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }
            if (endDate && reminderTime > endDate) return;

            reminders.push({
                sourceType: 'medication',
                sourceId: `${med.id}-${index}`,
                title: `💊 ${med.name}${med.dosage ? ` (${med.dosage})` : ''}`,
                dueAt: reminderTime.toISOString(),
                category: 'medication',
                notes: `Time to give ${med.name}`,
                icon: '💊'
            });
        });
    });

    // Replace medication reminders
    const synced = getSyncedReminders();
    const filtered = synced.filter(r => r.sourceType !== 'medication');
    saveSyncedReminders([...filtered, ...reminders.map(r => ({
        ...r,
        id: `synced-${r.sourceType}-${r.sourceId}`,
        completed: false,
        isSynced: true,
        createdAt: new Date().toISOString()
    }))]);
    notifyRemindersUpdated();
};

/**
 * Sync diaper reminders
 */
export const syncDiaperReminders = (diapers, reminderSettings) => {
    if (!reminderSettings?.enabled || !diapers || diapers.length === 0) {
        const synced = getSyncedReminders();
        const filtered = synced.filter(r => r.sourceType !== 'diaper');
        saveSyncedReminders(filtered);
        notifyRemindersUpdated();
        return;
    }

    const sorted = [...diapers].sort((a, b) =>
        new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
    );
    const lastDiaper = sorted[0];
    const lastDiaperTime = new Date(lastDiaper.timestamp || lastDiaper.date);

    let intervalHours = reminderSettings.interval || 3;
    if (reminderSettings.adaptive && sorted.length > 3) {
        const recentDiapers = sorted.slice(0, 4);
        const intervals = [];
        for (let i = 1; i < recentDiapers.length; i++) {
            const diff = (new Date(recentDiapers[i - 1].timestamp || recentDiapers[i - 1].date) -
                new Date(recentDiapers[i].timestamp || recentDiapers[i].date)) / (1000 * 60 * 60);
            intervals.push(diff);
        }
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        intervalHours = Math.max(2, Math.min(4, Math.round(avgInterval * 10) / 10));
    }

    const nextTime = new Date(lastDiaperTime.getTime() + intervalHours * 60 * 60 * 1000);

    syncReminder({
        sourceType: 'diaper',
        sourceId: 'next-diaper',
        title: '🧷 Diaper Check',
        dueAt: nextTime.toISOString(),
        category: 'diaper',
        notes: `Time to check diaper (${intervalHours.toFixed(1)}h since last change)`,
        icon: '🧷'
    });
};

/**
 * Helper functions
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

const getAppointmentIcon = (type) => {
    const icons = {
        vaccination: '💉',
        specialist: '🧑‍⚕️',
        emergency: '🚨',
        followup: '🔁',
        checkup: '🩺'
    };
    return icons[type] || '🩺';
};

/**
 * Notify that reminders have been updated
 */
const notifyRemindersUpdated = () => {
    window.dispatchEvent(new CustomEvent('reminders-synced'));
};

