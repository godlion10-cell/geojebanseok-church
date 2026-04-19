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
    // 🔴 새벽기도 추가 (월~금요일, 05:25 ~ 06:20)
    (day >= 1 && day <= 5 && t >= 325 && t <= 380) 
  );
}

function getNextWorship(): string {
  const now = new Date();
  const day = now.getDay();
  const worships = [
    { day: 0, time: '오전 9시', name: '주일대예배 1부' },
    { day: 0, time: '오전 11시', name: '주일대예배 2부' },
    { day: 3, time: '저녁 7:30', name: '수요저녁예배' },
    { day: 5, time: '저녁 8시', name: '금요기도회' },
  ];
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  for (const w of worships) {
    if (w.day > day || (w.day === day && w.day === 0)) {
      return `${days[w.day]}요일 ${w.time} ${w.name}`;
    }
  }
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
  { id: 'f1', title: '환영 및 등록 안내', content: '환영하고 축복합니다. 반석교회는 대한예수교 장로회 합동 측 소속입니다.\n• 유튜브: @petros-church\n• 온라인 헌금: 신협 131-017-687642\n• 다음세대 후원: 신협 131-018-242250' },
  { id: 'f2', title: '홈페이지 및 교회 소식', content: '반석교회 홈페이지 초안이 만들어졌습니다. 주소는 "거제반석교회.com" 입니다.' },
  { id: 'f3', title: '부활주일 감사', content: '할렐루야! 오늘은 부활주일입니다.' },
  { id: 'f4', title: '부활절 이벤트 동참', content: '본당 뒤편, 좋아하는 말씀 구절을 적어주세요. 함께 십자가를 채워요~' },
  { id: 'f5', title: '오늘 세례식 안내', content: '성인 세례: 설하나 자매. 함께 축복하고 환영해 주세요.' },
  { id: 'f6', title: '부활절 연합예배', content: '오늘 오후는 연초지역 연합예배로 드립니다. (송정교회 / 14:30)' },
  { id: 'f7', title: '새생명 축제 작정', content: '다음 주일에는 새생명을 작정하는 시간을 가집니다.' },
  { id: 'f8', title: '성전 보수 공사', content: '본당 방음 및 난방 벽 공사가 시작됩니다. 건축헌금 동참 부탁드립니다.' },
  { id: 'f9', title: '새가족 소개', content: '성시현 자매, 김원만 형제/허순 자매님을 환영하고 축복합니다.' },
  { id: 'f10', title: '전교인 성경퀴즈대회', content: '5월 5주차 진행 예정입니다. 범위는 주일말씀정리 유인물입니다.' },
];

const FALLBACK_SERMONS = [
  { id: 's1', title: '부활, 죽음을 이기는 하나님의 소망', category: '주일오전 설교', content: '이주민 목사 (고전 15:1-10)' },
  { id: 's2', title: '다시 시작된 하나님의 인도', category: '수요예배 말씀', content: '이주민 목사 (창 45:16-28)' },
  { id: 's3', title: '생명의 삶 (매일 새벽)', category: '큐티(QT) 안내', content: '경건의 시간' },
];

const FALLBACK_SCHEDULES = [
  { id: 'sc1', title: '주일대예배 (1부)', time: '오전 09:00', place: '2층 본당', officer: '이주민 목사' },
  { id: 'sc2', title: '주일대예배 (2부)', time: '오전 11:00', place: '2층 본당', officer: '이주민 목사' },
  { id: 'sc3', title: '주일오후예배', time: '오후 01:50', place: '2층 본당', officer: '이주민 목사' },
  { id: 'sc4', title: '주일청소년', time: '오전 10:00', place: '3층 교육관', officer: '김민정' },
  { id: 'sc5', title: '주일어린이', time: '오전 11:00', place: '3층 교육관', officer: '김민정' },
  { id: 'sc6', title: '수요저녁예배', time: '저녁 07:30', place: '2층 본당', officer: '이주민 목사' },
  { id: 'sc7', title: '금요기도회', time: '저녁 08:00', place: '2층 본당', officer: '이주민 목사' },
  { id: 'sc8', title: '새벽예배', time: '오전 05:30', place: '2층 본당', officer: '이주민 목사' },
];

