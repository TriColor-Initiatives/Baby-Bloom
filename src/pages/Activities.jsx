import '../styles/pages.css';

const Activities = () => {
  const activities = [
    { id: 1, icon: '🎨', title: 'Tummy Time', duration: '15 min', time: '6 hours ago' },
    { id: 2, icon: '📚', title: 'Story Time', duration: '20 min', time: 'Yesterday' },
    { id: 3, icon: '🎵', title: 'Music and Dance', duration: '10 min', time: '2 days ago' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🎨 Activities</h1>
        <p className="page-subtitle">Track playtime and learning activities</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary">
          <span>➕</span>
          <span>Log Activity</span>
        </button>
        <button className="btn btn-secondary">
          <span>💡</span>
          <span>Activity Ideas</span>
        </button>
      </div>

      <div className="content-grid">
        <div className="feeding-log">
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Recent Activities</h3>
          {activities.map((activity) => (
            <div key={activity.id} className="log-entry" style={{ borderLeftColor: 'var(--warning)' }}>
              <div className="log-entry-header">
                <div className="log-entry-type">
                  <span className="log-entry-icon">{activity.icon}</span>
                  <span>{activity.title}</span>
                </div>
                <div className="log-entry-time">{activity.time}</div>
              </div>
              <div className="log-entry-details">
                <div className="log-entry-detail">
                  <span>⏱️</span>
                  <span>{activity.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="info-panel">
          <div className="tip-card" style={{ background: 'linear-gradient(135deg, var(--warning) 0%, var(--accent) 100%)' }}>
            <div className="tip-card-title">
              <span>💡</span>
              <span>Activity Suggestions</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Peek-a-boo games</div>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Stacking blocks</div>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Mirror play</div>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Sensory bins</div>
              <div>• Reading board books</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activities;
