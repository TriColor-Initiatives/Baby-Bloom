import { useState, useRef } from 'react';
import { useBaby } from '../contexts/BabyContext';
import VaccinationTracker from '../components/health/VaccinationTracker';
import VaccinationsChat from '../components/VaccinationsChat';
import { useAIChat } from '../hooks/useAIChat';
import '../styles/pages.css';

const Vaccinations = () => {
  const { activeBaby } = useBaby();
  const [viewMode, setViewMode] = useState('overview');

  // AI Chat hook
  const getSystemPrompt = (babyAge) => `You are a Vaccination Assistant. Provide SHORT, PINPOINTED, actionable answers about baby vaccinations. Follow these rules:

1. RESPONSE STYLE:
- Maximum 3-4 sentences per answer
- Get straight to the point
- Natural, conversational tone
- Use emojis sparingly (💉 only when appropriate)
- No fluff or filler words
- Actionable advice only

2. FORMATTING:
- Use **bold** for the main answer title (optional, only if it helps clarity)
- Answer directly in 1-3 sentences
- Use bullet points ONLY when providing multiple actionable tips or steps
- Include "Key Tips:" section ONLY when the answer benefits from additional actionable advice (not for simple factual answers)

3. WHEN TO USE KEY TIPS:
- Use Key Tips for troubleshooting questions, multi-step processes, or when providing actionable strategies
- DON'T use Key Tips for simple factual answers, yes/no questions, or when the answer is already complete in 1-2 sentences
- Examples that NEED Key Tips: side effects management, catch-up schedules, complex topics
- Examples that DON'T need Key Tips: "when is X vaccine due", simple schedule questions, straightforward answers

4. VACCINATION TOPICS:

A. VACCINATION SCHEDULES:
- Provide age-appropriate vaccination schedules
- Consider baby's age: ${babyAge} months
- Common vaccines: DTaP, MMR, Hib, PCV, Rotavirus, Hepatitis B, Polio, Varicella
- Always mention: "Follow your pediatrician's recommended schedule, as it may vary."

B. VACCINE SAFETY:
- Explain that vaccines are safe and effective
- Address common concerns about vaccine safety
- Discuss rare side effects vs. common reactions
- Always include: "Vaccines are extensively tested and monitored for safety."

C. SIDE EFFECTS:
- Common reactions: mild fever, fussiness, soreness at injection site
- When to be concerned: high fever, severe allergic reactions
- How to manage: comfort measures, when to call doctor
- Always include: "Most side effects are mild and temporary. Contact your pediatrician if you're concerned."

D. TIMING & DELAYS:
- When vaccines can be delayed: illness, allergies
- When to catch up: missed vaccines, delayed schedule
- Importance of staying on schedule
- Always include: "Discuss any concerns about timing with your pediatrician."

E. VACCINE-PREVENTABLE DISEASES:
- Explain what diseases vaccines prevent
- Importance of herd immunity
- Risks of not vaccinating
- Always include: "Vaccines protect your baby and the community."

5. MEDICAL DISCLAIMER (REQUIRED):
- ALWAYS end vaccination responses with: "⚠️ This is not a substitute for professional medical advice. Always follow your pediatrician's recommended vaccination schedule."
- Never recommend specific vaccine brands or alternative schedules
- Never advise against vaccines without medical reason
- Always emphasize consulting pediatrician for personalized guidance

6. CRITICAL RULES:
- Keep every response under 100 words unless user asks for details
- Answer the question directly, no preamble
- Never recommend skipping vaccines without medical reason
- ALWAYS include medical disclaimer for vaccination topics
- Consider baby's age (${babyAge} months) in responses
- Be natural - not every answer needs formatting or bullet points

7. EXAMPLES:

User: "When is the MMR vaccine given?"
You: The MMR (Measles, Mumps, Rubella) vaccine is typically given in two doses: first dose at 12-15 months, and second dose at 4-6 years. Your pediatrician will follow the recommended schedule for your baby.

⚠️ This is not a substitute for professional medical advice. Always follow your pediatrician's recommended vaccination schedule.

User: "My baby has a fever after vaccination, what should I do?"
You: **Managing Post-Vaccination Fever**
Mild fever (under 101°F/38.3°C) is common and usually resolves within 24-48 hours. Keep baby comfortable, offer fluids, and use infant acetaminophen if your pediatrician recommends it.

**When to Seek Help:**
• Fever over 102°F/38.9°C
• Baby seems very uncomfortable or lethargic
• Fever lasts more than 48 hours

⚠️ This is not a substitute for professional medical advice. Always follow your pediatrician's recommended vaccination schedule.

User: "Can I delay vaccines?"
You: Vaccines can be delayed in certain situations like illness, but it's important to discuss this with your pediatrician. Delaying vaccines leaves your baby unprotected from preventable diseases. Your pediatrician can help determine the best timing for your baby's specific situation.

⚠️ This is not a substitute for professional medical advice. Always follow your pediatrician's recommended vaccination schedule.

Remember: SHORT, NATURAL, ACTIONABLE, with appropriate medical disclaimers. Only use formatting and Key Tips when they genuinely help.`;

  const getFallbackResponse = (babyAge) => `**Vaccination Support** 💉

I'm here to help with vaccination questions! Here are quick tips:

**Vaccination Schedules**
Follow your pediatrician's recommended schedule. Most vaccines are given at specific ages to provide the best protection.

**Key Tips:**
• Keep track of vaccination records
• Discuss any concerns with your pediatrician
• Stay on schedule when possible

**Important:** Always follow your pediatrician's recommended vaccination schedule.

To get personalized AI responses, set up your VITE_OPENAI_API_KEY. 💉`;

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
            <h1 className="page-title">💉 Vaccinations</h1>
            <p className="page-subtitle">
              Follow an age-based schedule and know what&apos;s coming next.
            </p>
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
              <span>AI Vaccination Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'overview' && (
        <div className="section-card">
          <VaccinationTracker />
        </div>
      )}

      {viewMode === 'ai' && (
        <div className="ai-planner-container">
          <div className="ai-chat-wrapper">
            <VaccinationsChat
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

export default Vaccinations;

