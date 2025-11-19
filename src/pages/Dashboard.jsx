import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';
import WelcomeScreen from '../components/onboarding/WelcomeScreen';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { babies, activeBaby } = useBaby();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWelcome, setShowWelcome] = useState(false);
  const [reminders, setReminders] = useState([]);

  // Check if user needs to add a baby
  useEffect(() => {
    if (babies.length === 0) {
      setShowWelcome(true);
    }
  }, [babies]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Load reminders from localStorage
  const loadReminders = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('baby-bloom-reminders') || '[]');
      const loadedReminders = Array.isArray(saved) ? saved : [];
      console.log('Dashboard: Loaded reminders:', loadedReminders);
      setReminders(loadedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
      setReminders([]);
    }
  };

  // Reload reminders when navigating to Dashboard
  useEffect(() => {
    if (location.pathname === '/') {
      loadReminders();
    }
  }, [location.pathname]);

  // Load reminders on mount and when page becomes visible
  useEffect(() => {
    loadReminders();

    // Listen for storage events (from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'baby-bloom-reminders') {
        loadReminders();
      }
    };

    // Listen for focus/visibility changes (when user navigates back to this tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadReminders();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also listen for custom event from Reminders page (same tab)
    const handleReminderUpdate = () => {
      console.log('Dashboard: Received reminders-updated event');
      loadReminders();
    };

    window.addEventListener('reminders-updated', handleReminderUpdate);
    
    // Also reload when navigating back to Dashboard (using focus event)
    const handleFocus = () => {
      loadReminders();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('reminders-updated', handleReminderUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Check if baby is younger than 6 months (0-6 months)
  const isBabyUnder6Months = () => {
    if (!activeBaby || !activeBaby.dateOfBirth) return false;
    const today = new Date();
    const birthDate = new Date(activeBaby.dateOfBirth);
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
      (today.getMonth() - birthDate.getMonth());
    return months < 6;
  };

  const canShowCryHelper = isBabyUnder6Months();

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTimeAgo = (date) => {
    if (!date) return 'No data';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };


  // Build Recent Activity from real data across modules
  const getAllFeedings = () => {
    try { return JSON.parse(localStorage.getItem('baby-bloom-feedings') || '[]'); } catch { return []; }
  };
  const getAllSleep = () => {
    try { return JSON.parse(localStorage.getItem('baby-bloom-sleep') || '[]'); } catch { return []; }
  };
  const getAllDiapers = () => {
    try { return JSON.parse(localStorage.getItem('baby-bloom-diapers') || '[]'); } catch { return []; }
  };
  const getAllHealth = () => {
    try { return JSON.parse(localStorage.getItem('baby-bloom-health') || '[]'); } catch { return []; }
  };

  const allFeedings = getAllFeedings();
  const allSleep = getAllSleep();
  const allDiapers = getAllDiapers();
  const allHealth = getAllHealth();

  // Get photos from localStorage
  const getAllPhotos = () => {
    try { 
      const photos = JSON.parse(localStorage.getItem('baby-bloom-photos') || '[]');
      return Array.isArray(photos) ? photos : [];
    } catch { 
      return []; 
    }
  };
  const allPhotos = getAllPhotos();

  const safeDate = (d) => (d ? new Date(d) : null);

  const getLatestEntryDate = (items) => {
    if (!items?.length) return null;
    return items.reduce((latest, item) => {
      const date = safeDate(item.timestamp || item.date);
      if (!date) return latest;
      if (!latest || date > latest) return date;
      return latest;
    }, null);
  };

  const analysisSources = [
    { id: 'feedings', label: 'Feedings', icon: '🍼', color: 'var(--primary)', data: allFeedings },
    { id: 'sleep', label: 'Sleep Sessions', icon: '😴', color: 'var(--secondary, #9c6cff)', data: allSleep },
    { id: 'health', label: 'Health Records', icon: '🩺', color: 'var(--success, #25c685)', data: allHealth },
    { id: 'photos', label: 'Photos', icon: '📷', color: 'var(--accent, #ff6b9d)', data: allPhotos },
  ];

  const statActions = {
    feedings: () => navigate('/feeding'),
    sleep: () => navigate('/sleep'),
    health: () => navigate('/health'),
    photos: () => navigate('/photos'),
  };

  const handleStatKeyDown = (event, action) => {
    if (!action) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const analysisStats = analysisSources.map((source) => {
    const latest = getLatestEntryDate(source.data);
    // For photos, show count differently
    const subtitle = source.id === 'photos' 
      ? (source.data.length ? `${source.data.length} photo${source.data.length !== 1 ? 's' : ''} saved` : 'No photos yet')
      : (source.data.length ? `Last entry ${getTimeAgo(latest)}` : 'No entries yet');
    
    return {
      id: source.id,
      label: source.label,
      icon: source.icon,
      color: source.color,
      count: source.data.length,
      subtitle: subtitle,
      action: statActions[source.id]
    };
  });

  const totalLogs = analysisStats.reduce((sum, stat) => sum + stat.count, 0);
  const trackedCategories = analysisStats.filter((stat) => stat.count > 0).length;
  const donutGradient = totalLogs > 0
    ? (() => {
        let cumulative = 0;
        const segments = analysisStats
          .filter((stat) => stat.count > 0)
          .map((stat) => {
            const start = (cumulative / totalLogs) * 100;
            cumulative += stat.count;
            const end = (cumulative / totalLogs) * 100;
            return `${stat.color} ${start}% ${end}%`;
          });
        return `conic-gradient(${segments.join(',')})`;
      })()
    : 'conic-gradient(var(--surface-variant, #e5e7f8) 0% 100%)';

  const formatSleepTitle = (s) => {
    const kind = (s.type || 'sleep').toString().toLowerCase();
    const dur = s.duration ? ` for ${s.duration.replace(/^0:/, '')}` : '';
    return `${kind === 'nap' ? 'Nap' : 'Sleep'}${dur}`;
  };
  const formatFeedingTitle = (f) => {
    const kind = (f.type || 'feeding').toString().toLowerCase();
    const amount = f.amount || f.volume || f.quantity;
    const unit = f.unit || (amount ? (f.type === 'solid' ? 'g' : 'ml') : '');
    const amtText = amount ? ` ${amount}${unit}` : '';
    const label = kind === 'bottle' ? 'Bottle' : kind === 'breast' ? 'Breastfeeding' : kind === 'solid' ? 'Solid food' : 'Feeding';
    return `${label}${amtText}`;
  };
  const formatDiaperTitle = (d) => {
    const t = (d.type || '').toString().toLowerCase();
    const label = t === 'wet' ? 'Diaper change - wet' : t === 'dirty' ? 'Diaper change - dirty' : t === 'both' ? 'Diaper change - wet & dirty' : 'Diaper change';
    return label;
  };
  const getHealthIcon = (t) => {
    const m = (t || '').toString().toLowerCase();
    if (m.includes('check')) return '🩺';
    if (m.includes('vaccine') || m.includes('immun')) return '💉';
    if (m.includes('med')) return '💊';
    if (m.includes('growth') || m.includes('measure')) return '📈';
    if (m.includes('allergy')) return '🤧';
    return '🏥';
  };

  const recentActivities = (() => {
    const feedings = allFeedings.map((f) => ({
      id: `f-${f.id || f.timestamp}`,
      icon: '🍼',
      title: formatFeedingTitle(f),
      when: f.timestamp || f.date,
      bg: 'var(--primary-light)'
    }));
    const sleeps = allSleep.map((s) => ({
      id: `s-${s.id || s.timestamp}`,
      icon: '💤',
      title: formatSleepTitle(s),
      when: s.timestamp || s.date,
      bg: 'var(--secondary-light)'
    }));
    const diapers = allDiapers.map((d) => ({
      id: `d-${d.id || d.timestamp}`,
      icon: '🧷',
      title: formatDiaperTitle(d),
      when: d.timestamp || d.date,
      bg: 'var(--accent)'
    }));
    const health = allHealth.map((h) => ({
      id: `h-${h.id || h.date}`,
      icon: getHealthIcon(h.type),
      title: h.title || (h.type ? h.type[0].toUpperCase() + h.type.slice(1) : 'Health record'),
      when: h.date,
      bg: 'var(--success)'
    }));

    return [...feedings, ...sleeps, ...diapers, ...health]
      .filter((i) => !!safeDate(i.when))
      .sort((a, b) => new Date(b.when) - new Date(a.when))
      .slice(0, 8) // show latest 8
      .map((i) => ({ ...i, time: getTimeAgo(i.when) }));
  })();

  const getTimeUntil = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const future = new Date(dateStr);
    const diffMs = future - now;
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins <= 0) return 'Due';
    if (diffMins < 60) return `In ${diffMins} min`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };
  
  const upcomingReminders = reminders
    .filter(r => {
      // Include reminders that are not completed
      if (r.completed === true) return false;
      
      // Include all non-completed reminders (due now, past due, or future)
      // This ensures we show reminders even if they're slightly past due
      return true;
    })
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      icon: r.icon || '⏰',
      title: r.title,
      time: getTimeUntil(r.dueAt)
    }));

  // Show welcome screen if no babies
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <h2>{getGreeting()}, {user?.displayName?.split(' ')[0] || 'Parent'}! 👋</h2>
        <p>
          {activeBaby ? (
            <>Tracking <strong>{activeBaby.name}</strong>'s day</>
          ) : (
            <>Here's what's happening with your little one today</>
          )}
        </p>
      </div>

      <div className="section-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="analysis-overview">
          <div className="analysis-donut-card">
            <div className="section-header">
              <h3 className="section-title">Today's Overview</h3>
            </div>
            <div className="analysis-donut-ring" style={{ backgroundImage: donutGradient }}>
              <div className="analysis-donut-inner">
                <span className="analysis-total">{totalLogs}</span>
                <small>Total logs</small>
                <small>{trackedCategories || 0} categories</small>
              </div>
            </div>
            <div className="analysis-donut-legend">
              {analysisStats.map((stat) => (
                <div key={stat.id} className="analysis-legend-item">
                  <span
                    className="analysis-legend-dot"
                    style={{ background: stat.color }}
                  />
                  <span>{stat.label}</span>
                  <strong>{stat.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-stats-card category-card">
            <div className="section-header" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <h3 className="section-title">Category Breakdown</h3>
            </div>
            <div className="analysis-stats-list">
              {analysisStats.map((stat) => (
                <div
                  key={`${stat.id}-row`}
                  className="analysis-stat-row"
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${stat.label}`}
                  onClick={stat.action}
                  onKeyDown={(event) => handleStatKeyDown(event, stat.action)}
                >
                  <div className="analysis-stat-info">
                    <span className="analysis-stat-icon" style={{ color: stat.color }}>
                      {stat.icon}
                    </span>
                    <div>
                      <div className="analysis-stat-label">{stat.label}</div>
                      <div className="analysis-stat-subtitle">{stat.subtitle}</div>
                    </div>
                  </div>
                  <div className="analysis-stat-value">{stat.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-stats-card">
            <div className="section-header">
              <h3 className="section-title">Upcoming Reminders</h3>
              <Link to="/reminders" className="section-link">All →</Link>
            </div>
            <div className="reminders">
              {upcomingReminders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">⏰</div>
                  <h3>No reminders yet</h3>
                  <p>Create reminders for feedings, vitamins, checkups and more</p>
                  <button className="btn btn-primary btn-large" onClick={() => navigate('/reminders?add=true')}>
                    <span>➕</span><span>Add a Reminder</span>
                  </button>
                </div>
              ) : (
                upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="reminder-item">
                    <span className="reminder-icon">{reminder.icon}</span>
                    <div className="reminder-content">
                      <div className="reminder-title">{reminder.title}</div>
                      <div className="reminder-time">{reminder.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {canShowCryHelper && (
        <div className="cry-helper-card">
          <div className="cry-helper-content">
            <div>
              <p className="cry-helper-eyebrow">Need quick help?</p>
              <h3>Is your baby crying? Know the reason faster</h3>
              <p>Jump into the Baby Cry Reason Finder to get guided suggestions and calming tips based on common triggers.</p>
              <div className="cry-helper-tags">
                <span>AI-guided</span>
                <span>2 min flow</span>
                <span>Trusted by parents</span>
              </div>
            </div>
            <div className="cry-helper-cta">
              <div className="cry-helper-icon">🤱</div>
              <a
                className="btn btn-primary cry-helper-btn"
                href="https://app.tricolorinitiatives.com/baby-cry-reason-finder/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Cry Finder
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Recent Activity</h3>
          <Link to="/timeline" className="section-link">View All →</Link>
        </div>
        <div className="timeline">
          {recentActivities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🗓️</div>
              <h3>No recent activity yet</h3>
              <p>Log feeding, sleep, diapers, or health to see them here</p>
              <div className="empty-tips">
                <div className="empty-tip"><span>🍼</span><span>Use the Feeding, Sleep, Diaper or Health pages to log your first entry</span></div>
                <div className="empty-tip"><span>⏱️</span><span>Activities appear instantly after saving</span></div>
              </div>
              <button className="btn btn-primary btn-large" onClick={() => navigate('/feeding?add=true')}>
                <span>➕</span><span>Log a Feeding</span>
              </button>
            </div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-icon" style={{ background: activity.bg }}>
                  {activity.icon}
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">{activity.title}</div>
                  <div className="timeline-time">{activity.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Weekly Insights</h3>
        </div>
        {(() => {
          // Check if there's any data in the current week (last 7 days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          sevenDaysAgo.setHours(0, 0, 0, 0);
          
          const hasWeeklyData = [
            ...allFeedings,
            ...allSleep,
            ...allDiapers,
            ...allHealth
          ].some(item => {
            const itemDate = safeDate(item.timestamp || item.date);
            return itemDate && itemDate >= sevenDaysAgo;
          });

          if (!hasWeeklyData) {
            // Empty state - no data for current week
            return (
              <div className="weekly-insights-empty">
                <div className="empty-icon">📊</div>
                <p className="empty-message">
                  No records yet — your weekly insights will appear here once you start logging activities.
                </p>
              </div>
            );
          }

          // Full insights - data exists
          return (
            <div className="weekly-insights-content">
              <div>📊</div>
              <h4>Your Baby's Week at a Glance</h4>
              <p>
                This week your baby had consistent sleep patterns and tried 2 new foods!
              </p>
              <Link to="/growth" className="section-link">View Detailed Report →</Link>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Dashboard;


