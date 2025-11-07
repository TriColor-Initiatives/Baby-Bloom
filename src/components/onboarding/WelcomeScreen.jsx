import { useState } from 'react';
import WelcomeFeaturesPage from './WelcomeFeaturesPage';
import WelcomeFormPage from './WelcomeFormPage';

const WelcomeScreen = ({ onComplete }) => {
    const [currentPage, setCurrentPage] = useState('features'); // 'features' or 'form'

    const handleContinueToForm = () => {
        setCurrentPage('form');
    };

    const handleBackToFeatures = () => {
        setCurrentPage('features');
    };

    return (
        <>
            {currentPage === 'features' && (
                <WelcomeFeaturesPage onContinue={handleContinueToForm} />
            )}
            {currentPage === 'form' && (
                <WelcomeFormPage onComplete={onComplete} onBack={handleBackToFeatures} />
            )}
        </>
    );
};

export default WelcomeScreen;
