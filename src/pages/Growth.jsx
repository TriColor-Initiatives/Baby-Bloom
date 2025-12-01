import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBaby } from '../contexts/BabyContext';
import GrowthCharts from '../components/health/GrowthCharts';
import '../styles/pages.css';

const REFERENCE_DATA = {
  '0-6': [
    {
      label: '🍼 Newborn (0–1 Month)',
      ageMonths: 0,
      weightRange: '2.5–4.5 kg',
      heightRange: '46–54 cm',
      headRange: '32–37 cm',
      weightKg: 3.5,
      heightCm: 50,
      headCm: 34.5,
      sections: [
        {
          title: 'Motor Development',
          items: ['Lifts head briefly while on tummy', 'Reflexes: rooting, sucking, grasp, Moro', 'Movements are jerky & primitive'],
        },
        {
          title: 'Cognitive / Social',
          items: ['Recognizes mother’s voice', 'Stares at faces', 'Prefers high-contrast shapes'],
        },
        {
          title: 'Sensory',
          items: ['Can see best at 20–30 cm', 'Tracks slow-moving objects for a second'],
        },
        {
          title: 'Feeding',
          items: ['8–12 feeds/day (breast)', 'Growth spurts common'],
        },
      ],
    },
    {
      label: '🌙 1 Month Old',
      ageMonths: 1,
      weightRange: '3.4–5.5 kg',
      heightRange: '50–58 cm',
      headRange: '34–38 cm',
      weightKg: 4.45,
      heightCm: 54,
      headCm: 36,
      sections: [
        {
          title: 'Motor',
          items: ['Slight head control when upright', 'Arms & legs more relaxed', 'Begins tummy-time toleration'],
        },
        {
          title: 'Cognitive / Social',
          items: ['Looks at caregivers longer', 'Responds to sound & begins cooing'],
        },
        {
          title: 'Sensory',
          items: ['Follows objects slowly side to side'],
        },
      ],
    },
    {
      label: '😊 2 Months Old',
      ageMonths: 2,
      weightRange: '4.0–6.5 kg',
      heightRange: '54–60 cm',
      headRange: '36–39.5 cm',
      weightKg: 5.25,
      heightCm: 57,
      headCm: 37.75,
      sections: [
        {
          title: 'Motor',
          items: ['Holds head up longer during tummy time', 'Smoother limb movement', 'Attempts mini push-ups'],
        },
        {
          title: 'Cognitive / Social',
          items: ['Smiles socially ⭐', 'Makes cooing sounds', 'Recognizes parents visually'],
        },
        {
          title: 'Sensory',
          items: ['Tracks moving objects 180°'],
        },
      ],
    },
    {
      label: '🎶 3 Months Old',
      ageMonths: 3,
      weightRange: '4.8–7.2 kg',
      heightRange: '57–64 cm',
      headRange: '38–41 cm',
      weightKg: 6,
      heightCm: 60.5,
      headCm: 39.5,
      sections: [
        {
          title: 'Motor',
          items: ['Holds head steady', 'Opens & closes hands intentionally', 'Brings hands to mouth', 'Begins rolling attempts (tummy → side)'],
        },
        {
          title: 'Cognitive / Social',
          items: ['Laughs softly', 'Enjoys face-to-face interaction', 'Recognizes familiar routines'],
        },
        {
          title: 'Sensory',
          items: ['Better eye–hand coordination', 'Tracks fast-moving objects'],
        },
      ],
    },
    {
      label: '✨ 4 Months Old',
      ageMonths: 4,
      weightRange: '5.4–7.8 kg',
      heightRange: '60–66 cm',
      headRange: '39–42.5 cm',
      weightKg: 6.6,
      heightCm: 63,
      headCm: 40.75,
      sections: [
        {
          title: 'Motor',
          items: ['Rolls tummy → back ⭐', 'Pushes up on elbows', 'Reaches for toys', 'Stronger neck & back'],
        },
        {
          title: 'Cognitive / Social',
          items: ['Laughs louder', 'Copies sounds', 'Shows excitement when seeing caregivers'],
        },
      ],
    },
    {
      label: '🧸 5 Months Old',
      ageMonths: 5,
      weightRange: '6.0–8.4 kg',
      heightRange: '62–68 cm',
      headRange: '40–43.5 cm',
      weightKg: 7.2,
      heightCm: 65,
      headCm: 41.75,
      sections: [
        {
          title: 'Motor',
          items: ['Sits with support', 'Rolls back → tummy sometimes', 'Transfers toys between hands'],
        },
        {
          title: 'Cognitive / Social',
          items: ['Recognizes own name', 'Expressive giggles & squeals', 'Shows curiosity about objects'],
        },
      ],
    },
    {
      label: '🌟 6 Months Old',
      ageMonths: 6,
      weightRange: '6.4–9.0 kg',
      heightRange: '63–70 cm',
      headRange: '41–44.5 cm',
      weightKg: 7.7,
      heightCm: 66.5,
      headCm: 42.75,
      sections: [
        {
          title: 'Motor',
          items: ['Rolls both ways ⭐', 'Sits with minimal support', 'Bears weight on legs when held', 'Begins crawling attempts (rocking on knees)'],
        },
        {
          title: 'Cognitive / Social',
          items: ['Babbling (“ba-ba,” “ma-ma” sounds)', 'Responds to emotions', 'Plays with cause-and-effect toys'],
        },
        {
          title: 'Feeding Milestones',
          items: ['Ready for solid foods (purees)', 'Can swallow thicker textures', 'Shows interest in family meals'],
        },
      ],
    },
  ],
  '6-12': [
    {
      label: '🌟 6 Months Old',
      ageMonths: 6,
      weightRange: '6.4–9.0 kg',
      heightRange: '63–70 cm',
      headRange: '41–44.5 cm',
      weightKg: 7.7,
      heightCm: 66.5,
      headCm: 42.75,
      sections: [
        { title: 'Motor', items: ['Rolls both ways', 'Sits with support', 'Rocks on hands & knees', 'Tries crawling motions'] },
        { title: 'Cognitive/Social', items: ['Responds to emotions', 'Recognizes strangers vs familiar faces', 'Babbling “ba-ba / da-da”'] },
        { title: 'Feeding', items: ['Starts purees', 'Shows interest in table food'] },
      ],
    },
    {
      label: '🦷 7 Months Old',
      ageMonths: 7,
      weightRange: '6.8–9.5 kg',
      heightRange: '65–72 cm',
      headRange: '41.5–45.2 cm',
      weightKg: 8.2,
      heightCm: 68.5,
      headCm: 43.35,
      sections: [
        { title: 'Motor', items: ['Sits without support', 'Begins army crawling', 'Uses hands to push up to sit'] },
        { title: 'Cognitive/Social', items: ['Responds to name', 'Enjoys peek-a-boo', 'Explores with hands & mouth'] },
        { title: 'Feeding', items: ['Eats thicker purees', 'Begins self-feeding attempts'] },
      ],
    },
    {
      label: '🧩 8 Months Old',
      ageMonths: 8,
      weightRange: '7.0–10.0 kg',
      heightRange: '66–74 cm',
      headRange: '42–46 cm',
      weightKg: 8.5,
      heightCm: 70,
      headCm: 44,
      sections: [
        { title: 'Motor', items: ['Crawling or scooting', 'Stands with support', 'Picks up objects with thumb & finger'] },
        { title: 'Cognitive/Social', items: ['Understands simple “no”', 'Recognizes familiar people', 'Imitates sounds and gestures'] },
        { title: 'Feeding', items: ['Eats mashed foods', 'Drinks water from sippy cup'] },
      ],
    },
    {
      label: '🚼 9 Months Old',
      ageMonths: 9,
      weightRange: '7.3–10.5 kg',
      heightRange: '67–75 cm',
      headRange: '43–47 cm',
      weightKg: 8.9,
      heightCm: 71,
      headCm: 45,
      sections: [
        { title: 'Motor', items: ['Pulls to stand', 'Crawls well', 'Uses pincer grasp (thumb + finger)'] },
        { title: 'Cognitive/Social', items: ['Says “mama/dada” (non-specific)', 'Understands simple instructions', 'Stranger anxiety begins'] },
        { title: 'Feeding', items: ['Finger foods introduced', 'Chews soft foods'] },
      ],
    },
    {
      label: '🎉 10 Months Old',
      ageMonths: 10,
      weightRange: '7.6–11.0 kg',
      heightRange: '69–76 cm',
      headRange: '43.5–47.5 cm',
      weightKg: 9.3,
      heightCm: 72.5,
      headCm: 45.5,
      sections: [
        { title: 'Motor', items: ['Cruises along furniture', 'Sits confidently', 'Points at objects'] },
        { title: 'Cognitive/Social', items: ['Enjoys interactive games', 'Responds to gestures', 'Understands “bye-bye”'] },
        { title: 'Feeding', items: ['Mixed textures', 'Self-feeding improves'] },
      ],
    },
    {
      label: '🚶 11 Months Old',
      ageMonths: 11,
      weightRange: '7.8–11.2 kg',
      heightRange: '70–78 cm',
      headRange: '44–48 cm',
      weightKg: 9.5,
      heightCm: 74,
      headCm: 46,
      sections: [
        { title: 'Motor', items: ['Stands momentarily', 'May take first steps', 'Climbs small obstacles'] },
        { title: 'Cognitive/Social', items: ['Says simple words intentionally', 'Shows preferences in toys', 'Follows simple 1-step commands'] },
        { title: 'Feeding', items: ['Eats soft solids', 'Uses hands well to feed'] },
      ],
    },
    {
      label: '🎂 12 Months (1 Year)',
      ageMonths: 12,
      weightRange: '8.0–11.5 kg',
      heightRange: '72–80 cm',
      headRange: '44.5–48.5 cm',
      weightKg: 9.75,
      heightCm: 76,
      headCm: 46.5,
      sections: [
        { title: 'Motor', items: ['Independent walking begins', 'Climbs furniture', 'Stacks objects'] },
        { title: 'Cognitive/Social', items: ['Says “mama/dada” meaningfully', 'Responds to own name perfectly', 'Waves, claps, points'] },
        { title: 'Feeding', items: ['Eats chopped foods', 'Drinks from sippy cup', 'Weaning process may begin'] },
      ],
    },
  ]
};

