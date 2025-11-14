import { useState } from 'react';
import { useBaby } from '../../contexts/BabyContext';
import TopBar from '../layout/TopBar';
import CustomDatePicker from './CustomDatePicker';
import './WelcomeFormPage.css';

const appFeatures = [
    {
        title: 'Feeding Tracker',
        description: 'Log bottle feeds, breastfeeding, and solid foods with timestamps.',
        icon: '\u{1F37C}',
        color: '#5568c9'
    },
    {
        title: 'Health Records',
        description: 'Track vaccinations, check-ups, medications, and symptoms.',
        icon: '\u{1FA7A}',
        color: '#10b981'
    },
    {
        title: 'Sleep Tracking',
        description: 'Monitor naps and nighttime sleep patterns.',
        icon: '\u{1F319}',
        color: '#8b5cf6'
    },
    {
        title: 'Growth Monitoring',
        description: 'Track weight, height, and head circumference over time.',
        icon: '\u{1F4C8}',
        color: '#f59e0b'
    },
    {
        title: 'Diaper Log',
        description: 'Record diaper changes and track patterns.',
        icon: '\u{1F9FD}',
        color: '#ec4899'
    },
    {
        title: 'Reminders',
        description: 'Set reminders for medications, appointments, and activities.',
        icon: '\u{23F0}',
        color: '#06b6d4'
    }
];

const WelcomeFormPage = ({ onComplete, onBack }) => {
    const { addBaby } = useBaby();
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

    const handleBack = () => {
        if (onBack) {
            onBack();
        }
    };

    const handleSubmit = () => {
        if (formData.name && formData.dateOfBirth && formData.gender) {
            addBaby(formData);
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

            <div className="form-container">
                <section className="welcome-form-panel-centered">
                    <div className="welcome-form-split-layout">
                        {/* Left Side - App Features */}
                        <div className="welcome-features-side">
                            <div className="features-content">
                                <h1>Everything you need to track your baby's journey <span role="img" aria-hidden="true">🌱</span></h1>
                                <p className="features-subtitle">Comprehensive tools to monitor feeding, health, growth, and daily activities all in one place.</p>
                                
                                <div className="features-list">
                                    {appFeatures.map(feature => (
                                        <div key={feature.title} className="feature-item">
                                            <div className="feature-icon-wrapper" style={{ backgroundColor: `${feature.color}15`, borderColor: `${feature.color}30` }}>
                                                <span className="feature-icon-emoji" aria-hidden="true">{feature.icon}</span>
                                            </div>
                                            <div className="feature-content">
                                                <strong>{feature.title}</strong>
                                                <p>{feature.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="reassurance-box">
                                    <div className="reassurance-item-simple">
                                        <span role="img" aria-hidden="true">🔒</span>
                                        <span>Private & secure</span>
                                    </div>
                                    <div className="reassurance-item-simple">
                                        <span role="img" aria-hidden="true">⚡</span>
                                        <span>Quick & easy</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Baby Profile Form */}
                        <div className="welcome-form-side">
                            <div className="welcome-form-card">
                                <header className="form-intro">
                                    <span className="eyebrow">Baby Profile</span>
                                    <h2>Tell us about your little one</h2>
                                </header>

                                <div className="form-body">
                                    <div className="form-section">
                                        <div className="form-group">
                                            <label>Baby's name *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Amara, Julian"
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                autoFocus
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Date of birth *</label>
                                            <CustomDatePicker
                                                value={formData.dateOfBirth}
                                                onChange={(value) => handleChange('dateOfBirth', value)}
                                                maxDate={new Date().toISOString().split('T')[0]}
                                            />
                                            {formData.dateOfBirth && (
                                                <small className="age-display">
                                                    {calculateAge(formData.dateOfBirth)}
                                                </small>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>Gender *</label>
                                            <div className="gender-options">
                                                <button
                                                    type="button"
                                                    className={`gender-pill ${formData.gender === 'male' ? 'selected' : ''}`}
                                                    onClick={() => handleChange('gender', 'male')}
                                                >
                                                    Boy 👦
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`gender-pill ${formData.gender === 'female' ? 'selected' : ''}`}
                                                    onClick={() => handleChange('gender', 'female')}
                                                >
                                                    Girl 👧
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Birth weight (kg)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="e.g., 3.4"
                                                    value={formData.weight}
                                                    onChange={(e) => handleChange('weight', e.target.value)}
                                                />
                                            </div>

                                            <div className="form-group">
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

                                        <div className="form-group">
                                            <label>Blood group</label>
                                            <select
                                                value={formData.bloodType}
                                                onChange={(e) => handleChange('bloodType', e.target.value)}
                                            >
                                                <option value="">Select blood group</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-large"
                                            onClick={handleSubmit}
                                            disabled={!formData.name || !formData.dateOfBirth || !formData.gender}
                                        >
                                            Continue to dashboard ✨
                                        </button>
                                        <p className="helper-text">You can update this anytime in Settings.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default WelcomeFormPage;
