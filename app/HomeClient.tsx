// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import OptimizedLogo from '../components/OptimizedLogo';

// ===== 헬퍼 함수들 =====
function checkIsLiveTime(): boolean {
  const now = new Date();
  const day = now.getDay();
  const t = now.getHours() * 60 + now.getMinutes();
  return (
    (day === 0 && t >= 530 && t <= 630) ||   // 주일 1부
    (day === 0 && t >= 640 && t <= 750) ||   // 주일 2부
    (day === 0 && t >= 830 && t <= 930) ||   // 주일 오후
    (day === 3 && t >= 1160 && t <= 1260) || // 수요 저녁
    (day === 5 && t >= 1190 && t <= 1290) || // 금요 기도회
    (day >= 1 && day <= 5 && t >= 325 && t <= 380)
  );
}

function getNextWorship(): string {
  const worships = [
    { day: 0, time: '오전 9시', name: '주일대예배 1부' },
    { day: 0, time: '오전 11시', name: '주일대예배 2부' },
    { day: 3, time: '저녁 7:30', name: '수요저녁예배' },
    { day: 5, time: '저녁 8시', name: '금요기도회' },
  ];
  const days = ['일', '월', '화', '수', '목', '금', '토'];
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

// ===== 데이터 보관함 (DB 연결 전용) =====
const FALLBACK_NEWS = [
  { id: 'f1', title: '환영 및 등록 안내', content: '환영하고 축복합니다...' },
  { id: 'f2', title: '홈페이지 오픈', content: '거제반석교회.com 주소가 열렸습니다.' }
];

const FALLBACK_SERMONS = [
  { id: 's1', title: '부활, 하나님의 소망', category: '주일오전 설교', content: '이주민 목사' }
];

const FALLBACK_SCHEDULES = [
  { id: 'sc1', title: '주일대예배 (1부)', time: '오전 09:00', place: '2층 본당', officer: '이주민 목사' },
  { id: 'sc2', title: '주일대예배 (2부)', time: '오전 11:00', place: '2층 본당', officer: '이주민 목사' },
  { id: 'sc6', title: '수요저녁예배', time: '저녁 07:30', place: '2층 본당', officer: '이주민 목사' },
  { id: 'sc7', title: '금요기도회', time: '저녁 08:00', place: '2층 본당', officer: '이주민 목사' },
  { id: 'sc8', title: '새벽예배', time: '오전 05:30', place: '2층 본당', officer: '이주민 목사' },
];

const WORSHIP_ORDERS: Record<string, any> = {};

export default function Home() {
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

  useEffect(() => {
    fetch('/api/content').then(res => res.json()).then(data => {
      if (data.success) {
        if (data.news?.length > 0) setNewsItems(data.news);
        if (data.sermons?.length > 0) setSermonItems(data.sermons);
        if (data.schedules?.length > 0) setScheduleItems(data.schedules);
      }
    });
  }, []);

  const displayNews = newsItems.length > 0 ? newsItems : FALLBACK_NEWS;
  const displaySermons = sermonItems.length > 0 ? sermonItems : FALLBACK_SERMONS;
  const displaySchedules = scheduleItems.length > 0 ? scheduleItems : FALLBACK_SCHEDULES;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  };

  const handleNavClick = (key: SectionKey) => {
    setActiveSection(key);
    setMenuOpen(false);
  };

  return (
    <div className={styles.mainContainer}>
      {/* 🛠 FIXED HEADER: 안개 현상 방지를 위해 하얀 배경과 높은 z-index 강제 적용 */}
      <header className={styles.header} style={{
        zIndex: 9999,
        backgroundColor: 'white',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className={styles.logo} onClick={() => setActiveSection('about')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <OptimizedLogo />
          {/* 🔴 로고 옆 글자 추가 (수정포인트) */}
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1a365d',
            whiteSpace: 'nowrap'
          }}>
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

      <main className={styles.contentArea} style={{ paddingTop: '80px' }}>
        {activeSection === 'about' && (
          <>
            <section className={styles.heroSection}>
              {/* 🔴 안개 현상 방지: 배경 이미지가 헤더를 가리지 않도록 z-index 낮춤 */}
              <div className={styles.heroBg} style={{ zIndex: 0 }}>
                <div className={styles.heroBgImage}></div>
                <div className={styles.heroOverlay}></div>
              </div>
              <div className={styles.heroContent} style={{ zIndex: 1 }}>
                <div className={styles.heroTagline}>그리스도의 살아있는 몸 된 공동체</div>
                <h1 className={styles.heroTitle}>
                  <span className={styles.gold}>하나님의 손에 붙잡혀</span>
                  <span className={styles.burgundy}>세상을 이기는 교회</span>
                </h1>
                <div className={styles.heroButtons}>
                  <button onClick={() => setActiveSection('sermon')} className={styles.btnPrimary}>실시간 예배 참여하기</button>
                  <button onClick={() => setActiveSection('vision')} className={styles.btnOutline}>비전과 사명 보기</button>
                </div>
              </div>
            </section>

            <section className={styles.tabSection}>
              <h2 className={styles.sectionTitle}>반석교회에 오신 것을 환영합니다</h2>
              <div className={styles.welcomeWrap}>
                <div className={styles.welcomeCard}><h3>교회의 정체성</h3><p>반석 같은 신앙을 추구하는 공동체입니다.</p></div>
                <div className={styles.welcomeCard}><h3>교회의 비전</h3><p>하나님의 도구가 되어 세상을 이기길 소망합니다.</p></div>
              </div>
            </section>
          </>
        )}

        {/* 설교말씀 섹션 */}
        {activeSection === 'sermon' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>설교 말씀</h2>
            <div className={styles.sermonContainer}>
              <div className={styles.sermonMain}>
                {isLive ? (
                  <div ref={liveVideoRef} className={styles.sermonVideoWrap}
                    style={isExpanded ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#000' } : { position: 'relative', aspectRatio: '16/9' }}>
                    <iframe width="100%" height="100%"
                      src={liveVideoId ? `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=1` : `https://www.youtube.com/embed/live_stream?channel=UCc_eP0i4YwSQmQ9du5-RHbA&autoplay=1`}
                      frameBorder="0" allowFullScreen></iframe>
                    <button onClick={toggleExpand} style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 16px', borderRadius: '8px' }}>
                      {isExpanded ? '🔲 작게보기' : '📱 크게보기'}
                    </button>
                  </div>
                ) : (
                  <div className={styles.sermonVideoWrap} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#172554', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem' }}>✝️</div>
                    <h3 style={{ color: '#fff' }}>지금은 예배 시간이 아닙니다</h3>
                    <p style={{ color: '#bfdbfe' }}>예배 시간에 실시간 방송이 시작됩니다.</p>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '12px', color: '#fff' }}>📅 다음 예배: {getNextWorship()}</div>
                  </div>
                )}
              </div>
              <div className={styles.sermonGrid}>
                {displaySermons.map((sermon: any) => (
                  <div key={sermon.id} className={styles.sermonCard}>
                    <h4>{sermon.category}</h4>
                    <p>{sermon.title}</p>
                    <span className={styles.sermonMeta}>{sermon.content}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 나머지 섹션들(vision, news, schedule, location)은 동일하게 유지 */}
        {activeSection === 'news' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>반석교회 소식</h2>
            <div className={styles.newsGrid}>
              {displayNews.map((news: any, idx: number) => (
                <div key={news.id} className={styles.newsCard}>
                  <h3>{idx + 1}. {news.title}</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{news.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'schedule' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>예배 안내</h2>
            <table className={styles.scheduleTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {displaySchedules.map((s: any) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                    <th style={{ padding: '15px', textAlign: 'left' }}>{s.title}</th>
                    <td>{s.time}</td>
                    <td>{s.place}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeSection === 'location' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>오시는 길</h2>
            <div className={styles.locationInfo} style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
              <p>📍 주소: 경상남도 거제시 연초면 소오비길 40-6</p>
              <p>📞 문의: 이주민 목사 (010.9825.5020)</p>
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p>© 2026 대한예수교장로회 반석교회 · 거제시 연초면 소오비길 40-6</p>
      </footer>
    </div>
  );
}