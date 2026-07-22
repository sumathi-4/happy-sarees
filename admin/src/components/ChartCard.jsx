import React, { useState } from 'react';
import styles from '../styles/Components.module.css';

function ChartCard({ title, type, selectOptions, children }) {
  const [selectedOption, setSelectedOption] = useState(selectOptions ? selectOptions[0] : '');

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
        {type === 'line' && (
          <div style={{ position: 'relative', width: '100%', height: '200px' }}>
            {/* Custom SVG Line Chart */}
            <svg viewBox="0 0 500 200" width="100%" height="100%">
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d11b69" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#d11b69" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              {/* Horizontal Gridlines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#eaeaea" strokeWidth="1.5" />

              {/* Y Axis Labels */}
              <text x="10" y="24" fill="#999999" fontSize="10">₹2L</text>
              <text x="10" y="64" fill="#999999" fontSize="10">₹1.5L</text>
              <text x="10" y="104" fill="#999999" fontSize="10">₹1L</text>
              <text x="10" y="144" fill="#999999" fontSize="10">₹50K</text>
              <text x="15" y="174" fill="#999999" fontSize="10">₹0</text>

              {/* Chart Line Path Area */}
              <path 
                d="M 40,140 Q 113,100 186,145 T 332,100 T 478,90 L 478,170 L 40,170 Z" 
                fill="url(#chart-gradient)" 
              />
              <path 
                d="M 40,140 Q 113,100 186,145 T 332,100 T 478,90" 
                fill="none" 
                stroke="#d11b69" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />

              {/* Data points */}
              <circle cx="40" cy="140" r="4" fill="#ffffff" stroke="#d11b69" strokeWidth="2" />
              <circle cx="113" cy="100" r="4" fill="#ffffff" stroke="#d11b69" strokeWidth="2" />
              <circle cx="186" cy="145" r="4" fill="#ffffff" stroke="#d11b69" strokeWidth="2" />
              <circle cx="259" cy="120" r="4" fill="#ffffff" stroke="#d11b69" strokeWidth="2" />
              <circle cx="332" cy="100" r="4" fill="#ffffff" stroke="#d11b69" strokeWidth="2" />
              <circle cx="405" cy="115" r="4" fill="#ffffff" stroke="#d11b69" strokeWidth="2" />
              <circle cx="478" cy="90" r="5" fill="#d11b69" />

              {/* X Axis Labels */}
              <text x="35" y="190" fill="#999999" fontSize="10">01 Jul</text>
              <text x="105" y="190" fill="#999999" fontSize="10">05 Jul</text>
              <text x="178" y="190" fill="#999999" fontSize="10">09 Jul</text>
              <text x="251" y="190" fill="#999999" fontSize="10">13 Jul</text>
              <text x="324" y="190" fill="#999999" fontSize="10">17 Jul</text>
              <text x="450" y="190" fill="#999999" fontSize="10">21 Jul</text>

              {/* Tooltip Overlay */}
              <g transform="translate(370, 75)">
                <rect width="90" height="42" rx="6" fill="#1e1e1e" opacity="0.9" />
                <text x="45" y="18" fill="#ffffff" fontSize="9" fontWeight="600" textAnchor="middle">21 Jul 2026</text>
                <text x="45" y="32" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">₹1,45,230</text>
              </g>
            </svg>
          </div>
        )}

        {type === 'donut' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
              {/* Custom SVG Donut Chart */}
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2e7d32" strokeWidth="12" strokeDasharray="168.3 251.2" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f57f17" strokeWidth="12" strokeDasharray="50.2 251.2" strokeDashoffset="-168.3" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1565c0" strokeWidth="12" strokeDasharray="20.1 251.2" strokeDashoffset="-218.5" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#d32f2f" strokeWidth="12" strokeDasharray="12.6 251.2" strokeDashoffset="-238.6" />
              </svg>
              {/* Absolute Central Labels */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#2b2b2b' }}>1,245</span>
                <span style={{ fontSize: '9px', color: '#999999', textTransform: 'uppercase', fontWeight: 600 }}>Total Orders</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2e7d32' }} />
                <span style={{ color: '#666666', width: '70px' }}>Delivered</span>
                <strong style={{ color: '#2b2b2b' }}>835 (67%)</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f57f17' }} />
                <span style={{ color: '#666666', width: '70px' }}>Processing</span>
                <strong style={{ color: '#2b2b2b' }}>245 (20%)</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1565c0' }} />
                <span style={{ color: '#666666', width: '70px' }}>Shipped</span>
                <strong style={{ color: '#2b2b2b' }}>98 (8%)</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d32f2f' }} />
                <span style={{ color: '#666666', width: '70px' }}>Cancelled</span>
                <strong style={{ color: '#2b2b2b' }}>67 (5%)</strong>
              </div>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export default ChartCard;
