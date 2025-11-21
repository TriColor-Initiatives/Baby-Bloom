import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBaby } from '../../contexts/BabyContext';
import TopBar from '../layout/TopBar';
import CustomDatePicker from './CustomDatePicker';
import CustomSelect from './CustomSelect';
import './WelcomeFormPage.css';

const appFeatures = [
    {
        title: 'Feeding Tracker',
        description: 'Log bottle feeds, breastfeeding, and solid foods with timestamps.',
        icon: '\u{1F37C}',
        color: '#FFB6D9',
        gradient: 'linear-gradient(135deg, #FFB6D9 0%, #FFD1E8 100%)'
    },
    {
        title: 'Health Records',
        description: 'Track vaccinations, check-ups, medications, and symptoms.',
        icon: '\u{1FA7A}',
        color: '#B5E5CF',
        gradient: 'linear-gradient(135deg, #B5E5CF 0%, #D4F4E7 100%)'
    },
    {
        title: 'Sleep Tracking',
        description: 'Monitor naps and nighttime sleep patterns.',
        icon: '\u{1F319}',
        color: '#C5B3F6',
        gradient: 'linear-gradient(135deg, #C5B3F6 0%, #E0D4FF 100%)'
    },
    {
        title: 'Growth Monitoring',
        description: 'Track weight, height, and head circumference over time.',
        icon: '\u{1F4C8}',
        color: '#FFD9A3',
        gradient: 'linear-gradient(135deg, #FFD9A3 0%, #FFE8C5 100%)'
    },
    {
        title: 'Daily Activities',
        description: 'Track playtime, tummy time, and developmental activities.',
        icon: '\u{1F3B2}',
        color: '#A8E6CF',
        gradient: 'linear-gradient(135deg, #A8E6CF 0%, #C8F4E0 100%)'
    },
    {
        title: 'Mother Wellness',
        description: 'Tools for postpartum care, mood tracking, hydration, and self-care reminders.',
        icon: '\u{1F497}',
        color: '#FFC0E3',
        gradient: 'linear-gradient(135deg, #FFC0E3 0%, #FFD9ED 100%)'
    },
    {
        title: 'Photos',
        description: 'Save, organize, and view baby photos and milestones in a beautiful gallery.',
        icon: '\u{1F4F7}',
        color: '#B8D4F0',
        gradient: 'linear-gradient(135deg, #B8D4F0 0%, #D4E8FF 100%)'
    },
    {
        title: 'Reminders',
        description: 'Set reminders for feeding times, doctor visits, medications, and important events.',
        icon: '\u{23F0}',
        color: '#FFE5B4',
        gradient: 'linear-gradient(135deg, #FFE5B4 0%, #FFF0D4 100%)'
    },
];

const parentRoleOptions = [
    { value: 'mommy', label: 'Mommy' },
    { value: 'daddy', label: 'Daddy' }
];

