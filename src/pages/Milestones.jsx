import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBaby } from '../contexts/BabyContext';
import CustomSelect from '../components/onboarding/CustomSelect';
import '../styles/pages.css';
import './Milestone.css';

const STORAGE_KEY = 'baby-bloom-milestones';

// Predefined milestones by age (0-24 months)
const MILESTONE_TEMPLATES = [
  // 0-3 Months
  { age: '1 month', title: 'Lifting head briefly', category: 'motor' },
  { age: '1 month', title: 'Tracking objects with eyes', category: 'cognitive' },
  { age: '1 month', title: 'Recognizing caregiver\'s voice', category: 'social' },
  { age: '2 months', title: 'First social smile', category: 'social' },
  { age: '2 months', title: 'Cooing sounds', category: 'language' },
  { age: '2 months', title: 'Holding head up during tummy time', category: 'motor' },
  { age: '3 months', title: 'Holding head steady', category: 'motor' },
  { age: '3 months', title: 'Opening and closing hands', category: 'motor' },
  { age: '3 months', title: 'First laugh', category: 'social' },
  { age: '3 months', title: 'Bringing hands to mouth', category: 'motor' },
  
  // 4-6 Months
  { age: '4 months', title: 'Rolling from tummy to back', category: 'motor' },
  { age: '4 months', title: 'Pushing up on elbows', category: 'motor' },
  { age: '4 months', title: 'Reaching for toys', category: 'motor' },
  { age: '4 months', title: 'Laughing out loud', category: 'social' },
  { age: '5 months', title: 'Sitting with support', category: 'motor' },
  { age: '5 months', title: 'Rolling from back to tummy', category: 'motor' },
  { age: '5 months', title: 'Transferring objects between hands', category: 'motor' },
  { age: '5 months', title: 'Recognizing own name', category: 'cognitive' },
  { age: '6 months', title: 'Sitting without support', category: 'motor' },
  { age: '6 months', title: 'Rolling over both ways', category: 'motor' },
  { age: '6 months', title: 'Babbling consonants (ba-ba, da-da)', category: 'language' },
  { age: '6 months', title: 'First solid foods', category: 'motor' },
  { age: '6 months', title: 'Bearing weight on legs when held', category: 'motor' },
  
  // 7-9 Months
  { age: '7 months', title: 'Responding to name', category: 'social' },
  { age: '7 months', title: 'Army crawling or scooting', category: 'motor' },
  { age: '7 months', title: 'Enjoys peek-a-boo', category: 'social' },
  { age: '7 months', title: 'Explores with hands and mouth', category: 'cognitive' },
  { age: '8 months', title: 'Crawling', category: 'motor' },
  { age: '8 months', title: 'Saying "mama" or "dada" (non-specific)', category: 'language' },
  { age: '8 months', title: 'Standing with support', category: 'motor' },
  { age: '8 months', title: 'Pincer grasp (thumb and finger)', category: 'motor' },
  { age: '9 months', title: 'Pulling to stand', category: 'motor' },
  { age: '9 months', title: 'Playing peek-a-boo', category: 'social' },
  { age: '9 months', title: 'Understanding simple "no"', category: 'cognitive' },
  { age: '9 months', title: 'Imitating sounds and gestures', category: 'social' },
  
  // 10-12 Months
  { age: '10 months', title: 'Cruising along furniture', category: 'motor' },
  { age: '10 months', title: 'Pointing at objects', category: 'cognitive' },
  { age: '10 months', title: 'Waving bye-bye', category: 'social' },
  { age: '11 months', title: 'First steps', category: 'motor' },
  { age: '11 months', title: 'Standing momentarily', category: 'motor' },
  { age: '11 months', title: 'Following simple 1-step commands', category: 'cognitive' },
  { age: '12 months', title: 'Walking independently', category: 'motor' },
  { age: '12 months', title: 'Saying first words meaningfully', category: 'language' },
  { age: '12 months', title: 'Saying "mama" or "dada" meaningfully', category: 'language' },
  { age: '12 months', title: 'Climbing furniture', category: 'motor' },
  { age: '12 months', title: 'Stacking objects', category: 'motor' },
  
  // 13-18 Months
  { age: '15 months', title: 'Walking well', category: 'motor' },
  { age: '15 months', title: 'Saying 3-5 words', category: 'language' },
  { age: '15 months', title: 'Following 1-step directions', category: 'cognitive' },
  { age: '15 months', title: 'Pointing to body parts', category: 'cognitive' },
  { age: '18 months', title: 'Running', category: 'motor' },
  { age: '18 months', title: 'Saying 10-20 words', category: 'language' },
  { age: '18 months', title: 'Climbing stairs with help', category: 'motor' },
  { age: '18 months', title: 'Feeding self with spoon', category: 'motor' },
  { age: '18 months', title: 'Pretend play', category: 'cognitive' },
  { age: '18 months', title: 'Following 2-step directions', category: 'cognitive' },
  
  // 19-24 Months
  { age: '21 months', title: 'Saying 50+ words', category: 'language' },
  { age: '21 months', title: 'Combining two words', category: 'language' },
  { age: '21 months', title: 'Kicking a ball', category: 'motor' },
  { age: '24 months', title: 'Running and jumping', category: 'motor' },
  { age: '24 months', title: 'Saying 2-word phrases', category: 'language' },
  { age: '24 months', title: 'Climbing stairs independently', category: 'motor' },
  { age: '24 months', title: 'Following complex instructions', category: 'cognitive' },
  { age: '24 months', title: 'Pretend play with others', category: 'social' },
];

