import React, { useState } from 'react';
import styles from '../styles/Components.module.css';

function ChartCard({ title, type, selectOptions, salesData = [], statusData = [], children }) {
  const [selectedOption, setSelectedOption] = useState(selectOptions ? selectOptions[0] : '');

  // ── Render Dynamic Line Chart ──────────────────────────────
  const renderLineChart = () => {
    const list = Array.isArray(salesData) && salesData.length > 0 ? salesData : [
      { month: 'Jul 2026', revenue: 0, orders: 0 }
    ];

    const revenues = list.map(d => Number(d.revenue || 0));
    const maxRev = Math.max(...revenues, 1000);
    const maxY = Math.ceil(maxRev / 1000) * 1000 || 10000;

    const width = 500;
    const height = 200;
    const paddingLeft = 55;
    const paddingRight = 30;
    const paddingTop = 25;
    const paddingBottom = 35;
    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    const points = list.map((item, idx) => {
      const x = list.length === 1
        ? paddingLeft + chartW / 2
        : paddingLeft + (idx / (list.length - 1)) * chartW;
      const y = height - paddingBottom - (item.revenue / maxY) * chartH;
      return { x, y, ...item };
    });

    let pathD = '';
    if (points.length === 1) {
      pathD = `M ${paddingLeft},${points[0].y} L ${width - paddingRight},${points[0].y}`;
    } else {
      pathD = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`), '');
    }

    const areaD = points.length === 1
      ? `M ${paddingLeft},${points[0].y} L ${width - paddingRight},${points[0].y} L ${width - paddingRight},${height - paddingBottom} L ${paddingLeft},${height - paddingBottom} Z`
      : `${pathD} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`;

    const lastPt = points[points.length - 1];

    return (
      <div style={{ position: 'relative', width: '100%', height: '200px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            <linearGradient id="chart-gradient-dynamic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d11b69" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#d11b69" stopOpacity="0.0"/>
            </linearGradient>
          </defs>
          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = height - paddingBottom - ratio * chartH;
            const val = Math.round(maxY * ratio);
            return (
              <g key={i}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                <text x="5" y={y + 3} fill="#999999" fontSize="9">
                  ₹{val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}
                </text>
              </g>
            );
          })}

          {/* Area & Line */}
          <path d={areaD} fill="url(#chart-gradient-dynamic)" />
          <path d={pathD} fill="none" stroke="#d11b69" strokeWidth="3" strokeLinecap="round" />

          {/* Points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={i === points.length - 1 ? "5" : "3.5"}
              fill={i === points.length - 1 ? "#d11b69" : "#ffffff"}
              stroke="#d11b69"
              strokeWidth="2"
            />
          ))}

          {/* X Axis Labels */}
          {points.map((pt, i) => (
            <text key={i} x={pt.x} y={height - 10} fill="#888888" fontSize="10" textAnchor="middle">
              {pt.month}
            </text>
          ))}

          {/* Active Tooltip Badge */}
          {lastPt && (
            <g transform={`translate(${Math.min(lastPt.x - 45, width - 110)}, ${Math.max(lastPt.y - 45, 10)})`}>
              <rect width="95" height="38" rx="6" fill="#1e1e1e" opacity="0.9" />
              <text x="47.5" y="16" fill="#ffffff" fontSize="9" fontWeight="600" textAnchor="middle">{lastPt.month}</text>
              <text x="47.5" y="30" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">₹{Number(lastPt.revenue).toLocaleString('en-IN')}</text>
            </g>
          )}
        </svg>
      </div>
    );
  };

  // ── Render Dynamic Donut Chart ─────────────────────────────
  const renderDonutChart = () => {
    const list = Array.isArray(statusData) && statusData.length > 0 ? statusData : [
      { status: 'No Orders', count: 0 }
    ];

    const total = list.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const circumference = 251.2; // 2 * PI * r(40)

    const statusColors = {
      'Delivered': '#2e7d32',
      'Processing': '#f57f17',
      'Confirmed': '#0284c7',
      'Shipped': '#1565c0',
      'Cancelled': '#d32f2f',
      'Returned': '#9333ea',
      'Pending Payment': '#ea580c',
      'Pending': '#eab308',
      'Order Placed': '#6366f1'
    };

    const palette = ['#2e7d32', '#f57f17', '#1565c0', '#d32f2f', '#9333ea', '#0284c7', '#ea580c'];

    let accumulatedOffset = 0;
    const segments = list.map((item, i) => {
      const count = Number(item.count || 0);
      const pct = total > 0 ? (count / total) : 0;
      const dash = pct * circumference;
      const offset = -accumulatedOffset;
      accumulatedOffset += dash;
      const color = statusColors[item.status] || palette[i % palette.length];
      return {
        ...item,
        count,
        pct: Math.round(pct * 100),
        dash,
        offset,
        color
      };
    });

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            {total === 0 ? (
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
            ) : (
              segments.map((seg, i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeDasharray={`${seg.dash} ${circumference}`}
                  strokeDashoffset={seg.offset}
                />
              ))
            )}
          </svg>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#2b2b2b' }}>{total.toLocaleString()}</span>
            <span style={{ fontSize: '9px', color: '#999999', textTransform: 'uppercase', fontWeight: 600 }}>Total Orders</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: seg.color }} />
              <span style={{ color: '#666666', width: '80px', textTransform: 'capitalize' }}>{seg.status}</span>
              <strong style={{ color: '#2b2b2b' }}>{seg.count} ({seg.pct}%)</strong>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.dashboardCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {selectOptions && (
          <select 
            value={selectedOption} 
            onChange={(e) => setSelectedOption(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(0,0,0,0.1)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#666666',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          >
            {selectOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        )}
      </div>
      <div className={styles.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '260px', justifyContent: 'center' }}>
        {type === 'line' && renderLineChart()}
        {type === 'donut' && renderDonutChart()}
        {children}
      </div>
    </div>
  );
}

export default ChartCard;
