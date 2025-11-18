import { useMemo, useState, useEffect } from 'react';
import '../styles/pages.css';

const CATEGORY_CONFIG = {
  feeding: { label: 'Feeding', icon: '\u{1F37C}', color: 'var(--primary)' },
  sleep: { label: 'Sleep', icon: '\u{1F4A4}', color: 'var(--secondary)' },
  diaper: { label: 'Diaper', icon: '\u{1F9F7}', color: 'var(--accent)' },
  health: { label: 'Health', icon: '\u{1FA7A}', color: 'var(--success)' },
  activity: { label: 'Activity', icon: '\u{1F3B2}', color: 'var(--warning)' },
  milestone: { label: 'Milestone', icon: '\u{1F389}', color: 'var(--accent-dark)' },
  appointment: { label: 'Appointment', icon: '\u{1F4CB}', color: 'var(--secondary)' },
};

const TITLE_ICON = '\u{1F5D3}';
const EXPORT_ICON = '\u{1F4CA}';

const HOURS = 60 * 60 * 1000;
const DAYS = 24 * HOURS;

// Helper functions to format data
const formatFeedingTitle = (f) => {
  const kind = (f.type || 'feeding').toString().toLowerCase();
  const amount = f.amount || f.volume || f.quantity;
  const unit = f.unit || (amount ? (f.type === 'solid' ? 'g' : 'ml') : '');
  const amtText = amount ? ` ${amount}${unit}` : '';
  const label = kind === 'bottle' ? 'Bottle' : kind === 'breast' ? 'Breastfeeding' : kind === 'solid' ? 'Solid food' : 'Feeding';
  return `${label}${amtText}`;
};

const formatSleepTitle = (s) => {
  const kind = (s.type || 'sleep').toString().toLowerCase();
  const dur = s.duration ? ` for ${s.duration.replace(/^0:/, '')}` : '';
  return `${kind === 'nap' ? 'Nap' : 'Sleep'}${dur}`;
};

const formatDiaperTitle = (d) => {
  const t = (d.type || '').toString().toLowerCase();
  const label = t === 'wet' ? 'Diaper change - wet' : t === 'dirty' ? 'Diaper change - dirty' : t === 'both' ? 'Diaper change - wet & dirty' : 'Diaper change';
  return label;
};

const getHealthIcon = (t) => {
  const m = (t || '').toString().toLowerCase();
  if (m.includes('check')) return '🩺';
  if (m.includes('vaccine') || m.includes('immun')) return '💉';
  if (m.includes('med')) return '💊';
  if (m.includes('growth') || m.includes('measure')) return '📈';
  if (m.includes('allergy')) return '🤧';
  return '🏥';
};

// Load real data from localStorage
const loadTimelineData = () => {
  const getAllFeedings = () => {
    try { return JSON.parse(localStorage.getItem('baby-bloom-feedings') || '[]'); } catch { return []; }
  };
  const getAllSleep = () => {
    try { return JSON.parse(localStorage.getItem('baby-bloom-sleep') || '[]'); } catch { return []; }
  };
  const getAllDiapers = () => {
    try { return JSON.parse(localStorage.getItem('baby-bloom-diapers') || '[]'); } catch { return []; }
  };
  const getAllHealth = () => {
    try { return JSON.parse(localStorage.getItem('baby-bloom-health') || '[]'); } catch { return []; }
  };

  const allFeedings = getAllFeedings();
  const allSleep = getAllSleep();
  const allDiapers = getAllDiapers();
  const allHealth = getAllHealth();

  const entries = [];

  // Add feedings
  allFeedings.forEach((f) => {
    const timestamp = f.timestamp || f.date;
    if (timestamp) {
      entries.push({
        id: `f-${f.id || f.timestamp}`,
        category: 'feeding',
        title: formatFeedingTitle(f),
        timestamp: timestamp,
        note: f.notes || f.note || ''
      });
    }
  });

  // Add sleep
  allSleep.forEach((s) => {
    const timestamp = s.timestamp || s.date;
    if (timestamp) {
      entries.push({
        id: `s-${s.id || s.timestamp}`,
        category: 'sleep',
        title: formatSleepTitle(s),
        timestamp: timestamp,
        note: s.notes || s.note || ''
      });
    }
  });

  // Add diapers
  allDiapers.forEach((d) => {
    const timestamp = d.timestamp || d.date;
    if (timestamp) {
      entries.push({
        id: `d-${d.id || d.timestamp}`,
        category: 'diaper',
        title: formatDiaperTitle(d),
        timestamp: timestamp,
        note: d.notes || d.note || ''
      });
    }
  });

  // Add health records
  allHealth.forEach((h) => {
    const timestamp = h.date || h.timestamp;
    if (timestamp) {
      entries.push({
        id: `h-${h.id || h.date}`,
        category: 'health',
        title: h.title || (h.type ? h.type[0].toUpperCase() + h.type.slice(1) : 'Health record'),
        timestamp: timestamp,
        note: h.notes || h.note || h.description || ''
      });
    }
  });

  return entries;
};

const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

const isWithinLastDays = (date, reference, days) => {
  const diff = reference.getTime() - date.getTime();
  return diff >= 0 && diff <= days * DAYS;
};

