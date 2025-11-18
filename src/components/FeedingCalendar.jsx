import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import '../pages/Feeding.css';
import './FeedingCalendar.css';

const FeedingCalendar = ({ feedings, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, breast, bottle, solid
  const [detailsSectionHeight, setDetailsSectionHeight] = useState(400); // Default height in px
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(400);
  const calendarModalRef = useRef(null);
  const calendarHeaderRef = useRef(null);
  const calendarControlsRef = useRef(null);
  const calendarLegendRef = useRef(null);
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
    // Normalize the target date to midnight in local timezone
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const targetDateStr = targetDate.toDateString();
    
    return feedings.filter(f => {
      if (!f.timestamp && !f.date) return false;
      const feedingDate = new Date(f.timestamp || f.date);
      // Normalize feeding date to midnight in local timezone
      feedingDate.setHours(0, 0, 0, 0);
      return feedingDate.toDateString() === targetDateStr;
    });
  };

  // Handle day click
  const handleDayClick = (day) => {
    if (!day.isCurrentMonth) return; // Don't allow clicking on other month days
    setSelectedDate(day.date);
    setSelectedFilter('all'); // Reset filter when selecting a new date
  };

  // Calculate maximum height for details section
  const getMaxHeight = useCallback(() => {
    if (!calendarHeaderRef.current || !calendarControlsRef.current || !calendarLegendRef.current) {
      return 2000; // Increased fallback
    }
    
    // Use viewport height directly instead of modal height to allow more expansion
    const viewportHeight = window.innerHeight;
    const headerHeight = calendarHeaderRef.current.offsetHeight; // "Feeding Calendar" header
    const controlsHeight = calendarControlsRef.current.offsetHeight; // Month navigation
    const legendHeight = calendarLegendRef.current.offsetHeight; // Footer hint
    
    // Calculate available space: viewport height minus fixed sections
    // Allow expansion almost to the "Feeding Calendar" header - only keep header visible
    // Reserve minimal space for controls (can be hidden) and legend
    const minControlsSpace = 0; // Allow controls to be hidden
    const modalPadding = 20; // Minimal padding
    const availableHeight = viewportHeight - headerHeight - minControlsSpace - legendHeight - modalPadding;
    
    // Return available height, but ensure minimum of 200px and allow up to 2000px
    return Math.max(200, Math.min(2000, availableHeight));
  }, []);

  // Resize handlers
  const handleResizeMove = useCallback((e) => {
    const deltaY = startYRef.current - e.clientY; // Inverted because we're dragging up
    const maxHeight = getMaxHeight();
    const newHeight = Math.max(200, Math.min(maxHeight, startHeightRef.current + deltaY));
    setDetailsSectionHeight(newHeight);
  }, [getMaxHeight]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleResizeMove]);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = detailsSectionHeight;
    // Recalculate max height at start of resize to get accurate measurements
    const maxHeight = getMaxHeight();
    if (detailsSectionHeight > maxHeight) {
      setDetailsSectionHeight(maxHeight);
      startHeightRef.current = maxHeight;
    }
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [detailsSectionHeight, handleResizeMove, handleResizeEnd, getMaxHeight]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [handleResizeMove, handleResizeEnd]);

  // Get filtered feedings for selected date
  const getFilteredFeedingsForDay = () => {
    const dayFeedings = getFeedingsForDay(selectedDate);
    if (selectedFilter === 'all') {
      return dayFeedings;
    }
    return dayFeedings.filter(f => f.type === selectedFilter);
  };

  // Get count for each feeding type
  const feedingCounts = useMemo(() => {
    if (!selectedDate) return { all: 0, breast: 0, bottle: 0, solid: 0 };
    const dayFeedings = getFeedingsForDay(selectedDate);
    return {
      all: dayFeedings.length,
      breast: dayFeedings.filter(f => f.type === 'breast').length,
      bottle: dayFeedings.filter(f => f.type === 'bottle').length,
      solid: dayFeedings.filter(f => f.type === 'solid').length
    };
  }, [selectedDate, feedings]);

  // Format time for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Get feeding type label
  const getTypeLabel = (type) => {
    switch (type) {
      case 'breast': return 'Breastfeeding';
      case 'bottle': return 'Bottle Feeding';
      case 'solid': return 'Solid Food';
      default: return type;
    }
  };

  // Get feeding type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'breast': return '🤱';
      case 'bottle': return '🍼';
      case 'solid': return '🥘';
      default: return '🍽️';
    }
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
      <div className="calendar-modal" ref={calendarModalRef} onClick={(e) => e.stopPropagation()}>
        <div className="calendar-header" ref={calendarHeaderRef}>
          <h2>📅 Feeding Calendar</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="calendar-controls" ref={calendarControlsRef}>
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
              const hasFeedings = dayFeedings.length > 0;
              
              return (
                <div
                  key={index}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''} ${hasFeedings ? 'has-feedings' : ''} ${selectedDate && selectedDate.toDateString() === day.date.toDateString() ? 'selected' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="day-number">{day.date.getDate()}</div>
                  {hasFeedings && (
                    <div className="day-feedings-dot" title={`${dayFeedings.length} feeding(s)`}>
                      <span className="dot"></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Details Section - Inline */}
        {selectedDate && (
          <div 
            className="day-details-section"
            style={{ height: `${detailsSectionHeight}px`, maxHeight: 'calc(100vh - 180px)' }}
          >
            {/* Resize Handle */}
            <div 
              className="resize-handle"
              onMouseDown={handleResizeStart}
              ref={resizeRef}
            >
              <div className="resize-handle-line"></div>
            </div>
            
            <div className="day-details-header-inline">
              <h3>
                Feedings for {selectedDate.toLocaleDateString('default', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button className="day-details-close" onClick={() => setSelectedDate(null)}>✕</button>
            </div>
            
            {/* Filter Tabs */}
            <div className="feeding-filter-tabs">
              <button 
                className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('all')}
              >
                <span>All</span>
                {feedingCounts.all > 0 && <span className="tab-count">{feedingCounts.all}</span>}
              </button>
              <button 
                className={`filter-tab ${selectedFilter === 'breast' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('breast')}
              >
                <span className="tab-icon">🤱</span>
                <span>Breast</span>
                {feedingCounts.breast > 0 && <span className="tab-count">{feedingCounts.breast}</span>}
              </button>
              <button 
                className={`filter-tab ${selectedFilter === 'bottle' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('bottle')}
              >
                <span className="tab-icon">🍼</span>
                <span>Bottle</span>
                {feedingCounts.bottle > 0 && <span className="tab-count">{feedingCounts.bottle}</span>}
              </button>
              <button 
                className={`filter-tab ${selectedFilter === 'solid' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('solid')}
              >
                <span className="tab-icon">🥘</span>
                <span>Solid</span>
                {feedingCounts.solid > 0 && <span className="tab-count">{feedingCounts.solid}</span>}
              </button>
            </div>

            <div className="day-details-content-inline">
              {getFilteredFeedingsForDay().length === 0 ? (
                <div className="no-feedings">
                  <p>
                    {getFeedingsForDay(selectedDate).length === 0 
                      ? 'No feedings logged for this day.' 
                      : `No ${selectedFilter === 'all' ? '' : selectedFilter} feedings for this day.`}
                  </p>
                </div>
              ) : (
                <div className="feedings-list">
                  {getFilteredFeedingsForDay()
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((feeding) => (
                      <div key={feeding.id} className="feeding-detail-item">
                        <div className="feeding-detail-header">
                          <div className="feeding-detail-type">
                            <span className="feeding-detail-icon">{getTypeIcon(feeding.type)}</span>
                            <span className="feeding-detail-label">{getTypeLabel(feeding.type)}</span>
                          </div>
                          <div className="feeding-detail-time">{formatTime(feeding.timestamp)}</div>
                        </div>
                        <div className="feeding-detail-info">
                          {feeding.amount && (
                            <div className="feeding-detail-stat">
                              <span className="stat-label">Amount:</span>
                              <span className="stat-value">{feeding.amount}{feeding.type === 'solid' ? 'g' : 'ml'}</span>
                            </div>
                          )}
                          {feeding.duration && (
                            <div className="feeding-detail-stat">
                              <span className="stat-label">Duration:</span>
                              <span className="stat-value">{feeding.duration} min</span>
                            </div>
                          )}
                          {feeding.side && (
                            <div className="feeding-detail-stat">
                              <span className="stat-label">Side:</span>
                              <span className="stat-value">{feeding.side.charAt(0).toUpperCase() + feeding.side.slice(1)}</span>
                            </div>
                          )}
                          {feeding.foodType && (
                            <div className="feeding-detail-stat">
                              <span className="stat-label">Food Type:</span>
                              <span className="stat-value">{feeding.foodType.charAt(0).toUpperCase() + feeding.foodType.slice(1)}</span>
                            </div>
                          )}
                          {feeding.details && (
                            <div className="feeding-detail-stat">
                              <span className="stat-label">Details:</span>
                              <span className="stat-value">{feeding.details}</span>
                            </div>
                          )}
                          {feeding.notes && (
                            <div className="feeding-detail-notes">
                              <span className="stat-label">Notes:</span>
                              <span className="stat-value">{feeding.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="calendar-legend" ref={calendarLegendRef}>
          <div className="legend-hint">
            <span>💡 Click on a date to view feeding details</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedingCalendar;
