import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';
import CustomSelect from '../components/onboarding/CustomSelect';
import '../styles/pages.css';
import './Settings.css';

export default function Settings() {
  const { theme, accentColor, toggleTheme, changeAccentColor } = useTheme();
  const { user, signOut } = useAuth();
  const { activeBaby, updateBaby, activeBabyId } = useBaby();
  
  // Notification states
  const [notifications, setNotifications] = useState({
    feedingReminders: true,
    sleepTracking: true,
    healthCheckups: true,
    milestoneAlerts: true,
    dailySummary: false,
  });
  
  // Baby profile state - load from activeBaby if available
  const [babyProfile, setBabyProfile] = useState({
    name: '',
    birthDate: '',
    gender: 'not-specified',
    weight: '',
    height: '',
    bloodType: '',
  });
  
  // Track original profile to detect changes
  const [originalProfile, setOriginalProfile] = useState({
    name: '',
    birthDate: '',
    gender: 'not-specified',
    weight: '',
    height: '',
    bloodType: '',
  });
  
  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Other settings
  const [autoTheme, setAutoTheme] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [dataSync, setDataSync] = useState(false);
  
  // Load settings from localStorage and activeBaby
  useEffect(() => {
    const savedNotifications = localStorage.getItem('baby-bloom-notifications');
    const savedLanguage = localStorage.getItem('baby-bloom-language');
    const savedTimeFormat = localStorage.getItem('baby-bloom-time-format');
    const savedDataSync = localStorage.getItem('baby-bloom-data-sync');
    const savedAutoTheme = localStorage.getItem('baby-bloom-auto-theme');
    
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTimeFormat) setTimeFormat(savedTimeFormat);
    if (savedDataSync) setDataSync(savedDataSync === 'true');
    if (savedAutoTheme) setAutoTheme(savedAutoTheme === 'true');
    
    // Load from activeBaby if available
    if (activeBaby) {
      const profileData = {
        name: activeBaby.name || '',
        birthDate: activeBaby.dateOfBirth || '',
        gender: activeBaby.gender || 'not-specified',
        weight: activeBaby.weight || '',
        height: activeBaby.height || '',
        bloodType: activeBaby.bloodType || '',
      };
      setBabyProfile(profileData);
      setOriginalProfile(profileData);
      setHasUnsavedChanges(false);
    }
  }, [activeBaby]);
  
  // Save notification settings
  const handleNotificationChange = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('baby-bloom-notifications', JSON.stringify(updated));
  };
  
  // Handle baby profile changes (only update local state)
  const handleProfileChange = (field, value) => {
    const updated = { ...babyProfile, [field]: value };
    setBabyProfile(updated);
    
    // Check if there are unsaved changes by comparing with original
    const updatedCopy = { ...updated };
    const originalCopy = { ...originalProfile };
    
    // Normalize for comparison (both use birthDate in state)
    const hasChanges = JSON.stringify(updatedCopy) !== JSON.stringify(originalCopy);
    setHasUnsavedChanges(hasChanges);
  };
  
  // Save baby profile
  const handleSaveProfile = () => {
    if (!activeBabyId || !activeBaby) {
      // Fallback to localStorage if no active baby
      localStorage.setItem('baby-bloom-profile', JSON.stringify(babyProfile));
      setOriginalProfile(babyProfile);
      setHasUnsavedChanges(false);
      alert('Profile saved successfully!');
      return;
    }
    
    // Update in BabyContext
    const updateData = {
      name: babyProfile.name,
      dateOfBirth: babyProfile.birthDate,
      gender: babyProfile.gender,
      weight: babyProfile.weight,
      height: babyProfile.height,
      bloodType: babyProfile.bloodType,
    };
    
    updateBaby(activeBabyId, updateData);
    setOriginalProfile(babyProfile);
    setHasUnsavedChanges(false);
    
    // Show success feedback
    const saveBtn = document.querySelector('.save-profile-btn');
    if (saveBtn) {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '✓ Saved!';
      saveBtn.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
      }, 2000);
    }
  };
  
  // Save language
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('baby-bloom-language', lang);
  };
  
  // Save time format
  const handleTimeFormatChange = (format) => {
    setTimeFormat(format);
    localStorage.setItem('baby-bloom-time-format', format);
  };
  
  // Toggle auto theme
  const handleAutoThemeToggle = () => {
    const newValue = !autoTheme;
    setAutoTheme(newValue);
    localStorage.setItem('baby-bloom-auto-theme', newValue.toString());
    
    if (newValue) {
      const hour = new Date().getHours();
      const prefersDark = hour < 6 || hour >= 18;
      if ((prefersDark && theme === 'light') || (!prefersDark && theme === 'dark')) {
        toggleTheme();
      }
    }
  };
  
  // Toggle data sync
  const handleDataSyncToggle = () => {
    const newValue = !dataSync;
    setDataSync(newValue);
    localStorage.setItem('baby-bloom-data-sync', newValue.toString());
  };

  const accentColors = [
    { name: 'Pink', value: 'pink', color: '#F472B6' },
    { name: 'Blue', value: 'blue', color: '#5568C9' },
    { name: 'Purple', value: 'purple', color: '#A855F7' },
    { name: 'Green', value: 'green', color: '#10B981' },
    { name: 'Orange', value: 'orange', color: '#F97316' },
    { name: 'Red', value: 'red', color: '#EF4444' },
    { name: 'Slate', value: 'slate', color: '#1f2937' },
  ];
  
  // Export data
  const handleExportData = () => {
    const data = {
      profile: babyProfile,
      notifications: notifications,
      settings: {
        theme,
        accentColor,
        language,
        timeFormat,
      },
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baby-bloom-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Import data
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.profile) {
          setBabyProfile(data.profile);
          localStorage.setItem('baby-bloom-profile', JSON.stringify(data.profile));
        }
        
        if (data.notifications) {
          setNotifications(data.notifications);
          localStorage.setItem('baby-bloom-notifications', JSON.stringify(data.notifications));
        }
        
        if (data.settings) {
          if (data.settings.language) handleLanguageChange(data.settings.language);
          if (data.settings.timeFormat) handleTimeFormatChange(data.settings.timeFormat);
          if (data.settings.accentColor) changeAccentColor(data.settings.accentColor);
        }
        
        alert('Data imported successfully!');
        window.location.reload();
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all app data? This cannot be undone.')) {
      const currentTheme = localStorage.getItem('baby-bloom-theme');
      const currentAccent = localStorage.getItem('baby-bloom-accent');
      
      localStorage.clear();
      
      if (currentTheme) localStorage.setItem('baby-bloom-theme', currentTheme);
      if (currentAccent) localStorage.setItem('baby-bloom-accent', currentAccent);
      
      alert('All app data has been cleared!');
      window.location.reload();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">⚙️ Settings</h1>
        <p className="page-subtitle">Customize your Baby Bloom experience</p>
      </div>

      <div className="settings-container">
        {/* Baby Profile Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2>👶 Baby Profile</h2>
            <p>Manage your baby's information</p>
          </div>

          <div className="settings-card">
            <div className="setting-item-vertical">
              <label className="setting-label">Baby's Name</label>
              <input
                type="text"
                className="setting-input"
                placeholder="Enter baby's name"
                value={babyProfile.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
              />
            </div>

            <div className="setting-item-vertical">
              <label className="setting-label">Date of Birth</label>
              <input
                type="date"
                className="setting-input"
                value={babyProfile.birthDate}
                onChange={(e) => handleProfileChange('birthDate', e.target.value)}
              />
            </div>

            <div className="setting-item-vertical">
              <label className="setting-label">Birth Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className="setting-input"
                placeholder="e.g., 3.4"
                value={babyProfile.weight}
                onChange={(e) => handleProfileChange('weight', e.target.value)}
              />
            </div>

            <div className="setting-item-vertical">
              <label className="setting-label">Birth Height (cm)</label>
              <input
                type="number"
                step="0.1"
                className="setting-input"
                placeholder="e.g., 50"
                value={babyProfile.height}
                onChange={(e) => handleProfileChange('height', e.target.value)}
              />
            </div>

            <div className="setting-item-vertical">
              <label className="setting-label">Blood Type</label>
              <CustomSelect
                className="setting-input"
                value={babyProfile.bloodType}
                onChange={(val) => handleProfileChange('bloodType', val)}
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
                placeholder="Select blood type"
              />
            </div>

            <div className="setting-item-vertical">
              <label className="setting-label">Gender</label>
              <div className="gender-options">
                <button
                  className={`gender-btn ${babyProfile.gender === 'male' ? 'active' : ''}`}
                  onClick={() => handleProfileChange('gender', 'male')}
                >
                  👦 Boy
                </button>
                <button
                  className={`gender-btn ${babyProfile.gender === 'female' ? 'active' : ''}`}
                  onClick={() => handleProfileChange('gender', 'female')}
                >
                  👧 Girl
                </button>
                <button
                  className={`gender-btn ${babyProfile.gender === 'not-specified' ? 'active' : ''}`}
                  onClick={() => handleProfileChange('gender', 'not-specified')}
                >
                  🧒 Not Specified
                </button>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="setting-item-vertical save-profile-section">
              <button
                className="save-profile-btn"
                onClick={handleSaveProfile}
                disabled={!hasUnsavedChanges}
              >
                {hasUnsavedChanges ? '💾 Save Changes' : '✓ All Changes Saved'}
              </button>
              {hasUnsavedChanges && (
                <p className="unsaved-changes-text">
                  You have unsaved changes
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2>🎨 Appearance</h2>
            <p>Customize the look and feel of the app</p>
          </div>

          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Auto Theme</div>
                <div className="setting-description">
                  Automatically switch based on time of day
                </div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={autoTheme}
                  onChange={handleAutoThemeToggle}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Theme Mode</div>
                <div className="setting-description">
                  Switch between light and dark mode
                </div>
              </div>
              <button 
                className="theme-toggle-btn"
                onClick={toggleTheme}
                disabled={autoTheme}
              >
                <span className="theme-toggle-icon">
                  {theme === 'light' ? '🌙' : '☀️'}
                </span>
                <span className="theme-toggle-text">
                  {theme === 'light' ? 'Dark' : 'Light'}
                </span>
              </button>
            </div>

            <div className="setting-item-vertical">
              <div className="setting-info">
                <div className="setting-label">Accent Color</div>
                <div className="setting-description">
                  Choose your preferred accent color
                </div>
              </div>
              <div className="accent-colors">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    className={`accent-color-btn ${accentColor === color.value ? 'active' : ''}`}
                    style={{ backgroundColor: color.color }}
                    onClick={() => changeAccentColor(color.value)}
                    title={color.name}
                    aria-label={`Select ${color.name} accent color`}
                  >
                    {accentColor === color.value && <span className="checkmark">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2>? Preferences</h2>
            <p>Adjust app behavior and display settings</p>
          </div>

          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Language</div>
                <div className="setting-description">
                  Choose your preferred language
                </div>
              </div>
              <CustomSelect
                className="setting-select"
                value={language}
                onChange={handleLanguageChange}
                options={[
                  { value: 'en', label: '???? English' },
                  { value: 'es', label: '???? Espa?ol' },
                  { value: 'fr', label: '???? Fran?ais' },
                  { value: 'de', label: '???? Deutsch' },
                  { value: 'hi', label: '???? ?????' },
                  { value: 'zh', label: '???? ??' },
                ]}
                placeholder="Select language"
              />
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Time Format</div>
                <div className="setting-description">
                  12-hour or 24-hour clock
                </div>
              </div>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="timeFormat"
                    value="12h"
                    checked={timeFormat === "12h"}
                    onChange={(e) => handleTimeFormatChange(e.target.value)}
                  />
                  <span>12-hour</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="timeFormat"
                    value="24h"
                    checked={timeFormat === "24h"}
                    onChange={(e) => handleTimeFormatChange(e.target.value)}
                  />
                  <span>24-hour</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Notifications Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2>🔔 Notifications</h2>
            <p>Manage your notification preferences</p>
          </div>

          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Feeding Reminders</div>
                <div className="setting-description">
                  Get notified when it's time to feed
                </div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications.feedingReminders}
                  onChange={() => handleNotificationChange('feedingReminders')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Sleep Tracking</div>
                <div className="setting-description">
                  Reminders for nap time and bedtime
                </div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications.sleepTracking}
                  onChange={() => handleNotificationChange('sleepTracking')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Health Checkups</div>
                <div className="setting-description">
                  Doctor appointments and vaccination reminders
                </div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications.healthCheckups}
                  onChange={() => handleNotificationChange('healthCheckups')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Milestone Alerts</div>
                <div className="setting-description">
                  Get notified about developmental milestones
                </div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications.milestoneAlerts}
                  onChange={() => handleNotificationChange('milestoneAlerts')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Daily Summary</div>
                <div className="setting-description">
                  Receive end-of-day activity summary
                </div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications.dailySummary}
                  onChange={() => handleNotificationChange('dailySummary')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Data & Privacy Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2>🗄️ Data & Privacy</h2>
            <p>Manage your app data and privacy settings</p>
          </div>

          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Cloud Sync</div>
                <div className="setting-description">
                  Sync data across devices {user ? '(Enabled with login)' : '(Login required)'}
                </div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={dataSync && !!user}
                  onChange={handleDataSyncToggle}
                  disabled={!user}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Storage Used</div>
                <div className="setting-description">
                  Data stored locally in your browser
                </div>
              </div>
              <div className="setting-value">
                ~{Math.round(JSON.stringify(localStorage).length / 1024)} KB
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Export Data</div>
                <div className="setting-description">
                  Download your data as a backup file
                </div>
              </div>
              <button 
                className="btn btn-secondary-outline"
                onClick={handleExportData}
              >
                📥 Export
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Import Data</div>
                <div className="setting-description">
                  Restore data from a backup file
                </div>
              </div>
              <label className="btn btn-secondary-outline" style={{ cursor: 'pointer' }}>
                📤 Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Clear All Data</div>
                <div className="setting-description">
                  Remove all feeding, sleep, and other records
                </div>
              </div>
              <button 
                className="btn btn-danger-outline"
                onClick={handleClearData}
              >
                🗑️ Clear Data
              </button>
            </div>
          </div>
        </div>

        {/* Account Section */}
        {user && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h2>👤 Account</h2>
              <p>Manage your account settings</p>
            </div>

            <div className="settings-card">
              <div className="account-info">
                <img 
                  src={user.photoURL || 'https://via.placeholder.com/80'} 
                  alt="Profile" 
                  className="account-avatar"
                />
                <div className="account-details">
                  <div className="account-name">{user.displayName || 'User'}</div>
                  <div className="account-email">{user.email}</div>
                </div>
              </div>

              <div className="setting-item">
                <button 
                  className="btn btn-danger-outline"
                  onClick={signOut}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2>ℹ️ About</h2>
            <p>App information and support</p>
          </div>

          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">App Version</div>
                <div className="setting-description">
                  Current version of Baby Bloom
                </div>
              </div>
              <div className="setting-value version-badge">v1.0.0</div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Developed By</div>
                <div className="setting-description">
                  TriColor Initiatives
                </div>
              </div>
              <div className="setting-value">2025</div>
            </div>

            <div className="setting-item">
              <button 
                className="btn btn-secondary-outline"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => window.open('https://github.com/Muskan-beniwal4TCI/Baby-Bloom', '_blank')}
              >
                💻 View on GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}