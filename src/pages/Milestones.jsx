import '../styles/pages.css';

const Milestones = () => {
  const milestones = [
    { id: 1, age: '6 months', title: 'Sitting without support', achieved: true, date: '2 months ago' },
    { id: 2, age: '7 months', title: 'Babbling consonants', achieved: true, date: '1 month ago' },
    { id: 3, age: '8 months', title: 'Crawling', achieved: false, date: 'In progress' },
    { id: 4, age: '9 months', title: 'Pulling to stand', achieved: false, date: 'Upcoming' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">⭐ Milestones</h1>
        <p className="page-subtitle">Track your baby's developmental achievements</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary">
          <span>➕</span>
          <span>Mark Achieved</span>
        </button>
        <button className="btn btn-secondary">
          <span>📸</span>
          <span>Add Photo</span>
        </button>
      </div>

      <div className="section-card">
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Developmental Milestones</h3>
        {milestones.map((milestone) => (
          <div key={milestone.id} className="log-entry" style={{ 
            borderLeftColor: milestone.achieved ? 'var(--success)' : 'var(--text-tertiary)',
            opacity: milestone.achieved ? 1 : 0.7
          }}>
            <div className="log-entry-header">
              <div className="log-entry-type">
                <span className="log-entry-icon">{milestone.achieved ? '✅' : '⏳'}</span>
                <span>{milestone.title}</span>
              </div>
              <div className="log-entry-time">{milestone.date}</div>
            </div>
            <div className="log-entry-details">
              <div className="log-entry-detail">
                <span>👶</span>
                <span>{milestone.age}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Milestones;
