import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ANNOUNCEMENT_MESSAGES } from '../../data/mockData';
import api from '../../services/api';
import styles from './AnnouncementBar.module.css';

function AnnouncementBar() {
  const [enabled, setEnabled] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const isHovered = useRef(false);

  // Fetch Live Announcements from Neon PostgreSQL Database via Backend API
  useEffect(() => {
    let isMounted = true;
    async function fetchAnnouncementData() {
      try {
        const res = await api.getAnnouncementBar();
        const data = res.data || res;
        if (data && isMounted) {
          setEnabled(data.enabled !== false);

          let itemsList = [];
          if (Array.isArray(data.items) && data.items.length > 0) {
            itemsList = data.items;
          } else if (data.text) {
            itemsList = [{
              id: 'anc_main',
              text: data.text,
              icon: '🚚',
              link: data.link || '/shop',
              linkTarget: '_self',
              duration: 5,
              status: 'active',
              bgColor: data.backgroundColor || '',
              textColor: data.textColor || ''
            }];
          }

          // Filter active & non-expired announcements
          const now = new Date();
          const validActive = itemsList.filter(item => {
            if (item.status === 'draft') return false;
            if (item.startDate && new Date(item.startDate) > now) return false;
            if (item.endDate && new Date(item.endDate) < now) return false;
            return true;
          });

          // Sort: Priority items first, then sortOrder ascending
          validActive.sort((a, b) => {
            if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
            return (a.sortOrder || 0) - (b.sortOrder || 0);
          });

          if (validActive.length > 0) {
            setAnnouncements(validActive);
          } else {
            // Fallback to default active list if empty
            setAnnouncements(ANNOUNCEMENT_MESSAGES.map((msg, idx) => ({
              id: `default_${idx}`,
              text: msg,
              icon: idx === 0 ? '🚚' : idx === 1 ? '🎁' : idx === 2 ? '💎' : '🔥',
              link: '/shop',
              linkTarget: '_self',
              duration: 5,
              status: 'active'
            })));
          }
        }
      } catch (err) {
        console.warn('[AnnouncementBar] Live fetch warning:', err.message);
      }
    }

    fetchAnnouncementData();
    return () => { isMounted = false; };
  }, []);

  // Automatic Rotation Loop based on duration
  useEffect(() => {
    if (!enabled || announcements.length <= 1) return;

    const currentItem = announcements[currentIndex % announcements.length];
    const durationMs = (currentItem?.duration || 5) * 1000;

    const timer = setTimeout(() => {
      if (!isHovered.current) {
        setFade(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % announcements.length);
          setFade(true);
        }, 400); // fade out duration
      }
    }, durationMs);

    return () => clearTimeout(timer);
  }, [currentIndex, announcements, enabled]);

  // Navigation handlers
  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
      setFade(true);
    }, 200);
  };

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
      setFade(true);
    }, 200);
  };

  if (!enabled || announcements.length === 0) {
    return null;
  }

  const current = announcements[currentIndex % announcements.length];

  const customBarStyle = {};
  if (current.bgColor) customBarStyle.background = current.bgColor;
  if (current.textColor) customBarStyle.color = current.textColor;

  return (
    <div 
      className={styles.bar} 
      style={customBarStyle}
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
    >
      <div className={styles.contentWrapper}>
        <span className={styles.icon} style={current.iconColor ? { color: current.iconColor } : {}}>
          {current.icon || '📢'}
        </span>

        <span className={`${styles.message} ${fade ? styles.fadeIn : styles.fadeOut}`}>
          {current.link ? (
            current.linkTarget === '_blank' ? (
              <a 
                href={current.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.messageLink}
                style={current.textColor ? { color: current.textColor } : {}}
              >
                {current.text}
              </a>
            ) : (
              <Link to={current.link} className={styles.messageLink} style={current.textColor ? { color: current.textColor } : {}}>
                {current.text}
              </Link>
            )
          ) : (
            <span style={current.textColor ? { color: current.textColor } : {}}>{current.text}</span>
          )}
        </span>
      </div>

      {/* Nav Buttons (Previous / Next Icons Only) */}
      {announcements.length > 1 && (
        <div className={styles.navControls}>
          <button className={styles.navBtn} onClick={handlePrev} title="Previous Announcement" aria-label="Previous Announcement">
            <FiChevronLeft size={16} />
          </button>
          <button className={styles.navBtn} onClick={handleNext} title="Next Announcement" aria-label="Next Announcement">
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default AnnouncementBar;
