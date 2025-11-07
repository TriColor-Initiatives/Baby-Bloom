import { useState, useEffect, useRef } from 'react';
import './FeedingTimer.css';

const FeedingTimer = ({ onComplete, onClose }) => {
  const [feedingType, setFeedingType] = useState('breast');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSide, setCurrentSide] = useState('left');
  const [leftTime, setLeftTime] = useState(0);
  const [rightTime, setRightTime] = useState(0);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now() - pausedTimeRef.current;
    
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
      
      if (feedingType === 'breast') {
        if (currentSide === 'left') {
          setLeftTime(elapsed - rightTime);
        } else {
          setRightTime(elapsed - leftTime);
        }
      }
    }, 1000);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    pausedTimeRef.current = elapsedTime * 1000;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resumeTimer = () => {
    setIsPaused(false);
    startTimer();
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setIsPaused(false);
  };

  const switchSide = () => {
    if (feedingType === 'breast' && isRunning) {
      setCurrentSide(prev => prev === 'left' ? 'right' : 'left');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    stopTimer();
    
    const feedingData = {
      type: feedingType,
      duration: Math.floor(elapsedTime / 60),
      timestamp: new Date().toISOString(),
      notes: notes || undefined
    };

    if (feedingType === 'breast') {
      feedingData.side = leftTime > 0 && rightTime > 0 ? 'both' : 
                        leftTime > rightTime ? 'left' : 'right';
      feedingData.leftDuration = Math.floor(leftTime / 60);
      feedingData.rightDuration = Math.floor(rightTime / 60);
    } else if (feedingType === 'bottle' && amount) {
      feedingData.amount = parseFloat(amount);
    }

    onComplete(feedingData);
    onClose();
  };

  const getSideColor = (side) => {
    if (feedingType !== 'breast') return 'var(--text-tertiary)';
    if (!isRunning) return 'var(--text-tertiary)';
    return currentSide === side ? 'var(--primary)' : 'var(--text-tertiary)';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="timer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="timer-header">
          <h2>🍼 Feeding Timer</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="timer-content">
          {!isRunning && !isPaused && (
            <div className="timer-setup">
              <div className="form-group">
                <label>Feeding Type</label>
                <div className="timer-type-selector">
                  <button
                    type="button"
                    className={`type-btn ${feedingType === 'breast' ? 'active' : ''}`}
                    onClick={() => setFeedingType('breast')}
                  >
                    🤱 Breast
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${feedingType === 'bottle' ? 'active' : ''}`}
                    onClick={() => setFeedingType('bottle')}
                  >
                    🍼 Bottle
                  </button>
                </div>
              </div>

              {feedingType === 'bottle' && (
                <div className="form-group">
                  <label>Amount (ml) - Optional</label>
                  <input
                    type="number"
                    placeholder="e.g., 180"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Notes - Optional</label>
                <textarea
                  placeholder="Add any notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                />
              </div>

              <button className="btn btn-primary timer-start-btn" onClick={startTimer}>
                ▶️ Start Timer
              </button>
            </div>
          )}

          {(isRunning || isPaused) && (
            <div className="timer-active">
              <div className="timer-display">
                <div className="main-timer">
                  <div className="timer-value">{formatTime(elapsedTime)}</div>
                  <div className="timer-label">Total Duration</div>
                </div>

                {feedingType === 'breast' && (
                  <div className="side-timers">
                    <div className="side-timer" style={{ color: getSideColor('left') }}>
                      <div className="side-icon">👈</div>
                      <div className="side-time">{formatTime(leftTime)}</div>
                      <div className="side-label">Left</div>
                    </div>
                    <div className="side-timer" style={{ color: getSideColor('right') }}>
                      <div className="side-icon">👉</div>
                      <div className="side-time">{formatTime(rightTime)}</div>
                      <div className="side-label">Right</div>
                    </div>
                  </div>
                )}

                {feedingType === 'breast' && isRunning && (
                  <button 
                    className="btn btn-secondary switch-side-btn"
                    onClick={switchSide}
                  >
                    🔄 Switch to {currentSide === 'left' ? 'Right' : 'Left'} Side
                  </button>
                )}
              </div>

              <div className="timer-controls">
                {!isPaused ? (
                  <button className="btn btn-secondary" onClick={pauseTimer}>
                    ⏸️ Pause
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={resumeTimer}>
                    ▶️ Resume
                  </button>
                )}
                <button className="btn btn-primary" onClick={handleComplete}>
                  ✅ Complete & Save
                </button>
              </div>

              {isPaused && (
                <div className="timer-paused-notice">
                  ⏸️ Timer paused - Resume or complete the feeding
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedingTimer;
