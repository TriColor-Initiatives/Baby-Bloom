import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useBaby } from '../../contexts/BabyContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, isCollapsed, onHoverChange, onClose }) => {
  const location = useLocation();
  const { activeBaby } = useBaby();

  // Check if baby is 6 months or older
  const isBaby6MonthsOrOlder = useMemo(() => {
    if (!activeBaby || !activeBaby.dateOfBirth) return false;
    const today = new Date();
    const birthDate = new Date(activeBaby.dateOfBirth);
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
      (today.getMonth() - birthDate.getMonth());
    return months >= 6;
  }, [activeBaby]);

  const navItems = [
    {
      section: 'Overview',
      items: [
        { path: '/', icon: '📊', label: 'Dashboard' },
      ],
    },
    {
      section: 'Daily Tracking',
      items: [
        { path: '/feeding', icon: '🍼', label: 'Feeding' },
        { path: '/sleep', icon: '🌙', label: 'Sleep' },
        { path: '/health', icon: '🩺', label: 'Health' },
        { path: '/reminders', icon: '⏰', label: 'Reminders' },
        { path: '/activities', icon: '🎨', label: 'Activities' },
      ],
    },
    {
      section: 'Baby Development',
      items: [
        { path: '/growth', icon: '📈', label: 'Growth' },
        { path: '/milestones', icon: '⭐', label: 'Milestones' },
        { path: '/photos', icon: '📸', label: 'Photos' },
      ],
    },
    {
      section: 'More',
      items: [
        { path: '/appointments', icon: '📅', label: 'Appointments' },
        { path: '/vaccinations', icon: '💉', label: 'Vaccinations' },
        { path: '/mother-health', icon: '💗', label: 'Mother Wellness' },
        { path: '/tips', icon: '💡', label: 'Tips' },
        ...(isBaby6MonthsOrOlder ? [{ path: '/recipes', icon: '🥣', label: 'Recipes' }] : []),
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  const shouldIgnoreHover = () =>
    typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleMouseEnter = () => {
    if (shouldIgnoreHover()) {
      return;
    }
    onHoverChange?.(false);
  };

  const handleMouseLeave = () => {
    if (shouldIgnoreHover()) {
      return;
    }
    onHoverChange?.(true);
  };

  const handleFocus = () => {
    if (shouldIgnoreHover()) {
      return;
    }
    onHoverChange?.(false);
  };

  const handleBlur = (event) => {
    if (shouldIgnoreHover()) {
      return;
    }
    if (!event.currentTarget.contains(event.relatedTarget)) {
      onHoverChange?.(true);
    }
  };

  return (
    <aside
      className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => window.innerWidth <= 768 && onClose?.()}
                title={item.label}
                aria-label={item.label}
              >
                <span className="nav-item-icon" aria-hidden="true">{item.icon}</span>
                <span className="nav-item-label" aria-hidden={isCollapsed}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="nav-item-badge" aria-hidden={isCollapsed}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/settings" className="sidebar-footer-btn" title="Settings" aria-label="Settings">
          <span aria-hidden="true">⚙️</span>
          <span className="sidebar-footer-label" aria-hidden={isCollapsed}>
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;


