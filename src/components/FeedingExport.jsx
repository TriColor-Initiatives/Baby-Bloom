import { useState, useMemo } from 'react';
import './FeedingExport.css';

const FeedingExport = ({ feedings, onClose }) => {
  const [dateRange, setDateRange] = useState('week');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let start = new Date();
    
    switch (dateRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          return { start, end: new Date(customEndDate) };
        }
        break;
      default:
        start.setDate(now.getDate() - 7);
    }
    
    return { start, end: now };
  };

  // Filter feedings by date range
  const filteredFeedings = useMemo(() => {
    const { start, end } = getDateRange();
    return feedings.filter(f => {
      const feedingDate = new Date(f.timestamp || f.date);
      return feedingDate >= start && feedingDate <= end;
    });
  }, [feedings, dateRange, customStartDate, customEndDate]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (filteredFeedings.length === 0) {
      return {
        totalFeedings: 0,
        breastFeedings: 0,
        bottleFeedings: 0,
        totalDuration: 0,
        totalAmount: 0,
        avgDuration: 0,
        avgAmount: 0,
        avgInterval: 0,
        leftBreastTime: 0,
        rightBreastTime: 0,
      };
    }

    const breast = filteredFeedings.filter(f => f.type === 'breast');
    const bottle = filteredFeedings.filter(f => f.type === 'bottle');

    const totalDuration = breast.reduce((sum, f) => 
      sum + (f.leftDuration || 0) + (f.rightDuration || 0), 0
    );
    
    const totalAmount = bottle.reduce((sum, f) => 
      sum + (parseFloat(f.amount) || 0), 0
    );

    const leftBreastTime = breast.reduce((sum, f) => 
      sum + (f.leftDuration || 0), 0
    );
    
    const rightBreastTime = breast.reduce((sum, f) => 
      sum + (f.rightDuration || 0), 0
    );

    // Calculate intervals
    const sortedFeedings = [...filteredFeedings].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let totalInterval = 0;
    for (let i = 1; i < sortedFeedings.length; i++) {
      const diff = new Date(sortedFeedings[i].date) - new Date(sortedFeedings[i-1].date);
      totalInterval += diff / (1000 * 60); // Convert to minutes
    }
    const avgInterval = sortedFeedings.length > 1 
      ? totalInterval / (sortedFeedings.length - 1) 
      : 0;

    return {
      totalFeedings: filteredFeedings.length,
      breastFeedings: breast.length,
      bottleFeedings: bottle.length,
      totalDuration,
      totalAmount,
      avgDuration: breast.length > 0 ? totalDuration / breast.length : 0,
      avgAmount: bottle.length > 0 ? totalAmount / bottle.length : 0,
      avgInterval,
      leftBreastTime,
      rightBreastTime,
    };
  }, [filteredFeedings]);

  // Export as CSV
  const exportAsCSV = () => {
    const headers = ['Date', 'Time', 'Type', 'Duration (min)', 'Amount (ml)', 'Left (min)', 'Right (min)', 'Notes'];
    const rows = filteredFeedings.map(f => {
      const date = new Date(f.timestamp || f.date);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        f.type,
        f.type === 'breast' ? (f.leftDuration || 0) + (f.rightDuration || 0) : '',
        f.type === 'bottle' ? f.amount : '',
        f.leftDuration || '',
        f.rightDuration || '',
        f.notes || ''
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feeding-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export as PDF (simplified - creates an HTML print view)
  const exportAsPDF = () => {
    const printWindow = window.open('', '_blank');
    const { start, end } = getDateRange();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Feeding Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          h1 {
            color: #667eea;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .date-range {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            background: #f7fafc;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
          }
          th {
            background: #667eea;
            color: white;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background: #f7fafc;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍼 Baby Bloom - Feeding Report</h1>
          <div class="date-range">
            ${start.toLocaleDateString()} - ${end.toLocaleDateString()}
          </div>
        </div>

        ${includeStats ? `
          <h2>Summary Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Feedings</div>
              <div class="stat-value">${statistics.totalFeedings}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Breastfeedings</div>
              <div class="stat-value">${statistics.breastFeedings}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Bottle Feedings</div>
              <div class="stat-value">${statistics.bottleFeedings}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Duration</div>
              <div class="stat-value">${Math.round(statistics.totalDuration)} min</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Amount</div>
              <div class="stat-value">${Math.round(statistics.totalAmount)} ml</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Avg. Interval</div>
              <div class="stat-value">${Math.round(statistics.avgInterval)} min</div>
            </div>
          </div>
        ` : ''}

        <h2>Feeding Log</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Amount</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${filteredFeedings.map(f => {
              const date = new Date(f.timestamp || f.date);
              const duration = f.type === 'breast' 
                ? `${(f.leftDuration || 0) + (f.rightDuration || 0)} min`
                : '-';
              const amount = f.type === 'bottle' ? `${f.amount} ml` : '-';
              return `
                <tr>
                  <td>${date.toLocaleDateString()}</td>
                  <td>${date.toLocaleTimeString()}</td>
                  <td>${f.type === 'breast' ? '🤱 Breast' : '🍼 Bottle'}</td>
                  <td>${duration}</td>
                  <td>${amount}</td>
                  <td>${f.notes || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          Generated on ${new Date().toLocaleString()} | Baby Bloom App
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Export as JSON
  const exportAsJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      dateRange: getDateRange(),
      statistics,
      feedings: filteredFeedings
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feeding-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'pdf':
        exportAsPDF();
        break;
      case 'csv':
        exportAsCSV();
        break;
      case 'json':
        exportAsJSON();
        break;
      default:
        exportAsPDF();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-header">
          <h2>📊 Export Report</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="export-content">
          {/* Date Range Selection */}
          <div className="export-section">
            <h3>Date Range</h3>
            <div className="date-range-options">
              {['today', 'week', 'month', 'quarter', 'year', 'custom'].map(range => (
                <button
                  key={range}
                  className={`range-btn ${dateRange === range ? 'active' : ''}`}
                  onClick={() => setDateRange(range)}
                >
                  {range === 'today' && '📅 Today'}
                  {range === 'week' && '📅 Last Week'}
                  {range === 'month' && '📅 Last Month'}
                  {range === 'quarter' && '📅 Last 3 Months'}
                  {range === 'year' && '📅 Last Year'}
                  {range === 'custom' && '📅 Custom Range'}
                </button>
              ))}
            </div>

            {dateRange === 'custom' && (
              <div className="custom-date-inputs">
                <div className="date-input-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="date-input-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Export Format */}
          <div className="export-section">
            <h3>Export Format</h3>
            <div className="format-options">
              <label className={`format-card ${exportFormat === 'pdf' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div className="format-icon">📄</div>
                <div className="format-name">PDF Report</div>
                <div className="format-desc">Printable document with charts</div>
              </label>

              <label className={`format-card ${exportFormat === 'csv' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div className="format-icon">📊</div>
                <div className="format-name">CSV File</div>
                <div className="format-desc">Spreadsheet-compatible data</div>
              </label>

              <label className={`format-card ${exportFormat === 'json' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div className="format-icon">📦</div>
                <div className="format-name">JSON Data</div>
                <div className="format-desc">Raw data for backup</div>
              </label>
            </div>
          </div>

          {/* Export Options */}
          <div className="export-section">
            <h3>Include in Report</h3>
            <div className="export-options">
              <label className="option-row">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                />
                <span>Statistics Summary</span>
              </label>
              <label className="option-row">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                />
                <span>Charts & Visualizations</span>
              </label>
            </div>
          </div>

          {/* Preview Stats */}
          <div className="export-section">
            <h3>Report Preview</h3>
            <div className="preview-stats">
              <div className="preview-stat">
                <span className="preview-label">Feedings to export:</span>
                <span className="preview-value">{filteredFeedings.length}</span>
              </div>
              <div className="preview-stat">
                <span className="preview-label">Date range:</span>
                <span className="preview-value">
                  {getDateRange().start.toLocaleDateString()} - {getDateRange().end.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="export-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleExport}
            disabled={filteredFeedings.length === 0}
          >
            📥 Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedingExport;
