'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

type ContentItem = {
  id: string;
  type: string;
  category: string | null;
  title: string;
  url: string | null;
  content: string | null;
};

type Schedule = {
  id: string;
  title: string;
  time: string;
  place: string;
  officer: string;
  order: number;
};

interface HomeClientProps {
  newsItems: ContentItem[];
  sermons: ContentItem[];
  schedules: Schedule[];
}

// 예배 시간 체크 함수
function checkIsLive(): boolean {
  const now = new Date();
  const day = now.getDay();
  const t = now.getHours() * 60 + now.getMinutes();
  return (
    (day === 0 && t >= 530 && t <= 630) ||   // 주일 1부
    (day === 0 && t >= 640 && t <= 750) ||   // 주일 2부
    (day === 0 && t >= 830 && t <= 930) ||   // 주일 오후
    (day === 3 && t >= 1160 && t <= 1260) || // 수요 저녁
    (day === 5 && t >= 1190 && t <= 1290) || // 금요 기도회
    (day >= 1 && day <= 6 && t >= 320 && t <= 390) // 새벽예배
  );
}

export default function HomeClient({ newsItems, sermons, schedules }: HomeClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkLive = async () => {
      try {
        const res = await fetch(`/api/youtube-live?t=${new Date().getTime()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.live && data.videoId) {
          setIsLive(true);
          setLiveVideoId(data.videoId);
        } else {
          setIsLive(false);
          setLiveVideoId(null);
        }
      } catch (_e) {
        setIsLive(false);
      }
    };
    checkLive();
    const timer = setInterval(checkLive, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <div className={styles.mainContainer}>
      {/* 헤더 - z-index 99999로 안개 현상 방지 */}
      <header
        className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%',
          zIndex: 99999,
          backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,250,240,0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', padding: '0 5%'
        }}
      >
        {/* 로고 영역 - 확인용 빨간 테두리/텍스트 */}
        <div
          className={styles.logo}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            border: '2px solid red' // 확인용: 로고 주변에 빨간 테두리가 생겨야 합니다!
          }}
        >
          <img src="/church-logo.png" alt="로고" style={{ height: '50px', width: 'auto' }} />

          <span style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'red', // 일단 확인을 위해 빨간색으로 넣습니다!
            display: 'inline-block'
          }}>
            반석교회
          </span>
        </div>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} style={{ marginLeft: 'auto' }}>
          <Link href="#about" className={styles.navLink} onClick={handleNavClick}>교회소개</Link>
          <Link href="#sermon" className={styles.navLink} onClick={handleNavClick}>설교말씀</Link>
          <Link href="#news" className={styles.navLink} onClick={handleNavClick}>교회소식</Link>
          <Link href="#schedule" className={styles.navLink} onClick={handleNavClick}>예배안내</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection} id="about" style={{ paddingTop: '100px' }}>
        <div className={styles.heroBg}>
          <div className={styles.heroBgImage}></div>
          <div className={styles.heroOverlay} style={{ zIndex: 1 }}></div>
        </div>
        <div className={styles.heroContent} style={{ zIndex: 2, position: 'relative' }}>
          <div className={styles.heroTagline}>은혜 위에 세워진 공동체</div>
          <h1 className={styles.heroTitle}>
            <span className={styles.gold}>은혜 위에</span><br />
            <span className={styles.burgundy}>바로 서는 교회</span>
          </h1>
        </div>
      </section>

      {/* Sermon Section */}
      <section className={styles.section} id="sermon">
        <h2 className={styles.sectionTitle}>설교 말씀</h2>
        <div className={styles.sermonMain}>
          <div className={styles.sermonVideoWrap} style={{
            position: 'relative', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden'
          }}>
            {isLive && liveVideoId ? (
              <iframe
                width="100%" height="100%"
                src={`https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=1`}
                allowFullScreen
                style={{ border: 0 }}
              ></iframe>
            ) : (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', background: '#f4f1ea', textAlign: 'center'
              }}>
                <span style={{ fontSize: '3rem' }}>✝️</span>
                <h3 style={{ color: '#5b272f', marginTop: '15px' }}>지금은 예배 시간이 아닙니다</h3>
                <p style={{ color: '#8b7355' }}>다음 예배 시간에 실시간 방송이 시작됩니다.</p>
                <Link href="https://www.youtube.com/@petros-church" target="_blank"
                  style={{ marginTop: '20px', padding: '10px 20px', background: '#5b272f', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                  지난 설교 보기
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer} style={{ padding: '40px 0', textAlign: 'center', background: '#333', color: '#fff' }}>
        <img src="/church-logo-white.png" alt="반석교회 로고" style={{ height: '60px', marginBottom: '20px' }} />
        <p>© 2026 거제 반석교회. 모든 권리 보유.</p>
      </footer>
    </div>
  );
}