'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

// 예배 시간 체크 함수
function checkIsLive(): boolean {
  const now = new Date();
  const day = now.getDay();
  const t = now.getHours() * 60 + now.getMinutes();
  return (
    (day === 0 && t >= 530 && t <= 630) ||   // 주일 1부 08:50~10:30
    (day === 0 && t >= 640 && t <= 750) ||   // 주일 2부 10:40~12:30
    (day === 0 && t >= 830 && t <= 930) ||   // 주일 오후 13:50~15:30
    (day === 3 && t >= 1160 && t <= 1260) || // 수요 저녁 19:20~21:00
    (day === 5 && t >= 1190 && t <= 1290) || // 금요 기도회 19:50~21:30
    (day >= 1 && day <= 6 && t >= 320 && t <= 390) // 새벽예배 05:20~06:30
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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('about');
  const [isLive, setIsLive] = useState(false);
  const liveVideoRef = useRef<HTMLDivElement>(null);

  // 예배 시간 자동 체크 (30초마다)
  useEffect(() => {
    const checkLive = () => setIsLive(checkIsLive());
    checkLive();
    const timer = setInterval(checkLive, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleFullscreen = () => {
    if (liveVideoRef.current) {
      if (liveVideoRef.current.requestFullscreen) liveVideoRef.current.requestFullscreen();
      else if ((liveVideoRef.current as any).webkitRequestFullscreen) (liveVideoRef.current as any).webkitRequestFullscreen();
      else if ((liveVideoRef.current as any).msRequestFullscreen) (liveVideoRef.current as any).msRequestFullscreen();
    }
  };

  const handleNavClick = (key: SectionKey) => {
    setActiveSection(key);
    setMenuOpen(false);
  };

  return (
    <div className={styles.mainContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div
          className={styles.logo}
          onClick={() => setActiveSection('about')}
          style={{ cursor: 'pointer' }}
        >
          <img src="/church-logo.png" alt="반석교회 로고" style={{ height: '50px', objectFit: 'contain' }} />
        </div>
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 열기"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`${styles.navLink} ${activeSection === item.key ? styles.navLinkActive : ''}`}
              onClick={() => handleNavClick(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content Area - shows only active section */}
      <main className={styles.contentArea}>

        {/* 교회소개 */}
        {activeSection === 'about' && (
          <section className={styles.heroSection}>
            <div className={styles.heroBg}>
              <div className={styles.heroBgImage}></div>
              <div className={styles.heroOverlay}></div>
            </div>
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
                <button onClick={() => setActiveSection('news')} className={styles.btnOutline}>교회 소식 보기</button>
              </div>
            </div>
          </section>
        )}

        {/* 비전과 사명 */}
        {activeSection === 'vision' && (
          <section className={styles.tabSection}>
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
        )}

        {/* 설교 말씀 */}
        {activeSection === 'sermon' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>설교 말씀</h2>
            <p className={styles.sectionSubtitle}>
              반석교회 유튜브 채널에서 지난 예배 영상을 다시 보실 수 있습니다.
            </p>
            <div className={styles.sermonContainer}>
              <div className={styles.sermonMain}>
                {isLive ? (
                  <>
                    <div ref={liveVideoRef} className={styles.sermonVideoWrap} style={{ position: 'relative', aspectRatio: '16/9', width: '100%', background: '#000', overflow: 'hidden' }}>
                      <iframe
                        width="100%" height="100%"
                        src="https://www.youtube.com/embed/live_stream?channel=UCc_eP0i4YwSQmQ9du5-RHbA&autoplay=1&mute=1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0 }}
                        title="반석교회 실시간 예배"
                      ></iframe>
                      <button onClick={handleFullscreen} style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'linear-gradient(135deg, #7a3a44, #4a1f26)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(0,0,0,0.6)' }}>
                        <span style={{ fontSize: '1.2rem' }}>📱</span> 영상 크게보기
                      </button>
                    </div>
                    <div className={styles.sermonMainInfo}>
                      <h3>🔴 실시간 예배 중</h3>
                      <p>지금 반석교회에서 예배가 진행되고 있습니다.<br />예배 화면을 클릭하시면 소리를 켜실 수 있습니다.<br />
                      <a href="https://www.youtube.com/@petros-church/live" target="_blank" rel="noopener noreferrer" style={{ color: '#c19c72', textDecoration: 'underline', fontSize: '0.9rem' }}>유튜브 앱에서 보기 →</a></p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.sermonVideoWrap} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8f4f0 0%, #eee5dd 50%, #f0e8e0 100%)', textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.7 }}>✝️</div>
                      <h3 style={{ color: '#5b272f', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.8rem' }}>하나님의 평안이 함께 하시길 기도합니다</h3>
                      <p style={{ color: '#8b7355', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 1.5rem', maxWidth: '320px' }}>현재 예배 시간이 아닙니다.<br />다음 예배에서 함께 예배드려요! 🙏</p>
                      <div style={{ background: 'rgba(91, 39, 47, 0.06)', borderRadius: '12px', padding: '0.8rem 1.5rem', fontSize: '0.85rem', color: '#5b272f', fontWeight: 600 }}>📅 다음 예배: {getNextWorship()}</div>
                    </div>
                    <div className={styles.sermonMainInfo}>
                      <h3>📺 예배 생중계 안내</h3>
                      <p>주일 오전 9시 · 11시 / 수요 저녁 7:30 / 금요 저녁 8시<br />예배 시간에 이곳에서 실시간으로 참여하실 수 있습니다.<br />
                      <a href="https://www.youtube.com/@petros-church" target="_blank" rel="noopener noreferrer" style={{ color: '#c19c72', textDecoration: 'underline' }}>유튜브 채널에서 지난 설교 보기 →</a></p>
                    </div>
                  </>
                )}
              </div>
              <div className={styles.sermonGrid}>
                <div className={styles.sermonCard}>
                  <div className={styles.sermonThumb}><span>📖</span></div>
                  <div className={styles.sermonInfo}>
                    <h4>주일오전 설교</h4>
                    <p>무릎 꿇으신 기도자</p>
                    <span className={styles.sermonMeta}>이주민 목사</span>
                  </div>
                </div>
                <div className={styles.sermonCard}>
                  <div className={styles.sermonThumb}><span>📖</span></div>
                  <div className={styles.sermonInfo}>
                    <h4>수요예배 말씀</h4>
                    <p>요셉 시리즈 (창세기)</p>
                    <span className={styles.sermonMeta}>이주민 목사</span>
                  </div>
                </div>
                <div className={styles.sermonCard}>
                  <div className={styles.sermonThumb}><span>🔗</span></div>
                  <div className={styles.sermonInfo}>
                    <h4>큐티(QT) 안내</h4>
                    <p>생명의 삶 (매일 새벽)</p>
                    <span className={styles.sermonMeta}>경건의 시간</span>
                  </div>
                </div>
              </div>
              <div className={styles.channelLink}>
                <a href="https://www.youtube.com/@petros-church/live" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                  🔴 실시간 생방송 바로가기
                </a>
              </div>
            </div>
          </section>
        )}

        {/* 교회 소식 */}
        {activeSection === 'news' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>반석교회 소식</h2>
            <div className={styles.newsContainer}>
              <div className={styles.sloganCard}>
                <div className={styles.sloganYear}>2026 표어 [눅 10:42]</div>
                <div className={styles.sloganText}>가장 좋은 것을 선택하라</div>
                <div className={styles.sloganSubtext}>
                  &ldquo;마리아는 이 좋은 편을 택하였으니 빼앗기지 아니하리라 하시니라&rdquo;<br />
                  <strong>Stand on grace / 은혜 위에 바로 서는 반석교회</strong>
                </div>
              </div>
              <div className={styles.newsGrid}>
                <div className={styles.newsCard}>
                  <h3>1. 환영 및 등록 안내</h3>
                  <p>환영하고 축복합니다. 반석교회는 대한예수교 장로회 합동 측 소속입니다.</p>
                  <ul><li>유튜브: @petros-church</li><li>온라인 헌금: 신협 131-017-687642</li><li>다음세대 후원: 신협 131-018-242250</li></ul>
                </div>
                <div className={styles.newsCard}>
                  <h3>2. 이번 주 예배 주제</h3>
                  <ul><li>주일오전: 무릎 꿇으신 기도자 (눅 22:39~44)</li><li>수요저녁: 창세기 45:4-10</li><li>금요기도: [기도] 책</li><li>새벽예배: QT책 진도를 따라</li></ul>
                </div>
                <div className={styles.newsCard}>
                  <h3>3. 고난주일 및 성찬식</h3>
                  <p>오늘은 고난주일(종려주일)로 보냅니다. 오늘 오전 예배 중 성찬식이 경건하게 진행됩니다.</p>
                </div>
                <div className={styles.newsCard}>
                  <h3>4. 이음돌 아우팅 안내</h3>
                  <p>오늘은 점심 식사가 없으며, 각 이음돌 모임별로 아우팅 시간을 보냅니다.</p>
                </div>
                <div className={styles.newsCard}>
                  <h3>5. 다음세대 예배 소식</h3>
                  <ul><li>주일청소년: 예수님의 십자가 (막 15장)</li><li>주일어린이: 구레네 시몬 (막 15:21)</li></ul>
                </div>
                <div className={styles.newsCard}>
                  <h3>6. 고난주간 특별새벽기도</h3>
                  <p>기간: 3월 30일(월) ~ 4월 3일(금) / 5일간</p>
                </div>
                <div className={styles.newsCard}>
                  <h3>7. 부활절 및 연합 세례식</h3>
                  <p>다음 주일은 예수님의 부활을 축하하며 세례식도 함께 진행합니다.</p>
                </div>
                <div className={styles.newsCard}>
                  <h3>8. 성전 보수 및 새생명 축제</h3>
                  <p>성전 보수공사 진행 중. 새생명 축제(4월 12일)를 위해 기도 바랍니다.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 예배 안내 */}
        {activeSection === 'schedule' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>예배 안내 및 순서</h2>
            <p className={styles.sectionSubtitle}>은혜의 자리로 여러분을 초대합니다.</p>
            <div className={styles.scheduleWrap}>
              <div className={styles.scheduleTableWrap}>
                <table className={styles.scheduleTable}>
                  <tbody>
                    <tr><th>주일대예배 (1부)</th><td><span className={styles.time}>오전 09:00</span></td><td>2층 본당</td><td>이주민 목사</td></tr>
                    <tr><th>주일대예배 (2부)</th><td><span className={styles.time}>오전 11:00</span></td><td>2층 본당</td><td>이주민 목사</td></tr>
                    <tr><th>주일오후예배</th><td><span className={styles.time}>오후 14:00</span></td><td>2층 본당</td><td>이주민 목사</td></tr>
                    <tr><th>중고등부예배</th><td><span className={styles.time}>오전 10:00</span></td><td>3층 교육관</td><td>김민정 전도사</td></tr>
                    <tr><th>주일학교예배</th><td><span className={styles.time}>오전 11:00</span></td><td>3층 교육관</td><td>김민정 전도사</td></tr>
                    <tr><th>수요저녁예배</th><td><span className={styles.time}>저녁 19:30</span></td><td>2층 본당</td><td>이주민 목사</td></tr>
                    <tr><th>금요기도회</th><td><span className={styles.time}>저녁 20:00</span></td><td>2층 본당</td><td>이주민 목사</td></tr>
                    <tr><th>새벽예배</th><td><span className={styles.time}>오전 05:30</span></td><td>2층 본당</td><td>이주민 목사</td></tr>
                  </tbody>
                </table>
              </div>
              <div className={styles.orderServiceBox}>
                <div className={styles.orderHeader}>주일 오전 예배 순서</div>
                <div className={styles.orderSub}>예배 10분 전에는 착석해 주시기 바랍니다.</div>
                <div className={styles.orderGroup}>
                  <div className={styles.orderGroupTitle}>◀ 개회 (하나님께 나아감)</div>
                  <div className={styles.orderRow}><span className={styles.orderMark}>*</span> <span className={styles.orderLabel}>묵도</span> <span className={styles.orderContent}></span> <span className={styles.orderResp}>다같이</span></div>
                  <div className={styles.orderRow}><span className={styles.orderMark}>*</span> <span className={styles.orderLabel}>개회찬송</span> <span className={styles.orderContent}>예수 우리 왕이여 (38장)</span> <span className={styles.orderResp}>다같이</span></div>
                  <div className={styles.orderRow}><span className={styles.orderMark}>*</span> <span className={styles.orderLabel}>신앙고백</span> <span className={styles.orderContent}>사도신경</span> <span className={styles.orderResp}>다같이</span></div>
                </div>
                <div className={styles.orderGroup}>
                  <div className={styles.orderGroupTitle}>◀ 말씀의 선포</div>
                  <div className={styles.orderRow}><span className={styles.orderMark}></span> <span className={styles.orderLabel}>성경봉독</span> <span className={styles.orderContent}>(누가복음 22:39~44)</span> <span className={styles.orderResp}>다같이</span></div>
                  <div className={styles.orderRow}><span className={styles.orderMark}></span> <span className={styles.orderLabel}>말씀</span> <span className={styles.orderContent} style={{fontWeight: 'bold', color: '#5b272f'}}>무릎 꿇으신 기도자</span> <span className={styles.orderResp}>이주민 목사</span></div>
                </div>
                <div className={styles.orderGroup} style={{ borderBottom: 'none' }}>
                  <div className={styles.orderGroupTitle}>◀ 결단과 헌신</div>
                  <div className={styles.orderRow}><span className={styles.orderMark}></span> <span className={styles.orderLabel}>예물봉헌</span> <span className={styles.orderContent}>내 구주 예수를 더욱 사랑 (314장)</span> <span className={styles.orderResp}>다같이</span></div>
                  <div className={styles.orderRow}><span className={styles.orderMark}>*</span> <span className={styles.orderLabel}>축도</span> <span className={styles.orderContent}></span> <span className={styles.orderResp}>이주민 목사</span></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 오시는 길 */}
        {activeSection === 'location' && (
          <section className={styles.tabSection}>
            <h2 className={styles.sectionTitle}>오시는 길</h2>
            <p className={styles.sectionSubtitle}>반석교회로 오시는 길을 상세히 안내해 드립니다.</p>
            <div className={styles.locationWrap}>
              <div className={styles.locationInfo}>
                <h3>대한예수교 장로회<br />반석교회</h3>
                <div className={styles.infoItem} style={{ cursor: 'pointer' }} onClick={() => window.open('https://www.google.com/maps/search/%EA%B2%BD%EC%83%81%EB%82%A8%EB%8F%84+%EA%B1%B0%EC%A0%9C%EC%8B%9C+%EC%97%B0%EC%B4%88%EB%A9%B4+%EC%86%8C%EC%98%A4%EB%B9%84%EA%B8%B8+40-6/@34.908055,128.657597,18z')}>
                  <span className={styles.infoLabel}>📍 주소</span>
                  <span style={{ textDecoration: 'underline', color: 'var(--color-primary)', lineHeight: '1.6' }}>
                    경상남도 거제시 연초면 소오비길 40-6<br />(소오비두부집 인근)
                  </span>
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

      {/* Footer */}
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
