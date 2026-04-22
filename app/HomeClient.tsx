// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import OptimizedLogo from '../components/OptimizedLogo';

// ===== 헬퍼 함수 및 데이터 (목사님 원본 그대로 유지) =====
function checkIsLiveTime(): boolean {
  const now = new Date();
  const day = now.getDay();
  const t = now.getHours() * 60 + now.getMinutes();
  return (
    (day === 0 && t >= 530 && t <= 630) || (day === 0 && t >= 640 && t <= 750) || 
    (day === 0 && t >= 830 && t <= 930) || (day === 3 && t >= 1160 && t <= 1260) || 
    (day === 5 && t >= 1190 && t <= 1290) || (day >= 1 && day <= 5 && t >= 325 && t <= 380) 
  );
}

function getNextWorship(): string {
  return `주일 오전 9시 주일대예배`;
}

type SectionKey = 'about' | 'vision' | 'sermon' | 'news' | 'schedule' | 'location';

const NAV_ITEMS: { key: SectionKey; label: string }[] = [
  { key: 'about', label: '교회소개' },
  { key: 'vision', label: '비전과사명' },
  { key: 'sermon', label: '설교말씀' },
  { key: 'news', label: '교회소식' },
  { key: 'schedule', label: '예배안내' },
  { key: 'location', label: '오시는길' },
];

export default function HomeClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('about');
  const [isLive, setIsLive] = useState(false);
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const liveVideoRef = useRef<HTMLDivElement>(null);

  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [sermonItems, setSermonItems] = useState<any[]>([]);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [selectedWorship, setSelectedWorship] = useState('주일대예배 (1부)');

  useEffect(() => {
    const syncLiveStatus = async () => {
      try {
        const res = await fetch(`/api/youtube-live?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        setIsLive(data.live);
        setLiveVideoId(data.videoId || null);
      } catch (error) { setIsLive(false); }
    };
    syncLiveStatus();
    const timer = setInterval(syncLiveStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  // API 데이터 로딩 (목사님 기존 로직 그대로)
  useEffect(() => {
    fetch('/api/content').then(res => res.json()).then(data => {
      if (data.success) {
        if (data.news?.length > 0) setNewsItems(data.news);
        if (data.sermons?.length > 0) setSermonItems(data.sermons);
        if (data.schedules?.length > 0) setScheduleItems(data.schedules);
      }
    });
  }, []);

  const handleNavClick = (key: SectionKey) => {
    setActiveSection(key);
    setMenuOpen(false);
  };

  return (
    <div className={styles.mainContainer}>
      {/* 🛠 1. 헤더 수정: 로고 옆 글자 배치 및 어색함 해결 */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => setActiveSection('about')} 
             style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <OptimizedLogo />
          {/* 로고 옆 글자: 이미지와 겹치지 않게 간격을 주고 선명하게 배치 */}
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a365d', whiteSpace: 'nowrap' }}>
            거제반석교회
          </span>
        </div>
        <button className={styles.mobileMenuBtn} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {NAV_ITEMS.map((item) => (
            <button key={item.key} 
                    className={`${styles.navLink} ${activeSection === item.key ? styles.navLinkActive : ''}`} 
                    onClick={() => handleNavClick(item.key)}>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className={styles.contentArea}>
        {activeSection === 'about' && (
          <section className={styles.heroSection}>
            <div className={styles.heroBg}><div className={styles.heroBgImage}></div><div className={styles.heroOverlay}></div></div>
            <div className={styles.heroContent}>
              <div className={styles.heroTagline}>그리스도의 살아있는 몸 된 공동체</div>
              <h1 className={styles.heroTitle}>하나님의 손에 붙잡혀 세상을 이기는 교회</h1>
            </div>
          </section>
        )}

        {/* 🛠 2. 라이브 섹션 수정: "안개 현상(어두운 글씨)" 해결 */}
        {activeSection === 'sermon' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>설교 말씀</h2>
            <div className={styles.sermonContainer}>
              <div className={styles.sermonMain}>
                {isLive ? (
                  <div className={styles.sermonVideoWrap} style={{ position: 'relative', aspectRatio: '16/9' }}>
                    <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=1`} frameBorder="0" allowFullScreen></iframe>
                  </div>
                ) : (
                  /* 🔴 안개 현상 해결: 배경과 대비되는 밝은 색상의 글씨로 변경 */
                  <div className={styles.sermonVideoWrap} style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)', textAlign: 'center', padding: '2rem' 
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✝️</div>
                    {/* 글씨를 흰색(#fff)으로 변경하여 선명하게 함 */}
                    <h3 style={{ color: '#ffffff', fontSize: '1.4rem', margin: '0' }}>지금은 라이브 예배 시간이 아닙니다</h3>
                    <p style={{ color: '#ffd700', marginTop: '0.5rem' }}>정해진 시간에 다시 찾아와 주세요!</p>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '10px', color: '#fff', marginTop: '1.5rem' }}>
                      📅 다음 예배: {getNextWorship()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
      
      <footer className={styles.footer}>
        <p>© 2026 거제반석교회</p>
      </footer>
    </div>
  );
}