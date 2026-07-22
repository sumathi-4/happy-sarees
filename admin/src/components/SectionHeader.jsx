import React from 'react';

function SectionHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#2b2b2b', marginBottom: '4px' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '13px', color: '#666666' }}>{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

export default SectionHeader;
