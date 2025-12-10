import { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/pages.css';
import { useBaby } from '../contexts/BabyContext';
import ActivitiesChat from '../components/ActivitiesChat';
import { useAIChat } from '../hooks/useAIChat';

const STORAGE_KEY = 'baby-bloom-activities';

const activityIdeas = [
  { icon: '👶', title: 'Tummy Time', description: 'Help strengthen neck and back muscles', duration: '5-15 min', minMonths: 0, maxMonths: 8 },
  { icon: '📚', title: 'Story Time', description: 'Read board books to encourage language development', duration: '10-20 min', minMonths: 0, maxMonths: 24 },
  { icon: '🎵', title: 'Music and Dance', description: 'Play music and move together to develop rhythm', duration: '10-15 min', minMonths: 6, maxMonths: 24 },
  { icon: '🧩', title: 'Stacking Blocks', description: 'Build fine motor skills with soft blocks', duration: '10-20 min', minMonths: 7, maxMonths: 24 },
  { icon: '🪞', title: 'Mirror Play', description: 'Explore self-awareness with safe mirrors', duration: '5-10 min', minMonths: 3, maxMonths: 12 },
  { icon: '🎨', title: 'Sensory Bins', description: 'Explore textures with safe materials', duration: '15-30 min', minMonths: 6, maxMonths: 24 },
  { icon: '🔔', title: 'Rattle Play', description: 'Shake and explore cause and effect', duration: '5-10 min', minMonths: 0, maxMonths: 9 },
  { icon: '🎈', title: 'Ball Rolling', description: 'Track moving objects and develop hand-eye coordination', duration: '10-15 min', minMonths: 5, maxMonths: 18 },
];

const Activities = () => {
  const { activeBaby } = useBaby();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('overview');
  const [activities, setActivities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    icon: '🎨',
    duration: '',
    timestamp: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  // Load activities
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setActivities(Array.isArray(saved) ? saved : []);
    } catch {
      setActivities([]);
    }
  }, []);

  // Save activities
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  // Auto-open modal if 'add' parameter is present
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      openModal();
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openModal = (activity = null) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        title: activity.title || '',
        icon: activity.icon || '🎨',
        duration: activity.duration || '',
        timestamp: activity.timestamp ? new Date(activity.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        notes: activity.notes || ''
      });
    } else {
      setEditingActivity(null);
      setFormData({
        title: '',
        icon: '🎨',
        duration: '',
        timestamp: new Date().toISOString().slice(0, 16),
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter an activity title');
      return;
    }

    const activityData = {
      id: editingActivity ? editingActivity.id : Date.now(),
      title: formData.title.trim(),
      icon: formData.icon || '🎨',
      duration: formData.duration,
      timestamp: new Date(formData.timestamp).toISOString(),
      notes: formData.notes.trim()
    };

    if (editingActivity) {
      setActivities(activities.map(a => a.id === editingActivity.id ? activityData : a));
    } else {
      setActivities([activityData, ...activities]);
    }

    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this activity?')) {
      setActivities(activities.filter(a => a.id !== id));
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const selectIdea = (idea) => {
    setFormData({
      ...formData,
      title: idea.title,
      icon: idea.icon,
      duration: idea.duration
    });
    setIsIdeasOpen(false);
    setIsModalOpen(true);
  };

  const babyAgeInMonths = useMemo(() => {
    if (activeBaby?.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(activeBaby.dateOfBirth);
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
        (today.getMonth() - birthDate.getMonth());
      const days = today.getDate() - birthDate.getDate();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      return months + Math.max(0, days) / daysInMonth;
    }

    if (typeof window !== 'undefined') {
      const stored = Number(localStorage.getItem('babyAgeMonths'));
      if (Number.isFinite(stored) && stored >= 0) {
        return stored;
      }
    }

    return null;
  }, [activeBaby]);

  const filteredIdeas = useMemo(() => {
    if (babyAgeInMonths === null) return activityIdeas;
    return activityIdeas.filter(({ minMonths = 0, maxMonths = Infinity }) => {
      return babyAgeInMonths >= minMonths && babyAgeInMonths <= maxMonths;
    });
  }, [babyAgeInMonths]);

  // AI Chat hook
  const getSystemPrompt = (babyAge) => `You are an Activity Assistant. Provide SHORT, PINPOINTED, practical answers about baby activities and play. Follow these rules:

1. RESPONSE STYLE:
- Maximum 3-4 sentences per answer
- Get straight to the point
- Natural, conversational tone
- Use emojis sparingly (🎨 only when appropriate)
- No fluff or filler words
- Focus on what parents can do

2. FORMATTING:
- Use **bold** for the main answer title (optional, only if it helps clarity)
- Answer directly in 1-3 sentences
- Use bullet points ONLY when providing multiple actionable tips or steps
- Include "Key Tips:" section ONLY when the answer benefits from additional actionable advice (not for simple suggestions or straightforward answers)

3. WHEN TO USE KEY TIPS:
- Use Key Tips for troubleshooting questions, multi-step processes, or when providing multiple actionable suggestions
- DON'T use Key Tips for simple activity suggestions, yes/no questions, or when the answer is already complete in 1-2 sentences
- Examples that NEED Key Tips: troubleshooting, "how to" questions, complex topics
- Examples that DON'T need Key Tips: "what activities", simple suggestions, straightforward questions

4. ACTIVITY TOPICS:

A. AGE-APPROPRIATE ACTIVITY SUGGESTIONS:
- Provide activities suitable for baby's age: ${babyAge} months
- General guidelines:
  * 0-3 months: Tummy time, high-contrast visuals, music, rattles
  * 3-6 months: Reaching, grasping, mirror play, peek-a-boo
  * 6-9 months: Sitting play, stacking, cause-and-effect toys
  * 9-12 months: Crawling games, simple puzzles, ball play
  * 12-18 months: Walking activities, pretend play, simple sorting
- Always mention: "Adjust activities based on your baby's development and interests."

B. DEVELOPMENTAL PLAY IDEAS:
- Motor skills: Activities that develop gross and fine motor skills
- Cognitive skills: Problem-solving, cause-and-effect, object permanence
- Language skills: Reading, singing, talking, naming objects
- Social skills: Interactive play, turn-taking, imitation
- Always include: "Play is how babies learn. Follow their lead and interests."

C. ACTIVITY TROUBLESHOOTING:
- Baby not interested: Try different times, shorter duration, or different activities
- Baby gets frustrated: Simplify the activity, provide more support
- Safety concerns: Always supervise, use age-appropriate materials
- Always include: "Every baby is different. Adjust activities to match your baby's temperament and development."

D. SENSORY PLAY IDEAS:
- Texture exploration: Safe materials (water, sand, rice, fabric)
- Visual stimulation: High-contrast images, colors, lights
- Auditory: Music, sounds, instruments
- Always include: "Ensure all materials are safe and age-appropriate. Supervise closely."

E. MOTOR SKILL DEVELOPMENT ACTIVITIES:
- Gross motor: Tummy time, rolling, crawling, walking activities
- Fine motor: Grasping, stacking, transferring objects, finger foods
- Balance and coordination: Sitting, standing, walking games
- Always include: "Encourage but don't force. Let baby progress at their own pace."

5. CRITICAL RULES:
- Keep every response under 100 words unless user asks for details
- Answer the question directly, no preamble
- Consider baby's age (${babyAge} months) in responses
- Always emphasize safety and supervision
- Never recommend unsafe activities
- Be natural - not every answer needs formatting or bullet points

6. EXAMPLES:

User: "What activities are good for my baby?"
You: At ${babyAge} months, try tummy time, reaching for toys, mirror play, and reading board books. Focus on activities that match your baby's current abilities and follow their interests. Keep sessions short (5-15 minutes) and always supervise closely.

User: "Baby doesn't like tummy time"
You: **Tummy Time Troubleshooting**
Start with very short sessions (1-2 minutes), use engaging toys or mirrors, and try after feeding when baby is alert. Gradually increase duration as baby gets stronger.

**Key Tips:**
• Make it fun with toys and interaction
• Try different times of day
• Don't force if baby is very upset

User: "When can babies start playing with blocks?"
You: Most babies can start playing with soft blocks around 6-7 months when they can sit up and grasp objects. Start with large, soft blocks and supervise closely. As they develop, they'll learn to stack and build.

Remember: SHORT, NATURAL, PRACTICAL. Only use formatting and Key Tips when they genuinely help.`;

  const getFallbackResponse = (babyAge) => `**Activity Support** 🎨

I'm here to help with activity questions! Here are quick tips:

**Age-Appropriate Activities**
At ${babyAge} months, focus on activities that match your baby's development stage.

**Key Tips:**
• Follow baby's interests
• Keep activities short and fun
• Always supervise for safety

To get personalized AI responses, set up your VITE_OPENAI_API_KEY. 🎨`;

  const {
    aiStatus,
    aiError,
    conversationHistory,
    suggestionClickRef,
    handleChatMessage
  } = useAIChat(getSystemPrompt, {
    activeBaby,
    babyAgeInMonths,
    maxTokens: 500,
    timeout: 30000,
    getFallbackResponse
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">🎨 Activities</h1>
            <p className="page-subtitle">Track playtime and learning activities</p>
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
              <span>Log Activity</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setIsIdeasOpen(true)}>
              <span>💡</span>
              <span>Activity Ideas</span>
            </button>
            <button
              className={`btn btn-new-feature ${viewMode === 'ai' ? 'active' : ''}`}
              onClick={() => setViewMode('ai')}
            >
              <span>🤖</span>
              <span>AI Activity Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'overview' && (
        <div className="content-grid">
          <div className="feeding-log">
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Recent Activities</h3>
            {activities.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎨</div>
                <h3>No activities logged yet</h3>
                <p>Start tracking your baby's playtime and learning activities</p>
                <div className="empty-tips">
                  <div className="empty-tip"><span>🎯</span><span>Track tummy time, reading, and play sessions</span></div>
                  <div className="empty-tip"><span>⏱️</span><span>Monitor activity duration and engagement</span></div>
                  <div className="empty-tip"><span>💡</span><span>Get activity ideas based on your baby's age</span></div>
                </div>
                <button className="btn btn-primary btn-large" onClick={() => openModal()}>
                  <span>➕</span>
                  <span>Log Your First Activity</span>
                </button>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="log-entry" style={{ borderLeftColor: 'var(--warning)' }}>
                  <div className="log-entry-header">
                    <div className="log-entry-type">
                      <span className="log-entry-icon">{activity.icon || '🎨'}</span>
                      <span>{activity.title}</span>
                    </div>
                    <div className="log-entry-time">{getTimeAgo(activity.timestamp)}</div>
                  </div>
                  <div className="log-entry-details">
                    {activity.duration && (
                      <div className="log-entry-detail">
                        <span>⏱️</span>
                        <span>{activity.duration}</span>
                      </div>
                    )}
                    {activity.notes && (
                      <div className="log-entry-detail">
                        <span>📝</span>
                        <span>{activity.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="log-entry-actions">
                    <button onClick={() => openModal(activity)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDelete(activity.id)} className="btn-icon">🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="info-panel">
            <div className="tip-card" style={{ background: 'linear-gradient(135deg, var(--warning) 0%, var(--accent) 100%)' }}>
              <div className="tip-card-title">
                <span>💡</span>
                <span>Activity Suggestions</span>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Peek-a-boo games</div>
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Stacking blocks</div>
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Mirror play</div>
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Sensory bins</div>
                <div>• Reading board books</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'ai' && (
        <div className="ai-planner-container">
          <div className="ai-chat-wrapper">
            <ActivitiesChat
              onSendMessage={handleChatMessage}
              isLoading={aiStatus === 'loading'}
              error={aiError}
              onSuggestionClick={suggestionClickRef}
            />
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingActivity ? 'Edit Activity' : 'Log Activity'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              <div>
                <label className="form-label">Activity Title *</label>
                <input
                  className="form-input"
                  style={{ fontSize: "1rem" }}
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Tummy Time"
                  required
                />
              </div>
              <div>
                <label className="form-label">Icon</label>
                <input
                  className="form-input"
                  style={{ fontSize: "1rem" }}
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="??"
                  maxLength="2"
                />
              </div>
              <div>
                <label className="form-label">Duration</label>
                <input
                  className="form-input"
                  style={{ fontSize: "1rem" }}
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 15 min"
                />
              </div>
              <div>
                <label className="form-label">Date & Time</label>
                <input
                  className="form-input"
                  style={{ fontSize: "0.95rem" }}
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  style={{ fontSize: "1rem" }}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes about the activity"
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingActivity ? 'Save' : 'Log Activity'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Ideas Modal */}
      {isIdeasOpen && (
        <div className="modal-overlay" onClick={() => setIsIdeasOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">💡 Activity Ideas</h3>
              <button className="modal-close" onClick={() => setIsIdeasOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                Tap on any activity idea to add it to your log
              </p>
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {filteredIdeas.length === 0 && (
                  <div
                    className="card"
                    style={{
                      padding: 'var(--spacing-md)',
                      textAlign: 'center',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    No age-appropriate ideas right now. Update your baby profile to see tailored suggestions.
                  </div>
                )}
                {filteredIdeas.map((idea, index) => (
                  <div
                    key={index}
                    className="card"
                    style={{
                      padding: 'var(--spacing-md)',
                      cursor: 'pointer',
                      border: '2px solid var(--border)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => selectIdea(idea)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                      <span style={{ fontSize: '2rem' }}>{idea.icon}</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, marginBottom: 'var(--spacing-xs)' }}>{idea.title}</h4>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          {idea.description}
                        </p>
                        <div style={{ marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                          ⏱️ {idea.duration}
                        </div>
                      </div>
                      <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
