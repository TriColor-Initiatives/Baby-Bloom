import '../styles/pages.css';

const Growth = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📏 Growth Tracking</h1>
        <p className="page-subtitle">Monitor your baby's physical development</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary">
          <span>➕</span>
          <span>Add Measurement</span>
        </button>
        <button className="btn btn-secondary">
          <span>📊</span>
          <span>View Charts</span>
        </button>
      </div>

      <div className="section-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Latest Measurements</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
          <div className="info-item">
            <div className="info-item-label">Weight</div>
            <div className="info-item-value">8.5 kg</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>50th percentile</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Height</div>
            <div className="info-item-value">71 cm</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>55th percentile</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Head Circumference</div>
            <div className="info-item-value">45 cm</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>48th percentile</div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Growth Chart</h3>
        <div style={{ 
          padding: 'var(--spacing-2xl)', 
          background: 'var(--surface-variant)', 
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>📈</div>
          <p style={{ color: 'var(--text-secondary)' }}>Growth chart visualization will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default Growth;
