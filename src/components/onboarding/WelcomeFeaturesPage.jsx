import { useState } from 'react';
import TopBar from '../layout/TopBar';
import './WelcomeFeaturesPage.css';

const heroTiles = [
    {
        title: 'Morning friendly',
        description: 'Quick taps before coffee.',
        icon: '\u{1F60A}',
        accent: 'sunrise'
    },
    {
        title: 'Night mode ready',
        description: 'Soft hues for sleepy logs.',
        icon: '\u{1F31D}',
        accent: 'moon'
    },
    {
        title: '2 quick steps',
        description: 'No sign-ups or emails needed.',
        icon: '\u{26A1}',
        accent: 'spark'
    },
    {
        title: 'Holistic',
        description: 'Activities, health, and reminders stay connected.',
        icon: '\u{1F495}',
        accent: 'heart'
    },
    {
        title: 'Daily rhythm',
        description: 'Log feedings, naps, diapers, and moods in seconds.',
        icon: '\u{1F37C}',
        accent: 'sunrise'
    },
    {
        title: 'Growth & health',
        description: 'See trends for weight, height, symptoms, and visits.',
        icon: '\u{1F4C8}',
        accent: 'sprout'
    },
    {
        title: 'Family reminders',
        description: 'Coordinate meds, pumping, tummy time, and more.',
        icon: '\u{23F0}',
        accent: 'clock'
    },
    {
        title: 'Sweet memories',
        description: 'Pin tummy time wins, first giggles, and photo notes.',
        icon: '\u{1F4F7}',
        accent: 'camera'
    }
];

const reassurancePoints = [
    {
        title: 'Private by design',
        description: 'Everything stays on this device. No accounts required.',
        icon: '\u{1F512}'
    },
    {
        title: 'Made for sharing',
        description: 'Add caregivers later and keep everyone in sync.',
        icon: '\u{1F91D}'
    }
];

const milestoneMoments = [
    {
        title: 'First smile',
        caption: 'Save photos & tiny wins.',
        icon: '\u{1F929}'
    },
    {
        title: 'Doctor visits',
        caption: 'Bring stats in one tap.',
        icon: '\u{1F3E5}'
    },
    {
        title: 'Sleep streaks',
        caption: 'Spot restful patterns.',
        icon: '\u{1F319}'
    }
];

const WelcomeFeaturesPage = ({ onContinue }) => {
    return (
        <div className="welcome-features-page">
            <TopBar />

            <div className="features-container">
                <section className="welcome-spotlight-full">
                    <div className="welcome-form-panel-centered">
                        <div className="spotlight-content">
                        <div className="spotlight-header">
                            <h1>Design the perfect baby dashboard in minutes <span role="img" aria-hidden="true">🌱</span></h1>
                            <p>Turn everyday logs into insights that cover feeding, sleep, growth, health, and memories.</p>
                        </div>

                        <div className="spotlight-tiles">
                            {heroTiles.map(tile => (
                                <div key={tile.title} className="hero-tile">
                                    <span className={`tile-icon ${tile.accent || ''}`} aria-hidden="true">{tile.icon}</span>
                                    {tile.label && <span className="tile-label">{tile.label}</span>}
                                    <strong>{tile.title}</strong>
                                    {tile.description && <p>{tile.description}</p>}
                                </div>
                            ))}
                        </div>

                        <div className="reassurance-panel">
                            {reassurancePoints.map(point => (
                                <div key={point.title} className="reassurance-item">
                                    <div className="reassurance-title">
                                        <span role="img" aria-hidden="true">{point.icon}</span>
                                        <strong>{point.title}</strong>
                                    </div>
                                    <p>{point.description}</p>
                                </div>
                            ))}
                        </div>

                        <ul className="milestone-strip">
                            {milestoneMoments.map(moment => (
                                <li key={moment.title}>
                                    <span className="moment-emoji" aria-hidden="true">{moment.icon}</span>
                                    <div>
                                        <strong>{moment.title}</strong>
                                        <p>{moment.caption}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="features-cta">
                            <button
                                type="button"
                                className="btn btn-primary btn-large"
                                onClick={onContinue}
                            >
                                Continue to setup ✨
                            </button>
                            <p className="cta-note">Just a few details to personalize your experience</p>
                        </div>
                    </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default WelcomeFeaturesPage;
