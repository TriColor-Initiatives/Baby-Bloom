import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBaby } from '../contexts/BabyContext';
import FeedingTimer from '../components/FeedingTimer';
import FeedingCalendar from '../components/FeedingCalendar';
import FeedingGoals from '../components/FeedingGoals';
import FeedingChat from '../components/FeedingChat';
import CustomSelect from '../components/onboarding/CustomSelect';
import { useAIChat } from '../hooks/useAIChat';
import '../styles/pages.css';
import './Feeding.css';

const Feeding = () => {
  const { activeBaby } = useBaby();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('overview');
  const [activeFilter, setActiveFilter] = useState('all');
  const [feedings, setFeedings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [editingFeeding, setEditingFeeding] = useState(null);
  const [formData, setFormData] = useState({
    type: 'bottle',
    amount: '',
    duration: '',
    side: 'left',
    foodType: '',
    details: '',
    notes: '',
    timestamp: new Date().toISOString().slice(0, 16)
  });

  // Check if baby is 6 months or older
  const isBaby6MonthsOrOlder = () => {
    if (!activeBaby || !activeBaby.dateOfBirth) return false;
    const today = new Date();
    const birthDate = new Date(activeBaby.dateOfBirth);
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
      (today.getMonth() - birthDate.getMonth());
    return months >= 6;
  };

  const canShowSolidFood = isBaby6MonthsOrOlder();

  // Reset form type if solid food is selected but baby is under 6 months
  useEffect(() => {
    if (formData.type === 'solid' && !canShowSolidFood) {
      setFormData(prev => ({ ...prev, type: 'bottle' }));
    }
    // Reset active filter if it's 'solid' but baby is under 6 months
    if (activeFilter === 'solid' && !canShowSolidFood) {
      setActiveFilter('all');
    }
  }, [canShowSolidFood, formData.type, activeFilter]);

  // Load feedings from localStorage
  useEffect(() => {
    const savedFeedings = localStorage.getItem('baby-bloom-feedings');
    if (savedFeedings) {
      setFeedings(JSON.parse(savedFeedings));
    }
  }, []);

  // Save feedings to localStorage whenever they change
  useEffect(() => {
    if (feedings.length > 0) {
      localStorage.setItem('baby-bloom-feedings', JSON.stringify(feedings));
    }
  }, [feedings]);

  // Auto-open modal if 'add' parameter is present
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      openModal();
      // Remove the parameter after opening
      setSearchParams({});
    }
  }, [searchParams]);

  const openModal = (feeding = null) => {
    if (feeding) {
      setEditingFeeding(feeding);
      setFormData({
        type: feeding.type,
        amount: feeding.amount || '',
        duration: feeding.duration || '',
        side: feeding.side || 'left',
        foodType: feeding.foodType || '',
        details: feeding.details || '',
        notes: feeding.notes || '',
        timestamp: new Date(feeding.timestamp).toISOString().slice(0, 16)
      });
    } else {
      setEditingFeeding(null);
      setFormData({
        type: 'bottle',
        amount: '',
        duration: '',
        side: 'left',
        foodType: '',
        details: '',
        notes: '',
        timestamp: new Date().toISOString().slice(0, 16)
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFeeding(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const feedingData = {
      id: editingFeeding ? editingFeeding.id : Date.now(),
      type: formData.type,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      side: formData.type === 'breast' ? formData.side : undefined,
      foodType: formData.type === 'bottle' ? formData.foodType : undefined,
      details: formData.details || undefined,
      notes: formData.notes || undefined,
      timestamp: new Date(formData.timestamp).toISOString()
    };

    if (editingFeeding) {
      setFeedings(feedings.map(f => f.id === editingFeeding.id ? feedingData : f));
    } else {
      setFeedings([feedingData, ...feedings]);
    }

    closeModal();
  };

  const handleTimerComplete = (feedingData) => {
    const completeFeedingData = {
      id: Date.now(),
      ...feedingData
    };
    setFeedings([completeFeedingData, ...feedings]);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this feeding entry?')) {
      setFeedings(feedings.filter(f => f.id !== id));
    }
  };

  const getFilteredFeedings = () => {
    if (activeFilter === 'all') {
      // If baby is under 6 months, filter out solid food entries
      if (!canShowSolidFood) {
        return feedings.filter(f => f.type !== 'solid');
      }
      return feedings;
    }
    // If trying to filter by solid food but baby is under 6 months, return empty
    if (activeFilter === 'solid' && !canShowSolidFood) {
      return [];
    }
    return feedings.filter(f => f.type === activeFilter);
  };

  const getTodayFeedings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return feedings.filter(f => new Date(f.timestamp) >= today);
  };

  const calculateStats = () => {
    const todayFeedings = getTodayFeedings();
    const totalAmount = todayFeedings.reduce((sum, f) => sum + (f.amount || 0), 0);

    let lastFed = 'No feedings today';
    if (todayFeedings.length > 0) {
      const sorted = [...todayFeedings].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      lastFed = getTimeAgo(new Date(sorted[0].timestamp));
    }

    let avgInterval = '--';
    if (todayFeedings.length > 1) {
      const sorted = [...todayFeedings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const intervals = [];
      for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i].timestamp) - new Date(sorted[i - 1].timestamp)) / (1000 * 60 * 60);
        intervals.push(diff);
      }
      const avg = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      avgInterval = avg.toFixed(1) + ' hours';
    }

    return {
      totalFeedings: todayFeedings.length,
      totalAmount: totalAmount > 0 ? totalAmount + 'ml' : '--',
      lastFed,
      avgInterval
    };
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bottle': return '🍼';
      case 'breast': return '🤱';
      case 'solid': return '🥘';
      default: return '🍽️';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'bottle': return 'Bottle Feed';
      case 'breast': return 'Breastfeed';
      case 'solid': return 'Solid Food';
      default: return 'Feeding';
    }
  };

  const filteredFeedings = getFilteredFeedings();
  const stats = calculateStats();

  // AI Chat hook
  const getSystemPrompt = (babyAge) => `You are a Feeding Assistant. Provide SHORT, PINPOINTED, practical answers about baby feeding. Follow these rules:

1. RESPONSE STYLE:
- Maximum 3-4 sentences per answer
- Get straight to the point
- Natural, conversational tone
- Use emojis sparingly (🍼 only when appropriate)
- No fluff or filler words
- Focus on what parents can do

2. FORMATTING:
- Use **bold** for the main answer title (optional, only if it helps clarity)
- Answer directly in 1-3 sentences
- Use bullet points ONLY when providing multiple actionable tips or steps
- Include "Key Tips:" section ONLY when the answer benefits from additional actionable advice (not for simple yes/no or straightforward answers)

3. WHEN TO USE KEY TIPS:
- Use Key Tips for troubleshooting questions, multi-step processes, or when providing actionable advice
- DON'T use Key Tips for simple factual answers, yes/no questions, or when the answer is already complete in 1-2 sentences
- Examples that NEED Key Tips: troubleshooting, "how to" questions, complex topics
- Examples that DON'T need Key Tips: "how often", "when to start", simple factual questions

4. FEEDING TOPICS:

A. FEEDING SCHEDULES:
- Provide age-appropriate feeding frequency and amounts
- Consider baby's age: ${babyAge} months
- General guidelines:
  * Newborns (0-3 months): 8-12 feeds per day, on-demand
  * 3-6 months: 6-8 feeds per day, every 3-4 hours
  * 6-12 months: 4-6 feeds per day plus solid foods
- Always mention: "Every baby is different. Follow your baby's hunger cues."

B. TROUBLESHOOTING:
- Feeding refusal: Check for teething, illness, or overstimulation. Try different positions or timing.
- Gas: Burp frequently, hold upright after feeding, check bottle nipple size or latch.
- Spitting up: Normal if not excessive. Keep baby upright, avoid overfeeding.
- Always include: "If concerns persist, consult your pediatrician."

C. NUTRITION QUESTIONS:
- Formula vs. breast milk: Both provide complete nutrition. Choose based on your situation.
- Solid food introduction: Start around 6 months with single-ingredient purees.
- Allergens: Introduce common allergens (eggs, peanuts) early, one at a time.
- Always include: "Consult your pediatrician for personalized nutrition advice."

D. WEANING GUIDANCE:
- When to start: Around 6 months, when baby shows readiness signs (sitting up, showing interest in food).
- How to start: Begin with single-ingredient purees, gradually increase texture.
- Breastfeeding weaning: Gradual process, can take weeks to months. Reduce feeds slowly.
- Always include: "Weaning is a gradual process. Follow your baby's pace."

5. CRITICAL RULES:
- Keep every response under 100 words unless user asks for details
- Answer the question directly, no preamble
- Never diagnose medical conditions
- Always recommend consulting pediatrician for persistent concerns
- Consider baby's age (${babyAge} months) in responses
- Be natural - not every answer needs formatting or bullet points

6. EXAMPLES:

User: "How often should I feed my baby?"
You: At ${babyAge} months, most babies need 4-6 feeds per day plus solid foods. Follow your baby's hunger cues - they'll let you know when they're hungry. Every baby is different, so trust your instincts.

User: "Baby is refusing to eat"
You: **Feeding Refusal Troubleshooting**
Check for teething, illness, or overstimulation. Try different feeding positions, timing, or environment. Ensure baby isn't too tired or distracted.

**Key Tips:**
• Try feeding when baby is calm and alert
• Offer smaller amounts more frequently
• Check for signs of illness or discomfort

If refusal lasts more than 24 hours or baby shows signs of dehydration, consult your pediatrician.

User: "When can I start solid foods?"
You: Most babies are ready for solid foods around 6 months when they can sit up with support, show interest in food, and have good head control. Start with single-ingredient purees and introduce new foods one at a time.

Remember: SHORT, NATURAL, PRACTICAL. Only use formatting and Key Tips when they genuinely help.`;

  const getFallbackResponse = (babyAge) => `**Feeding Support** 🍼

I'm here to help with feeding questions! Here are quick tips:

**Feeding Schedules**
At ${babyAge} months, most babies need 4-6 feeds per day plus solid foods.

**Key Tips:**
• Follow baby's hunger cues
• Every baby is different
• Consult your pediatrician for personalized advice

To get personalized AI responses, set up your VITE_OPENAI_API_KEY. 🍼`;

  const {
    aiStatus,
    aiError,
    conversationHistory,
    suggestionClickRef,
    handleChatMessage
  } = useAIChat(getSystemPrompt, {
    activeBaby,
    maxTokens: 500,
    timeout: 30000,
    getFallbackResponse
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">🍼 Feeding Tracker</h1>
            <p className="page-subtitle">Track and manage your baby's feeding schedule</p>
          </div>
          <div className="page-actions">
            <button
              className={`btn ${viewMode === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('overview')}
            >
              <span>📋</span>
              <span>Overview</span>
            </button>
            <button className="btn btn-secondary" onClick={() => openModal()}>
              <span>➕</span>
              <span>Log Feeding</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setIsTimerOpen(true)}>
              <span>⏱️</span>
              <span>Start Timer</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setIsCalendarOpen(true)}>
              <span>📅</span>
              <span>Calendar</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setIsGoalsOpen(true)}>
              <span>🎯</span>
              <span>Goals</span>
            </button>
            <button
              className={`btn btn-new-feature ${viewMode === 'ai' ? 'active' : ''}`}
              onClick={() => setViewMode('ai')}
            >
              <span>🤖</span>
              <span>AI Feeding Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'overview' && (
        <div className="content-grid">
          <div className="feeding-log">
            <div className="log-filters">
              <button
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${activeFilter === 'bottle' ? 'active' : ''}`}
                onClick={() => setActiveFilter('bottle')}
              >
                🍼 Bottle
              </button>
              <button
                className={`filter-btn ${activeFilter === 'breast' ? 'active' : ''}`}
                onClick={() => setActiveFilter('breast')}
              >
                🤱 Breast
              </button>
              {canShowSolidFood && (
                <button
                  className={`filter-btn ${activeFilter === 'solid' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('solid')}
                >
                  🥘 Solid Food
                </button>
              )}
            </div>

            <div className="log-entries">
              {filteredFeedings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🍼</div>
                  <h3>No feedings logged yet</h3>
                  <p>Start tracking your baby's feeding journey!</p>
                  <div className="empty-tips">
                    <div className="empty-tip">
                      <span>💡</span>
                      <span>Track bottle, breast, and solid foods</span>
                    </div>
                    <div className="empty-tip">
                      <span>📊</span>
                      <span>See patterns and analytics</span>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-large" onClick={() => openModal()}>
                    <span>➕</span>
                    <span>Log Your First Feeding</span>
                  </button>
                </div>
              ) : (
                filteredFeedings.map((feeding) => (
                  <div key={feeding.id} className="log-entry">
                    <div className="log-entry-header">
                      <div className="log-entry-type">
                        <span className="log-entry-icon">{getTypeIcon(feeding.type)}</span>
                        <span>{getTypeLabel(feeding.type)}</span>
                      </div>
                      <div className="log-entry-time">{getTimeAgo(new Date(feeding.timestamp))}</div>
                    </div>
                    <div className="log-entry-details">
                      {feeding.amount && (
                        <div className="log-entry-detail">
                          <span>📏</span>
                          <span>{feeding.amount}{feeding.type === 'solid' ? 'g' : 'ml'}</span>
                        </div>
                      )}
                      {feeding.duration && (
                        <div className="log-entry-detail">
                          <span>⏱️</span>
                          <span>{feeding.duration} min</span>
                        </div>
                      )}
                      {feeding.side && (
                        <div className="log-entry-detail">
                          <span>👶</span>
                          <span>{feeding.side.charAt(0).toUpperCase() + feeding.side.slice(1)}</span>
                        </div>
                      )}
                      {feeding.foodType && (
                        <div className="log-entry-detail">
                          <span>🍼</span>
                          <span>{feeding.foodType.charAt(0).toUpperCase() + feeding.foodType.slice(1)}</span>
                        </div>
                      )}
                      {feeding.details && (
                        <div className="log-entry-detail">
                          <span>🥘</span>
                          <span>{feeding.details}</span>
                        </div>
                      )}
                      {feeding.notes && (
                        <div className="log-entry-detail">
                          <span>📝</span>
                          <span>{feeding.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="log-entry-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => openModal(feeding)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(feeding.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="info-panel">
            <div className="info-card">
              <div className="info-card-title">
                <span>📊</span>
                <span>Today's Summary</span>
              </div>
              <div className="info-item">
                <div className="info-item-label">Total Feedings</div>
                <div className="info-item-value">{stats.totalFeedings}</div>
              </div>
              <div className="info-item">
                <div className="info-item-label">Total Amount</div>
                <div className="info-item-value">{stats.totalAmount}</div>
              </div>
              <div className="info-item">
                <div className="info-item-label">Last Fed</div>
                <div className="info-item-value">{stats.lastFed}</div>
              </div>
              <div className="info-item">
                <div className="info-item-label">Avg Interval</div>
                <div className="info-item-value">{stats.avgInterval}</div>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-card-title">
                <span>💡</span>
                <span>Feeding Tip</span>
              </div>
              <p className="tip-card-text">
                At 6-12 months, babies typically need 24-32 oz of formula per day along with solid foods. Introduce new foods one at a time, waiting 3-5 days between each.
              </p>
            </div>

            {/* Meal Ideas card removed as requested */}
          </div>
        </div>
      )}

      {viewMode === 'ai' && (
        <div className="ai-planner-container">
          <div className="ai-chat-wrapper">
            <FeedingChat
              onSendMessage={handleChatMessage}
              isLoading={aiStatus === 'loading'}
              error={aiError}
              onSuggestionClick={suggestionClickRef}
            />
          </div>
        </div>
      )}

      {/* Add Feeding Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFeeding ? 'Edit Feeding' : 'Log New Feeding'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="feeding-form">
              <div className="form-group">
                <label>Feeding Type *</label>
                <div className="type-selector">
                  <button
                    type="button"
                    className={`type-btn ${formData.type === 'bottle' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'bottle' })}
                  >
                    🍼 Bottle
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${formData.type === 'breast' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'breast' })}
                  >
                    🤱 Breast
                  </button>
                  {canShowSolidFood && (
                    <button
                      type="button"
                      className={`type-btn ${formData.type === 'solid' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, type: 'solid' })}
                    >
                      🥘 Solid
                    </button>
                  )}
                </div>
              </div>

              {formData.type === 'bottle' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Amount (ml)</label>
                      <input
                        type="number"
                        placeholder="e.g., 180"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration (min)</label>
                      <input
                        type="number"
                        placeholder="e.g., 15"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <CustomSelect
                      value={formData.foodType}
                      onChange={(val) => setFormData({ ...formData, foodType: val })}
                      options={[
                        { value: 'formula', label: 'Formula' },
                        { value: 'breast-milk', label: 'Breast Milk' },
                      ]}
                      placeholder="Select type"
                    />
                  </div>
                </>
              )}

              {formData.type === 'breast' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Duration (min)</label>
                      <input
                        type="number"
                        placeholder="e.g., 20"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Side</label>
                      <CustomSelect
                        value={formData.side}
                        onChange={(val) => setFormData({ ...formData, side: val })}
                        options={[
                          { value: 'left', label: 'Left' },
                          { value: 'right', label: 'Right' },
                          { value: 'both', label: 'Both' },
                        ]}
                        placeholder="Choose side"
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.type === 'solid' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Amount (g)</label>
                      <input
                        type="number"
                        placeholder="e.g., 50"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Food Details</label>
                      <input
                        type="text"
                        placeholder="e.g., Mashed carrots"
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Add any additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFeeding ? 'Update' : 'Save'} Feeding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timer Modal */}
      {isTimerOpen && (
        <FeedingTimer
          canShowSolidFood={canShowSolidFood}
          onComplete={handleTimerComplete}
          onClose={() => setIsTimerOpen(false)}
        />
      )}
      {/* Calendar Modal */}
      {isCalendarOpen && (
        <FeedingCalendar
          feedings={feedings}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}

      {/* Goals Modal */}
      {isGoalsOpen && (
        <FeedingGoals
          feedings={feedings}
          onClose={() => setIsGoalsOpen(false)}
        />
      )}
    </div>
  );
};

export default Feeding;
