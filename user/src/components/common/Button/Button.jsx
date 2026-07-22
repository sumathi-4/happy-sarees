import React from 'react';
import styles from './Button.module.css';

function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon = null,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) {
  const btnClasses = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={btnClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <span className={styles.spinner}></span>
      ) : (
        <>
          {icon && <span className={styles.iconNode}>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

export default Button;
