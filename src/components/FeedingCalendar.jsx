import { useState, useMemo } from 'react';
import './FeedingCalendar.css';

const FeedingCalendar = ({ feedings, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [currentDate]);

  // Get feedings for a specific day
  const getFeedingsForDay = (date) => {
    return feedings.filter(f => {
      const feedingDate = new Date(f.timestamp || f.date);
      return feedingDate.toDateString() === date.toDateString();
    });
  };

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-header">
          <h2>📅 Feeding Calendar</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="calendar-controls">
          <button className="btn-nav" onClick={goToPreviousMonth}>←</button>
          <h3>
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button className="btn-nav" onClick={goToNextMonth}>→</button>
          <button className="btn-today" onClick={goToToday}>Today</button>
        </div>

        <div className="calendar-content">
          <div className="calendar-grid">
            <div className="weekday-header">Sun</div>
            <div className="weekday-header">Mon</div>
            <div className="weekday-header">Tue</div>
            <div className="weekday-header">Wed</div>
            <div className="weekday-header">Thu</div>
            <div className="weekday-header">Fri</div>
            <div className="weekday-header">Sat</div>

            {calendarData.map((day, index) => {
              const dayFeedings = getFeedingsForDay(day.date);
              const breastCount = dayFeedings.filter(f => f.type === 'breast').length;
              const bottleCount = dayFeedings.filter(f => f.type === 'bottle').length;
              
              return (
                <div
                  key={index}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
                >
                  <div className="day-number">{day.date.getDate()}</div>
                  {dayFeedings.length > 0 && (
                    <div className="day-feedings">
                      {breastCount > 0 && (
                        <div className="feeding-indicator breast" title={`${breastCount} breastfeeding(s)`}>
                          🤱 {breastCount}
                        </div>
                      )}
                      {bottleCount > 0 && (
                        <div className="feeding-indicator bottle" title={`${bottleCount} bottle feeding(s)`}>
                          🍼 {bottleCount}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-icon breast">🤱</div>
            <span>Breastfeeding</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon bottle">🍼</div>
            <span>Bottle Feeding</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedingCalendar;