const WelcomeFormPage = ({ onComplete, onBack }) => {
    const { parentRole, setParentRole } = useAuth();
    const { addBaby } = useBaby();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        dateOfBirth: '',
        gender: '',
        weight: '',
        height: '',
        bloodType: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRoleSelect = (role) => {
        setParentRole(role);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = () => {
        if (formData.name && formData.dateOfBirth && formData.gender) {
            addBaby(formData);
            closeModal();
            onComplete();
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return '';
        const today = new Date();
        const birthDate = new Date(dob);
        const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
            (today.getMonth() - birthDate.getMonth());

        if (months < 1) {
            const days = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
            return `${days} day${days !== 1 ? 's' : ''} old`;
        } else if (months < 12) {
            return `${months} month${months !== 1 ? 's' : ''} old`;
        } else {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
        }
    };

    return (
        <div className="welcome-form-page">
            <TopBar />

            <div className="welcome-hero-container">
                <div className="welcome-hero-content">
                    <div className="hero-header">
                        <h1 className="hero-title">
                            Everything you need to track your baby's journey <span role="img" aria-hidden="true">🌱</span>
                        </h1>
                        <p className="hero-subtitle">
                            Comprehensive tools to monitor feeding, health, growth, and daily activities all in one place.
                        </p>
                    </div>

                    <div className="features-grid">
                        {appFeatures.map((feature, index) => (
                            <div 
                                key={feature.title} 
                                className="feature-card"
                                style={{ 
                                    animationDelay: `${index * 0.1}s`,
                                    '--feature-gradient': feature.gradient,
                                    '--feature-color': feature.color
                                }}
                            >
                                <div className="feature-card-icon" style={{ background: feature.gradient }}>
                                    <span className="feature-emoji" aria-hidden="true">{feature.icon}</span>
                                </div>
                                <div className="feature-card-content">
                                    <h3 className="feature-card-title">{feature.title}</h3>
                                    <p className="feature-card-description">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        className="continue-button"
                        onClick={openModal}
                    >
                        Continue to Baby Profile
                    </button>
                </div>
            </div>

            {/* Baby Profile Modal */}
            {isModalOpen && (
                <div className="profile-modal-overlay" onClick={closeModal}>
                    <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="profile-modal-close" onClick={closeModal}>×</button>
                        
                        <header className="profile-modal-header">
                            <span className="profile-eyebrow">Baby Profile</span>
                            <h2>Tell us about your little one</h2>
                        </header>

                        <div className="profile-form-body">
                            <div className="profile-form-section">
                                <div className="profile-form-group">
                                    <label>Baby's name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Amara, Julian"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="profile-form-group">
                                    <label>Date of birth *</label>
                                    <CustomDatePicker
                                        value={formData.dateOfBirth}
                                        onChange={(value) => handleChange('dateOfBirth', value)}
                                        maxDate={new Date().toISOString().split('T')[0]}
                                    />
                                    {formData.dateOfBirth && (
                                        <small className="profile-age-display">
                                            {calculateAge(formData.dateOfBirth)}
                                        </small>
                                    )}
                                </div>

                                <div className="profile-form-group">
                                    <label>Gender *</label>
                                    <div className="profile-gender-options">
                                        <button
                                            type="button"
                                            className={`profile-gender-pill ${formData.gender === 'male' ? 'selected' : ''}`}
                                            onClick={() => handleChange('gender', 'male')}
                                        >
                                            Boy 👦
                                        </button>
                                        <button
                                            type="button"
                                            className={`profile-gender-pill ${formData.gender === 'female' ? 'selected' : ''}`}
                                            onClick={() => handleChange('gender', 'female')}
                                        >
                                            Girl 👧
                                        </button>
                                    </div>
                                </div>

                                <div className="profile-form-group">
                                    <label>Who's on duty? 👶</label>
                                    <CustomSelect
                                        value={parentRole}
                                        onChange={handleRoleSelect}
                                        options={parentRoleOptions}
                                        placeholder="Please select"
                                    />
                                </div>

                                <div className="profile-form-row">
                                    <div className="profile-form-group">
                                        <label>Birth weight (kg)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="e.g., 3.4"
                                            value={formData.weight}
                                            onChange={(e) => handleChange('weight', e.target.value)}
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label>Birth height (cm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="e.g., 50"
                                             value={formData.height}
                                            onChange={(e) => handleChange('height', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="profile-form-group">
                                    <label>Blood group</label>
                                    <CustomSelect
                                        value={formData.bloodType}
                                        onChange={(value) => handleChange('bloodType', value)}
                                        options={[
                                            { value: 'A+', label: 'A+' },
                                            { value: 'A-', label: 'A-' },
                                            { value: 'B+', label: 'B+' },
                                            { value: 'B-', label: 'B-' },
                                            { value: 'AB+', label: 'AB+' },
                                            { value: 'AB-', label: 'AB-' },
                                            { value: 'O+', label: 'O+' },
                                            { value: 'O-', label: 'O-' }
                                        ]}
                                        placeholder="Select blood group"
                                    />
                                </div>
                            </div>

                            <div className="profile-form-actions">
                                <button
                                    type="button"
                                    className="profile-save-button"
                                    onClick={handleSubmit}
                                    disabled={!formData.name || !formData.dateOfBirth || !formData.gender}
                                >
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WelcomeFormPage;




