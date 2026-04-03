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
        <div className={styles.logo}>
          <span style={{ fontSize: '1.3rem' }}>✝</span>
          <span>반석교회</span>
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
              <h3>🔴 실시간 예배 및 최신 설교</h3>
              <p>주일 오전 11:00 / 수요일 저녁 19:30 등 모든 공예배가 실시간으로 송출됩니다.<br />방송 중이 아닐 때는 가장 최근의 설교 영상이 상영됩니다.</p>
            </div>
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
              { id: 'fn2', title: '이번 주 예배 주제', content: '• 주일오전: 무릎 꿇으신 기도자 (눅 22:39~44)\n• 수요저녁: 창세기 45:4-10\n• 금요기도: [기도] 책\n• 새벽예배: QT책 진도를 따라' },
              { id: 'fn3', title: '고난주일 및 성찬식', content: '오늘은 고난주일(종려주일)로 보냅니다. 오늘 오전 예배 중 성찬식이 경건하게 진행됩니다.' },
              { id: 'fn4', title: '이음돌 아우팅 안내', content: '오늘은 점심 식사가 없으며, 각 이음돌 모임별로 아우팅 시간을 보냅니다.\n※ 단, 주일학교와 어르신들에게는 김밥을 제공해 드립니다.' },
              { id: 'fn5', title: '다음세대 예배 소식', content: '• 주일청소년: 예수님의 십자가 (막 15장)\n• 주일어린이: 구레네 시몬 (막 15:21). 사순절 가정학습지를 함께해요.' },
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
        <p className={styles.sectionSubtitle}>은혜의 자리로 여러분을 초대합니다.</p>
        
        <div className={styles.scheduleWrap}>
          {/* Left: Schedule Table */}
          <div className={styles.scheduleTableWrap}>
            <table className={styles.scheduleTable}>
              <tbody>
                {(schedules.length > 0 ? schedules : [
                  { id: 'fs1', title: '주일대예배 (1부)', time: '오전 09:00', place: '2층 본당', officer: '이주민 목사' },
                  { id: 'fs2', title: '주일대예배 (2부)', time: '오전 11:00', place: '2층 본당', officer: '이주민 목사' },
                  { id: 'fs3', title: '주일오후예배', time: '오후 14:00', place: '2층 본당', officer: '이주민 목사' },
                  { id: 'fs4', title: '중고등부예배', time: '오전 10:00', place: '3층 교육관', officer: '김민정 전도사' },
                  { id: 'fs5', title: '주일학교예배', time: '오전 11:00', place: '3층 교육관', officer: '김민정 전도사' },
                  { id: 'fs6', title: '수요저녁예배', time: '저녁 19:30', place: '2층 본당', officer: '이주민 목사' },
                  { id: 'fs7', title: '금요기도회', time: '저녁 20:00', place: '2층 본당', officer: '이주민 목사' },
                  { id: 'fs8', title: '새벽예배', time: '오전 05:30', place: '2층 본당', officer: '이주민 목사' },
                ]).map((schedule: any) => (
                  <tr key={schedule.id}>
                    <th>{schedule.title}</th>
                    <td><span className={styles.time}>{schedule.time}</span></td>
                    <td>{schedule.place}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{schedule.officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Order of Service Box */}
          <div className={styles.orderServiceBox}>
            <div className={styles.orderHeader}>주일 오전 예배 순서</div>
            <div className={styles.orderSub}>예배 10분 전에는 착석해 주시기 바랍니다.</div>
            
            <div className={styles.orderGroup}>
              <div className={styles.orderGroupTitle}>◀ 개회 (하나님께 나아감)</div>
              <div className={styles.orderRow}><span className={styles.orderMark}>*</span> <span className={styles.orderLabel}>묵도</span> <span className={styles.orderContent}></span> <span className={styles.orderResp}>다같이</span></div>
              <div className={styles.orderRow}><span className={styles.orderMark}>*</span> <span className={styles.orderLabel}>개회찬송</span> <span className={styles.orderContent}>예수 우리 왕이여 (38장)</span> <span className={styles.orderResp}>다같이</span></div>
              <div className={styles.orderRow}><span className={styles.orderMark}>*</span> <span className={styles.orderLabel}>신앙고백</span> <span className={styles.orderContent}>사도신경</span> <span className={styles.orderResp}>다같이</span></div>
              <div className={styles.orderRow}><span className={styles.orderMark}>*</span> <span className={styles.orderLabel}>교독문</span> <span className={styles.orderContent}></span> <span className={styles.orderResp}>다같이</span></div>
              <div className={styles.orderRow}><span className={styles.orderMark}></span> <span className={styles.orderLabel}>찬송</span> <span className={styles.orderContent}>만왕의 왕 주께서 (151장)</span> <span className={styles.orderResp}>다같이</span></div>
              <div className={styles.orderRow}><span className={styles.orderMark}></span> <span className={styles.orderLabel}>통성기도</span> <span className={styles.orderContent}></span> <span className={styles.orderResp}>다같이</span></div>
            </div>

            <div className={styles.orderGroup}>
              <div className={styles.orderGroupTitle}>◀ 말씀의 선포</div>
              <div className={styles.orderRow}><span className={styles.orderMark}></span> <span className={styles.orderLabel}>성경봉독</span> <span className={styles.orderContent}>(누가복음 22:39~44)</span> <span className={styles.orderResp}>다같이</span></div>
              <div className={styles.orderRow}><span className={styles.orderMark}></span> <span className={styles.orderLabel}>말씀</span> <span className={styles.orderContent} style={{fontWeight: 'bold', color: '#5b272f'}}>무릎 꿇으신 기도자</span> <span className={styles.orderResp}>이주민 목사</span></div>
              <div className={styles.orderRow}><span className={styles.orderMark}></span> <span className={styles.orderLabel}>합심기도</span> <span className={styles.orderContent}>말씀을 기억하며</span> <span className={styles.orderResp}>다같이</span></div>
            </div>

            <div className={styles.orderGroup}>
              <div className={styles.orderGroupTitle}>◀ 결단과 헌신</div>
              <div className={styles.orderRow}><span className={styles.orderMark}></span> <span className={styles.orderLabel}>예물봉헌</span> <span className={styles.orderContent}>내 구주 예수를 더욱 사랑 (314장)</span> <span className={styles.orderResp}>다같이</span></div>
              <div className={styles.orderRow}><span className={styles.orderMark}></span> <span className={styles.orderLabel}>교회소식</span> <span className={styles.orderContent}></span> <span className={styles.orderResp}>인도자</span></div>
            </div>

            <div className={styles.orderGroup} style={{ borderBottom: 'none' }}>
              <div className={styles.orderGroupTitle}>◀ 성찬식</div>
              <div className={styles.orderRow}><span className={styles.orderMark}></span> <span className={styles.orderLabel}>성찬식</span> <span className={styles.orderContent}>(고린도전서 11:23-26)</span> <span className={styles.orderResp}>이주민 목사</span></div>
              <div className={styles.orderRow}><span className={styles.orderMark}>*</span> <span className={styles.orderLabel}>찬송</span> <span className={styles.orderContent}>십자가를 질 수 있나 (461장)</span> <span className={styles.orderResp}>다같이</span></div>
              <div className={styles.orderRow}><span className={styles.orderMark}>*</span> <span className={styles.orderLabel}>축도</span> <span className={styles.orderContent}></span> <span className={styles.orderResp}>이주민 목사</span></div>
            </div>
            
            <div className={styles.orderSub} style={{ marginTop: '0', background: '#eadddf', fontWeight: 'bold' }}>
              예배 후 식탁의 교제가 준비되어 있습니다.
            </div>
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
              <span style={{ wordBreak: 'keep-all' }}>연하해안로 신오교 맞은편 진입 후, 세븐일레븐 거제소오비점 근처에 위치하고 있습니다. 주차 안내를 따라 전용 주차장을 이용 바랍니다.</span>
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
            <span>✝</span>
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
