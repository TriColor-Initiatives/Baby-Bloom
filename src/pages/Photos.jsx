import '../styles/pages.css';

const Photos = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📸 Photo Timeline</h1>
        <p className="page-subtitle">Capture and cherish your baby's precious moments</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary">
          <span>➕</span>
          <span>Upload Photo</span>
        </button>
        <button className="btn btn-secondary">
          <span>📅</span>
          <span>By Month</span>
        </button>
        <button className="btn btn-secondary">
          <span>⭐</span>
          <span>Milestones</span>
        </button>
      </div>

      <div className="section-card">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-lg)'
        }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} style={{
              aspectRatio: '1',
              background: 'var(--surface-variant)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}>
              📸
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Photos;
