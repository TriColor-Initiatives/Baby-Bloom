import React, { useMemo } from 'react';
import './GrowthCharts.css';

const GrowthCharts = ({ referenceCurve = [], chartPoints = [], onClose, embed = false }) => {
  const hasMeasurements = chartPoints?.length > 0;
  const width = 640;
  const height = 240;
  const padding = 40;

  const nearestRefWeight = (age) => {
    if (!referenceCurve.length) return null;
    return referenceCurve.reduce((best, current) => {
      const dist = Math.abs(current.ageMonths - age);
      if (!best || dist < best.dist) return { value: current.weightKg, dist };
      return best;
    }, null)?.value ?? null;
  };

  const bars = useMemo(() => {
    return chartPoints.map((p, idx) => ({
      label: p.ageMonths.toFixed(1).replace('.0', ''),
      actual: p.weight,
      reference: nearestRefWeight(p.ageMonths),
      age: p.ageMonths,
      idx,
    }));
  }, [chartPoints, referenceCurve]);

  const maxWeight = useMemo(() => {
    const vals = [
      ...bars.map((b) => b.actual || 0),
      ...bars.map((b) => b.reference || 0),
      10,
    ];
    return Math.max(...vals) + 1;
  }, [bars]);

  const xScale = (index, total) => {
    const barArea = width - padding * 2;
    const slot = barArea / Math.max(total, 1);
    return padding + slot * index;
  };

  const yScale = (weight) => {
    if (weight === null || weight === undefined) return height - padding;
    const ratio = weight / maxWeight;
    return height - padding - ratio * (height - padding * 2);
  };

  const barWidth = ((width - padding * 2) / Math.max(bars.length, 1)) * 0.4;

  const ChartBody = (
    <div className="charts-content">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Baby weight bar chart">
        <g>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--border)" />
          <text x={width / 2} y={height - 12} textAnchor="middle" fill="var(--text-secondary)" fontSize="12">
            Age (months)
          </text>
          <text
            x={12}
            y={height / 2}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="12"
            transform={`rotate(-90 12 ${height / 2})`}
          >
            Weight (kg)
          </text>
        </g>

        {[0.25, 0.5, 0.75, 1].map((tick, idx) => {
          const weightTick = tick * maxWeight;
          const y = yScale(weightTick);
          return (
            <g key={idx}>
              <line
                x1={padding - 6}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
              <text x={padding - 10} y={y + 4} textAnchor="end" fill="var(--text-secondary)" fontSize="11">
                {weightTick.toFixed(1)}
              </text>
            </g>
          );
        })}

        {bars.map((bar, i) => {
          const x = xScale(i, bars.length);
          const groupWidth = (width - padding * 2) / Math.max(bars.length, 1);
          const refX = x + groupWidth * 0.15;
          const actX = x + groupWidth * 0.5;
          const refHeight = height - padding - yScale(bar.reference || 0);
          const actHeight = height - padding - yScale(bar.actual || 0);

          return (
            <g key={bar.idx}>
              <rect
                x={refX - barWidth / 2}
                y={yScale(bar.reference || 0)}
                width={barWidth}
                height={refHeight}
                fill="#c7d3ff"
                opacity="0.7"
                rx="4"
              />
              <rect
                x={actX - barWidth / 2}
                y={yScale(bar.actual || 0)}
                width={barWidth}
                height={actHeight}
                fill="var(--accent)"
                rx="4"
              />
              <text
                x={x + groupWidth * 0.5}
                y={height - padding + 18}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="11"
              >
                {bar.label}
              </text>
            </g>
          );
        })}

        {!hasMeasurements && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="14"
          >
            Add a measurement to see your baby's chart.
          </text>
        )}
      </svg>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', marginTop: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '10px', background: '#c7d3ff', display: 'inline-block', borderRadius: '4px' }}></span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Reference weight</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '10px', background: 'var(--accent)', display: 'inline-block', borderRadius: '4px' }}></span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your baby</span>
        </div>
      </div>
    </div>
  );

  if (embed) {
    return (
      <div>
        {ChartBody}
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="charts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Growth Charts</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {ChartBody}
      </div>
    </div>
  );
};

export default GrowthCharts;