const WORSHIP_ORDERS: Record<string, any> = {
  '주일대예배 (1부)': {
    title: '주일 오전 예배 순서',
    groups: [
      { heading: '◀ 개회 (하나님께 나아감)', rows: [
        { label: '묵도', content: '', resp: '다같이' },
        { label: '개회찬송', content: '예수 우리 왕이여 (38장)', resp: '다같이' },
        { label: '신앙고백', content: '사도신경', resp: '다같이' },
        { label: '교독문', content: '134번 (부활절2)', resp: '다같이' },
        { label: '찬송', content: '할렐루야 우리 예수 (161장)', resp: '다같이' },
      ]},
      { heading: '◀ 말씀의 선포', rows: [
        { label: '성경봉독', content: '고린도전서 15:1~10', resp: '다같이' },
        { label: '말씀', content: '부활, 죽음을 이기는 하나님의 소망', resp: '이주민 목사', bold: true },
        { label: '합심기도', content: '', resp: '다같이' },
      ]},
    ],
  },
  '주일대예배 (2부)': {
    title: '주일 오전 예배 순서',
    groups: [
      { heading: '◀ 개회', rows: [
        { label: '묵도', content: '', resp: '다같이' },
        { label: '개회찬송', content: '예수 우리 왕이여 (38장)', resp: '다같이' },
        { label: '찬송', content: '할렐루야 우리 예수 (161장)', resp: '다같이' },
      ]},
      { heading: '◀ 말씀', rows: [
        { label: '성경봉독', content: '고린도전서 15:1~10', resp: '다같이' },
        { label: '말씀', content: '부활, 죽음을 이기는 하나님의 소망', resp: '이주민 목사', bold: true },
      ]},
    ],
  },
};

