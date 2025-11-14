import '../styles/pages.css';

const Breastfeeding = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🤱 Breastfeeding Support</h1>
        <p className="page-subtitle">Tips, tracking, and guidance for breastfeeding</p>
      </div>

      <div className="content-grid">
        <div className="section-card">
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Helpful Tips</h3>
          
          <div className="info-item" style={{ marginBottom: 'var(--spacing-md)' }}>
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>🎯 Proper Latch</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Baby's mouth should cover most of the areola, not just the nipple. You should feel a pulling sensation, not pain.
            </p>
          </div>

          <div className="info-item" style={{ marginBottom: 'var(--spacing-md)' }}>
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>⏱️ Feeding Duration</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Sessions typically last 15-45 minutes. Let baby finish one breast before offering the other.
            </p>
          </div>

          <div className="info-item">
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>💧 Supply Building</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Stay hydrated, eat nutritious foods, and feed on demand to maintain good milk supply.
            </p>
          </div>
        </div>

        <div className="info-panel">
          <div className="tip-card">
            <div className="tip-card-title">
              <span>🆘</span>
              <span>Need Help?</span>
            </div>
            <p className="tip-card-text">
              If you're experiencing pain, low supply, or other concerns, contact a lactation consultant or your healthcare provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breastfeeding;