const formatRelativeTime = (date, reference, rtf, longFormatter) => {
  const diffMs = date.getTime() - reference.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 1) return 'Just now';
  if (absMinutes < 60) return rtf.format(diffMinutes, 'minute');

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) <= 7) return rtf.format(diffDays, 'day');

  return longFormatter.format(date);
};

const escapeCsv = (value) => {
  if (value === undefined || value === null || value === '') {
    return '""';
  }
  const safeValue = String(value).replace(/"/g, '""');
  return '"' + safeValue + '"';
};

const Timeline = () => {
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [activeRange, setActiveRange] = useState('week');

  // Load real data from localStorage
  useEffect(() => {
    const entries = loadTimelineData();
    setTimelineEntries(entries);
  }, []);

  const relativeTimeFormatter = useMemo(
    () => new Intl.RelativeTimeFormat('en', { numeric: 'auto' }),
    []
  );
  const longDateTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }),
    []
  );
  const timeOfDayFormatter = useMemo(
    () => new Intl.DateTimeFormat('en', { weekday: 'short', hour: 'numeric', minute: '2-digit' }),
    []
  );

  const sortedEntries = useMemo(
    () =>
      [...timelineEntries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [timelineEntries]
  );

  const now = new Date();

  const filteredEntries = useMemo(() => {
    if (activeRange === 'today') {
      return sortedEntries.filter((entry) => isSameDay(new Date(entry.timestamp), now));
    }
    if (activeRange === 'week') {
      return sortedEntries.filter((entry) => isWithinLastDays(new Date(entry.timestamp), now, 7));
    }
    return sortedEntries;
  }, [activeRange, now, sortedEntries]);

  const handleExport = () => {
    if (!filteredEntries.length) return;

    const header = 'Title,Category,When,Notes\n';
    const rows = filteredEntries
      .map((entry) => {
        const date = new Date(entry.timestamp);
        const meta = CATEGORY_CONFIG[entry.category] ?? CATEGORY_CONFIG.activity;
        return [
          escapeCsv(entry.title),
          escapeCsv(meta.label),
          escapeCsv(longDateTimeFormatter.format(date)),
          escapeCsv(entry.note ?? ''),
        ].join(',');
      })
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `baby-bloom-timeline-${activeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filterButtons = [
    { key: 'today', label: 'Today', icon: '\u{1F4C5}' },
    { key: 'week', label: 'This Week', icon: '\u{1F4C6}' },
  ];

  const emptyMessage =
    activeRange === 'today'
      ? 'No activities logged yet today. Log feeding, sleep, diaper, or health records to see them here.'
      : timelineEntries.length === 0
        ? 'No activities recorded yet. Start logging feeding, sleep, diaper, or health records to build your timeline.'
        : 'No activities recorded in the last 7 days.';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-title-icon" aria-hidden="true">{TITLE_ICON}</span>
          Timeline
        </h1>
        <p className="page-subtitle">Complete activity history for your baby</p>
      </div>

      <div className="page-actions">
        {filterButtons.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            className={`btn btn-secondary ${activeRange === key ? 'active' : ''}`}
            onClick={() => setActiveRange(key)}
            aria-pressed={activeRange === key}
          >
            <span aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleExport}
          disabled={!filteredEntries.length}
        >
          <span aria-hidden="true">{EXPORT_ICON}</span>
          <span>Export</span>
        </button>
      </div>

      <div className="section-card">
        <h3 style={{ marginBottom: 'var(--spacing-xl)' }}>Recent Activities</h3>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: '20px',
              top: '20px',
              bottom: '20px',
              width: '2px',
              background: 'var(--border)',
            }}
          />

          {filteredEntries.length === 0 && (
            <div
              className="card"
              style={{
                padding: 'var(--spacing-xl)',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              {emptyMessage}
            </div>
          )}

          {filteredEntries.map((entry) => {
            const date = new Date(entry.timestamp);
            const meta = CATEGORY_CONFIG[entry.category] ?? CATEGORY_CONFIG.activity;
            const dotColor = entry.color ?? meta.color;
            const iconChar = entry.icon ?? meta.icon;
            const relativeTime = formatRelativeTime(
              date,
              now,
              relativeTimeFormatter,
              longDateTimeFormatter
            );
            const timeOfDay = timeOfDayFormatter.format(date);

            return (
              <div
                key={entry.id}
                style={{
                  position: 'relative',
                  paddingLeft: '60px',
                  marginBottom: 'var(--spacing-xl)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '8px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: dotColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    border: '3px solid var(--surface)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <span aria-hidden="true">{iconChar}</span>
                </div>

                <div className="card" style={{ borderLeft: '3px solid ' + dotColor }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: 'var(--spacing-xs)',
                      gap: 'var(--spacing-md)',
                    }}
                  >
                    <h4 style={{ margin: 0 }}>{entry.title}</h4>
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-tertiary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {relativeTime}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      marginBottom: entry.note ? 'var(--spacing-sm)' : 0,
                    }}
                  >
                    {meta.label} | {timeOfDay}
                  </div>
                  {entry.note && (
                    <div
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {entry.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
