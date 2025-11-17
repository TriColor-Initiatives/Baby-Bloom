import { useMemo } from 'react';
import '../pages/Feeding.css';
import './FeedingAnalytics.css';

const FeedingAnalytics = ({ feedings, onClose }) => {
  const analytics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Total feedings today
    const todayFeedings = feedings.filter(f => {
      const feedingDate = new Date(f.timestamp);
      feedingDate.setHours(0, 0, 0, 0);
      return feedingDate.getTime() === today.getTime();
    }).length;

    // Total feedings in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const last7DaysFeedings = feedings.filter(f => {
      const feedingDate = new Date(f.timestamp);
      return feedingDate >= sevenDaysAgo;
    }).length;

    return {
      todayFeedings,
      last7DaysFeedings
    };
  }, [feedings]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="analytics-header">
          <h2>📊 Feeding Analytics</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="analytics-content">
          <div className="analytics-metrics">
            <div className="metric-card">
              <div className="metric-icon">📅</div>
              <div className="metric-value">{analytics.todayFeedings}</div>
              <div className="metric-label">Today's Feedings</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-value">{analytics.last7DaysFeedings}</div>
              <div className="metric-label">Last 7 Days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedingAnalytics;
