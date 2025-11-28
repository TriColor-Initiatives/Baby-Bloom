import { useState, useEffect, useRef } from 'react';
import {
    requestNotificationPermission,
    getNotificationPermission,
    scheduleReminder,
    cancelReminder,
    showNotification
} from '../services/notificationService';
import { syncDiaperReminders } from '../services/reminderSyncService';

const STORAGE_KEY = 'baby-bloom-diaper-reminders';

const DiaperReminder = ({ diapers, onClose }) => {
    const [reminderSettings, setReminderSettings] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {
            enabled: false,
            interval: 3, // hours
            adaptive: true,
            notifications: true
        };
    });

    const scheduledReminderIdRef = useRef(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reminderSettings));
        calculateNextReminder();

        // Sync to reminders page
        syncDiaperReminders(diapers, reminderSettings);
    }, [reminderSettings, diapers]);

    const calculateNextReminder = () => {
        if (!reminderSettings.enabled || diapers.length === 0) {
            if (scheduledReminderIdRef.current) {
                cancelReminder(scheduledReminderIdRef.current);
                scheduledReminderIdRef.current = null;
            }
            return;
        }

        // Get last diaper change
        const sorted = [...diapers].sort((a, b) =>
            new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
        );
        const lastDiaper = sorted[0];
        const lastDiaperTime = new Date(lastDiaper.timestamp || lastDiaper.date);

        let intervalHours = reminderSettings.interval;

        // Adaptive interval based on recent pattern
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

        // Cancel previous reminder
        if (scheduledReminderIdRef.current) {
            cancelReminder(scheduledReminderIdRef.current);
        }

        // Schedule new reminder
        if (reminderSettings.notifications && nextTime > new Date()) {
            const reminderId = `diaper-${nextTime.getTime()}`;
            scheduledReminderIdRef.current = reminderId;

            scheduleReminder({
                id: reminderId,
                title: '🧷 Diaper Check Reminder',
                dueAt: nextTime.toISOString(),
                body: `It's been ${intervalHours.toFixed(1)} hours since last diaper change. Time to check!`,
                icon: '🧷',
                category: 'diaper'
            });
        }
    };

    const handleToggle = (key) => {
        setReminderSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleIntervalChange = (e) => {
        setReminderSettings(prev => ({
            ...prev,
            interval: parseFloat(e.target.value)
        }));
    };

    const handleRequestNotificationPermission = async () => {
        const permission = await requestNotificationPermission();
        if (permission === 'granted') {
            showNotification('Baby Bloom', {
                body: 'Diaper reminders enabled!',
                icon: '🧷'
            });
            calculateNextReminder();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="reminder-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="reminder-header">
                    <h2>🧷 Diaper Reminders</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="reminder-content">
                    <div className="reminder-section">
                        <h3>Settings</h3>
                        <div className="reminder-settings">
                            <div className="setting-row">
                                <div>
                                    <div className="setting-label">Enable Reminders</div>
                                    <div className="setting-description">Get notifications for diaper checks</div>
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
                                            <div className="setting-label">Adaptive Interval</div>
                                            <div className="setting-description">Adjust based on baby's pattern</div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={reminderSettings.adaptive}
                                                onChange={() => handleToggle('adaptive')}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    {!reminderSettings.adaptive && (
                                        <div className="setting-row">
                                            <div>
                                                <div className="setting-label">Reminder Interval</div>
                                                <div className="setting-description">Hours between reminders</div>
                                            </div>
                                            <div className="interval-selector">
                                                <input
                                                    type="range"
                                                    min="2"
                                                    max="6"
                                                    step="0.5"
                                                    value={reminderSettings.interval}
                                                    onChange={handleIntervalChange}
                                                />
                                                <span className="interval-value">{reminderSettings.interval}h</span>
                                            </div>
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
                                <strong>Tip:</strong> Regular diaper checks help prevent diaper rash and keep your baby comfortable.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiaperReminder;

