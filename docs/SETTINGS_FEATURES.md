# Settings Page Features Documentation

## Overview
The Settings page in Baby Bloom provides comprehensive customization and management options for the application. This document outlines all available features and their functionality.

## Features

### 1. 👶 Baby Profile Management
Manage your baby's essential information:
- **Baby's Name**: Store and display your baby's name throughout the app
- **Date of Birth**: Track age and development milestones automatically
- **Gender Selection**: Choose from Boy, Girl, or Not Specified options
- All data is persisted in localStorage

### 2. 🎨 Appearance Customization

#### Theme Modes
- **Light Mode**: Clean, bright interface perfect for daytime use
- **Dark Mode**: Easy on the eyes for nighttime tracking
- **Auto Theme**: Automatically switches based on time of day
  - Dark mode: 6 PM to 6 AM
  - Light mode: 6 AM to 6 PM

#### Accent Colors
Choose from 6 beautiful accent colors:
- 💗 Pink (#F472B6)
- 💙 Blue (#5568C9) - Default
- 💜 Purple (#A855F7)
- 💚 Green (#10B981)
- 🧡 Orange (#F97316)
- ❤️ Red (#EF4444)

Color choices persist across sessions and apply throughout the entire app.

### 3. ⚡ Preferences

#### Language Support
Select from multiple languages:
- 🇺🇸 English
- 🇪🇸 Español (Spanish)
- 🇫🇷 Français (French)
- 🇩🇪 Deutsch (German)
- 🇮🇳 हिंदी (Hindi)
- 🇨🇳 中文 (Chinese)

*Note: Language strings need to be implemented in the i18n system*

#### Time Format
Choose your preferred time display:
- **12-hour format**: 3:30 PM
- **24-hour format**: 15:30

### 4. 🔔 Notification Preferences

Granular control over app notifications:
- **Feeding Reminders**: Get alerts when it's time to feed
- **Sleep Tracking**: Reminders for nap time and bedtime
- **Health Checkups**: Doctor appointments and vaccination alerts
- **Milestone Alerts**: Notifications about developmental milestones
- **Daily Summary**: End-of-day activity recap

All notification preferences are saved and can be toggled individually.

### 5. 🗄️ Data & Privacy Management

#### Cloud Sync
- Sync data across multiple devices
- Requires user authentication (Firebase Auth)
- Automatically disabled when not logged in

#### Storage Management
- View current localStorage usage in KB
- Track how much data the app is storing locally

#### Data Export
- Download all your data as a JSON backup file
- Includes:
  - Baby profile information
  - Notification preferences
  - Theme and appearance settings
  - Export timestamp
- Filename format: `baby-bloom-backup-YYYY-MM-DD.json`

#### Data Import
- Restore data from a previously exported backup file
- Validates JSON structure before importing
- Automatically reloads the app after successful import

#### Clear All Data
- Remove all stored data from the app
- Preserves theme and accent color preferences
- Shows confirmation dialog before deletion
- Cannot be undone

### 6. 👤 Account Management
(Only visible when logged in)

- Display user profile information:
  - Profile photo
  - Display name
  - Email address
- **Sign Out**: Securely log out of your account

### 7. ℹ️ About Section

App information:
- **App Version**: Current version (v1.0.0)
- **Developer**: TriColor Initiatives
- **Year**: 2025
- **GitHub Link**: Direct link to the repository

## Technical Implementation

### State Management
- Uses React hooks (useState, useEffect) for local state
- Integrates with ThemeContext for theme management
- Integrates with AuthContext for user authentication
- All settings persist in localStorage

### LocalStorage Keys
```javascript
'baby-bloom-notifications'  // Notification preferences
'baby-bloom-profile'        // Baby profile data
'baby-bloom-language'       // Selected language
'baby-bloom-time-format'    // Time format preference
'baby-bloom-data-sync'      // Cloud sync toggle
'baby-bloom-auto-theme'     // Auto theme toggle
'baby-bloom-theme'          // Current theme
'baby-bloom-accent'         // Current accent color
```

### Responsive Design
- Mobile-first approach
- Breakpoint at 768px
- Stack layouts vertically on mobile
- Full-width buttons on smaller screens
- Optimized touch targets

## UI Components

### Toggle Switch
Animated switch for on/off settings:
- Smooth transitions
- Gradient background when active
- Disabled state support

### Input Fields
- Full-width text inputs
- Focus states with border animation
- Placeholder text support

### Button Variants
- **Primary**: Gradient background
- **Secondary Outline**: Border with hover effects
- **Danger Outline**: Red theme for destructive actions

### Radio Buttons
- Custom styled radio groups
- Visual feedback on selection
- Group layout for related options

### Gender Selection
- Three-button layout
- Icon + text labels
- Active state with gradient

### Accent Color Picker
- 6 color circles
- Checkmark on active color
- Hover scale animation
- Shadow highlight on selection

## Accessibility Features

- Proper ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Semantic HTML structure
- Alt text for images
- Color contrast compliance

## Future Enhancements

1. **Notification Scheduling**: Set specific times for reminders
2. **Multiple Baby Profiles**: Support for twins or siblings
3. **Unit Preferences**: Imperial vs Metric
4. **Data Encryption**: Optional encryption for sensitive data
5. **Backup to Cloud**: Automatic cloud backups
6. **Export Formats**: PDF reports, CSV exports
7. **Theme Customization**: Custom color schemes
8. **Accessibility Options**: Font size, high contrast modes

## Usage Examples

### Changing Theme
```javascript
// User clicks theme toggle button
toggleTheme(); // Switches between light/dark
```

### Exporting Data
```javascript
// User clicks export button
handleExportData();
// Downloads: baby-bloom-backup-2025-11-05.json
```

### Updating Baby Profile
```javascript
// User enters baby's name
handleProfileChange('name', 'Emma');
// Automatically saved to localStorage
```

## Best Practices

1. **Always save to localStorage** after state changes
2. **Validate imported data** before applying
3. **Show confirmations** for destructive actions
4. **Provide feedback** after user actions
5. **Handle errors gracefully** with try-catch blocks
6. **Test on multiple devices** and screen sizes

## Troubleshooting

### Settings Not Saving
- Check browser localStorage limits (usually 5-10MB)
- Ensure localStorage is not disabled in browser settings
- Clear cache if experiencing issues

### Import Fails
- Verify JSON file is not corrupted
- Check file was exported from Baby Bloom
- Ensure file structure matches expected format

### Theme Not Changing
- Check if auto-theme is enabled
- Verify ThemeContext is properly initialized
- Check browser's prefers-color-scheme support

## Support
For issues or feature requests, please visit:
https://github.com/Muskan-beniwal4TCI/Baby-Bloom/issues
