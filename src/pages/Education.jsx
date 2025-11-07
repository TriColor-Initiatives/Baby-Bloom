import '../styles/pages.css';

const Education = () => {
  const topics = [
    { id: 1, icon: '🍼', title: 'Introducing Solid Foods', category: 'Nutrition', articles: 12 },
    { id: 2, icon: '😴', title: 'Sleep Training Methods', category: 'Sleep', articles: 8 },
    { id: 3, icon: '⭐', title: 'Developmental Milestones', category: 'Development', articles: 15 },
    { id: 4, icon: '🏥', title: 'Common Baby Illnesses', category: 'Health', articles: 10 },
    { id: 5, icon: '🎨', title: 'Age-Appropriate Activities', category: 'Activities', articles: 20 },
    { id: 6, icon: '🧠', title: 'Cognitive Development', category: 'Development', articles: 9 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📚 Education Hub</h1>
        <p className="page-subtitle">Expert articles and guides for baby care</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-secondary">
          <span>🔍</span>
          <span>Search Articles</span>
        </button>
        <button className="btn btn-secondary">
          <span>⭐</span>
          <span>Saved Articles</span>
        </button>
      </div>

      <div className="section-card">
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Popular Topics</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: 'var(--spacing-md)' 
        }}>
          {topics.map((topic) => (
            <div key={topic.id} className="card" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-sm)' }}>{topic.icon}</div>
              <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>{topic.title}</h4>
              <div style={{ 
                fontSize: 'var(--font-size-xs)', 
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--spacing-sm)'
              }}>
                {topic.category}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                {topic.articles} articles
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Featured Article</h3>
        <div style={{ 
          padding: 'var(--spacing-xl)', 
          background: 'var(--surface-variant)', 
          borderRadius: 'var(--radius-md)' 
        }}>
          <h4 style={{ marginBottom: 'var(--spacing-md)' }}>
            Understanding Your 6-12 Month Old's Development
          </h4>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            Learn about the amazing developmental changes your baby goes through between 6-12 months, including motor skills, language development, and social interactions.
          </p>
          <button className="btn btn-primary">Read Article →</button>
        </div>
      </div>
    </div>
  );
};

export default Education;
