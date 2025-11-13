import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';
import WelcomeScreen from '../components/onboarding/WelcomeScreen';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { babies, activeBaby } = useBaby();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWelcome, setShowWelcome] = useState(false);

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
    try { return JSON.parse(localStorage.getItem('babyFeedings') || '[]'); } catch { return []; }
  };
  const getAllSleep = () => {
    try { return JSON.parse(localStorage.getItem('babySleep') || '[]'); } catch { return []; }
  };
  const getAllDiapers = () => {
    try { return JSON.parse(localStorage.getItem('babyDiapers') || '[]'); } catch { return []; }
  };
  const getAllHealth = () => {
    try { return JSON.parse(localStorage.getItem('baby-bloom-health') || '[]'); } catch { return []; }
  };

  const allFeedings = getAllFeedings();
  const allSleep = getAllSleep();
  const allDiapers = getAllDiapers();
  const allHealth = getAllHealth();

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
    { id: 'diapers', label: 'Diaper Changes', icon: '🧷', color: 'var(--accent, #ffb86c)', data: allDiapers },
    { id: 'health', label: 'Health Records', icon: '🩺', color: 'var(--success, #25c685)', data: allHealth },
  ];

  const statActions = {
    feedings: () => navigate('/feeding'),
    sleep: () => navigate('/sleep'),
    diapers: () => navigate('/diaper'),
    health: () => navigate('/health'),
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
    return {
      id: source.id,
      label: source.label,
      icon: source.icon,
      color: source.color,
      count: source.data.length,
      subtitle: source.data.length ? `Last entry ${getTimeAgo(latest)}` : 'No entries yet',
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

  // Reminders from localStorage
  const getReminders = () => {
    try { return JSON.parse(localStorage.getItem('baby-bloom-reminders') || '[]'); } catch { return []; }
  };
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
  const upcomingReminders = getReminders()
    .filter(r => !r.completed && new Date(r.dueAt) > new Date())
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
        <div className="section-header">
          <h3 className="section-title">Daily Log Overview</h3>
        </div>
        <div className="analysis-overview">
          <div className="analysis-donut-card">
            <p className="analysis-donut-title">Today's Overview</p>
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

          <div className="analysis-stats-card">
            <p className="analysis-stats-title">Category breakdown</p>
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
        </div>
      </div>

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

      <div className="dashboard-content">
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

      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Weekly Insights</h3>
        </div>
        <div style={{
          padding: 'var(--spacing-xl)',
          background: 'var(--surface-variant)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>📊</div>
          <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Your Baby's Week at a Glance</h4>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
            This week your baby had consistent sleep patterns and tried 2 new foods!
          </p>
          <Link to="/growth" className="section-link">View Detailed Report →</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

