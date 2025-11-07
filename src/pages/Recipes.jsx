import '../styles/pages.css';

const Recipes = () => {
  const recipes = [
    {
      id: 1,
      name: 'Sweet Potato Puree',
      age: '6+ months',
      icon: '🍠',
      time: '20 min',
      difficulty: 'Easy',
      nutrition: 'Rich in Vitamin A'
    },
    {
      id: 2,
      name: 'Banana Oatmeal',
      age: '6+ months',
      icon: '🍌',
      time: '10 min',
      difficulty: 'Easy',
      nutrition: 'Fiber and Potassium'
    },
    {
      id: 3,
      name: 'Avocado Mash',
      age: '6+ months',
      icon: '🥑',
      time: '5 min',
      difficulty: 'Easy',
      nutrition: 'Healthy Fats'
    },
    {
      id: 4,
      name: 'Carrot & Pea Puree',
      age: '7+ months',
      icon: '🥕',
      time: '25 min',
      difficulty: 'Easy',
      nutrition: 'Vitamins A & C'
    },
    {
      id: 5,
      name: 'Chicken & Veggie Mix',
      age: '8+ months',
      icon: '🍗',
      time: '30 min',
      difficulty: 'Medium',
      nutrition: 'Protein and Iron'
    },
    {
      id: 6,
      name: 'Mini Pancakes',
      age: '9+ months',
      icon: '🥞',
      time: '15 min',
      difficulty: 'Medium',
      nutrition: 'Finger Food'
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🥘 Meal Recipes</h1>
        <p className="page-subtitle">Nutritious and age-appropriate meal ideas</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-secondary">
          <span>🔍</span>
          <span>Search Recipes</span>
        </button>
        <button className="btn btn-secondary">
          <span>⭐</span>
          <span>Favorites</span>
        </button>
        <button className="btn btn-secondary">
          <span>📅</span>
          <span>Meal Planner</span>
        </button>
      </div>

      <div className="section-card">
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Recipe Library</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: 'var(--spacing-lg)' 
        }}>
          {recipes.map((recipe) => (
            <div key={recipe.id} className="card" style={{ cursor: 'pointer' }}>
              <div style={{ 
                fontSize: '64px', 
                textAlign: 'center',
                marginBottom: 'var(--spacing-md)',
                padding: 'var(--spacing-lg)',
                background: 'var(--surface-variant)',
                borderRadius: 'var(--radius-md)'
              }}>
                {recipe.icon}
              </div>
              <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>{recipe.name}</h4>
              <div style={{ 
                fontSize: 'var(--font-size-xs)', 
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--spacing-md)'
              }}>
                {recipe.age}
              </div>
              <div style={{ 
                display: 'flex',
                gap: 'var(--spacing-md)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-sm)'
              }}>
                <span>⏱️ {recipe.time}</span>
                <span>📊 {recipe.difficulty}</span>
              </div>
              <div style={{ 
                fontSize: 'var(--font-size-xs)',
                color: 'var(--primary-dark)',
                fontWeight: 600
              }}>
                💪 {recipe.nutrition}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Feeding Guidelines</h3>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-md)'
        }}>
          <div className="info-item">
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>6-8 Months</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Start with single-ingredient purees. Introduce iron-rich foods like meat and fortified cereals.
            </p>
          </div>
          <div className="info-item">
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>8-10 Months</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Introduce mashed and chopped foods. Baby can start self-feeding with soft finger foods.
            </p>
          </div>
          <div className="info-item">
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>10-12 Months</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Most table foods are OK. Continue breast milk or formula. Avoid honey, choking hazards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recipes;
