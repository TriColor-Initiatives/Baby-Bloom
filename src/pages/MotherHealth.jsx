import '../styles/pages.css';

const MotherHealth = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">💝 Mother's Wellness</h1>
        <p className="page-subtitle">Track your postpartum health and self-care</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary">
          <span>➕</span>
          <span>Log Wellness</span>
        </button>
        <button className="btn btn-secondary">
          <span>😊</span>
          <span>Mood Check-in</span>
        </button>
      </div>

      <div className="content-grid">
        <div className="section-card">
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Self-Care Reminders</h3>
          <div className="log-entry" style={{ borderLeftColor: 'var(--primary)' }}>
            <div className="log-entry-type">
              <span className="log-entry-icon">💧</span>
              <span>Stay Hydrated</span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
              Drink at least 8 glasses of water daily, especially if breastfeeding
            </p>
          </div>

          <div className="log-entry" style={{ borderLeftColor: 'var(--secondary)' }}>
            <div className="log-entry-type">
              <span className="log-entry-icon">😴</span>
              <span>Rest When Baby Sleeps</span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
              Your recovery is important. Try to nap when your baby naps
            </p>
          </div>

          <div className="log-entry" style={{ borderLeftColor: 'var(--success)' }}>
            <div className="log-entry-type">
              <span className="log-entry-icon">🥗</span>
              <span>Nutritious Meals</span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
              Eat balanced meals with plenty of fruits and vegetables
            </p>
          </div>
        </div>

        <div className="info-panel">
          <div className="tip-card" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)' }}>
            <div className="tip-card-title">
              <span>💝</span>
              <span>Remember</span>
            </div>
            <p className="tip-card-text">
              Taking care of yourself is not selfish - it's essential. A healthy, happy mom means a healthy, happy baby. Don't hesitate to ask for help.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotherHealth;
