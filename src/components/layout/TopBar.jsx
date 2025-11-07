import './TopBar.css';
// Import the logo using Vite's asset handling
import tricolorLogo from '../../assets/images/tricolor_logo.png?url';

const TopBar = ({ onMenuClick }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="topbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <span className="topbar-menu-icon" aria-hidden="true" />
        </button>
        <div className="app-title">
          <svg
            className="app-logo"
            viewBox="0 0 36 36"
            role="img"
            aria-label="Baby Bloom logo"
          >
            <defs>
              <linearGradient id="appLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary-light)" />
                <stop offset="100%" stopColor="var(--primary)" />
              </linearGradient>
            </defs>
            <circle cx="18" cy="18" r="17" fill="url(#appLogoGradient)" />
            {/* Face shape */}
            <circle cx="18" cy="18" r="12" fill="var(--surface)" />
            {/* Eyes */}
            <circle cx="14" cy="16" r="1.5" fill="var(--primary)" />
            <circle cx="22" cy="16" r="1.5" fill="var(--primary)" />
            {/* Rosy cheeks */}
            <circle cx="13" cy="19" r="1.5" fill="var(--accent)" opacity="0.3" />
            <circle cx="23" cy="19" r="1.5" fill="var(--accent)" opacity="0.3" />
            {/* Smile */}
            <path
              d="M14 20.5c2 2 6 2 8 0"
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <h1 className="app-name">Baby Bloom</h1>
        </div>
      </div>

      <div className="topbar-right">
        <a
          href="https://itservices.tricolorinitiatives.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={tricolorLogo} alt="Tricolor Initiatives" className="company-logo" />
        </a>
      </div>
    </header>
  );
};

export default TopBar;
