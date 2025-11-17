import { useState, useMemo } from 'react';
import '../pages/Feeding.css';
import './FeedingAdvancedAnalytics.css';

const FeedingAdvancedAnalytics = ({ feedings, onClose }) => {
  const [activeView, setActiveView] = useState('trends');
  const [timeframe, setTimeframe] = useState('month');

  // Calculate weekly trends
  const weeklyTrends = useMemo(() => {
    const now = new Date();
    const weeks = [];
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekFeedings = feedings.filter(f => {
        const feedingDate = new Date(f.timestamp || f.date);
        return feedingDate >= weekStart && feedingDate < weekEnd;
      });
      
      const breastFeedings = weekFeedings.filter(f => f.type === 'breast');
      const bottleFeedings = weekFeedings.filter(f => f.type === 'bottle');
      
      weeks.push({
        label: `Week ${12 - i}`,
        startDate: weekStart,
        total: weekFeedings.length,
        breast: breastFeedings.length,
        bottle: bottleFeedings.length,
        avgDuration: breastFeedings.length > 0
          ? breastFeedings.reduce((sum, f) => sum + (f.leftDuration || 0) + (f.rightDuration || 0), 0) / breastFeedings.length
          : 0,
        totalAmount: bottleFeedings.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0)
      });
    }
    
    return weeks;
  }, [feedings]);

  // Detect patterns
  const patterns = useMemo(() => {
    if (feedings.length < 7) return [];
    
    const sortedFeedings = [...feedings].sort((a, b) => new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date));
    const detectedPatterns = [];
    
    // Pattern 1: Consistent feeding times
    const hourlyDistribution = new Array(24).fill(0);
    sortedFeedings.forEach(f => {
      const hour = new Date(f.timestamp || f.date).getHours();
      hourlyDistribution[hour]++;
    });
    
    const peakHours = hourlyDistribution
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count >= 3)
      .sort((a, b) => b.count - a.count);
    
    if (peakHours.length > 0) {
      detectedPatterns.push({
        type: 'peak-times',
        icon: '🕐',
        title: 'Peak Feeding Times',
        description: `Most feedings occur at ${peakHours.slice(0, 3).map(h => 
          `${h.hour}:00`).join(', ')}`,
        confidence: 'high'
      });
    }
    
    // Pattern 2: Feeding frequency trend
    const recentWeek = sortedFeedings.slice(-7);
    const previousWeek = sortedFeedings.slice(-14, -7);
    
    if (recentWeek.length > previousWeek.length) {
      detectedPatterns.push({
        type: 'frequency-increase',
        icon: '📈',
        title: 'Increasing Frequency',
        description: `Feedings increased by ${Math.round(((recentWeek.length - previousWeek.length) / previousWeek.length) * 100)}% this week`,
        confidence: 'medium'
      });
    } else if (recentWeek.length < previousWeek.length) {
      detectedPatterns.push({
        type: 'frequency-decrease',
        icon: '📉',
        title: 'Decreasing Frequency',
        description: `Feedings decreased by ${Math.round(((previousWeek.length - recentWeek.length) / previousWeek.length) * 100)}% this week`,
        confidence: 'medium'
      });
    }
    
    // Pattern 3: Preferred feeding type
    const breastCount = sortedFeedings.filter(f => f.type === 'breast').length;
    const bottleCount = sortedFeedings.filter(f => f.type === 'bottle').length;
    const total = sortedFeedings.length;
    
    if (breastCount > bottleCount && (breastCount / total) > 0.7) {
      detectedPatterns.push({
        type: 'breast-preference',
        icon: '🤱',
        title: 'Breastfeeding Preference',
        description: `${Math.round((breastCount / total) * 100)}% of feedings are breastfeeding`,
        confidence: 'high'
      });
    } else if (bottleCount > breastCount && (bottleCount / total) > 0.7) {
      detectedPatterns.push({
        type: 'bottle-preference',
        icon: '🍼',
        title: 'Bottle Preference',
        description: `${Math.round((bottleCount / total) * 100)}% of feedings are bottle feeding`,
        confidence: 'high'
      });
    }
    
    // Pattern 4: Night feeding pattern
    const nightFeedings = sortedFeedings.filter(f => {
      const hour = new Date(f.timestamp || f.date).getHours();
      return hour >= 22 || hour <= 6;
    });
    
    if (nightFeedings.length > 0) {
      detectedPatterns.push({
        type: 'night-feeding',
        icon: '🌙',
        title: 'Night Feeding Pattern',
        description: `Average ${Math.round(nightFeedings.length / 7)} night feedings per night`,
        confidence: 'medium'
      });
    }
    
    return detectedPatterns;
  }, [feedings]);

  // Predictive insights
  const insights = useMemo(() => {
    if (feedings.length < 14) {
      return [{
        type: 'insufficient-data',
        icon: '📊',
        title: 'Collecting Data',
        message: 'Keep logging feedings to get personalized insights',
        action: null
      }];
    }
    
    const sortedFeedings = [...feedings].sort((a, b) => new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date));
    const generatedInsights = [];
    
    // Insight 1: Growth phase detection
    const last7Days = sortedFeedings.slice(-7);
    const previous7Days = sortedFeedings.slice(-14, -7);
    
    if (last7Days.length > previous7Days.length * 1.3) {
      generatedInsights.push({
        type: 'growth-spurt',
        icon: '🌱',
        title: 'Possible Growth Spurt',
        message: 'Feeding frequency has increased significantly. This is normal during growth spurts.',
        action: 'Monitor for next few days'
      });
    }
    
    // Insight 2: Duration consistency
    const breastFeedings = sortedFeedings.filter(f => f.type === 'breast');
    if (breastFeedings.length >= 10) {
      const durations = breastFeedings.map(f => (f.leftDuration || 0) + (f.rightDuration || 0));
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const recentAvg = durations.slice(-5).reduce((a, b) => a + b, 0) / 5;
      
      if (recentAvg < avgDuration * 0.7) {
        generatedInsights.push({
          type: 'short-feedings',
          icon: '⏱️',
          title: 'Shorter Feeding Sessions',
          message: 'Recent feedings are shorter than average. Baby may be feeding more efficiently.',
          action: 'Ensure adequate intake'
        });
      }
    }
    
    // Insight 3: Hydration reminder
    const bottleFeedings = sortedFeedings.filter(f => f.type === 'bottle');
    if (bottleFeedings.length >= 5) {
      const totalAmount = bottleFeedings.slice(-5).reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
      const avgPerFeeding = totalAmount / 5;
      
      if (avgPerFeeding < 100) {
        generatedInsights.push({
          type: 'low-intake',
          icon: '💧',
          title: 'Monitor Intake',
          message: `Average bottle feeding is ${Math.round(avgPerFeeding)}ml. Consider consulting pediatrician if concerned.`,
          action: 'Track wet diapers'
        });
      }
    }
    
    // Insight 4: Schedule formation
    const intervals = [];
    for (let i = 1; i < sortedFeedings.length; i++) {
      const diff = (new Date(sortedFeedings[i].timestamp || sortedFeedings[i].date) - new Date(sortedFeedings[i-1].timestamp || sortedFeedings[i-1].date)) / (1000 * 60);
      intervals.push(diff);
    }
    
    if (intervals.length >= 10) {
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const stdDev = Math.sqrt(intervals.reduce((sq, n) => sq + Math.pow(n - avgInterval, 2), 0) / intervals.length);
      
      if (stdDev < avgInterval * 0.3) {
        generatedInsights.push({
          type: 'schedule-forming',
          icon: '📅',
          title: 'Schedule Forming',
          message: `Baby is developing a consistent feeding pattern (~${Math.round(avgInterval / 60)} hours).`,
          action: 'Great progress!'
        });
      }
    }
    
    return generatedInsights;
  }, [feedings]);

  // Monthly comparison
  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthFeedings = feedings.filter(f => {
        const feedingDate = new Date(f.timestamp || f.date);
        return feedingDate >= monthStart && feedingDate <= monthEnd;
      });
      
      months.push({
        label: monthStart.toLocaleDateString('default', { month: 'short' }),
        total: monthFeedings.length,
        avgPerDay: (monthFeedings.length / monthEnd.getDate()).toFixed(1)
      });
    }
    
    return months;
  }, [feedings]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="advanced-analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="advanced-analytics-header">
          <h2>📈 Advanced Analytics</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="view-tabs">
          <button
            className={`view-tab ${activeView === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveView('trends')}
          >
            📊 Trends
          </button>
          <button
            className={`view-tab ${activeView === 'patterns' ? 'active' : ''}`}
            onClick={() => setActiveView('patterns')}
          >
            🔍 Patterns
          </button>
          <button
            className={`view-tab ${activeView === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveView('insights')}
          >
            💡 Insights
          </button>
        </div>

        <div className="advanced-analytics-content">
          {activeView === 'trends' && (
            <div className="trends-view">
              <h3>Weekly Trends</h3>
              <div className="trends-chart">
                {weeklyTrends.map((week, index) => {
                  const maxTotal = Math.max(...weeklyTrends.map(w => w.total));
                  const height = maxTotal > 0 ? (week.total / maxTotal) * 100 : 0;
                  
                  return (
                    <div key={index} className="trend-bar-container">
                      <div className="trend-bar" style={{ height: `${height}%` }}>
                        <div className="trend-value">{week.total}</div>
                      </div>
                      <div className="trend-label">{week.label}</div>
                    </div>
                  );
                })}
              </div>

              <h3>Monthly Comparison</h3>
              <div className="monthly-comparison">
                {monthlyComparison.map((month, index) => (
                  <div key={index} className="month-card">
                    <div className="month-label">{month.label}</div>
                    <div className="month-total">{month.total}</div>
                    <div className="month-avg">{month.avgPerDay}/day</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'patterns' && (
            <div className="patterns-view">
              {patterns.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <p>Not enough data to detect patterns yet.</p>
                  <p className="empty-hint">Keep logging feedings for pattern detection.</p>
                </div>
              ) : (
                <div className="patterns-grid">
                  {patterns.map((pattern, index) => (
                    <div key={index} className="pattern-card">
                      <div className="pattern-header">
                        <div className="pattern-icon">{pattern.icon}</div>
                        <div className="pattern-confidence">{pattern.confidence}</div>
                      </div>
                      <h4>{pattern.title}</h4>
                      <p>{pattern.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'insights' && (
            <div className="insights-view">
              {insights.map((insight, index) => (
                <div key={index} className="insight-card">
                  <div className="insight-icon">{insight.icon}</div>
                  <div className="insight-content">
                    <h4>{insight.title}</h4>
                    <p>{insight.message}</p>
                    {insight.action && (
                      <div className="insight-action">💡 {insight.action}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedingAdvancedAnalytics;
