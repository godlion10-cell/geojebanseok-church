// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

export default function HomeClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('about');

  // 유튜브 라이브 체크
  useEffect(() => {
    const checkLive = async () => {
      try {
        const res = await fetch(`/api/youtube-live?t=${Date.now()}`);
        const data = await res.json();
        setIsLive(data.live);
        setLiveVideoId(data.videoId || null);
      } catch (e) { setIsLive(false); }
    };
    checkLive();
    const timer = setInterval(checkLive, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.mainContainer}>
      {/* 🛠 헤더: 안개를 뚫고 무조건 맨 위에 보이게 z-index 9999 적용 */}
      <header className={styles.header} style={{ 
        position: 'fixed', top: 0, left: 0, width: '100%', height: '80px',
        zIndex: 9999, backgroundColor: 'white', display: 'flex', alignItems: 'center', padding: '0 5%',
        borderBottom: '1px solid #eee'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.scrollTo(0,0)}>
          {/* 로고 이미지 (OptimizedLogo 대신 기본 img 사용으로 에러 방지) */}
          <img src="/church-logo.png" alt="로고" style={{ height: '50px', width: 'auto' }} />
          {/* 🔴 로고 옆 글자: 무조건 보이도록 코드 추가 */}
          <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1a365d', whiteSpace: 'nowrap' }}>
            거제반석교회
          </span>
        </div>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} style={{ marginLeft: 'auto' }}>
          <button onClick={() => {setActiveSection('about'); setMenuOpen(false);}} className={styles.navLink}>교회소개</button>
          <button onClick={() => {setActiveSection('sermon'); setMenuOpen(false);}} className={styles.navLink}>설교말씀</button>
          <button onClick={() => {setActiveSection('news'); setMenuOpen(false);}} className={styles.navLink}>교회소식</button>
          <button onClick={() => {setActiveSection('schedule'); setMenuOpen(false);}} className={styles.navLink}>예배안내</button>
        </nav>
      </header>

      {/* 본문 영역 */}
      <main style={{ paddingTop: '80px' }}>
        {activeSection === 'about' && (
          <section className={styles.heroSection}>
            <div className={styles.heroBg} style={{ zIndex: 0 }}>
              <div className={styles.heroBgImage}></div>
              <div className={styles.heroOverlay}></div>
            </div>
            <div className={styles.heroContent} style={{ zIndex: 1 }}>
              <h1 className={styles.heroTitle}>
                <span className={styles.gold}>하나님의 손에 붙잡혀</span><br/>
                <span className={styles.burgundy}>세상을 이기는 교회</span>
              </h1>
            </div>
          </section>
        )}

        {/* 설교/라이브 섹션 */}
        {activeSection === 'sermon' && (
          <section style={{ padding: '60px 5%' }}>
            <h2 className={styles.sectionTitle}>설교 말씀</h2>
            <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: '15px', overflow: 'hidden' }}>
              {isLive ? (
                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=1`} frameBorder="0" allowFullScreen></iframe>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#172554', color: 'white' }}>
                  <h3>지금은 라이브 예배 시간이 아닙니다</h3>
                  <p>정해진 시간에 다시 찾아와 주세요.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p>© 2026 거제반석교회 · 경남 거제시 연초면 소오비길 40-6</p>
      </footer>
    </div>
  );
}