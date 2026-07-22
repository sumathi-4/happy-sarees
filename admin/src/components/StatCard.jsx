import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import styles from '../styles/Components.module.css';

function StatCard({ title, value, icon, trend, trendValue, colorTheme, actionLink }) {
  const getThemeStyles = () => {
    switch (colorTheme) {
      case 'pink':
        return { bg: 'rgba(209, 27, 105, 0.08)', color: '#d11b69' };
      case 'blue':
        return { bg: 'rgba(6, 31, 235, 0.08)', color: '#061feb' };
      case 'green':
        return { bg: 'rgba(46, 125, 50, 0.08)', color: '#2e7d32' };
      case 'orange':
        return { bg: 'rgba(245, 127, 23, 0.08)', color: '#f57f17' };
      default:
        return { bg: 'rgba(0, 0, 0, 0.04)', color: '#666666' };
    }
  };

  const theme = getThemeStyles();

  return (
    <div className={styles.statCard}>
      <div className={styles.statCardHeader}>
        <span className={styles.statTitle}>{title}</span>
        <div className={styles.statIconWrapper} style={{ backgroundColor: theme.bg, color: theme.color }}>
          {icon}
        </div>
      </div>

      <div className={styles.statValue}>{value}</div>

      <div className={styles.statFooter}>
        {trend === 'up' && (
          <span className={styles.trendUp}>
            <FiTrendingUp /> {trendValue}
          </span>
        )}
        {trend === 'down' && (
          <span className={styles.trendDown}>
            <FiTrendingDown /> {trendValue}
          </span>
        )}
        {trend === 'muted' && (
          <span className={styles.trendMuted}>{trendValue}</span>
        )}
        {actionLink && (
          <span 
            onClick={actionLink.onClick}
            style={{ color: '#d11b69', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}
          >
            {actionLink.label}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;