const Milestones = () => {
  const { activeBaby } = useBaby();
  const [searchParams, setSearchParams] = useSearchParams();
  const [milestones, setMilestones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    age: '',
    category: 'motor',
    achieved: false,
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    photo: null
  });

  // Load milestones from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMilestones(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
      setMilestones([]);
    }
  }, []);

  // Save milestones
  useEffect(() => {
    if (milestones.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [milestones]);

  // Auto-open modal
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsAddModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams]);

  const openModal = (milestone = null) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setFormData({
        title: milestone.title,
        age: milestone.age,
        category: milestone.category || 'motor',
        achieved: false,
        date: new Date().toISOString().slice(0, 10),
        notes: milestone.notes || '',
        photo: milestone.photo || null
      });
    } else {
      setEditingMilestone(null);
      setFormData({
        title: '',
        age: '',
        category: 'motor',
        achieved: false,
        date: new Date().toISOString().slice(0, 10),
        notes: '',
        photo: null
      });
    }
    setIsModalOpen(true);
  };

  const openAddFromTemplate = () => {
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsAddModalOpen(false);
    setEditingMilestone(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a milestone title');
      return;
    }

    const milestoneData = {
      id: editingMilestone ? editingMilestone.id : Date.now().toString(),
      title: formData.title.trim(),
      age: formData.age,
      category: formData.category,
      achieved: false,
      date: null,
      notes: formData.notes.trim(),
      photo: formData.photo
    };

    if (editingMilestone) {
      setMilestones(milestones.map(m => m.id === editingMilestone.id ? milestoneData : m));
    } else {
      setMilestones([milestoneData, ...milestones]);
    }

    closeModal();
  };

  const handleAddFromTemplate = (template) => {
    const milestoneData = {
      id: Date.now().toString(),
      ...template,
      achieved: false,
      date: null,
      notes: '',
      photo: null
    };
    setMilestones([milestoneData, ...milestones]);
    setIsAddModalOpen(false);
  };

  const handleToggleAchieved = (milestone) => {
    setMilestones(milestones.map(m =>
      m.id === milestone.id
        ? { ...m, achieved: !m.achieved, date: !m.achieved ? new Date().toISOString().slice(0, 10) : null }
        : m
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

const getTimeAgo = (date) => {
    if (!date) return 'Not achieved yet';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Get specific icon for each milestone based on title
  const getMilestoneIcon = (title, category) => {
    const titleLower = title.toLowerCase();
    
    // Motor milestones
    if (titleLower.includes('head') || titleLower.includes('lifting')) return '👶';
    if (titleLower.includes('rolling') || titleLower.includes('roll')) return '🔄';
    if (titleLower.includes('sitting') || titleLower.includes('sit')) return '🧘';
    if (titleLower.includes('crawling') || titleLower.includes('crawl') || titleLower.includes('scooting')) return '🐛';
    if (titleLower.includes('standing') || titleLower.includes('stand')) return '🧍';
    if (titleLower.includes('walking') || titleLower.includes('walk') || titleLower.includes('steps')) return '🚶';
    if (titleLower.includes('running') || titleLower.includes('run')) return '🏃';
    if (titleLower.includes('climbing') || titleLower.includes('climb')) return '🧗';
    if (titleLower.includes('jumping') || titleLower.includes('jump')) return '🦘';
    if (titleLower.includes('grasp') || titleLower.includes('pincer') || titleLower.includes('reaching')) return '✋';
    if (titleLower.includes('transferring') || titleLower.includes('passing')) return '🤲';
    if (titleLower.includes('pushing') || titleLower.includes('push')) return '💪';
    if (titleLower.includes('feeding') || titleLower.includes('spoon') || titleLower.includes('food')) return '🍽️';
    if (titleLower.includes('kicking') || titleLower.includes('kick')) return '⚽';
    if (titleLower.includes('stacking') || titleLower.includes('stack')) return '🧱';
    if (titleLower.includes('bearing weight') || titleLower.includes('legs')) return '🦵';
    
    // Language milestones
    if (titleLower.includes('smile') || titleLower.includes('laugh')) return '😊';
    if (titleLower.includes('cooing') || titleLower.includes('coo')) return '👶';
    if (titleLower.includes('babbling') || titleLower.includes('babble')) return '🗣️';
    if (titleLower.includes('mama') || titleLower.includes('dada') || titleLower.includes('saying')) return '💬';
    if (titleLower.includes('word') || titleLower.includes('phrase') || titleLower.includes('combining')) return '📝';
    if (titleLower.includes('sound') || titleLower.includes('voice')) return '🔊';
    
    // Social milestones
    if (titleLower.includes('recognizing') || titleLower.includes('recognize')) return '👀';
    if (titleLower.includes('responding') || titleLower.includes('respond')) return '👋';
    if (titleLower.includes('peek-a-boo') || titleLower.includes('peek')) return '👻';
    if (titleLower.includes('waving') || titleLower.includes('wave')) return '👋';
    if (titleLower.includes('play') || titleLower.includes('pretend')) return '🎭';
    if (titleLower.includes('imitating') || titleLower.includes('imitate')) return '🪞';
    if (titleLower.includes('enjoys') || titleLower.includes('enjoy')) return '😄';
    
    // Cognitive milestones
    if (titleLower.includes('tracking') || titleLower.includes('track')) return '👁️';
    if (titleLower.includes('pointing') || titleLower.includes('point')) return '👉';
    if (titleLower.includes('understanding') || titleLower.includes('understand')) return '🧠';
    if (titleLower.includes('following') || titleLower.includes('follow') || titleLower.includes('command') || titleLower.includes('direction')) return '📋';
    if (titleLower.includes('exploring') || titleLower.includes('explore')) return '🔍';
    if (titleLower.includes('body part') || titleLower.includes('body parts')) return '👤';
    
    // Fallback to category icon
    const categoryIcons = {
      motor: '👶',
      language: '💬',
      social: '👥',
      cognitive: '🧠'
    };
    return categoryIcons[category] || '⭐';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      motor: '👶',
      language: '💬',
      social: '👥',
      cognitive: '🧠'
    };
    return icons[category] || '⭐';
  };

  const parseAgeMonths = (ageLabel) => {
    if (!ageLabel) return null;
    const match = ageLabel.match(/([0-9]+(?:\.[0-9]+)?)\s*month/i);
    return match ? Number(match[1]) : null;
  };

  const babyAgeMonths = useMemo(() => {
    if (!activeBaby?.dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(activeBaby.dateOfBirth);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    const days = today.getDate() - birth.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return months + Math.max(0, days) / daysInMonth;
  }, [activeBaby]);

  const sortedTemplates = useMemo(() => {
    const withAge = MILESTONE_TEMPLATES.map((tpl, idx) => ({
      ...tpl,
      ageValue: parseAgeMonths(tpl.age),
      idx
    }));
    if (babyAgeMonths === null) {
      return withAge.sort((a, b) => (a.ageValue ?? Infinity) - (b.ageValue ?? Infinity));
    }
    return withAge
      .slice()
      .sort((a, b) => {
        const distA = Math.abs((a.ageValue ?? babyAgeMonths) - babyAgeMonths);
        const distB = Math.abs((b.ageValue ?? babyAgeMonths) - babyAgeMonths);
        if (distA === distB) return (a.ageValue ?? Infinity) - (b.ageValue ?? Infinity);
        return distA - distB;
      });
  }, [babyAgeMonths]);

  const displayedTemplates = useMemo(() => {
    if (babyAgeMonths === null) {
      // Show first 10 templates sorted by age if no baby age
      return sortedTemplates.slice(0, 10);
    }
    
    const currentMonth = Math.max(0, Math.round(babyAgeMonths));
    const ageRange = 2; // Show milestones within ±2 months of current age
    
    // Filter milestones within age range (current ±2 months)
    const ageAppropriate = sortedTemplates.filter((tpl) => {
      if (tpl.ageValue === null) return false;
      const tplMonth = Math.round(tpl.ageValue);
      return Math.abs(tplMonth - currentMonth) <= ageRange;
    });
    
    // If we have age-appropriate milestones, show up to 8 of them
    if (ageAppropriate.length > 0) {
      return ageAppropriate.slice(0, 8);
    }
    
    // Fallback: show upcoming milestones (next 3-6 months)
    const upcoming = sortedTemplates.filter((tpl) => {
      if (tpl.ageValue === null) return false;
      const tplMonth = Math.round(tpl.ageValue);
      return tplMonth >= currentMonth && tplMonth <= currentMonth + 6;
    });
    
    if (upcoming.length > 0) {
      return upcoming.slice(0, 6);
    }
    
    // Final fallback: closest milestones by distance
    return sortedTemplates
      .slice()
      .sort((a, b) => {
        const distA = Math.abs((a.ageValue ?? babyAgeMonths) - babyAgeMonths);
        const distB = Math.abs((b.ageValue ?? babyAgeMonths) - babyAgeMonths);
        return distA - distB;
      })
      .slice(0, 6);
  }, [babyAgeMonths, sortedTemplates]);

  // Separate milestones into in-progress and completed
  const inProgressMilestones = milestones.filter(m => !m.achieved);
  const completedMilestones = milestones.filter(m => m.achieved);
  
  const achievedCount = completedMilestones.length;
  const totalCount = milestones.length;
  const inProgressCount = inProgressMilestones.length;

  // Calculate progress for circular indicator
  const circumference = 2 * Math.PI * 45; // Exact calculation for r=45
  const progressPercentage = totalCount > 0 ? (achievedCount / totalCount) : 0;
  const strokeDasharray = `${progressPercentage * circumference}, ${circumference}`;

  // Reusable function to render milestone card
  const renderMilestoneCard = (milestone) => (
    <div 
      key={milestone.id} 
      className={`milestone-card ${milestone.achieved ? 'milestone-achieved' : ''}`}
      data-category={milestone.category}
    >
      {milestone.achieved && (
        <div className="milestone-celebration">🎉</div>
      )}
      <div className="milestone-card-header">
                <div className="milestone-icon-wrapper">
                  <div className="milestone-icon-bg">
                    {milestone.achieved ? (
                      <svg className="milestone-check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          className="milestone-check-path"
                          d="M5 12L10 17L19 6" 
                          stroke="#000000" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    ) : (
                      <span className="milestone-icon-emoji">{getMilestoneIcon(milestone.title, milestone.category)}</span>
                    )}
                  </div>
                </div>
        <div className="milestone-card-body">
          <div className="milestone-title-row-with-actions">
            <div className="milestone-title-section">
              <h4 className="milestone-title">{milestone.title}</h4>
              <div className="milestone-meta-row">
                <span className="milestone-category-badge">
                  {getCategoryIcon(milestone.category)} {milestone.category}
                </span>
                {milestone.achieved && milestone.date && (
                  <span className="milestone-date-info-inline">
                    <span className="milestone-date-icon">📅</span>
                    <span>{new Date(milestone.date).toLocaleDateString()}</span>
                  </span>
                )}
                <span className="milestone-age-badge">{milestone.achieved ? getTimeAgo(milestone.date) : milestone.age}</span>
              </div>
            </div>
            <div className="milestone-actions">
              <button
                className={`milestone-action-btn milestone-toggle-btn ${milestone.achieved ? 'achieved' : ''}`}
                onClick={() => handleToggleAchieved(milestone)}
                title={milestone.achieved ? 'Mark as not achieved' : 'Mark as achieved'}
                aria-label={milestone.achieved ? 'Mark as not achieved' : 'Mark as achieved'}
              >
                {milestone.achieved ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
              <button
                className="milestone-action-btn milestone-edit-btn"
                onClick={() => openModal(milestone)}
                title="Edit milestone"
                aria-label="Edit milestone"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M11.5 2.5L13.5 4.5L5.5 12.5H3.5V10.5L11.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="milestone-action-btn milestone-delete-btn"
                onClick={() => handleDelete(milestone.id)}
                title="Delete milestone"
                aria-label="Delete milestone"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M5.5 4.5V3.5C5.5 2.95 5.95 2.5 6.5 2.5H9.5C10.05 2.5 10.5 2.95 10.5 3.5V4.5M3.5 4.5H12.5M11.5 4.5V12.5C11.5 13.05 11.05 13.5 10.5 13.5H5.5C4.95 13.5 4.5 13.05 4.5 12.5V4.5M7 7.5V11M9 7.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          {milestone.notes && (
            <p className="milestone-notes">{milestone.notes}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header milestones-page-header">
        <div>
          <h1 className="page-title">⭐ Milestones</h1>
          <p className="page-subtitle">Track your baby's developmental achievements</p>
        </div>
        <div className="page-actions milestones-header-actions">
          <button className="btn btn-primary" onClick={openAddFromTemplate}>
            <span>➕</span>
            <span>Add Milestone</span>
          </button>
          <button className="btn btn-secondary" onClick={() => openModal()}>
            <span>✏️</span>
            <span>Custom Milestone</span>
          </button>
        </div>
      </div>

      <div className="milestones-content-grid">
        <div className="section-card milestones-list-panel">
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>
            Developmental Milestones ({inProgressCount})
          </h3>
          {inProgressMilestones.length === 0 && completedMilestones.length === 0 ? (
            <div className="empty-state-enhanced">
              <div className="empty-illustration">
                <div className="empty-icon-animated">⭐</div>
              </div>
              <h3>Start Your Milestone Journey</h3>
              <p>Track your baby's amazing developmental achievements and celebrate every step forward</p>
              
              <div className="quick-actions">
                <button className="quick-action-btn primary" onClick={openAddFromTemplate}>
                  <span className="quick-action-icon">🎯</span>
                  <div>
                    <span className="quick-action-title">Add from Templates</span>
                    <span className="quick-action-subtitle">Age-appropriate milestones</span>
                  </div>
                </button>
                <button className="quick-action-btn secondary" onClick={() => openModal()}>
                  <span className="quick-action-icon">✨</span>
                  <div>
                    <span className="quick-action-title">Create Custom</span>
                    <span className="quick-action-subtitle">Your unique milestone</span>
                  </div>
                </button>
              </div>
              
              <div className="empty-tips">
                <p>💡 <strong>Tip:</strong> Milestones are automatically sorted by your baby's age for easy tracking</p>
              </div>
            </div>
          ) : inProgressMilestones.length === 0 ? (
            <div className="empty-state-enhanced">
              <div className="empty-illustration">
                <div className="empty-icon-animated">🎉</div>
              </div>
              <h3>All Milestones Completed!</h3>
              <p>Great job! You've completed all your milestones. Add more to continue tracking your baby's development.</p>
              
              <div className="quick-actions">
                <button className="quick-action-btn primary" onClick={openAddFromTemplate}>
                  <span className="quick-action-icon">🎯</span>
                  <div>
                    <span className="quick-action-title">Add from Templates</span>
                    <span className="quick-action-subtitle">Age-appropriate milestones</span>
                  </div>
                </button>
                <button className="quick-action-btn secondary" onClick={() => openModal()}>
                  <span className="quick-action-icon">✨</span>
                  <div>
                    <span className="quick-action-title">Create Custom</span>
                    <span className="quick-action-subtitle">Your unique milestone</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="milestones-grid">
              {inProgressMilestones.map((milestone) => renderMilestoneCard(milestone))}
            </div>
          )}
        </div>

        {totalCount > 0 && (
          <div className="milestones-progress-panel">
            <div className="progress-card-enhanced">
              <div className="progress-header">
                <span className="progress-icon">📊</span>
                <h3>Your Progress</h3>
              </div>
              
              <div className="progress-circle-container">
                <div className="progress-circle">
                  <svg className="progress-ring-svg" viewBox="0 0 100 100">
                    <circle className="progress-ring-bg" cx="50" cy="50" r="45" />
                    <circle 
                      className="progress-ring" 
                      cx="50" 
                      cy="50" 
                      r="45"
                      style={{ 
                        strokeDasharray: strokeDasharray,
                        strokeDashoffset: 0
                      }}
                    />
                  </svg>
                  <div className="progress-percentage">
                    {Math.round(progressPercentage * 100)}%
                  </div>
                </div>
              </div>
              
              <div className="progress-breakdown">
                <div className="progress-item">
                  <span className="progress-label">Achieved</span>
                  <span className="progress-value success">{achievedCount}</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">In Progress</span>
                  <span className="progress-value">{totalCount - achievedCount}</span>
                </div>
              </div>
              
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progressPercentage * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            {completedMilestones.length > 0 && (
              <div className="completed-milestones-section">
                <div className="section-card completed-milestones-card">
                  <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <span className="completed-milestones-icon">✅</span>
                    Completed Milestones ({completedMilestones.length})
                  </h3>
                  <div className="milestones-grid completed-milestones-grid">
                    {completedMilestones.map((milestone) => renderMilestoneCard(milestone))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add from Template Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay milestones-modal-overlay" onClick={closeModal}>
          <div className="modal-content milestones-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header milestones-modal-header">
              <div>
                <h2>Add Milestone from Template</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Select a milestone to track your baby's development
                </p>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="milestones-template-list">
              {displayedTemplates.length === 0 ? (
                <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>👶</div>
                  <p>No milestones available for this age range</p>
                </div>
              ) : (
                displayedTemplates.map((template, idx) => {
                  const exists = milestones.some(m => m.title === template.title);
                  const icon = getMilestoneIcon(template.title, template.category);
                  return (
                    <div
                      key={`${template.title}-${template.age}-${idx}`}
                      className={`milestone-template-card ${exists ? 'milestone-template-exists' : ''}`}
                      onClick={() => !exists && handleAddFromTemplate(template)}
                    >
                      <div className="milestone-template-icon">{icon}</div>
                      <div className="milestone-template-content">
                        <div className="milestone-template-title">{template.title}</div>
                        <div className="milestone-template-meta">
                          <span className="milestone-template-age">{template.age}</span>
                          <span className="milestone-template-category">{getCategoryIcon(template.category)} {template.category}</span>
                        </div>
                      </div>
                      {exists && (
                        <div className="milestone-template-badge">Added</div>
                      )}
                      {!exists && (
                        <div className="milestone-template-arrow">→</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMilestone ? 'Edit Milestone' : 'Create Custom Milestone'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-lg)' }}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="e.g., First word"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="text"
                    placeholder="e.g., 8 months"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div className="form-group">
                <label>Category</label>
                <CustomSelect
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  options={[
                    { value: 'motor', label: '👶 Motor' },
                    { value: 'language', label: '💬 Language' },
                    { value: 'social', label: '👥 Social' },
                    { value: 'cognitive', label: '🧠 Cognitive' },
                  ]}
                  placeholder="Select category"
                />
              </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Add any notes about this milestone..."
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
                  {editingMilestone ? 'Update' : 'Create'} Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Milestones;
