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

export default function HomeClient({ newsItems, sermons, schedules }: HomeClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedWorship, setSelectedWorship] = useState('주일대예배 (1부)');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <div className={styles.mainContainer}>
      {/* Header */}
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div
          className={styles.logo}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onDoubleClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          style={{ cursor: 'pointer' }}
        >
          <img src="/church-logo.jpg" alt="반석교회 로고" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 열기"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link href="#about" className={styles.navLink} onClick={handleNavClick}>교회소개</Link>
          <Link href="#vision" className={styles.navLink} onClick={handleNavClick}>비전과사명</Link>
          <Link href="#sermon" className={styles.navLink} onClick={handleNavClick}>설교말씀</Link>
          <Link href="#news" className={styles.navLink} onClick={handleNavClick}>교회소식</Link>
          <Link href="#schedule" className={styles.navLink} onClick={handleNavClick}>예배안내</Link>
          <Link href="#location" className={styles.navLink} onClick={handleNavClick}>오시는길</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection} id="about">
        {/* Background layers */}
        <div className={styles.heroBg}>
          <div className={styles.heroBgImage}></div>
          <div className={styles.heroOverlay}></div>
        </div>

        {/* Decorative elements */}
        <div className={`${styles.heroDecor} ${styles.heroDecorCross}`}></div>
        <div className={`${styles.heroDecor} ${styles.heroDecorCircle}`}></div>
        <div className={`${styles.heroDecor} ${styles.heroDecorDots}`}></div>

        <div className={styles.heroContent}>
          <div className={styles.heroTagline}>은혜 위에 세워진 공동체</div>
          <h1 className={styles.heroTitle}>
            <span className={styles.gold}>은혜 위에</span>
            <span className={styles.burgundy}>바로 서는 교회</span>
          </h1>
          <p className={styles.heroQuote}>
            &ldquo;그러므로 누구든지 나의 이 말을 듣고 행하는 자는<br />
            그 집을 반석 위에 지은 지혜로운 사람 같으리니&rdquo;<br />
            <span style={{ display: 'block', marginTop: '0.5rem' }}>— 마태복음 7:24</span>
          </p>
          <div className={styles.heroButtons}>
            <a href="https://www.youtube.com/@petros-church/live" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>실시간 예배 참여하기</a>
            <a href="#news" className={styles.btnOutline}>교회 소식 보기</a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator}>
          <span>SCROLL</span>
          <div className={styles.scrollLine}></div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className={styles.section} id="vision">
        <h2 className={styles.sectionTitle}>비전과 사명</h2>
        <p className={styles.sectionSubtitle}>
          반석교회는 대한예수교 장로회 합동측에 속한 건전한 교회입니다.
        </p>

        <div className={styles.visionGrid}>
          <div className={styles.visionCard}>
            <div className={styles.visionNum}>01</div>
            <h3 className={styles.visionTitle}>한 걸음의 순종</h3>
            <p className={styles.visionDesc}>주의 말씀을 따라 한 걸음씩 나아가는 교회</p>
          </div>
          <div className={styles.visionCard}>
            <div className={styles.visionNum}>02</div>
            <h3 className={styles.visionTitle}>한 영혼의 구원</h3>
            <p className={styles.visionDesc}>영혼 구원을 위해 최선을 다하는 교회</p>
          </div>
          <div className={styles.visionCard}>
            <div className={styles.visionNum}>03</div>
            <h3 className={styles.visionTitle}>한 걸음의 섬김</h3>
            <p className={styles.visionDesc}>섬김과 헌신으로 이웃과 세상을 섬기는 교회</p>
          </div>
          <div className={styles.visionCard}>
            <div className={styles.visionNum}>04</div>
            <h3 className={styles.visionTitle}>한 마음의 공동체</h3>
            <p className={styles.visionDesc}>모두가 하나 되어 하나님의 꿈을 이루는 교회<br />(한 공동체의 꿈)</p>
          </div>
        </div>
      </section>

      {/* Sermon / YouTube Section */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="sermon">
        <h2 className={styles.sectionTitle}>설교 말씀</h2>
        <p className={styles.sectionSubtitle}>
          반석교회 유튜브 채널에서 지난 예배 영상을 다시 보실 수 있습니다.
        </p>

        <div className={styles.sermonContainer}>
          {/* Live / Latest Sermon */}
          <div className={styles.sermonMain}>
            {(() => {
              const now = new Date();
              const day = now.getDay(); // 0=일, 1=월, ..., 6=토
              const hour = now.getHours();
              const min = now.getMinutes();
              const t = hour * 60 + min; // 현재 시간(분)

              // 예배 시간 체크 (시작 10분 전 ~ 종료 30분 후)
              const isLive = (
                // 주일 1부 08:50~10:30
                (day === 0 && t >= 530 && t <= 630) ||
                // 주일 2부 10:40~12:30
                (day === 0 && t >= 640 && t <= 750) ||
                // 주일 오후 13:50~15:30
                (day === 0 && t >= 830 && t <= 930) ||
                // 수요 저녁 19:20~21:00
                (day === 3 && t >= 1160 && t <= 1260) ||
                // 금요 기도회 19:50~21:30
                (day === 5 && t >= 1190 && t <= 1290) ||
                // 새벽예배 (월~토) 05:20~06:30
                (day >= 1 && day <= 6 && t >= 320 && t <= 390)
              );

              // 다음 예배 안내
              const getNextWorship = () => {
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
              };

              if (isLive) {
                return (
                  <>
                    <div className={styles.sermonVideoWrap}>
                      <iframe
                        src="https://www.youtube.com/embed/live?channel=UCc_eP0i4YwSQmQ9du5-RHbA"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title="반석교회 실시간 예배 생중계"
                      ></iframe>
                    </div>
                    <div className={styles.sermonMainInfo}>
                      <h3>🔴 실시간 예배 중</h3>
                      <p>지금 반석교회에서 예배가 진행되고 있습니다.<br />함께 은혜를 나눠요!</p>
                    </div>
                  </>
                );
              }

              return (
                <>
                  <div className={styles.sermonVideoWrap} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f8f4f0 0%, #eee5dd 50%, #f0e8e0 100%)',
                    textAlign: 'center',
                    padding: '2rem',
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.7 }}>✝️</div>
                    <h3 style={{ 
                      color: '#5b272f', 
                      fontSize: '1.3rem', 
                      fontWeight: 700, 
                      margin: '0 0 0.8rem',
                      fontFamily: 'var(--font-heading)',
                    }}>
                      하나님의 평안이 함께 하시길 기도합니다
                    </h3>
                    <p style={{ 
                      color: '#8b7355', 
                      fontSize: '0.95rem', 
                      lineHeight: 1.7, 
                      margin: '0 0 1.5rem',
                      maxWidth: '320px',
                    }}>
                      현재 예배 시간이 아닙니다.<br />
                      다음 예배에서 함께 예배드려요! 🙏
                    </p>
                    <div style={{
                      background: 'rgba(91, 39, 47, 0.06)',
                      borderRadius: '12px',
                      padding: '0.8rem 1.5rem',
                      fontSize: '0.85rem',
                      color: '#5b272f',
                      fontWeight: 600,
                    }}>
                      📅 다음 예배: {getNextWorship()}
                    </div>
                  </div>
                  <div className={styles.sermonMainInfo}>
                    <h3>📺 예배 생중계 안내</h3>
                    <p>주일 오전 9시 · 11시 / 수요 저녁 7:30 / 금요 저녁 8시<br />예배 시간에 이곳에서 실시간으로 참여하실 수 있습니다.<br />
                    <a href="https://www.youtube.com/@petros-church" target="_blank" rel="noopener noreferrer" style={{ color: '#c19c72', textDecoration: 'underline' }}>
                      유튜브 채널에서 지난 설교 보기 →
                    </a></p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Recent Sermons Grid */}
          <div className={styles.sermonGrid}>
            {(sermons.length > 0 ? sermons : [
              { id: 'fs1', title: '무릎 꿇으신 기도자', category: '주일오전 설교', content: '이주민 목사', url: '#' },
              { id: 'fs2', title: '요셉 시리즈 (창세기)', category: '수요예배 말씀', content: '이주민 목사', url: '#' },
              { id: 'fs3', title: '생명의 삶 (매일 새벽)', category: '큐티(QT) 안내', content: '경건의 시간', url: '#' },
            ]).map((sermon) => (
              <a 
                key={sermon.id} 
                href={sermon.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.sermonCard}
              >
                <div className={styles.sermonThumb}>
                  <span>{sermon.category === '큐티(QT) 안내' ? '🔗' : '📖'}</span>
                </div>
                <div className={styles.sermonInfo}>
                  <h4>{sermon.category || '설교말씀'}</h4>
                  <p>{sermon.title}</p>
                  <span className={styles.sermonMeta}>{sermon.content || '이주민 목사'}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* News & Slogan Section */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="news">
        <h2 className={styles.sectionTitle}>반석교회 소식</h2>
        <p className={styles.sectionSubtitle}>은혜와 사랑이 넘치는 반석교회 이야기입니다.</p>
        
        <div className={styles.newsContainer}>
          {/* 2026 표어 카드 */}
          <div className={styles.sloganCard}>
            <div className={styles.sloganYear}>2026 표어 [눅 10:42]</div>
            <div className={styles.sloganText}>가장 좋은 것을 선택하라</div>
            <div className={styles.sloganSubtext}>
              &ldquo;마리아는 이 좋은 편을 택하였으니 빼앗기지 아니하리라 하시니라&rdquo;<br /><br />
              <strong>Stand on grace / 은혜 위에 바로 서는 반석교회</strong><br />
              주의 말씀은 내 발의 등이요 내 길에 빛이니이다 (시편 119:105)
            </div>
          </div>

          <div className={styles.newsGrid}>
            {(newsItems.length > 0 ? newsItems : [
              { id: 'fn1', title: '환영 및 등록 안내', content: '환영하고 축복합니다. 반석교회는 대한예수교 장로회 합동 측 소속입니다.\n• 유튜브: @petros-church\n• 온라인 헌금: 신협 131-017-687642\n• 다음세대 후원: 신협 131-018-242250' },
              { id: 'fn2', title: '이번 주 예배 주제', content: '• 주일오전\n  무릎 꿇으신 기도자\n  (눅 22:39~44)\n• 수요저녁\n  창세기 45:4-10\n• 금요기도\n  [기도] 책\n• 새벽예배\n  QT책 진도를 따라' },
              { id: 'fn3', title: '고난주일 및 성찬식', content: '오늘은 고난주일(종려주일)로 보냅니다. 오늘 오전 예배 중 성찬식이 경건하게 진행됩니다.' },
              { id: 'fn4', title: '이음돌 아우팅 안내', content: '오늘은 점심 식사가 없으며,\n각 이음돌 모임별로 아우팅 시간을 보냅니다.\n\n※ 단, 주일학교와 어르신들에게는\n김밥을 제공해 드립니다.' },
              { id: 'fn5', title: '다음세대 예배 소식', content: '• 주일청소년:\n  예수님의 십자가 (막 15장)\n• 주일어린이:\n  구레네 시몬 (막 15:21)\n  사순절 가정학습지를 함께해요.' },
              { id: 'fn6', title: '고난주간 특별새벽기도', content: '내일부터 고난주간 특별 새벽기도를 준비합니다.\n• 기간: 3월 30일(월) ~ 4월 3일(금)' },
              { id: 'fn7', title: '부활절 및 연합 세례식', content: '다음 주일은 예수님의 부활을 축하하며 세례식도 함께 진행합니다.' },
              { id: 'fn8', title: '성전 보수 및 새생명 축제', content: '성전 안팎의 보수공사를 진행하고 있습니다. 아울러 다가오는 새생명 축제를 위해 기도 바랍니다.' },
            ]).map((news: any, idx: number) => (
              <div key={news.id} className={styles.newsCard}>
                <h3>{idx + 1}. {news.title}</h3>
                {news.url && news.url.includes('/uploads/') && (
                  <img src={news.url} alt={news.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
                )}
                {news.content && <p style={{ whiteSpace: 'pre-line' }}>{news.content}</p>}
                {news.url && !news.url.includes('/uploads/') && (
                  <a href={news.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-logo-gold)', fontSize: '0.9rem', textDecoration: 'underline' }}>
                    자세히 보기 &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className={styles.section} id="schedule">
        <h2 className={styles.sectionTitle}>예배 안내 및 순서</h2>
        <p className={styles.sectionSubtitle}>은혜의 자리로 여러분을 초대합니다.<br />예배 이름을 클릭하면 해당 예배 순서를 보실 수 있습니다.</p>
        
        <div className={styles.scheduleWrap}>
          {/* Left: Schedule Table */}
          <div className={styles.scheduleTableWrap}>
            <table className={styles.scheduleTable}>
              <tbody>
                {(schedules.length > 0 ? schedules : [
                  { id: 'fs1', title: '주일대예배 (1부)', time: '오전 9시', place: '2층 본당', officer: '이주민 목사' },
                  { id: 'fs2', title: '주일대예배 (2부)', time: '오전 11시', place: '2층 본당', officer: '이주민 목사' },
                  { id: 'fs3', title: '주일오후예배', time: '오후 2시', place: '2층 본당', officer: '이주민 목사' },
                  { id: 'fs4', title: '중고등부예배', time: '오전 10시', place: '3층 교육관', officer: '김민정 전도사' },
                  { id: 'fs5', title: '주일학교예배', time: '오전 11시', place: '3층 교육관', officer: '김민정 전도사' },
                  { id: 'fs6', title: '수요저녁예배', time: '저녁 7:30', place: '2층 본당', officer: '이주민 목사' },
                  { id: 'fs7', title: '금요기도회', time: '저녁 8시', place: '2층 본당', officer: '이주민 목사' },
                  { id: 'fs8', title: '새벽예배', time: '새벽 5:30', place: '2층 본당', officer: '이주민 목사' },
                ]).map((schedule: any) => (
                  <tr
                    key={schedule.id}
                    onClick={() => setSelectedWorship(schedule.title)}
                    style={{
                      cursor: 'pointer',
                      background: selectedWorship === schedule.title ? 'rgba(91, 39, 47, 0.08)' : undefined,
                      transition: 'background 0.2s',
                    }}
                  >
                    <th style={{
                      color: selectedWorship === schedule.title ? '#5b272f' : undefined,
                      position: 'relative',
                    }}>
                      {selectedWorship === schedule.title && <span style={{ position: 'absolute', left: '-0.2rem', top: '50%', transform: 'translateY(-50%)', color: '#c19c72' }}>▶</span>}
                      {schedule.title}
                    </th>
                    <td><span className={styles.time}>{schedule.time}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{schedule.place}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{schedule.officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Order of Service Box */}
          <div className={styles.orderServiceBox}>
            <div className={styles.orderHeader}>{selectedWorship || '주일대예배 (1부)'} 순서</div>
            <div className={styles.orderSub}>예배 10분 전에는 착석해 주시기 바랍니다.</div>
            
            {(() => {
              const orders: Record<string, { groups: { title: string; rows: { mark: string; label: string; content: string; resp: string }[] }[]; footer?: string }> = {
                '주일대예배 (1부)': {
                  groups: [
                    { title: '◀ 개회 (하나님께 나아감)', rows: [
                      { mark: '*', label: '묵도', content: '', resp: '다같이' },
                      { mark: '*', label: '개회찬송', content: '예수 우리 왕이여 (38장)', resp: '다같이' },
                      { mark: '*', label: '신앙고백', content: '사도신경', resp: '다같이' },
                      { mark: '*', label: '교독문', content: '', resp: '다같이' },
                      { mark: '', label: '찬송', content: '만왕의 왕 주께서 (151장)', resp: '다같이' },
                      { mark: '', label: '통성기도', content: '', resp: '다같이' },
                    ]},
                    { title: '◀ 말씀의 선포', rows: [
                      { mark: '', label: '성경봉독', content: '(누가복음 22:39~44)', resp: '다같이' },
                      { mark: '', label: '말씀', content: '무릎 꿇으신 기도자', resp: '이주민 목사' },
                      { mark: '', label: '합심기도', content: '말씀을 기억하며', resp: '다같이' },
                    ]},
                    { title: '◀ 결단과 헌신', rows: [
                      { mark: '', label: '예물봉헌', content: '내 구주 예수를 더욱 사랑 (314장)', resp: '다같이' },
                      { mark: '', label: '교회소식', content: '', resp: '인도자' },
                    ]},
                    { title: '◀ 성찬식', rows: [
                      { mark: '', label: '성찬식', content: '(고린도전서 11:23-26)', resp: '이주민 목사' },
                      { mark: '*', label: '찬송', content: '십자가를 질 수 있나 (461장)', resp: '다같이' },
                      { mark: '*', label: '축도', content: '', resp: '이주민 목사' },
                    ]},
                  ],
                  footer: '예배 후 식탁의 교제가 준비되어 있습니다.',
                },
                '주일대예배 (2부)': {
                  groups: [
                    { title: '◀ 개회 (하나님께 나아감)', rows: [
                      { mark: '*', label: '묵도', content: '', resp: '다같이' },
                      { mark: '*', label: '개회찬송', content: '예수 우리 왕이여 (38장)', resp: '다같이' },
                      { mark: '*', label: '신앙고백', content: '사도신경', resp: '다같이' },
                      { mark: '*', label: '교독문', content: '', resp: '다같이' },
                      { mark: '', label: '찬양', content: '찬양팀 인도', resp: '다같이' },
                      { mark: '', label: '통성기도', content: '', resp: '다같이' },
                    ]},
                    { title: '◀ 말씀의 선포', rows: [
                      { mark: '', label: '성경봉독', content: '(누가복음 22:39~44)', resp: '다같이' },
                      { mark: '', label: '말씀', content: '무릎 꿇으신 기도자', resp: '이주민 목사' },
                      { mark: '', label: '합심기도', content: '말씀을 기억하며', resp: '다같이' },
                    ]},
                    { title: '◀ 결단과 헌신', rows: [
                      { mark: '', label: '예물봉헌', content: '내 구주 예수를 더욱 사랑 (314장)', resp: '다같이' },
                      { mark: '', label: '교회소식', content: '', resp: '인도자' },
                      { mark: '*', label: '찬송', content: '십자가를 질 수 있나 (461장)', resp: '다같이' },
                      { mark: '*', label: '축도', content: '', resp: '이주민 목사' },
                    ]},
                  ],
                  footer: '예배 후 식탁의 교제가 준비되어 있습니다.',
                },
                '주일오후예배': {
                  groups: [
                    { title: '◀ 예배의 부름', rows: [
                      { mark: '*', label: '묵도', content: '', resp: '다같이' },
                      { mark: '*', label: '찬송', content: '', resp: '다같이' },
                      { mark: '*', label: '기도', content: '', resp: '인도자' },
                    ]},
                    { title: '◀ 말씀과 기도', rows: [
                      { mark: '', label: '성경봉독', content: '', resp: '다같이' },
                      { mark: '', label: '말씀', content: '오후 말씀', resp: '이주민 목사' },
                      { mark: '', label: '통성기도', content: '', resp: '다같이' },
                    ]},
                    { title: '◀ 보냄', rows: [
                      { mark: '*', label: '찬송', content: '', resp: '다같이' },
                      { mark: '*', label: '축도', content: '', resp: '이주민 목사' },
                    ]},
                  ],
                },
                '중고등부예배': {
                  groups: [
                    { title: '◀ 찬양과 경배', rows: [
                      { mark: '', label: '찬양', content: '찬양 인도', resp: '다같이' },
                      { mark: '', label: '기도', content: '', resp: '인도자' },
                    ]},
                    { title: '◀ 말씀', rows: [
                      { mark: '', label: '성경봉독', content: '', resp: '다같이' },
                      { mark: '', label: '말씀', content: '예수님의 십자가 (막 15장)', resp: '김민정 전도사' },
                      { mark: '', label: '합심기도', content: '', resp: '다같이' },
                    ]},
                    { title: '◀ 교제', rows: [
                      { mark: '', label: '교회소식', content: '', resp: '인도자' },
                      { mark: '', label: '찬양', content: '', resp: '다같이' },
                      { mark: '*', label: '축복기도', content: '', resp: '김민정 전도사' },
                    ]},
                  ],
                },
                '주일학교예배': {
                  groups: [
                    { title: '◀ 찬양', rows: [
                      { mark: '', label: '율동찬양', content: '', resp: '다같이' },
                      { mark: '', label: '기도', content: '', resp: '인도자' },
                    ]},
                    { title: '◀ 말씀', rows: [
                      { mark: '', label: '말씀', content: '구레네 시몬 (막 15:21)', resp: '김민정 전도사' },
                      { mark: '', label: '암송', content: '이번 주 말씀 암송', resp: '다같이' },
                    ]},
                    { title: '◀ 활동', rows: [
                      { mark: '', label: '공과활동', content: '사순절 가정학습지', resp: '다같이' },
                      { mark: '', label: '교회소식', content: '', resp: '인도자' },
                      { mark: '*', label: '축복기도', content: '', resp: '김민정 전도사' },
                    ]},
                  ],
                },
                '수요저녁예배': {
                  groups: [
                    { title: '◀ 개회', rows: [
                      { mark: '*', label: '묵도', content: '', resp: '다같이' },
                      { mark: '*', label: '찬송', content: '', resp: '다같이' },
                      { mark: '', label: '기도', content: '', resp: '인도자' },
                    ]},
                    { title: '◀ 말씀', rows: [
                      { mark: '', label: '성경봉독', content: '창세기 45:4-10', resp: '다같이' },
                      { mark: '', label: '말씀', content: '요셉 시리즈', resp: '이주민 목사' },
                      { mark: '', label: '통성기도', content: '', resp: '다같이' },
                    ]},
                    { title: '◀ 마침', rows: [
                      { mark: '', label: '교회소식', content: '', resp: '인도자' },
                      { mark: '*', label: '찬송', content: '', resp: '다같이' },
                      { mark: '*', label: '축도', content: '', resp: '이주민 목사' },
                    ]},
                  ],
                },
                '금요기도회': {
                  groups: [
                    { title: '◀ 찬양과 기도', rows: [
                      { mark: '', label: '찬양', content: '', resp: '다같이' },
                      { mark: '', label: '대표기도', content: '', resp: '인도자' },
                    ]},
                    { title: '◀ 말씀과 기도', rows: [
                      { mark: '', label: '말씀', content: '[기도] 책', resp: '이주민 목사' },
                      { mark: '', label: '통성기도', content: '중보기도', resp: '다같이' },
                      { mark: '', label: '릴레이기도', content: '', resp: '참석 성도' },
                    ]},
                    { title: '◀ 마침', rows: [
                      { mark: '*', label: '찬송', content: '', resp: '다같이' },
                      { mark: '*', label: '축도', content: '', resp: '이주민 목사' },
                    ]},
                  ],
                },
                '새벽예배': {
                  groups: [
                    { title: '◀ 예배', rows: [
                      { mark: '*', label: '묵도', content: '', resp: '다같이' },
                      { mark: '*', label: '찬송', content: '', resp: '다같이' },
                      { mark: '', label: '기도', content: '', resp: '인도자' },
                    ]},
                    { title: '◀ 말씀', rows: [
                      { mark: '', label: '말씀', content: 'QT책 진도를 따라', resp: '이주민 목사' },
                      { mark: '', label: '통성기도', content: '', resp: '다같이' },
                    ]},
                    { title: '◀ 마침', rows: [
                      { mark: '*', label: '찬송', content: '', resp: '다같이' },
                      { mark: '*', label: '축도', content: '', resp: '이주민 목사' },
                    ]},
                  ],
                },
              };

              const current = orders[selectedWorship] || orders['주일대예배 (1부)'];
              return (
                <>
                  {current.groups.map((group, gi) => (
                    <div key={gi} className={styles.orderGroup} style={gi === current.groups.length - 1 ? { borderBottom: 'none' } : undefined}>
                      <div className={styles.orderGroupTitle}>{group.title}</div>
                      {group.rows.map((row, ri) => (
                        <div key={ri} className={styles.orderRow}>
                          <span className={styles.orderMark}>{row.mark}</span>
                          {' '}<span className={styles.orderLabel}>{row.label}</span>
                          {' '}<span className={styles.orderContent} style={row.label === '말씀' ? { fontWeight: 'bold', color: '#5b272f' } : undefined}>{row.content}</span>
                          {' '}<span className={styles.orderResp}>{row.resp}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  {current.footer && (
                    <div className={styles.orderSub} style={{ marginTop: '0', background: '#eadddf', fontWeight: 'bold' }}>
                      {current.footer}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="location">
        <h2 className={styles.sectionTitle}>오시는 길</h2>
        <p className={styles.sectionSubtitle}>반석교회로 오시는 길을 상세히 안내해 드립니다.</p>
        
        <div className={styles.locationWrap}>
          <div className={styles.locationInfo}>
            <h3>대한예수교 장로회<br />반석교회</h3>
            
            <div className={styles.infoItem} style={{ cursor: 'pointer' }} onClick={() => window.open('https://www.google.com/maps/search/%EA%B2%BD%EC%83%81%EB%82%A8%EB%8F%84+%EA%B1%B0%EC%A0%9C%EC%8B%9C+%EC%97%B0%EC%B4%88%EB%A9%B4+%EC%86%8C%EC%98%A4%EB%B9%84%EA%B8%B8+40-6/@34.908055,128.657597,18z')}>
              <span className={styles.infoLabel}>📍 주소</span>
              <span style={{ textDecoration: 'underline', color: 'var(--color-primary)', lineHeight: '1.6' }}>
                경상남도 거제시 연초면 소오비길 40-6<br />
                (소오비두부집 인근)
              </span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>🚗 오시는 길</span>
              <span style={{ wordBreak: 'keep-all' }}>연하해안로 신오교 맞은편 진입 후, 세븐일레븐 거제소오비점 근처에 위치하고 있습니다.<br />주차 안내를 따라 전용 주차장을 이용 바랍니다.</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>📞 문의</span>
              <span><strong>담임목사 이주민:</strong> 010.9825.5020</span>
            </div>
          </div>
          
          <div className={styles.mapFrame}>
            <iframe
              src="https://maps.google.com/maps?q=%EA%B2%BD%EC%83%81%EB%82%A8%EB%8F%84%20%EA%B1%B0%EC%A0%9C%EC%8B%9C%20%EC%97%B0%EC%B4%88%EB%A9%B4%20%EC%86%8C%EC%98%A4%EB%B9%84%EA%B8%B8%2040-6&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="반석교회 오시는길 약도"
            ></iframe>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <img src="/church-logo.jpg" alt="반석교회 로고" style={{ height: '48px', objectFit: 'contain', filter: 'invert(1) brightness(2)' }} />
            <span>대한예수교장로회 반석교회</span>
          </div>
          <div className={styles.footerInfo}>
            <p>담임목사: 이주민 | 주소: 거제시 연초면 소오비길 40-6</p>
            <p>온라인 헌금: 신협 131-017-687642 반석교회</p>
            <p>다음세대 후원: 신협 131-018-242250 반석교회</p>
          </div>
          <div className={styles.footerDivider}></div>
          <p className={styles.footerCopy}>
            © 2026 Banseok Church. All Rights Reserved. 
            <Link href="/admin" style={{ marginLeft: '1rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>[관리자]</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
