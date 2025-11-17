import { useState, useEffect } from 'react';
import '../pages/Feeding.css';
import './FeedingReminder.css';

const FeedingReminder = ({ feedings, onClose }) => {
  const [reminderSettings, setReminderSettings] = useState(() => {
    const saved = localStorage.getItem('baby-bloom-feeding-reminders');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      interval: 3,
      adaptive: true,
      notifications: true
    };
  });

  const [nextReminder, setNextReminder] = useState(null);
  const [upcomingReminders, setUpcomingReminders] = useState([]);

  useEffect(() => {
    localStorage.setItem('baby-bloom-feeding-reminders', JSON.stringify(reminderSettings));
    calculateNextReminder();
  }, [reminderSettings, feedings]);

  const calculateNextReminder = () => {
    if (!reminderSettings.enabled || feedings.length === 0) {
      setNextReminder(null);
      return;
    }

    // Get last feeding
    const sorted = [...feedings].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    const lastFeeding = sorted[0];
    const lastFeedingTime = new Date(lastFeeding.timestamp);

    let intervalHours = reminderSettings.interval;

    // Adaptive interval based on recent pattern
    if (reminderSettings.adaptive && sorted.length > 3) {
      const recentFeedings = sorted.slice(0, 4);
      const intervals = [];
      for (let i = 1; i < recentFeedings.length; i++) {
        const diff = (new Date(recentFeedings[i-1].timestamp) - new Date(recentFeedings[i].timestamp)) / (1000 * 60 * 60);
        intervals.push(diff);
      }
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      intervalHours = Math.max(2, Math.min(4, Math.round(avgInterval * 10) / 10));
    }

    const nextTime = new Date(lastFeedingTime.getTime() + intervalHours * 60 * 60 * 1000);
    
    setNextReminder({
      time: nextTime,
      interval: intervalHours
    });

    // Calculate next 3 reminders
    const upcoming = [];
    for (let i = 1; i <= 3; i++) {
      const time = new Date(nextTime.getTime() + (i * intervalHours * 60 * 60 * 1000));
      upcoming.push(time);
    }
    setUpcomingReminders(upcoming);
  };

  const getTimeUntil = (time) => {
    const now = new Date();
    const diff = time - now;
    
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    if (minutes === 0) {
      return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `in ${hours}h ${minutes}m`;
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
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

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Baby Bloom', {
          body: 'Feeding reminders enabled!',
          icon: '🍼'
        });
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="reminder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reminder-header">
          <h2>⏰ Feeding Reminders</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="reminder-content">
          {/* Settings */}
          <div className="reminder-section">
            <h3>Settings</h3>
            <div className="reminder-settings">
              <div className="setting-row">
                <div>
                  <div className="setting-label">Enable Reminders</div>
                  <div className="setting-description">Get notifications for feeding times</div>
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
                      onClick={requestNotificationPermission}
                      style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}
                    >
                      {Notification.permission === 'granted' ? '✅ Enabled' : 
                       Notification.permission === 'denied' ? '🚫 Blocked' : '🔔 Enable'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Next Reminder */}
          {reminderSettings.enabled && nextReminder && (
            <div className="reminder-section">
              <h3>Next Feeding</h3>
              <div className="next-reminder-card">
                <div className="reminder-icon">🍼</div>
                <div className="reminder-info">
                  <div className="reminder-time">{formatTime(nextReminder.time)}</div>
                  <div className="reminder-until">{getTimeUntil(nextReminder.time)}</div>
                  {reminderSettings.adaptive && (
                    <div className="reminder-note">
                      Based on {nextReminder.interval.toFixed(1)}h average pattern
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Reminders */}
          {reminderSettings.enabled && upcomingReminders.length > 0 && (
            <div className="reminder-section">
              <h3>Upcoming Schedule</h3>
              <div className="upcoming-list">
                {upcomingReminders.map((time, index) => (
                  <div key={index} className="upcoming-item">
                    <div className="upcoming-time">{formatTime(time)}</div>
                    <div className="upcoming-relative">{getTimeUntil(time)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="reminder-section">
            <div className="reminder-tips">
              <div className="tip-icon">💡</div>
              <div>
                <strong>Tip:</strong> Adaptive reminders learn from your baby's feeding pattern and adjust automatically for better accuracy.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedingReminder;
