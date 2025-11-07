import { useMemo } from 'react';
import './FeedingAnalytics.css';

const FeedingAnalytics = ({ feedings, onClose }) => {
  const analytics = useMemo(() => {
    // Get last 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    // Daily totals
    const dailyData = last7Days.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayFeedings = feedings.filter(f => {
        const feedingDate = new Date(f.timestamp);
        return feedingDate >= date && feedingDate < nextDay;
      });

      return {
        date,
        count: dayFeedings.length,
        amount: dayFeedings.reduce((sum, f) => sum + (f.amount || 0), 0)
      };
    });

    // Type distribution
    const typeCount = {
      bottle: feedings.filter(f => f.type === 'bottle').length,
      breast: feedings.filter(f => f.type === 'breast').length,
      solid: feedings.filter(f => f.type === 'solid').length
    };

    // Time of day distribution (24 hours)
    const hourlyData = Array(24).fill(0);
    feedings.forEach(f => {
      const hour = new Date(f.timestamp).getHours();
      hourlyData[hour]++;
    });

    // Statistics
    const durations = feedings.filter(f => f.duration).map(f => f.duration);
    const avgDuration = durations.length > 0 
      ? (durations.reduce((sum, d) => sum + d, 0) / durations.length).toFixed(1)
      : 0;

    const amounts = feedings.filter(f => f.amount).map(f => f.amount);
    const avgAmount = amounts.length > 0
      ? Math.round(amounts.reduce((sum, a) => sum + a, 0) / amounts.length)
      : 0;

    // Find longest gap
    const sorted = [...feedings].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    let longestGap = 0;
    for (let i = 1; i < sorted.length; i++) {
      const gap = (new Date(sorted[i].timestamp) - new Date(sorted[i-1].timestamp)) / (1000 * 60 * 60);
      if (gap > longestGap) longestGap = gap;
    }

    return {
      dailyData,
      typeCount,
      hourlyData,
      avgDuration,
      avgAmount,
      longestGap: longestGap.toFixed(1),
      totalFeedings: feedings.length
    };
  }, [feedings]);

  const maxDailyCount = Math.max(...analytics.dailyData.map(d => d.count), 1);
  const maxHourlyCount = Math.max(...analytics.hourlyData, 1);
  const totalTypes = analytics.typeCount.bottle + analytics.typeCount.breast + analytics.typeCount.solid;

  const getDayLabel = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'bottle': return '#5568C9';
      case 'breast': return '#10B981';
      case 'solid': return '#F97316';
      default: return '#94A3B8';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="analytics-header">
          <h2>📊 Feeding Analytics</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="analytics-content">
          {/* Statistics Grid */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon">🍼</div>
              <div className="stat-value">{analytics.totalFeedings}</div>
              <div className="stat-label">Total Feedings</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">⏱️</div>
              <div className="stat-value">{analytics.avgDuration} min</div>
              <div className="stat-label">Avg Duration</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">📏</div>
              <div className="stat-value">{analytics.avgAmount} ml</div>
              <div className="stat-label">Avg Amount</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">⏰</div>
              <div className="stat-value">{analytics.longestGap} hrs</div>
              <div className="stat-label">Longest Gap</div>
            </div>
          </div>

          {/* Daily Bar Chart */}
          <div className="chart-section">
            <h3>📈 Last 7 Days</h3>
            <div className="bar-chart">
              {analytics.dailyData.map((day, index) => (
                <div key={index} className="bar-column">
                  <div className="bar-container">
                    <div 
                      className="bar"
                      style={{ 
                        height: `${(day.count / maxDailyCount) * 100}%`,
                        background: 'linear-gradient(to top, var(--primary), var(--primary-light))'
                      }}
                    >
                      {day.count > 0 && <span className="bar-value">{day.count}</span>}
                    </div>
                  </div>
                  <div className="bar-label">{getDayLabel(day.date)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Type Distribution Pie Chart */}
          <div className="chart-section">
            <h3>🥧 Feeding Type Distribution</h3>
            {totalTypes > 0 ? (
              <>
                <div className="pie-chart">
                  <svg viewBox="0 0 200 200" className="pie-svg">
                    <circle cx="100" cy="100" r="80" fill="none" 
                      stroke={getTypeColor('bottle')}
                      strokeWidth="40"
                      strokeDasharray={`${(analytics.typeCount.bottle / totalTypes) * 502.65} 502.65`}
                      transform="rotate(-90 100 100)"
                    />
                    <circle cx="100" cy="100" r="80" fill="none"
                      stroke={getTypeColor('breast')}
                      strokeWidth="40"
                      strokeDasharray={`${(analytics.typeCount.breast / totalTypes) * 502.65} 502.65`}
                      strokeDashoffset={`-${(analytics.typeCount.bottle / totalTypes) * 502.65}`}
                      transform="rotate(-90 100 100)"
                    />
                    <circle cx="100" cy="100" r="80" fill="none"
                      stroke={getTypeColor('solid')}
                      strokeWidth="40"
                      strokeDasharray={`${(analytics.typeCount.solid / totalTypes) * 502.65} 502.65`}
                      strokeDashoffset={`-${((analytics.typeCount.bottle + analytics.typeCount.breast) / totalTypes) * 502.65}`}
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                </div>
                <div className="pie-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: getTypeColor('bottle') }}></div>
                    <span>Bottle: {analytics.typeCount.bottle} ({Math.round(analytics.typeCount.bottle / totalTypes * 100)}%)</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: getTypeColor('breast') }}></div>
                    <span>Breast: {analytics.typeCount.breast} ({Math.round(analytics.typeCount.breast / totalTypes * 100)}%)</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: getTypeColor('solid') }}></div>
                    <span>Solid: {analytics.typeCount.solid} ({Math.round(analytics.typeCount.solid / totalTypes * 100)}%)</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-data">No feeding data available</div>
            )}
          </div>

          {/* Hourly Heatmap */}
          <div className="chart-section">
            <h3>🕐 Feeding Times (24 Hours)</h3>
            <div className="heatmap">
              {analytics.hourlyData.map((count, hour) => (
                <div 
                  key={hour}
                  className="heatmap-cell"
                  style={{
                    opacity: count === 0 ? 0.1 : 0.2 + (count / maxHourlyCount) * 0.8,
                    background: count > 0 ? 'var(--primary)' : 'var(--surface-variant)'
                  }}
                  title={`${hour}:00 - ${count} feedings`}
                >
                  <div className="heatmap-hour">{hour}</div>
                  {count > 0 && <div className="heatmap-count">{count}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedingAnalytics;