const Growth = () => {
  const { activeBaby } = useBaby();
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [isChartsOpen, setIsChartsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    weight: '',
    height: '',
    headCircumference: '',
    notes: ''
  });

  // Load health records from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('baby-bloom-health') || '[]');
      setRecords(Array.isArray(saved) ? saved : []);
    } catch {
      setRecords([]);
    }
  }, []);

  // Auto-open modal if 'add' parameter is present
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsMeasurementModalOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openMeasurementModal = () => {
    setFormData({
      date: new Date().toISOString().slice(0, 16),
      weight: '',
      height: '',
      headCircumference: '',
      notes: ''
    });
    setIsMeasurementModalOpen(true);
  };

  const closeMeasurementModal = () => {
    setIsMeasurementModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const recordData = {
      id: Date.now(),
      type: 'checkup',
      title: 'Growth Measurement',
      date: new Date(formData.date).toISOString(),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      headCircumference: formData.headCircumference ? parseFloat(formData.headCircumference) : null,
      notes: formData.notes || ''
    };

    const updatedRecords = [recordData, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('baby-bloom-health', JSON.stringify(updatedRecords));

    closeMeasurementModal();
  };

  // Get growth records (only those with measurements) and sort by date (newest first)
  const growthRecords = records
    .filter(r => r.weight || r.height || r.headCircumference)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get latest measurements
  const latestRecord = growthRecords.length > 0 ? growthRecords[0] : null;

  const referenceCurve = useMemo(() => {
    const merged = [...REFERENCE_DATA['0-6'], ...REFERENCE_DATA['6-12']];
    return merged.sort((a, b) => a.ageMonths - b.ageMonths);
  }, []);

  const getAgeInMonths = (dateString, fallbackIndex) => {
    if (activeBaby?.dateOfBirth) {
      const date = new Date(dateString);
      const birth = new Date(activeBaby.dateOfBirth);
      const months = (date.getFullYear() - birth.getFullYear()) * 12 + (date.getMonth() - birth.getMonth());
      const days = date.getDate() - birth.getDate();
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      return months + Math.max(0, days) / daysInMonth;
    }
    // Fallback: space by 1 month using order of entry
    return fallbackIndex;
  };

  const babyAgeMonths = useMemo(() => {
    if (!activeBaby?.dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(activeBaby.dateOfBirth);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    const days = today.getDate() - birth.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return months + Math.max(0, days) / daysInMonth;
  }, [activeBaby]);

  const ageMatchedReference = useMemo(() => {
    const combined = [...REFERENCE_DATA['0-6'], ...REFERENCE_DATA['6-12']];
    if (babyAgeMonths === null) return combined;
    if (babyAgeMonths < 1) {
      // Keep newborn/0–1 month only when under 1 month old
      return [REFERENCE_DATA['0-6'][0]];
    }
    const closest = combined.reduce((best, current) => {
      const dist = Math.abs(current.ageMonths - babyAgeMonths);
      if (!best || dist < best.dist) return { item: current, dist };
      return best;
    }, null);
    return closest ? [closest.item] : combined.slice(0, 1);
  }, [babyAgeMonths]);

  const CARD_STYLES = [
    'linear-gradient(135deg, #eef2ff, #dfe7ff)',
    'linear-gradient(135deg, #e7ecff, #d5defc)',
    'linear-gradient(135deg, #edf2ff, #dce6ff)',
    'linear-gradient(135deg, #e8eeff, #d8e4ff)',
  ];

  const chartPoints = useMemo(() => {
    return growthRecords
      .slice()
      .reverse()
      .map((record, index) => ({
        ageMonths: getAgeInMonths(record.date, index),
        weight: record.weight ? Number(record.weight) : null,
        height: record.height ? Number(record.height) : null,
        head: record.headCircumference ? Number(record.headCircumference) : null,
        date: record.date
      }));
  }, [growthRecords, activeBaby]);

  // Calculate trends and percentiles for latest measurements
  const getTrend = (metric, currentValue) => {
    if (!latestRecord || growthRecords.length < 2) return null;
    const previousRecord = growthRecords[1];
    let previousValue = null;
    if (metric === 'weight') previousValue = previousRecord.weight;
    else if (metric === 'height') previousValue = previousRecord.height;
    else if (metric === 'head') previousValue = previousRecord.headCircumference;

    if (!previousValue || !currentValue) return null;
    const diff = currentValue - previousValue;
    return {
      value: Math.abs(diff),
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
      percentage: ((diff / previousValue) * 100).toFixed(1)
    };
  };

  // Calculate percentile (simplified - based on reference data)
  const getPercentile = (metric, value, ageMonths) => {
    if (!value || ageMonths === null) return null;
    const ref = referenceCurve.find(r => Math.abs(r.ageMonths - ageMonths) < 0.5);
    if (!ref) return null;

    let refValue = null;
    if (metric === 'weight') refValue = ref.weightKg;
    else if (metric === 'height') refValue = ref.heightCm;
    else if (metric === 'head') refValue = ref.headCm;

    if (!refValue) return null;

    // Simplified percentile calculation
    const ratio = value / refValue;
    if (ratio >= 1.15) return 95;
    if (ratio >= 1.08) return 75;
    if (ratio >= 1.0) return 50;
    if (ratio >= 0.92) return 25;
    if (ratio >= 0.85) return 5;
    return 5;
  };

  // Get time ago string
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📏 Growth Tracking</h1>
        <p className="page-subtitle">Monitor your baby's physical development</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={openMeasurementModal}>
          <span>➕</span>
          <span>Add Measurement</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsChartsOpen(true)}>
          <span>📊</span>
          <span>View Charts</span>
        </button>
      </div>

      {/* Two Column Layout: Latest Measurements (Left) and Growth Charts (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-xl)',
        alignItems: 'stretch'
      }} className="growth-two-column-layout">
        {/* Left Column: Latest Measurements */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Latest Measurements</h3>
          {latestRecord ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', flex: 1, minHeight: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', flex: 1, overflow: 'auto' }}>
                {latestRecord.weight && (() => {
                  const trend = getTrend('weight', latestRecord.weight);
                  const percentile = getPercentile('weight', latestRecord.weight, getAgeInMonths(latestRecord.date, 0));
                  return (
                    <div style={{
                      background: 'linear-gradient(135deg, #eef2ff, #dfe7ff)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--spacing-lg)',
                      border: '1px solid rgba(255,255,255,0.5)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)'
                    }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚖️</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>Weight</div>
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {latestRecord.weight} <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 500 }}>kg</span>
                        </div>
                        {percentile && (
                          <div style={{
                            background: 'rgba(255,255,255,0.7)',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 600,
                            color: 'var(--primary)',
                            display: 'inline-block',
                            width: 'fit-content',
                            marginTop: 'var(--spacing-xs)'
                          }}>
                            {percentile}th percentile
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-xs)', flexShrink: 0 }}>
                        {trend && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)',
                            fontSize: 'var(--font-size-sm)',
                            color: trend.direction === 'up' ? 'var(--success)' : trend.direction === 'down' ? 'var(--error)' : 'var(--text-secondary)',
                            fontWeight: 600
                          }}>
                            <span>{trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}</span>
                            <span>{trend.value.toFixed(1)} kg ({trend.percentage}%)</span>
                          </div>
                        )}
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                          {getTimeAgo(latestRecord.date)} • {new Date(latestRecord.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {latestRecord.height && (() => {
                  const trend = getTrend('height', latestRecord.height);
                  const percentile = getPercentile('height', latestRecord.height, getAgeInMonths(latestRecord.date, 0));
                  return (
                    <div style={{
                      background: 'linear-gradient(135deg, #eef2ff, #dfe7ff)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--spacing-lg)',
                      border: '1px solid rgba(255,255,255,0.5)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)'
                    }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📏</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>Height</div>
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {latestRecord.height} <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 500 }}>cm</span>
                        </div>
                        {percentile && (
                          <div style={{
                            background: 'rgba(255,255,255,0.7)',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 600,
                            color: 'var(--primary)',
                            display: 'inline-block',
                            width: 'fit-content',
                            marginTop: 'var(--spacing-xs)'
                          }}>
                            {percentile}th percentile
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-xs)', flexShrink: 0 }}>
                        {trend && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)',
                            fontSize: 'var(--font-size-sm)',
                            color: trend.direction === 'up' ? 'var(--success)' : trend.direction === 'down' ? 'var(--error)' : 'var(--text-secondary)',
                            fontWeight: 600
                          }}>
                            <span>{trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}</span>
                            <span>{trend.value.toFixed(1)} cm ({trend.percentage}%)</span>
                          </div>
                        )}
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                          {getTimeAgo(latestRecord.date)} • {new Date(latestRecord.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {latestRecord.headCircumference && (() => {
                  const trend = getTrend('head', latestRecord.headCircumference);
                  const percentile = getPercentile('head', latestRecord.headCircumference, getAgeInMonths(latestRecord.date, 0));
                  return (
                    <div style={{
                      background: 'linear-gradient(135deg, #eef2ff, #dfe7ff)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--spacing-lg)',
                      border: '1px solid rgba(255,255,255,0.5)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)'
                    }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⭕</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>Head Circumference</div>
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {latestRecord.headCircumference} <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 500 }}>cm</span>
                        </div>
                        {percentile && (
                          <div style={{
                            background: 'rgba(255,255,255,0.7)',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 600,
                            color: 'var(--primary)',
                            display: 'inline-block',
                            width: 'fit-content',
                            marginTop: 'var(--spacing-xs)'
                          }}>
                            {percentile}th percentile
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-xs)', flexShrink: 0 }}>
                        {trend && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)',
                            fontSize: 'var(--font-size-sm)',
                            color: trend.direction === 'up' ? 'var(--success)' : trend.direction === 'down' ? 'var(--error)' : 'var(--text-secondary)',
                            fontWeight: 600
                          }}>
                            <span>{trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}</span>
                            <span>{trend.value.toFixed(1)} cm ({trend.percentage}%)</span>
                          </div>
                        )}
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                          {getTimeAgo(latestRecord.date)} • {new Date(latestRecord.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              {latestRecord && (
                <button className="btn btn-primary" onClick={openMeasurementModal} style={{ marginTop: 'auto', width: 'auto', alignSelf: 'center', flexShrink: 0 }}>
                  <span>➕</span>
                  <span>Add New Measurement</span>
                </button>
              )}
            </div>
          ) : (
            <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="empty-icon">📏</div>
              <h3>No measurements yet</h3>
              <p>Add your first growth measurement to start tracking</p>
              <button className="btn btn-primary btn-large" onClick={openMeasurementModal}>
                <span>➕</span>
                <span>Add Measurement</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Growth Charts */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ margin: 0 }}>Growth Charts</h3>
            <button className="btn btn-secondary" onClick={() => setIsChartsOpen(true)} style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}>
              <span>🔍</span>
              <span>Fullscreen</span>
            </button>
          </div>
          <div style={{
            padding: 'var(--spacing-lg) var(--spacing-lg) var(--spacing-sm) var(--spacing-lg)',
            background: 'linear-gradient(135deg, #eef2ff, #dfe7ff)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
            flex: 1,
            minHeight: 0
          }}>
            <GrowthCharts
              records={records}
              referenceCurve={referenceCurve}
              chartPoints={chartPoints}
              onClose={() => { }}
              embed
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: 'var(--spacing-sm)',
              borderTop: '1px solid rgba(255,255,255,0.5)',
              flexShrink: 0
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', flex: 1 }}>
                Track growth over time. Switch tabs to view different metrics.
              </div>
              <button className="btn btn-primary" onClick={openMeasurementModal} style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}>
                <span>➕</span>
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>
          {babyAgeMonths !== null ? 'Age-matched Growth & Milestones' : 'Growth & Milestones (0–12 months)'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--spacing-md)' }}>
          {ageMatchedReference.map((item, idx) => {
            const bg = CARD_STYLES[idx % CARD_STYLES.length];
            return (
              <div
                key={item.label}
                className="card milestone-card"
                style={{
                  padding: 'var(--spacing-xl)',
                  background: bg,
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                  display: 'grid',
                  gap: 'var(--spacing-md)',
                  minHeight: '240px',
                  transition: 'all var(--transition-normal)',
                  animation: `milestoneFadeIn ${0.3 + idx * 0.1}s ease-out`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 700, fontSize: '1.05rem' }}>
                    <span className="milestone-icon floating-icon">👶</span>
                    <span>{item.label}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                  <span style={{ background: 'rgba(255,255,255,0.6)', padding: '4px 10px', borderRadius: '999px' }}>Weight {item.weightRange || `${item.weightKg} kg`}</span>
                  <span style={{ background: 'rgba(255,255,255,0.6)', padding: '4px 10px', borderRadius: '999px' }}>Height {item.heightRange || `${item.heightCm} cm`}</span>
                  <span style={{ background: 'rgba(255,255,255,0.6)', padding: '4px 10px', borderRadius: '999px' }}>Head circ. {item.headRange || `${item.headCm} cm`}</span>
                </div>
                <div style={{ display: 'grid', gap: 'var(--spacing-sm)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {item.sections?.map((section, sectionIdx) => (
                    <div
                      key={section.title}
                      className="milestone-subcard"
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        background: 'rgba(255,255,255,0.6)',
                        borderRadius: '12px',
                        padding: '8px 10px',
                        height: '100%',
                        animationDelay: `${sectionIdx * 80}ms`
                      }}
                    >
                      <div className="milestone-section-title">
                        <span className="milestone-icon floating-icon">✨</span>
                        <span>{section.title}</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {section.items.map((m) => (<li key={m}>{m}</li>))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Growth History Timeline */}
      {growthRecords.length > 0 && (
        <div className="section-card">
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Growth History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {growthRecords.slice(0, 10).map((record, idx) => (
              <div
                key={record.id}
                style={{
                  display: 'flex',
                  gap: 'var(--spacing-lg)',
                  padding: 'var(--spacing-md)',
                  background: 'var(--surface-variant)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${idx === 0 ? 'var(--primary)' : 'var(--border)'}`,
                  transition: 'all var(--transition-normal)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface-variant)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  minWidth: '100px',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  fontWeight: 500
                }}>
                  {new Date(record.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {getAgeInMonths(record.date, idx).toFixed(1)} months
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: 'var(--spacing-lg)',
                  flexWrap: 'wrap',
                  flex: 1
                }}>
                  {record.weight && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Weight</div>
                        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>{record.weight} kg</div>
                      </div>
                    </div>
                  )}
                  {record.height && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <span style={{ fontSize: '1.2rem' }}>📏</span>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Height</div>
                        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>{record.height} cm</div>
                      </div>
                    </div>
                  )}
                  {record.headCircumference && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <span style={{ fontSize: '1.2rem' }}>⭕</span>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Head</div>
                        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>{record.headCircumference} cm</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Measurement Modal */}
      {isMeasurementModalOpen && (
        <div className="modal-overlay" onClick={closeMeasurementModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Growth Measurement</h3>
              <button className="modal-close" onClick={closeMeasurementModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              <div>
                <label className="form-label">Date & Time</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Weight (kg)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 8.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Height (cm)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 71"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Head Circumference (cm)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 45"
                  value={formData.headCircumference}
                  onChange={(e) => setFormData({ ...formData, headCircumference: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeMeasurementModal}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!formData.weight && !formData.height && !formData.headCircumference}
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Charts Modal */}
      {isChartsOpen && (
        <GrowthCharts
          records={records}
          referenceCurve={referenceCurve}
          chartPoints={chartPoints}
          onClose={() => setIsChartsOpen(false)}
        />
      )}
    </div>
  );
};

export default Growth;
