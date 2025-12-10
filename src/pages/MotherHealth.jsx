import { useState, useRef } from 'react';
import '../styles/pages.css';
import MotherHealthChat from '../components/MotherHealthChat';
import { useAIChat } from '../hooks/useAIChat';

const MotherHealth = () => {
  const [viewMode, setViewMode] = useState('overview');

  // AI Chat hook
  const getSystemPrompt = () => `You are a Postpartum Wellness Assistant. Provide SHORT, PINPOINTED, actionable answers. Follow these rules:

1. RESPONSE STYLE:
- Maximum 3-4 sentences per answer
- Get straight to the point
- Natural, conversational tone
- Use emojis sparingly (💗 only when appropriate)
- No fluff or filler words
- Actionable advice only

2. FORMATTING:
- Use **bold** for the main answer title (optional, only if it helps clarity)
- Answer directly in 1-3 sentences
- Use bullet points ONLY when providing multiple actionable tips or steps
- Include "Key Tips:" or "When to Seek Help:" sections ONLY when the answer benefits from additional actionable advice (not for simple factual answers)

3. WHEN TO USE KEY TIPS:
- Use Key Tips for troubleshooting questions, multi-step processes, or when providing actionable strategies
- Use "When to Seek Help:" for emergency symptoms or red flags
- DON'T use Key Tips for simple factual answers, yes/no questions, or when the answer is already complete in 1-2 sentences
- Examples that NEED Key Tips: troubleshooting, "what to do", complex topics
- Examples that DON'T need Key Tips: "how long", simple questions, straightforward answers

4. MEDICAL DISCLAIMER:
- For medical questions: "Consult your healthcare provider for personalized advice."
- For emergencies: "Seek immediate medical attention."

5. CRITICAL RULES:
- Keep every response under 100 words unless user asks for details
- Answer the question directly, no preamble
- Emergency symptoms = immediate medical attention
- Never diagnose
- Be natural - not every answer needs formatting or bullet points

6. EXAMPLES:

User: "How long does postpartum bleeding last?"
You: Typically 4-6 weeks, gradually decreasing. Use pads, not tampons. If heavy bleeding persists or you soak a pad in an hour, contact your healthcare provider.

User: "I'm feeling overwhelmed"
You: This is normal. Take breaks when possible, ask for help, and prioritize rest. If feelings persist or worsen, reach out to a mental health professional or your healthcare provider.

User: "How can I manage postpartum anxiety?"
You: **Managing Postpartum Anxiety**
Practice deep breathing, get rest when possible, and talk to someone you trust. Consider therapy or support groups. Limit caffeine and prioritize self-care.

**When to Seek Help:**
• Anxiety interferes with daily life
• You have thoughts of harming yourself or baby
• Symptoms persist or worsen

Consult your healthcare provider for personalized advice.

Remember: SHORT, NATURAL, ACTIONABLE. Only use formatting and Key Tips when they genuinely help.`;

  const getFallbackResponse = () => `**Postpartum Wellness Support** 💗

I'm here to help with your postpartum recovery! Here are quick tips:

**Self-Care Essentials**
• Rest when baby sleeps
• Stay hydrated (8+ glasses daily)
• Eat nutritious meals
• Accept help from others

**When to Seek Help:**
• Persistent sadness or anxiety
• Severe physical symptoms
• Thoughts of self-harm

**Important:** Always consult your healthcare provider for medical concerns.

To get personalized AI responses, set up your VITE_OPENAI_API_KEY. 💜`;

  const {
    aiStatus,
    aiError,
    conversationHistory,
    suggestionClickRef,
    handleChatMessage
  } = useAIChat(() => getSystemPrompt(), {
    activeBaby: null,
    maxTokens: 500,
    timeout: 30000,
    getFallbackResponse: () => getFallbackResponse()
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">💗 Mother's Wellness</h1>
            <p className="page-subtitle">Track your postpartum health and self-care</p>
          </div>
          <div className="page-actions">
            <button
              className={`btn ${viewMode === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('overview')}
            >
              <span>📋</span>
              <span>Overview</span>
            </button>
            <button
              className={`btn btn-new-feature ${viewMode === 'ai' ? 'active' : ''}`}
              onClick={() => setViewMode('ai')}
            >
              <span>🤖</span>
              <span>AI Wellness Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'overview' && (
        <>
          <div className="section-card">
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Self-Care Reminders</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  <span style={{ fontSize: '32px' }}>💧</span>
                  <div>
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      HYDRATION
                    </div>
                    <h4 style={{ margin: 0 }}>Stay Hydrated</h4>
                  </div>
                </div>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  Drink at least 8 glasses of water daily, especially if breastfeeding
                </p>
              </div>

              <div className="card" style={{ borderTop: '4px solid var(--secondary)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  <span style={{ fontSize: '32px' }}>😴</span>
                  <div>
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      REST
                    </div>
                    <h4 style={{ margin: 0 }}>Rest When Baby Sleeps</h4>
                  </div>
                </div>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  Your recovery is important. Try to nap when your baby naps
                </p>
              </div>

              <div className="card" style={{ borderTop: '4px solid #f5b14c' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  <span style={{ fontSize: '32px' }}>🧘</span>
                  <div>
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      MINDFULNESS
                    </div>
                    <h4 style={{ margin: 0 }}>Mindful Breathing Break</h4>
                  </div>
                </div>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  Take 5 minutes to inhale for 4 counts, hold for 4, then exhale for 6-8 to reset stress.
                </p>
              </div>

              <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  <span style={{ fontSize: '32px' }}>🥗</span>
                  <div>
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      NUTRITION
                    </div>
                    <h4 style={{ margin: 0 }}>Nutritious Meals</h4>
                  </div>
                </div>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  Eat balanced meals with plenty of fruits and vegetables
                </p>
              </div>

              <div className="card" style={{ borderTop: '4px solid #4cb7a5' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  <span style={{ fontSize: '32px' }}>🚶‍♀️</span>
                  <div>
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      EXERCISE
                    </div>
                    <h4 style={{ margin: 0 }}>Gentle Movement</h4>
                  </div>
                </div>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  Add a 10-minute walk or light stretch to boost circulation and ease postpartum aches.
                </p>
              </div>
            </div>
          </div>

          <div className="info-panel" style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className="tip-card" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)' }}>
              <div className="tip-card-title">
                <span>💜</span>
                <span>Remember</span>
              </div>
              <p className="tip-card-text">
                Taking care of yourself is not selfish - it's essential. A healthy, happy mom means a healthy, happy baby. Don't hesitate to ask for help.
              </p>
            </div>
          </div>
        </>
      )}

      {viewMode === 'ai' && (
        <div className="ai-planner-container">
          <div className="ai-chat-wrapper">
            <MotherHealthChat
              onSendMessage={handleChatMessage}
              isLoading={aiStatus === 'loading'}
              error={aiError}
              onSuggestionClick={suggestionClickRef}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MotherHealth;
