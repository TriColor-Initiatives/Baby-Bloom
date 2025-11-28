import { useState, useEffect, useRef } from 'react';
import {
    requestNotificationPermission,
    getNotificationPermission,
    scheduleReminder,
    cancelReminder,
    showNotification
} from '../services/notificationService';
import { syncSleepReminders } from '../services/reminderSyncService';
import '../pages/sleep.css';

const STORAGE_KEY = 'baby-bloom-sleep-reminders';

const SleepReminder = ({ sleeps, onClose }) => {
    const [reminderSettings, setReminderSettings] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {
            enabled: false,
            napReminders: true,
            bedtimeReminders: true,
            napTime: '14:00', // Default 2 PM
            bedtime: '20:00', // Default 8 PM
            notifications: true
        };
    });

    const scheduledReminderIdsRef = useRef([]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reminderSettings));
        scheduleSleepReminders();

        // Sync to reminders page
        syncSleepReminders(reminderSettings);
    }, [reminderSettings, sleeps]);

    const scheduleSleepReminders = () => {
        // Cancel existing reminders
        scheduledReminderIdsRef.current.forEach(id => cancelReminder(id));
        scheduledReminderIdsRef.current = [];

        if (!reminderSettings.enabled || !reminderSettings.notifications) {
            return;
        }

        const today = new Date();

        // Schedule reminders for the next 7 days
        for (let day = 0; day < 7; day++) {
            const reminderDate = new Date(today);
            reminderDate.setDate(reminderDate.getDate() + day);
            reminderDate.setHours(0, 0, 0, 0);

            // Schedule nap reminder
            if (reminderSettings.napReminders) {
                const [napHour, napMin] = reminderSettings.napTime.split(':').map(Number);
                const napTime = new Date(reminderDate);
                napTime.setHours(napHour, napMin, 0, 0);

                // Only schedule if in the future
                if (napTime > today) {
                    const napReminderId = `sleep-nap-${napTime.getTime()}`;
                    scheduledReminderIdsRef.current.push(napReminderId);

                    scheduleReminder({
                        id: napReminderId,
                        title: '😴 Nap Time Reminder',
                        dueAt: napTime.toISOString(),
                        body: 'Time for your baby\'s nap!',
                        icon: '😴',
                        category: 'sleep'
                    });
                }
            }

            // Schedule bedtime reminder
            if (reminderSettings.bedtimeReminders) {
                const [bedHour, bedMin] = reminderSettings.bedtime.split(':').map(Number);
                const bedtime = new Date(reminderDate);
                bedtime.setHours(bedHour, bedMin, 0, 0);

                // Only schedule if in the future
                if (bedtime > today) {
                    const bedReminderId = `sleep-bedtime-${bedtime.getTime()}`;
                    scheduledReminderIdsRef.current.push(bedReminderId);

                    scheduleReminder({
                        id: bedReminderId,
                        title: '🌙 Bedtime Reminder',
                        dueAt: bedtime.toISOString(),
                        body: 'Time to start your baby\'s bedtime routine!',
                        icon: '🌙',
                        category: 'sleep'
                    });
                }
            }
        }
    };

    const handleToggle = (key) => {
        setReminderSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleTimeChange = (key, value) => {
        setReminderSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleRequestNotificationPermission = async () => {
        const permission = await requestNotificationPermission();
        if (permission === 'granted') {
            showNotification('Baby Bloom', {
                body: 'Sleep reminders enabled!',
                icon: '😴'
            });
            scheduleSleepReminders();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="reminder-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="reminder-header">
                    <h2>😴 Sleep Reminders</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="reminder-content">
                    <div className="reminder-section">
                        <h3>Settings</h3>
                        <div className="reminder-settings">
                            <div className="setting-row">
                                <div>
                                    <div className="setting-label">Enable Reminders</div>
                                    <div className="setting-description">Get notifications for sleep times</div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={reminderSettings.enabled}
                                        onChange={() => handleToggle('enabled')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            {reminderSettings.enabled && (
                                <>
                                    <div className="setting-row">
                                        <div>
                                            <div className="setting-label">Nap Reminders</div>
                                            <div className="setting-description">Remind for daily naps</div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={reminderSettings.napReminders}
                                                onChange={() => handleToggle('napReminders')}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    {reminderSettings.napReminders && (
                                        <div className="setting-row">
                                            <div>
                                                <div className="setting-label">Nap Time</div>
                                                <div className="setting-description">When to remind for nap</div>
                                            </div>
                                            <input
                                                type="time"
                                                value={reminderSettings.napTime}
                                                onChange={(e) => handleTimeChange('napTime', e.target.value)}
                                                style={{ padding: 'var(--spacing-sm)', fontSize: '1rem' }}
                                            />
                                        </div>
                                    )}

                                    <div className="setting-row">
                                        <div>
                                            <div className="setting-label">Bedtime Reminders</div>
                                            <div className="setting-description">Remind for bedtime routine</div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={reminderSettings.bedtimeReminders}
                                                onChange={() => handleToggle('bedtimeReminders')}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    {reminderSettings.bedtimeReminders && (
                                        <div className="setting-row">
                                            <div>
                                                <div className="setting-label">Bedtime</div>
                                                <div className="setting-description">When to remind for bedtime</div>
                                            </div>
                                            <input
                                                type="time"
                                                value={reminderSettings.bedtime}
                                                onChange={(e) => handleTimeChange('bedtime', e.target.value)}
                                                style={{ padding: 'var(--spacing-sm)', fontSize: '1rem' }}
                                            />
                                        </div>
                                    )}

                                    <div className="setting-row">
                                        <div>
                                            <div className="setting-label">Browser Notifications</div>
                                            <div className="setting-description">Allow desktop notifications</div>
                                        </div>
                                        <button
                                            className="btn btn-secondary-outline"
                                            onClick={handleRequestNotificationPermission}
                                            style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}
                                        >
                                            {getNotificationPermission() === 'granted' ? '✅ Enabled' :
                                                getNotificationPermission() === 'denied' ? '🚫 Blocked' : '🔔 Enable'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="reminder-section">
                        <div className="reminder-tips">
                            <div className="tip-icon">💡</div>
                            <div>
                                <strong>Tip:</strong> Consistent sleep schedules help babies develop healthy sleep patterns. Set reminders to maintain routine.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SleepReminder;

