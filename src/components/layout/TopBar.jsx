import './TopBar.css';
import babyBloomLogo from '../../assets/images/baby_bloom_logo.png?url';
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
          <div className="app-logo-circle">
            <img src={babyBloomLogo} alt="Baby Bloom logo" className="app-logo" />
          </div>
          <h1 className="app-name">BabyBloom</h1>
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
