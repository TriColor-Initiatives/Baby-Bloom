import React, { useMemo, useState } from 'react';
import './GrowthCharts.css';

const GrowthCharts = ({ referenceCurve = [], chartPoints = [], onClose, embed = false }) => {
  const [activeTab, setActiveTab] = useState('weight');
  const hasMeasurements = chartPoints?.length > 0;
  const width = embed ? 600 : 800;
  const height = embed ? 280 : 400;
  const padding = { top: 50, right: 50, bottom: 60, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Get reference values for different metrics
  const getReferenceValue = (age, metric) => {
    if (!referenceCurve.length) return null;
    const nearest = referenceCurve.reduce((best, current) => {
      const dist = Math.abs(current.ageMonths - age);
      if (!best || dist < best.dist) {
        let value = null;
        if (metric === 'weight') value = current.weightKg;
        else if (metric === 'height') value = current.heightCm;
        else if (metric === 'head') value = current.headCm;
        return { value, dist };
      }
      return best;
    }, null);
    return nearest?.value ?? null;
  };

  // Get percentile zones (5th, 25th, 50th, 75th, 95th)
  const getPercentileZones = (metric) => {
    if (!referenceCurve.length) return [];
    const zones = [];
    referenceCurve.forEach(ref => {
      let value = null;
      if (metric === 'weight') value = ref.weightKg;
      else if (metric === 'height') value = ref.heightCm;
      else if (metric === 'head') value = ref.headCm;

      if (value) {
        // Calculate percentile zones (simplified - using ±20% for zones)
        zones.push({
          age: ref.ageMonths,
          p5: value * 0.85,
          p25: value * 0.92,
          p50: value,
          p75: value * 1.08,
          p95: value * 1.15
        });
      }
    });
    return zones;
  };

  // Prepare chart data for active metric
  const chartData = useMemo(() => {
    const metric = activeTab;
    return chartPoints
      .map((p) => ({
        ageMonths: p.ageMonths,
        value: metric === 'weight' ? p.weight : metric === 'height' ? p.height : p.head,
        date: p.date
      }))
      .filter(p => p.value !== null && p.value !== undefined)
      .sort((a, b) => a.ageMonths - b.ageMonths);
  }, [chartPoints, activeTab]);

  // Calculate max value for Y-axis
  const maxValue = useMemo(() => {
    const metric = activeTab;
    const values = [
      ...chartData.map(p => p.value || 0),
      ...referenceCurve.map(ref => {
        if (metric === 'weight') return ref.weightKg || 0;
        if (metric === 'height') return ref.heightCm || 0;
        if (metric === 'head') return ref.headCm || 0;
        return 0;
      })
    ];
    const max = Math.max(...values, 1);
    return Math.ceil(max * 1.2); // Add 20% padding
  }, [chartData, referenceCurve, activeTab]);

  const minValue = useMemo(() => {
    const metric = activeTab;
    const values = [
      ...chartData.map(p => p.value || 0),
      ...referenceCurve.map(ref => {
        if (metric === 'weight') return ref.weightKg || 0;
        if (metric === 'height') return ref.heightCm || 0;
        if (metric === 'head') return ref.headCm || 0;
        return 0;
      })
    ].filter(v => v > 0);
    if (values.length === 0) return 0;
    const min = Math.min(...values);
    return Math.max(0, Math.floor(min * 0.9)); // 10% padding below
  }, [chartData, referenceCurve, activeTab]);

  // Scale functions
  const xScale = (ageMonths) => {
    if (chartData.length === 0) return padding.left;
    const minAge = Math.min(...chartData.map(p => p.ageMonths), 0);
    const maxAge = Math.max(...chartData.map(p => p.ageMonths), 12);
    const ageRange = maxAge - minAge || 12;
    const ratio = (ageMonths - minAge) / ageRange;
    return padding.left + ratio * chartWidth;
  };

  const yScale = (value) => {
    if (value === null || value === undefined) return padding.top + chartHeight;
    const valueRange = maxValue - minValue || maxValue;
    const ratio = (value - minValue) / valueRange;
    return padding.top + chartHeight - (ratio * chartHeight);
  };

  // Generate smooth path for line chart
  const generatePath = (points) => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      const p = points[0];
      return `M ${xScale(p.ageMonths)} ${yScale(p.value)}`;
    }

    let path = `M ${xScale(points[0].ageMonths)} ${yScale(points[0].value)}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      const x1 = xScale(prev.ageMonths);
      const y1 = yScale(prev.value);
      const x2 = xScale(curr.ageMonths);
      const y2 = yScale(curr.value);

      if (i === 1) {
        // First segment - use quadratic curve
        const cp1x = x1 + (x2 - x1) * 0.5;
        const cp1y = y1;
        path += ` Q ${cp1x} ${cp1y} ${x2} ${y2}`;
      } else if (next) {
        // Middle segments - use smooth curves
        const cp1x = x1 + (x2 - x1) * 0.3;
        const cp1y = y1;
        const cp2x = x2 - (x2 - x1) * 0.3;
        const cp2y = y2;
        path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x2} ${y2}`;
      } else {
        // Last segment
        const cp1x = x1 + (x2 - x1) * 0.5;
        const cp1y = y1;
        path += ` Q ${cp1x} ${cp1y} ${x2} ${y2}`;
      }
    }

    return path;
  };

  // Generate area path (for gradient fill)
  const generateAreaPath = (points) => {
    if (points.length === 0) return '';
    const linePath = generatePath(points);
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    return `${linePath} L ${xScale(lastPoint.ageMonths)} ${padding.top + chartHeight} L ${xScale(firstPoint.ageMonths)} ${padding.top + chartHeight} Z`;
  };

  // Reference curve points
  const referencePoints = useMemo(() => {
    const metric = activeTab;
    return referenceCurve
      .filter(ref => {
        if (metric === 'weight') return ref.weightKg;
        if (metric === 'height') return ref.heightCm;
        if (metric === 'head') return ref.headCm;
        return false;
      })
      .map(ref => ({
        ageMonths: ref.ageMonths,
        value: metric === 'weight' ? ref.weightKg : metric === 'height' ? ref.heightCm : ref.headCm
      }))
      .sort((a, b) => a.ageMonths - b.ageMonths);
  }, [referenceCurve, activeTab]);

  // Get metric labels
  const getMetricLabel = () => {
    if (activeTab === 'weight') return 'Weight (kg)';
    if (activeTab === 'height') return 'Height (cm)';
    return 'Head Circumference (cm)';
  };

  const getMetricIcon = () => {
    if (activeTab === 'weight') return '⚖️';
    if (activeTab === 'height') return '📏';
    return '⭕';
  };

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const numTicks = 5;
    const step = (maxValue - minValue) / (numTicks - 1);
    return Array.from({ length: numTicks }, (_, i) => minValue + step * i);
  }, [maxValue, minValue]);

  // X-axis ticks
  const xTicks = useMemo(() => {
    if (chartData.length === 0) return [0, 3, 6, 9, 12];
    const minAge = Math.min(...chartData.map(p => p.ageMonths), 0);
    const maxAge = Math.max(...chartData.map(p => p.ageMonths), 12);
    const ticks = [];
    for (let age = 0; age <= 12; age += 3) {
      if (age >= minAge && age <= maxAge) ticks.push(age);
    }
    return ticks.length > 0 ? ticks : [0, 3, 6, 9, 12];
  }, [chartData]);

  const ChartBody = (
    <div className="charts-content">
      {/* Tabs */}
      <div className="chart-tabs">
        <button
          className={`chart-tab ${activeTab === 'weight' ? 'active' : ''}`}
          onClick={() => setActiveTab('weight')}
        >
          <span>⚖️</span>
          <span>Weight</span>
        </button>
        <button
          className={`chart-tab ${activeTab === 'height' ? 'active' : ''}`}
          onClick={() => setActiveTab('height')}
        >
          <span>📏</span>
          <span>Height</span>
        </button>
        <button
          className={`chart-tab ${activeTab === 'head' ? 'active' : ''}`}
          onClick={() => setActiveTab('head')}
        >
          <span>⭕</span>
          <span>Head</span>
        </button>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Baby ${activeTab} growth chart`}>
          {/* Background grid */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {yTicks.map((tick, idx) => {
            const y = yScale(tick);
            return (
              <g key={`grid-y-${idx}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="2 4"
                  opacity="0.5"
                />
              </g>
            );
          })}

          {/* Grid lines (vertical) */}
          {xTicks.map((tick, idx) => {
            const x = xScale(tick);
            return (
              <g key={`grid-x-${idx}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="var(--border)"
                  strokeDasharray="2 4"
                  opacity="0.3"
                />
              </g>
            );
          })}

          {/* Percentile zones (subtle background) */}
          {referencePoints.length > 0 && chartData.length > 0 && (() => {
            const zones = getPercentileZones(activeTab);
            if (zones.length === 0) return null;

            return zones.map((zone, idx) => {
              if (idx === 0) return null;
              const prevZone = zones[idx - 1];
              const x1 = xScale(prevZone.age);
              const x2 = xScale(zone.age);
              const y1_p50 = yScale(prevZone.p50);
              const y2_p50 = yScale(zone.p50);
              const y1_p25 = yScale(prevZone.p25);
              const y2_p25 = yScale(zone.p25);
              const y1_p75 = yScale(prevZone.p75);
              const y2_p75 = yScale(zone.p75);

              return (
                <g key={`zone-${idx}`}>
                  {/* 25th-75th percentile zone */}
                  <path
                    d={`M ${x1} ${y1_p25} L ${x2} ${y2_p25} L ${x2} ${y2_p75} L ${x1} ${y1_p75} Z`}
                    fill="#c7d3ff"
                    opacity="0.15"
                  />
                </g>
              );
            });
          })()}

          {/* Reference curve (dashed line) */}
          {referencePoints.length > 0 && (
            <path
              d={generatePath(referencePoints)}
              fill="none"
              stroke="#c7d3ff"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.6"
            />
          )}

          {/* Baby's data area fill */}
          {chartData.length > 0 && (
            <path
              d={generateAreaPath(chartData)}
              fill="url(#areaGradient)"
            />
          )}

          {/* Baby's data line */}
          {chartData.length > 0 && (
            <path
              d={generatePath(chartData)}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {chartData.map((point, idx) => {
            const x = xScale(point.ageMonths);
            const y = yScale(point.value);
            return (
              <g key={`point-${idx}`} className="chart-point">
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="var(--accent)"
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Tooltip on hover */}
                <title>
                  {getMetricIcon()} {point.value.toFixed(1)} {activeTab === 'weight' ? 'kg' : 'cm'} at {point.ageMonths.toFixed(1)} months
                  {'\n'}Date: {new Date(point.date).toLocaleDateString()}
                </title>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="var(--text-secondary)"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="var(--text-secondary)"
            strokeWidth="2"
          />

          {/* Y-axis labels */}
          {yTicks.map((tick, idx) => {
            const y = yScale(tick);
            return (
              <g key={`y-label-${idx}`}>
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--text-secondary)"
                  fontSize="12"
                  fontWeight="500"
                >
                  {tick.toFixed(activeTab === 'weight' ? 1 : 0)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {xTicks.map((tick, idx) => {
            const x = xScale(tick);
            return (
              <g key={`x-label-${idx}`}>
                <text
                  x={x}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="12"
                  fontWeight="500"
                >
                  {tick === 0 ? 'Birth' : `${tick}mo`}
                </text>
              </g>
            );
          })}

          {/* Axis titles */}
          <text
            x={width / 2}
            y={height - 15}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="13"
            fontWeight="600"
          >
            Age (months)
          </text>
          <text
            x={20}
            y={height / 2}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="13"
            fontWeight="600"
            transform={`rotate(-90 20 ${height / 2})`}
          >
            {getMetricLabel()}
          </text>

          {/* Empty state */}
          {!hasMeasurements && (
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize="14"
            >
              Add a measurement to see your baby's growth chart.
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#c7d3ff', border: '1px dashed #c7d3ff' }}></span>
          <span>Reference (50th percentile)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: 'var(--accent)' }}></span>
          <span>Your baby</span>
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
