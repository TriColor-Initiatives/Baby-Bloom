import { useState } from 'react';
import { useBaby } from '../../contexts/BabyContext';
import TopBar from '../layout/TopBar';
import './WelcomeFormPage.css';

const steps = [
    { label: 'Baby basics', icon: '\u{1F37C}' },
    { label: 'Details', icon: '\u{1F9F8}' }
];

const WelcomeFormPage = ({ onComplete, onBack }) => {
    const { addBaby } = useBaby();
    const [step, setStep] = useState(1);
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

    const handleNext = () => {
        if (step === 1 && formData.name && formData.dateOfBirth && formData.gender) {
            setStep(2);
        }
    };

    const handleBack = () => {
        if (step === 1) {
            onBack();
        } else {
            setStep(1);
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

    const bubbleInitial = formData.name ? formData.name.charAt(0).toUpperCase() : 'BB';

    return (
        <div className="welcome-form-page">
            <TopBar />

            <div className="form-container">
                <section className="welcome-form-panel-centered">
                    <div className="welcome-form-card">
                        <header className="form-intro">
                            <span className="eyebrow">Baby profile · 🧸</span>
                            <h2>Tell us about your little one</h2>
                            <p>We personalize insights or reminders once we know a few basics.</p>
                        </header>

                        <div className="step-tracker">
                            {steps.map((stepData, index) => {
                                const position = index + 1;
                                const isActive = step === position;
                                const isComplete = step > position;

                                return (
                                    <div key={stepData.label} className="step-item">
                                        <div className={`step-node ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}>
                                            <span className="step-icon" aria-hidden="true">{stepData.icon}</span>
                                            <span>{position}</span>
                                        </div>
                                        <span className="step-text">{stepData.label}</span>
                                        {index < steps.length - 1 && (
                                            <div className={`step-connector ${step > position ? 'filled' : ''}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {step === 1 && (
                            <div className="form-body">
                                <div className="baby-persona">
                                    <div className="baby-bubble" aria-hidden="true">
                                        {bubbleInitial}
                                    </div>
                                    <div>
                                        <p className="baby-label">{formData.gender ? `Tracking a ${formData.gender}` : 'Profile preview'}</p>
                                        <p className="baby-name">{formData.name || 'Little explorer'}</p>
                                        <p className="baby-age">
                                            {formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 'Age updates once you add a birthday.'}
                                        </p>
                                    </div>
                                </div>

                                <ul className="celebration-chips">
                                    <li>🎯 Smart insights</li>
                                    <li>💖 Shareable moments</li>
                                    <li>📅 Gentle reminders</li>
                                </ul>

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
                                        <input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
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
                                        <p className="helper-text">You can update this anytime in Settings.</p>
                                    </div>
                                </div>

                                <div className="tip-card">
                                    <span role="img" aria-hidden="true">✨</span>
                                    <p>Names & birthdays unlock personalized dashboards instantly.</p>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-large"
                                        onClick={handleNext}
                                        disabled={!formData.name || !formData.dateOfBirth || !formData.gender}
                                    >
                                        Continue to details ✨
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-text"
                                        onClick={() => {
                                            if (formData.name && formData.dateOfBirth && formData.gender) {
                                                handleSubmit();
                                            }
                                        }}
                                    >
                                        Skip additional details
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="form-body">
                                <div className="form-section">
                                    <div className="form-header">
                                        <h3>Optional details</h3>
                                        <p>These help build personalized growth charts and recommendations.</p>
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
                                        <label>Blood type</label>
                                        <select
                                            value={formData.bloodType}
                                            onChange={(e) => handleChange('bloodType', e.target.value)}
                                        >
                                            <option value="">Select blood type</option>
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

                                    <div className="info-banner">
                                        <strong>Good to know 💡</strong>
                                        <p>You can always edit or add more medical info later from the Health page.</p>
                                    </div>
                                </div>

                                <div className="form-actions split">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleBack}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-large"
                                        onClick={handleSubmit}
                                    >
                                        Complete setup 🎉
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            className="btn-back-to-features"
                            onClick={handleBack}
                        >
                            ← Back to features
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default WelcomeFormPage;
