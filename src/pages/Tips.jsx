import '../styles/pages.css';

const Tips = () => {
  const tips = [
    {
      id: 1,
      category: 'Feeding',
      icon: '🍼',
      title: 'Introducing Sippy Cups',
      content: 'Start introducing sippy cups around 6 months. Begin with water during meals to help baby learn this new skill.',
      color: 'var(--primary)'
    },
    {
      id: 2,
      category: 'Safety',
      icon: '🛡️',
      title: 'Babyproofing Your Home',
      content: 'As baby becomes mobile, secure furniture, cover outlets, and install safety gates. Get down to baby\'s level to spot hazards.',
      color: 'var(--error)'
    },
    {
      id: 3,
      category: 'Sleep',
      icon: '😴',
      title: 'Bedtime Routine',
      content: 'Establish a consistent bedtime routine: bath, book, lullaby. This signals to baby that it\'s time to sleep.',
      color: 'var(--secondary)'
    },
    {
      id: 4,
      category: 'Development',
      icon: '⭐',
      title: 'Encourage Crawling',
      content: 'Place toys just out of reach during tummy time. This motivates baby to move and strengthens muscles.',
      color: 'var(--warning)'
    },
    {
      id: 5,
      category: 'Health',
      icon: '💊',
      title: 'Teething Relief',
      content: 'Offer cold teething rings, gentle gum massage, or chilled washcloth. Consult doctor about pain relief if needed.',
      color: 'var(--success)'
    },
    {
      id: 6,
      category: 'Bonding',
      icon: '💝',
      title: 'Quality Time',
      content: 'Make eye contact, talk, sing, and respond to baby\'s coos. These interactions build strong emotional bonds.',
      color: 'var(--primary-dark)'
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">💡 Tips & Guides</h1>
        <p className="page-subtitle">Practical advice for everyday baby care</p>
      </div>

      <div className="section-card">
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Daily Care Tips</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: 'var(--spacing-lg)' 
        }}>
          {tips.map((tip) => (
            <div key={tip.id} className="card" style={{ borderTop: `4px solid ${tip.color}` }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-md)'
              }}>
                <span style={{ fontSize: '32px' }}>{tip.icon}</span>
                <div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xs)', 
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}>
                    {tip.category}
                  </div>
                  <h4 style={{ margin: 0 }}>{tip.title}</h4>
                </div>
              </div>
              <p style={{ 
                fontSize: 'var(--font-size-sm)', 
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                margin: 0
              }}>
                {tip.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tips;
