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

  // Get real data from localStorage
  const getTodayFeedings = () => {
    const feedings = JSON.parse(localStorage.getItem('babyFeedings') || '[]');
    const today = new Date().toDateString();
    return feedings.filter(f => new Date(f.timestamp || f.date).toDateString() === today);
  };

  const getTodaySleep = () => {
    const sleeps = JSON.parse(localStorage.getItem('babySleep') || '[]');
    const today = new Date().toDateString();
    return sleeps.filter(s => new Date(s.timestamp || s.date).toDateString() === today);
  };

  const getTodayDiapers = () => {
    const diapers = JSON.parse(localStorage.getItem('babyDiapers') || '[]');
    const today = new Date().toDateString();
    return diapers.filter(d => new Date(d.timestamp || d.date).toDateString() === today);
  };

  const todayFeedings = getTodayFeedings();
  const todaySleep = getTodaySleep();
  const todayDiapers = getTodayDiapers();

  const calculateTotalSleepHours = () => {
    return todaySleep.reduce((total, sleep) => {
      if (sleep.duration) {
        const [hours, minutes] = sleep.duration.split(':').map(Number);
        return total + hours + (minutes / 60);
      }
      return total;
    }, 0).toFixed(1);
  };

  const getLastActivity = (items) => {
    if (items.length === 0) return null;
    const sorted = [...items].sort((a, b) =>
      new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
    );
    return sorted[0];
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

  const lastFeeding = getLastActivity(todayFeedings);
  const lastDiaper = getLastActivity(todayDiapers);
  const totalSleepHours = calculateTotalSleepHours();

  const todayStats = [
    {
      id: 1,
      type: 'feeding',
      icon: '🍼',
      title: 'Feedings Today',
      value: todayFeedings.length > 0 ? todayFeedings.length : '-',
      subtitle: lastFeeding ? `Last fed ${getTimeAgo(lastFeeding.timestamp || lastFeeding.date)}` : 'No feedings logged today',
      isEmpty: todayFeedings.length === 0,
      action: () => navigate('/feeding')
    },
    {
      id: 2,
      type: 'sleep',
      icon: '😴',
      title: 'Sleep Duration',
      value: todaySleep.length > 0 ? `${totalSleepHours}h` : '-',
      subtitle: todaySleep.length > 0 ? `${todaySleep.length} sleep session${todaySleep.length !== 1 ? 's' : ''}` : 'No sleep logged today',
      isEmpty: todaySleep.length === 0,
      action: () => navigate('/sleep')
    },
    {
      id: 3,
      type: 'diaper',
      icon: '🧷',
      title: 'Diaper Changes',
      value: todayDiapers.length > 0 ? todayDiapers.length : '-',
      subtitle: lastDiaper ? `Last changed ${getTimeAgo(lastDiaper.timestamp || lastDiaper.date)}` : 'No changes logged today',
      isEmpty: todayDiapers.length === 0,
      action: () => navigate('/diaper')
    },
    {
      id: 4,
      type: 'health',
      icon: '🩺',
      title: 'Health Status',
      value: 'Good',
      subtitle: 'Track health records',
      isEmpty: false,
      action: () => navigate('/health')
    }
  ];

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

  const safeDate = (d) => (d ? new Date(d) : null);

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
    const feedings = getAllFeedings().map((f) => ({
      id: `f-${f.id || f.timestamp}`,
      icon: '🍼',
      title: formatFeedingTitle(f),
      when: f.timestamp || f.date,
      bg: 'var(--primary-light)'
    }));
    const sleeps = getAllSleep().map((s) => ({
      id: `s-${s.id || s.timestamp}`,
      icon: '💤',
      title: formatSleepTitle(s),
      when: s.timestamp || s.date,
      bg: 'var(--secondary-light)'
    }));
    const diapers = getAllDiapers().map((d) => ({
      id: `d-${d.id || d.timestamp}`,
      icon: '🧷',
      title: formatDiaperTitle(d),
      when: d.timestamp || d.date,
      bg: 'var(--accent)'
    }));
    const health = getAllHealth().map((h) => ({
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

  const quickActions = [
    { id: 1, icon: '🍼', label: 'Log Feeding', action: () => navigate('/feeding?add=true') },
    { id: 2, icon: '😴', label: 'Log Sleep', action: () => navigate('/sleep?add=true') },
    { id: 3, icon: '🧷', label: 'Log Diaper', action: () => navigate('/diaper?add=true') },
    { id: 4, icon: '🩺', label: 'Log Health', action: () => navigate('/health?add=true') },
  ];

  // Show welcome screen if no babies
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  const hasAnyData = todayFeedings.length > 0 || todaySleep.length > 0 || todayDiapers.length > 0;

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

      {!hasAnyData && (
        <div className="getting-started-banner">
          <div className="banner-content">
            <span className="banner-icon">🚀</span>
            <div>
              <h3>Getting Started</h3>
              <p>Start tracking your baby's daily activities using the quick actions below!</p>
              <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-xs)', opacity: 0.8 }}>
                💡 Focus on <strong>Daily Tracking</strong> (Feeding, Sleep, Diaper, Health) - other features available in "More"
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {todayStats.map((stat) => (
          <div
            key={stat.id}
            className={`stat-card ${stat.type} ${stat.isEmpty ? 'empty' : ''}`}
            onClick={stat.action}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-header">
              <div className="stat-icon">{stat.icon}</div>
              {!stat.isEmpty && (
                <span className="stat-trend up">✓</span>
              )}
            </div>
            <div className="stat-title">{stat.title}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-subtitle">{stat.subtitle}</div>
            {stat.isEmpty && (
              <div className="stat-cta">Click to add →</div>
            )}
          </div>
        ))}
      </div>

      <div className="section-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="section-header">
          <h3 className="section-title">Quick Actions</h3>
        </div>
        <div className="quick-actions">
          {quickActions.map((action) => (
            <button key={action.id} className="quick-action-btn" onClick={action.action}>
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
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
                  <div className="empty-tip"><span>🍼</span><span>Use Quick Actions to log your first entry</span></div>
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
