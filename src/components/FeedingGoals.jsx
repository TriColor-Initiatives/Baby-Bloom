import { useState, useEffect } from 'react';
import './FeedingGoals.css';

const FeedingGoals = ({ feedings, onClose }) => {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('feeding_goals');
    return saved ? JSON.parse(saved) : {
      dailyFeedings: 8,
      breastfeedingMinutes: 20,
      bottleAmount: 120
    };
  });

  useEffect(() => {
    localStorage.setItem('feeding_goals', JSON.stringify(goals));
  }, [goals]);

  // Calculate today's progress
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayFeedings = feedings.filter(f => {
    const feedingDate = new Date(f.timestamp || f.date);
    feedingDate.setHours(0, 0, 0, 0);
    return feedingDate.getTime() === today.getTime();
  });

  const breastFeedings = todayFeedings.filter(f => f.type === 'breast');
  const bottleFeedings = todayFeedings.filter(f => f.type === 'bottle');

  const totalDuration = breastFeedings.reduce((sum, f) => 
    sum + (f.leftDuration || 0) + (f.rightDuration || 0), 0
  );
  
  const avgDuration = breastFeedings.length > 0 ? totalDuration / breastFeedings.length : 0;
  const avgBottleAmount = bottleFeedings.length > 0
    ? bottleFeedings.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0) / bottleFeedings.length
    : 0;

  const feedingsProgress = Math.min((todayFeedings.length / goals.dailyFeedings) * 100, 100);
  const durationProgress = Math.min((avgDuration / goals.breastfeedingMinutes) * 100, 100);
  const amountProgress = Math.min((avgBottleAmount / goals.bottleAmount) * 100, 100);

  // Get achievement badges
  const badges = [];
  if (todayFeedings.length >= goals.dailyFeedings) {
    badges.push({ icon: '🎯', title: 'Daily Goal Achieved!', color: '#10b981' });
  }
  if (feedings.length >= 50) {
    badges.push({ icon: '🌟', title: '50 Feedings Logged', color: '#f59e0b' });
  }
  if (feedings.length >= 100) {
    badges.push({ icon: '💯', title: 'Century Club', color: '#ec4899' });
  }

  const handleGoalChange = (field, value) => {
    setGoals(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="goals-modal" onClick={(e) => e.stopPropagation()}>
        <div className="goals-header">
          <h2>🎯 Goals & Insights</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="goals-content">
          {/* Today's Progress */}
          <section className="goals-section">
            <h3>Today's Progress</h3>
            <div className="progress-grid">
              <div className="progress-card">
                <div className="progress-header">
                  <span>Total Feedings</span>
                  <span className="progress-value">{todayFeedings.length}/{goals.dailyFeedings}</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${feedingsProgress}%` }}></div>
                </div>
              </div>

              <div className="progress-card">
                <div className="progress-header">
                  <span>Avg. Breast Duration</span>
                  <span className="progress-value">{Math.round(avgDuration)}/{goals.breastfeedingMinutes} min</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${durationProgress}%` }}></div>
                </div>
              </div>

              <div className="progress-card">
                <div className="progress-header">
                  <span>Avg. Bottle Amount</span>
                  <span className="progress-value">{Math.round(avgBottleAmount)}/{goals.bottleAmount} ml</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${amountProgress}%` }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Set Goals */}
          <section className="goals-section">
            <h3>Set Your Goals</h3>
            <div className="goals-inputs">
              <div className="goal-input-group">
                <label>Daily Feedings Target</label>
                <input
                  type="number"
                  value={goals.dailyFeedings}
                  onChange={(e) => handleGoalChange('dailyFeedings', e.target.value)}
                  min="1"
                  max="20"
                />
              </div>
              <div className="goal-input-group">
                <label>Target Breast Duration (min)</label>
                <input
                  type="number"
                  value={goals.breastfeedingMinutes}
                  onChange={(e) => handleGoalChange('breastfeedingMinutes', e.target.value)}
                  min="5"
                  max="60"
                />
              </div>
              <div className="goal-input-group">
                <label>Target Bottle Amount (ml)</label>
                <input
                  type="number"
                  value={goals.bottleAmount}
                  onChange={(e) => handleGoalChange('bottleAmount', e.target.value)}
                  min="30"
                  max="300"
                />
              </div>
            </div>
          </section>

          {/* Achievements */}
          {badges.length > 0 && (
            <section className="goals-section">
              <h3>🏆 Achievements</h3>
              <div className="badges-grid">
                {badges.map((badge, index) => (
                  <div key={index} className="badge-card" style={{ borderColor: badge.color }}>
                    <div className="badge-icon">{badge.icon}</div>
                    <div className="badge-title">{badge.title}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Insights */}
          <section className="goals-section">
            <h3>💡 Insights</h3>
            <div className="insights-list">
              <div className="insight-item">
                <div className="insight-icon">📊</div>
                <div className="insight-text">
                  You've logged <strong>{feedings.length}</strong> feedings total. Great tracking!
                </div>
              </div>
              {todayFeedings.length >= goals.dailyFeedings && (
                <div className="insight-item success">
                  <div className="insight-icon">✅</div>
                  <div className="insight-text">
                    You've reached today's feeding goal! Keep up the excellent work!
                  </div>
                </div>
              )}
              {todayFeedings.length < goals.dailyFeedings / 2 && (
                <div className="insight-item warning">
                  <div className="insight-icon">⚠️</div>
                  <div className="insight-text">
                    You're halfway through the day. Consider feeding soon to stay on track.
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FeedingGoals;
