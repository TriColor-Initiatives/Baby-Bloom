import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBaby } from '../contexts/BabyContext';
import MedicationManager from '../components/health/MedicationManager';
import SymptomLogger from '../components/health/SymptomLogger';
import EmergencyInfo from '../components/health/EmergencyInfo';
import HealthChat from '../components/HealthChat';
import CustomSelect from '../components/onboarding/CustomSelect';
import { useAIChat } from '../hooks/useAIChat';
import '../styles/pages.css';
import './Health.css';

const Health = () => {
  const { activeBaby } = useBaby();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('overview');
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMedicationsOpen, setIsMedicationsOpen] = useState(false);
  const [isSymptomsOpen, setIsSymptomsOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    type: 'checkup',
    title: '',
    date: new Date().toISOString().slice(0, 16),
    weight: '',
    height: '',
    headCircumference: '',
    temperature: '',
    symptoms: '',
    medications: '',
    doctor: '',
    notes: ''
  });

  // Load records from localStorage
  useEffect(() => {
    const savedRecords = localStorage.getItem('baby-bloom-health');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  // Save records
  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('baby-bloom-health', JSON.stringify(records));
    }
  }, [records]);

  // Auto-open modal if 'add' parameter is present
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      openModal();
      // Remove the parameter after opening
      setSearchParams({});
    }
  }, [searchParams]);

  const openModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        type: record.type,
        title: record.title,
        date: new Date(record.date).toISOString().slice(0, 16),
        weight: record.weight || '',
        height: record.height || '',
        headCircumference: record.headCircumference || '',
        temperature: record.temperature || '',
        symptoms: record.symptoms || '',
        medications: record.medications || '',
        doctor: record.doctor || '',
        notes: record.notes || ''
      });
    } else {
      setEditingRecord(null);
      setFormData({
        type: 'checkup',
        title: '',
        date: new Date().toISOString().slice(0, 16),
        weight: '',
        height: '',
        headCircumference: '',
        temperature: '',
        symptoms: '',
        medications: '',
        doctor: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const recordData = {
      id: editingRecord ? editingRecord.id : Date.now(),
      type: formData.type,
      title: formData.title,
      date: new Date(formData.date).toISOString(),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      headCircumference: formData.headCircumference ? parseFloat(formData.headCircumference) : null,
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
      symptoms: formData.symptoms,
      medications: formData.medications,
      doctor: formData.doctor,
      notes: formData.notes
    };

    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? recordData : r));
    } else {
      setRecords([recordData, ...records]);
    }

    closeModal();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  // Show all records (no filtering)
  const filteredRecords = records;

  const getTypeIcon = (type) => {
    const icons = {
      checkup: '✅',
      illness: '🤒',
      medication: '💊',
      vaccination: '💉',
      symptom: '🩺'
    };
    return icons[type] || '📋';
  };

  const getTypeLabel = (type) => {
    const labels = {
      checkup: 'Check-up',
      illness: 'Illness',
      medication: 'Medication',
      vaccination: 'Vaccination',
      symptom: 'Symptom'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      checkup: 'var(--success)',
      illness: 'var(--error)',
      medication: 'var(--warning)',
      vaccination: 'var(--primary)',
      symptom: '#ec4899'
    };
    return colors[type] || 'var(--border)';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // AI Chat hook
  const getSystemPrompt = (babyAge) => `You are a Baby Health Assistant. Provide SHORT, PINPOINTED, actionable answers about baby health. Follow these rules:

1. RESPONSE STYLE:
- Maximum 3-4 sentences per answer
- Get straight to the point
- Natural, conversational tone
- Use emojis sparingly (💊 only when appropriate)
- No fluff or filler words
- Actionable advice only

2. FORMATTING:
- Use **bold** for the main answer title (optional, only if it helps clarity)
- Answer directly in 1-3 sentences
- Use bullet points ONLY when providing multiple actionable tips or emergency symptoms
- Include "Key Tips:" or "When to Seek Help:" sections ONLY when the answer benefits from additional actionable advice (not for simple factual answers)

3. WHEN TO USE KEY TIPS:
- Use Key Tips for troubleshooting questions, multi-step processes, or when providing actionable strategies
- Use "When to Seek Help:" for emergency symptoms or red flags
- DON'T use Key Tips for simple factual answers, yes/no questions, or when the answer is already complete in 1-2 sentences
- Examples that NEED Key Tips: troubleshooting, "what to do", complex topics
- Examples that DON'T need Key Tips: "when to call", simple medication questions, straightforward answers

4. HEALTH & MEDICAL TOPICS:

A. SYMPTOM ASSESSMENT:
- Provide general guidance on common baby symptoms
- Explain when symptoms are normal vs. concerning
- Consider baby's age: ${babyAge} months
- Always include: "If [specific symptom] persists or worsens, contact your pediatrician immediately."
- For severe symptoms: "Seek immediate medical attention or call 911."
- Common concerns: fever, cough, rash, vomiting, diarrhea, breathing issues

B. MEDICATION QUESTIONS:
- Provide general information about medications (not specific prescriptions)
- Explain common medication categories and purposes for babies
- Always include: "Always consult your pediatrician before giving any medication to your baby."
- Never recommend specific dosages or medications
- Age-appropriate considerations

C. VACCINATION INFO:
- Explain recommended vaccination schedule for babies
- Discuss timing and safety considerations
- Common vaccines: DTaP, MMR, Hib, PCV, Rotavirus, etc.
- Always include: "Follow your pediatrician's recommended vaccination schedule."

D. EMERGENCY GUIDANCE:
- List emergency symptoms that require immediate medical attention:
  * Difficulty breathing or blue lips
  * High fever (over 100.4°F/38°C in babies under 3 months, over 102°F/38.9°C in older babies)
  * Severe dehydration (no wet diapers for 6+ hours, sunken fontanelle)
  * Unconsciousness or unresponsiveness
  * Severe injury or trauma
  * Seizures
  * Persistent vomiting or inability to keep fluids down
- Always end with: "For life-threatening emergencies, call 911 immediately."

E. GROWTH CONCERNS:
- Explain normal growth patterns by age
- Discuss when growth patterns may be concerning
- Weight, height, head circumference percentiles
- Always include: "Discuss growth concerns with your pediatrician. They track growth over time."

5. MEDICAL DISCLAIMER (REQUIRED):
- ALWAYS end medical/health responses with: "⚠️ This is not a substitute for professional medical advice. Always consult your pediatrician for personalized guidance."
- For emergency symptoms: "Seek immediate medical attention or call 911."
- Never diagnose conditions
- Never prescribe medications
- Never replace professional medical judgment

6. CRITICAL RULES:
- Keep every response under 100 words unless user asks for details
- Answer the question directly, no preamble
- Emergency symptoms = immediate medical attention
- Never diagnose
- ALWAYS include medical disclaimer for health/medical topics
- Consider baby's age (${babyAge} months) in responses
- Be natural - not every answer needs formatting or bullet points

7. EXAMPLES:

User: "When should I call the doctor about fever?"
You: Call your pediatrician if baby is under 3 months with any fever (100.4°F/38°C+), or if baby is older with fever above 102°F/38.9°C, especially with lethargy, difficulty breathing, or dehydration signs.

⚠️ This is not a substitute for professional medical advice. Always consult your pediatrician for personalized guidance.

User: "Can I give my baby ibuprofen?"
You: Ibuprofen is generally safe for babies 6+ months, but always consult your pediatrician before giving any medication. Never give to babies under 6 months. Dosage depends on weight and age, so your pediatrician will provide the correct amount.

⚠️ This is not a substitute for professional medical advice. Always consult your pediatrician for personalized guidance.

User: "Baby has a rash, what should I do?"
You: **Rash Assessment**
First, note when the rash appeared and if baby has other symptoms like fever. Keep the area clean and dry. Avoid new soaps or lotions. If the rash spreads, baby seems uncomfortable, or has a fever, contact your pediatrician.

**When to Seek Help:**
• Rash spreads rapidly
• Baby has fever or seems unwell
• Rash is blistered or oozing

⚠️ This is not a substitute for professional medical advice. Always consult your pediatrician for personalized guidance.

Remember: SHORT, NATURAL, ACTIONABLE, with appropriate medical disclaimers. Only use formatting and Key Tips when they genuinely help.`;

  const getFallbackResponse = (babyAge) => `**Baby Health Support** 💊

I'm here to help with baby health questions! Here are quick tips:

**Symptom Assessment**
Always monitor your baby closely. When in doubt, contact your pediatrician.

**Key Tips:**
• Trust your instincts
• Keep emergency numbers handy
• Track symptoms and changes

**Important:** Always consult your pediatrician for medical concerns.

To get personalized AI responses, set up your VITE_OPENAI_API_KEY. 💊`;

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
            <h1 className="page-title">💊 Health & Medical</h1>
            <p className="page-subtitle">Track health records, symptoms, and medications</p>
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
              <span>Add Record</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setIsMedicationsOpen(true)}>
              <span>💊</span>
              <span>Medications</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setIsSymptomsOpen(true)}>
              <span>🩺</span>
              <span>Symptoms</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setIsEmergencyOpen(true)}>
              <span>🚨</span>
              <span>Emergency</span>
            </button>
            <button
              className={`btn btn-new-feature ${viewMode === 'ai' ? 'active' : ''}`}
              onClick={() => setViewMode('ai')}
            >
              <span>🤖</span>
              <span>AI Health Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'overview' && (
        <div className="content-grid">
          <div className="feeding-log">
            <h3 style={{ marginBottom: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
              Health Records ({filteredRecords.length})
            </h3>

            {filteredRecords.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏥</div>
                <h3>No Health Records Yet</h3>
                <p>Start tracking your baby's health and medical information</p>

                <div className="empty-tips">
                  <div className="empty-tip">
                    <span>📅</span>
                    <span>Log check-ups, vaccinations, and doctor visits</span>
                  </div>
                  <div className="empty-tip">
                    <span>💊</span>
                    <span>Track medications and monitor symptoms</span>
                  </div>
                  <div className="empty-tip">
                    <span>📈</span>
                    <span>Record growth measurements and development milestones</span>
                  </div>
                </div>

                <button className="btn btn-primary btn-large" onClick={() => openModal()}>
                  <span>➕</span>
                  <span>Add Your First Health Record</span>
                </button>
              </div>
            ) : (
              filteredRecords.map(record => (
                <div
                  key={record.id}
                  className="log-entry"
                  style={{ borderLeftColor: getTypeColor(record.type) }}
                >
                  <div className="log-entry-header">
                    <div className="log-entry-type">
                      <span className="log-entry-icon">{getTypeIcon(record.type)}</span>
                      <span>{record.title}</span>
                    </div>
                    <div className="log-entry-time">{formatDate(record.date)}</div>
                  </div>

                  <div className="log-entry-details">
                    {record.weight && (
                      <div className="log-entry-detail">
                        <span>⚖️</span>
                        <span>Weight: {record.weight} kg</span>
                      </div>
                    )}
                    {record.height && (
                      <div className="log-entry-detail">
                        <span>📏</span>
                        <span>Height: {record.height} cm</span>
                      </div>
                    )}
                    {record.headCircumference && (
                      <div className="log-entry-detail">
                        <span>⭕</span>
                        <span>Head: {record.headCircumference} cm</span>
                      </div>
                    )}
                    {record.temperature && (
                      <div className="log-entry-detail">
                        <span>🌡️</span>
                        <span>Temp: {record.temperature}°C</span>
                      </div>
                    )}
                    {record.symptoms && (
                      <div className="log-entry-detail">
                        <span>🩺</span>
                        <span>{record.symptoms}</span>
                      </div>
                    )}
                    {record.medications && (
                      <div className="log-entry-detail">
                        <span>�</span>
                        <span>{record.medications}</span>
                      </div>
                    )}
                    {record.doctor && (
                      <div className="log-entry-detail">
                        <span>👨‍⚕️</span>
                        <span>{record.doctor}</span>
                      </div>
                    )}
                    {record.notes && (
                      <div className="log-entry-detail">
                        <span>�</span>
                        <span>{record.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="log-entry-actions">
                    <button onClick={() => openModal(record)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDelete(record.id)} className="btn-icon">�️</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="info-panel">
            <div className="info-card">
              <div className="info-card-title">
                <span>📊</span>
                <span>Health Status</span>
              </div>
              <div className="info-item">
                <div className="info-item-label">Current Status</div>
                <div className="info-item-value" style={{ color: 'var(--success)' }}>Healthy</div>
              </div>
              <div className="info-item">
                <div className="info-item-label">Total Records</div>
                <div className="info-item-value">{records.length}</div>
              </div>
              <div className="info-item">
                <div className="info-item-label">Last Record</div>
                <div className="info-item-value">
                  {records.length > 0 ? formatDate(records[0].date) : 'N/A'}
                </div>
              </div>
            </div>

            <div className="tip-card" style={{ background: 'linear-gradient(135deg, var(--success) 30%, #6BC598 100%)' }}>
              <div className="tip-card-title">
                <span>💡</span>
                <span>Health Tip</span>
              </div>
              <p className="tip-card-text">
                Keep track of your baby's growth percentiles and discuss any concerns with your pediatrician. Regular checkups are important for early detection.
              </p>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'ai' && (
        <div className="ai-planner-container">
          <div className="ai-chat-wrapper">
            <HealthChat
              onSendMessage={handleChatMessage}
              isLoading={aiStatus === 'loading'}
              error={aiError}
              onSuggestionClick={suggestionClickRef}
            />
          </div>
        </div>
      )}

      {/* Add/Edit Record Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRecord ? 'Edit Record' : 'Add Health Record'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="health-form">
              <div className="form-group">
                <label>Record Type *</label>
                <CustomSelect
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val })}
                  options={[
                    { value: 'checkup', label: '? Check-up' },
                    { value: 'illness', label: '?? Illness' },
                    { value: 'medication', label: '?? Medication' },
                    { value: 'vaccination', label: '?? Vaccination' },
                    { value: 'symptom', label: '?? Symptom' },
                  ]}
                  placeholder="Select record type"
                  required
                />
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="e.g., 6-month checkup"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              {(formData.type === 'checkup' || formData.type === 'illness') && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="8.5"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="71"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Head Circumference (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="45"
                        value={formData.headCircumference}
                        onChange={(e) => setFormData({ ...formData, headCircumference: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="36.5"
                        value={formData.temperature}
                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {(formData.type === 'illness' || formData.type === 'symptom') && (
                <div className="form-group">
                  <label>Symptoms</label>
                  <input
                    type="text"
                    placeholder="e.g., Fever, cough, runny nose"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  />
                </div>
              )}

              {(formData.type === 'medication' || formData.type === 'illness') && (
                <div className="form-group">
                  <label>Medications</label>
                  <input
                    type="text"
                    placeholder="e.g., Paracetamol 5ml every 6 hours"
                    value={formData.medications}
                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Doctor/Healthcare Provider</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Smith"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Additional notes..."
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
                  {editingRecord ? 'Update' : 'Save'} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Component Modals */}
      {isMedicationsOpen && (
        <MedicationManager onClose={() => setIsMedicationsOpen(false)} />
      )}

      {isSymptomsOpen && (
        <SymptomLogger onClose={() => setIsSymptomsOpen(false)} />
      )}

      {isEmergencyOpen && (
        <EmergencyInfo onClose={() => setIsEmergencyOpen(false)} />
      )}

    </div>
  );
};

export default Health;