export default function Home() {
  // 상태 변수들
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('about');
  const [isLive, setIsLive] = useState(false);
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 🔴 에러 수정 포인트: liveVideoRef를 Home 컴포넌트 내부에 선언!
  const liveVideoRef = useRef<HTMLDivElement>(null);

  // DB 데이터 상태
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [sermonItems, setSermonItems] = useState<any[]>([]);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [selectedWorship, setSelectedWorship] = useState('주일대예배 (1부)');

  // 💡 라이브 자동 감지 로직
  useEffect(() => {
    const syncLiveStatus = async () => {
      try {
        const res = await fetch(`/api/youtube-live?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (!data.live) {
          setIsLive(false);
          setLiveVideoId(null);
          document.body.style.overflow = '';
        } else {
          setIsLive(true);
          setLiveVideoId(data.videoId || null);
        }
      } catch (error) {
        setIsLive(false);
      }
    };
    syncLiveStatus();
    const timer = setInterval(syncLiveStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  // 💡 콘텐츠 및 예배 순서 로딩
  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.news?.length > 0) setNewsItems(data.news);
          if (data.sermons?.length > 0) setSermonItems(data.sermons);
          if (data.schedules?.length > 0) setScheduleItems(data.schedules);
          if (data.worshipOrders?.length > 0) {
            for (const wo of data.worshipOrders) {
              if (wo.category && wo.content) {
                try {
                  const parsed = JSON.parse(wo.content);
                  WORSHIP_ORDERS[wo.category] = parsed;
                } catch (e) {}
              }
            }
          }
        }
      });
  }, []);

  const displayNews = newsItems.length > 0 ? newsItems : FALLBACK_NEWS;
  const displaySermons = sermonItems.length > 0 ? sermonItems : FALLBACK_SERMONS;
  const displaySchedules = scheduleItems.length > 0 ? scheduleItems : FALLBACK_SCHEDULES;

  const toggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  const handleNavClick = (key: SectionKey) => {
    setActiveSection(key);
    setMenuOpen(false);
  };

  return (
    <div className={styles.mainContainer}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => setActiveSection('about')} style={{ cursor: 'pointer' }}>
          <OptimizedLogo />
        </div>
        <button className={styles.mobileMenuBtn} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {NAV_ITEMS.map((item) => (
            <button key={item.key} className={`${styles.navLink} ${activeSection === item.key ? styles.navLinkActive : ''}`} onClick={() => handleNavClick(item.key)}>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.contentArea}>
        
        {/* 교회소개(about) */}
        {activeSection === 'about' && (
          <>
            <section className={styles.heroSection}>
              <div className={styles.heroBg}><div className={styles.heroBgImage}></div><div className={styles.heroOverlay}></div></div>
              <div className={styles.heroContent}>
                <div className={styles.heroTagline}>그리스도의 살아있는 몸 된 공동체</div>
                <h1 className={styles.heroTitle}><span className={styles.gold}>하나님의 손에 붙잡혀</span><span className={styles.burgundy}>세상을 이기는 교회</span></h1>
                <p className={styles.heroQuote}>&ldquo;너는 베드로라 내가 이 반석 위에 내 교회를 세우리니 음부의 권세가 이기지 못하리라&rdquo;<br /><span>— 마태복음 16:18</span></p>
                <div className={styles.heroButtons}>
                  <button onClick={() => setActiveSection('sermon')} className={styles.btnPrimary}>실시간 예배 참여하기</button>
                  <button onClick={() => setActiveSection('vision')} className={styles.btnOutline}>비전과 사명 보기</button>
                </div>
              </div>
            </section>
            <section className={styles.tabSection}>
              <h2 className={styles.sectionTitle}>반석교회에 오신 것을 환영합니다</h2>
              <div className={styles.welcomeWrap}>
                <div className={styles.welcomeCard}><h3>교회의 정체성: 그리스도의 몸</h3><p>반석교회는 마태복음 16:18 약속을 따라 반석 같은 신앙을 추구하는 공동체입니다.</p></div>
                <div className={styles.welcomeCard}><h3>교회의 비전</h3><p>&ldquo;하나님의 주머니 속 매끄러운 돌&rdquo;처럼, 하나님의 도구가 되어 세상을 이기길 소망합니다.</p></div>
                <div className={styles.welcomeCard} style={{ gridColumn: '1 / -1' }}>
                  <div className={styles.mottoBox}><div className={styles.mottoLabel}>영구 표어</div><div className={styles.mottoText}>Stand on Grace !!</div><div className={styles.mottoSub}>은혜 위에 바로 서라</div></div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* 비전과사명(vision) */}
        {activeSection === 'vision' && (
          <section className={styles.tabSection}>
            <div className={styles.vpHeader}><h2 className={styles.vpTitle}>Stand on Grace !!</h2><p className={styles.vpSubtitle}>반석교회 목회 철학</p></div>
            <div className={styles.vpMinistryRow}>
              <div className={styles.vpTreeWrap}><img src="/vision/tree.png" alt="나무" className={styles.vpTreeImg} /></div>
              <div className={styles.vpMinistryCards}>
                <div className={styles.vpMCard}><h4>사역의 가치 (생명)</h4><p>성령의 능력으로 &lsquo;생명&rsquo;에 집중합니다.</p></div>
                <div className={styles.vpMCard}><h4>신앙의 본질 (은혜)</h4><p>하나님의 절대주권 아래 순종합니다.</p></div>
                <div className={styles.vpMCard}><h4>복음의 진리 (반석)</h4><p>오직 예수, 오직 성경을 기준으로 삼습니다.</p></div>
              </div>
            </div>
            <div className={styles.vpPillarsSection}>
              <div className={styles.vpPillarsGrid}>
                <div className={styles.vpPillarItem}><h4>단단한 교회</h4><p>하나님의 진리로만 순전해지는 교회</p></div>
                <div className={styles.vpPillarItem}><h4>강건한 교회</h4><p>예수의 생명으로 세상을 이기는 교회</p></div>
                <div className={styles.vpPillarItem}><h4>세우는 교회</h4><p>다음세대를 영적 리더로 세우는 교회</p></div>
                <div className={styles.vpPillarItem}><h4>굳건한 교회</h4><p>하나님 나라를 위해 사명에 헌신하는 교회</p></div>
              </div>
            </div>
          </section>
        )}

        {/* 설교말씀(sermon) */}
        {activeSection === 'sermon' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>설교 말씀</h2>
            <div className={styles.sermonContainer}>
              <div className={styles.sermonMain}>
                {isLive ? (
                  <div ref={liveVideoRef} className={styles.sermonVideoWrap} style={isExpanded ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#000' } : { position: 'relative', aspectRatio: '16/9' }}>
                    <iframe width="100%" height="100%" src={liveVideoId ? `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=1&rel=0` : `https://www.youtube.com/embed/live_stream?channel=UCc_eP0i4YwSQmQ9du5-RHbA&autoplay=1&mute=1`} frameBorder="0" allowFullScreen title="반석교회 실시간 예배"></iframe>
                    <button onClick={toggleExpand} style={{
                      position: 'absolute', bottom: '15px', left: '15px',
                      background: 'rgba(0,0,0,0.7)', color: 'white', border: '1px solid rgba(255,255,255,0.4)',
                      borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', zIndex: 10000,
                    }}>{isExpanded ? '🔲 작게보기' : '📱 크게보기'}</button>
                  </div>
                ) : (
                  <div className={styles.sermonVideoWrap} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)', textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '4rem' }}>✝️</div>
                    <h3 style={{ color: '#fff', fontSize: '1.3rem', margin: '1rem 0 0.5rem' }}>지금은 라이브 예배 시간이 아닙니다</h3>
                    <p style={{ color: '#bfdbfe', margin: '0.5rem 0 1.5rem' }}>예배가 종료되었거나 준비 중입니다.<br />정해진 시간에 다시 찾아와 주세요!</p>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '12px', color: '#fff' }}>📅 다음 예배: {getNextWorship()}</div>
                  </div>
                )}
                <div className={styles.sermonMainInfo}>
                  {isLive ? (
                    <>
                      <h3>🔴 실시간 예배 중</h3>
                      <p>지금 반석교회에서 예배가 진행되고 있습니다.<br />
                        <a href="https://www.youtube.com/@petros-church/live" target="_blank" rel="noopener noreferrer" style={{ color: '#c19c72', textDecoration: 'underline' }}>유튜브에서 보기 →</a></p>
                    </>
                  ) : (
                    <>
                      <h3>📺 예배 생중계 안내</h3>
                      <p>주일 오전 9시 · 11시 / 수요 저녁 7:30 / 금요 저녁 8시<br />
                        <a href="https://www.youtube.com/@petros-church" target="_blank" rel="noopener noreferrer" style={{ color: '#c19c72', textDecoration: 'underline' }}>유튜브 채널에서 지난 설교 보기 →</a></p>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.sermonGrid}>
                {displaySermons.map((sermon: any) => (
                  <div key={sermon.id} className={styles.sermonCard}>
                    <div className={styles.sermonInfo}>
                      <h4>{sermon.category || '설교말씀'}</h4>
                      <p>{sermon.title}</p>
                      <span className={styles.sermonMeta}>{sermon.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 교회소식(news) */}
        {activeSection === 'news' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>반석교회 소식</h2>
            <div className={styles.newsContainer}>
              <div className={styles.sloganCard}>
                <div className={styles.sloganYear}>2026 표어 [눅 10:42]</div>
                <div className={styles.sloganText}>가장 좋은 것을 선택하라</div>
                <div className={styles.sloganSubtext}>&ldquo;마리아는 이 좋은 편을 택하였으니 빼앗기지 아니하리라 하시니라&rdquo;<br /><strong>Stand on grace / 은혜 위에 바로 서는 반석교회</strong></div>
              </div>
              <div className={styles.newsGrid}>
                {displayNews.map((news: any, idx: number) => (
                  <div key={news.id} className={styles.newsCard}>
                    <h3>{idx + 1}. {news.title}</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{news.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 예배안내(schedule) */}
        {activeSection === 'schedule' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>예배 안내 및 순서</h2>
            <p className={styles.sectionSubtitle}>은혜의 자리로 여러분을 초대합니다.</p>
            <div className={styles.scheduleWrap}>
              <div className={styles.scheduleTableWrap}>
                <div className={styles.orderHeader}>예배 시간 안내</div>
                <table className={styles.scheduleTable}>
                  <tbody>
                    {displaySchedules.map((s: any) => {
                      const isActive = s.title === selectedWorship;
                      const hasOrder = WORSHIP_ORDERS[s.title];
                      return (
                        <tr key={s.id} className={`${hasOrder ? styles.scheduleRowClickable : ''} ${isActive ? styles.scheduleRowActive : ''}`} onClick={() => hasOrder && setSelectedWorship(s.title)}>
                          <th>{s.title}</th>
                          <td><span className={styles.time}>{s.time}</span></td>
                          <td>{s.place}</td>
                          <td>{s.officer}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className={styles.scheduleFooterVerse}>
                  <div className={styles.verseIcon}>✝</div>
                  <div className={styles.verseText}>&ldquo;그러므로 누구든지 나의 이 말을 듣고 행하는 자는 그 집을 반석 위에 지은 지혜로운 사람 같으리니&rdquo;</div>
                  <div className={styles.verseRef}>— 마태복음 7:24</div>
                </div>
              </div>
              <div className={styles.orderServiceBox} key={selectedWorship}>
                <div className={styles.orderHeader}>{WORSHIP_ORDERS[selectedWorship]?.title || '주일 오전 예배 순서'}</div>
                <div className={styles.orderSub}>예배 10분 전에는 착석해 주시기 바랍니다.</div>
                <div className={styles.orderFade}>
                  {WORSHIP_ORDERS[selectedWorship]?.groups.map((g: any, gi: number) => (
                    <div key={gi} className={styles.orderGroup} style={gi === (WORSHIP_ORDERS[selectedWorship]?.groups.length ?? 0) - 1 ? { borderBottom: 'none' } : {}}>
                      <div className={styles.orderGroupTitle}>{g.heading}</div>
                      {g.rows.map((r: any, ri: number) => (
                        <div key={ri} className={styles.orderRow}>
                          <span className={styles.orderMark}>{r.bold ? '✦' : '*'}</span>
                          <span className={styles.orderLabel}>{r.label}</span>
                          <span className={styles.orderContent} style={r.bold ? { fontWeight: 'bold', color: '#5b272f' } : {}}>{r.content}</span>
                          {r.resp && <span className={styles.orderResp}>{r.resp}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 오시는길(location) */}
        {activeSection === 'location' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>오시는 길</h2>
            <p className={styles.sectionSubtitle}>반석교회로 오시는 길을 상세히 안내해 드립니다.</p>
            <div className={styles.locationWrap}>
              <div className={styles.locationInfo}>
                <h3>대한예수교 장로회<br />반석교회</h3>
                <div className={styles.infoItem} style={{ cursor: 'pointer' }} onClick={() => window.open('https://www.google.com/maps/search/%EA%B2%BD%EC%83%81%EB%82%A8%EB%8F%84+%EA%B1%B0%EC%A0%9C%EC%8B%9C+%EC%97%B0%EC%B4%88%EB%A9%B4+%EC%86%8C%EC%98%A4%EB%B9%84%EA%B8%B8+40-6/@34.908055,128.657597,18z')}>
                  <span className={styles.infoLabel}>📍 주소</span>
                  <span style={{ textDecoration: 'underline', color: 'var(--color-primary)', lineHeight: '1.6' }}>경상남도 거제시 연초면 소오비길 40-6<br />(소오비두부집 인근)</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>📞 문의</span>
                  <span><strong>담임목사 이주민:</strong> 010.9825.5020</span>
                </div>
              </div>
              <div className={styles.mapFrame}>
                <iframe
                  src="https://maps.google.com/maps?q=%EA%B2%BD%EC%83%81%EB%82%A8%EB%8F%84%20%EA%B1%B0%EC%A0%9C%EC%8B%9C%20%EC%97%B0%EC%B4%88%EB%A9%B4%20%EC%86%8C%EC%98%A4%EB%B9%84%EA%B8%B8%2040-6&t=&z=17&ie=UTF8&iwloc=&output=embed"
                  width="100%" height="100%" style={{ border: 0 }}
                  allowFullScreen={true} loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="반석교회 오시는길 약도"
                ></iframe>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerCopy}>
            © 2026 대한예수교장로회 반석교회 · 담임: 이주민 목사 · 거제시 연초면 소오비길 40-6 · 헌금: 신협 131-017-687642
            <Link href="/admin" style={{ marginLeft: '1rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>[관리자]</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
