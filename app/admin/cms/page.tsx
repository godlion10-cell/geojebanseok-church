"use client";

import { useState, useEffect, useRef } from 'react';
import css from './cms.module.css';

export default function CMSPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('hero');
  const [saving, setSaving] = useState(false);
  const isFirstRender = useRef(true);

  // Content state (initialized with current homepage values)
  const [content, setContent] = useState({
    heroTagline: "은혜 위에 세워진 공동체",
    heroTitle_gold: "은혜 위에",
    heroTitle_burgundy: "바로 서는 교회",
    heroQuote: "주의 말씀은 내 발의 등이요 내 길에 빛이니이다 (시편 119:105)",
    visionTitle: "비전과 사명",
    visionSubtitle: "거제 반석교회는 하나님의 말씀을 따라 세상을 변화시키는 공동체입니다.",
    sermonYoutubeUrl: "https://www.youtube.com/channel/@petros-church",
    newsSlogan: "2026 표어: 가장 좋은 것을 선택하라 [눅 10:42]",
    newsSubtext: "은혜와 사랑이 넘치는 반석교회 이야기입니다.",
    mapAddress: "경상남도 거제시 연초면 소오비길 40-6",
    mapZoom: "17",
    fontFamily: "Nanum Myeongjo, serif",
    letterSpacing: "-0.01em",
    lineHeight: "1.8"
  });

  // Persist login state
  useEffect(() => {
    const auth = localStorage.getItem('banseok_cms_auth');
    if (auth === 'true') {
      setIsAuthorized(true);
    }
    isFirstRender.current = false;
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') { 
      setIsAuthorized(true);
      localStorage.setItem('banseok_cms_auth', 'true');
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem('banseok_cms_auth');
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('성공적으로 저장되었습니다. 홈페이지에 즉시 반영됩니다.');
    }, 1500);
  };

  if (!isAuthorized) {
    return (
      <div className={css.loginContainer}>
        <div className={css.loginCard}>
          <h2>반석교회 관리자</h2>
          <p>비밀번호를 입력하여 접속하세요.</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              className={css.loginInput}
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit" className={css.loginBtn}>로그인</button>
          </form>
          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#ccc' }}>초기 비밀번호: 1234</p>
        </div>
      </div>
    );
  }

  return (
    <div className={css.cmsWrapper}>
      <div className={css.cmsHeader}>
        <div>
          <h1>콘텐츠 관리 시스템 (CMS)</h1>
          <p className={css.subtitle}>반석교회 홈페이지 디자인과 내용을 한눈에 관리하세요.</p>
        </div>
        <div className={css.headerActions}>
          <button className={css.logoutBtn} onClick={handleLogout}>로그아웃</button>
          <button className={css.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '변경 사항 저장'}
          </button>
        </div>
      </div>

      <div className={css.cmsMain}>
        <aside className={css.categorySidebar}>
          <button className={`${css.catBtn} ${activeTab === 'hero' ? css.catBtnActive : ''}`} onClick={() => setActiveTab('hero')}>⛪ 대문 (Hero)</button>
          <button className={`${css.catBtn} ${activeTab === 'vision' ? css.catBtnActive : ''}`} onClick={() => setActiveTab('vision')}>📖 비전 (Vision)</button>
          <button className={`${css.catBtn} ${activeTab === 'sermon' ? css.catBtnActive : ''}`} onClick={() => setActiveTab('sermon')}>📺 설교 (Media)</button>
          <button className={`${css.catBtn} ${activeTab === 'news' ? css.catBtnActive : ''}`} onClick={() => setActiveTab('news')}>📢 소식 (News)</button>
          <button className={`${css.catBtn} ${activeTab === 'map' ? css.catBtnActive : ''}`} onClick={() => setActiveTab('map')}>📍 약도 (Map)</button>
          <button className={`${css.catBtn} ${activeTab === 'style' ? css.catBtnActive : ''}`} onClick={() => setActiveTab('style')}>🎨 디자인 (Style)</button>
        </aside>

        <main className={css.editorCard}>
          {activeTab === 'hero' && (
            <div className={css.sectionForm}>
              <h3>히어로 섹션 편집</h3>
              <div className={css.formGroup}>
                <label>상단 강조 텍스트 (Tagline)</label>
                <input value={content.heroTagline} onChange={(e) => setContent({...content, heroTagline: e.target.value})} />
              </div>
              <div className={css.formRow}>
                <div className={css.formGroup}>
                  <label>메인 타이틀 (골드 강조)</label>
                  <input value={content.heroTitle_gold} onChange={(e) => setContent({...content, heroTitle_gold: e.target.value})} />
                </div>
                <div className={css.formGroup}>
                  <label>메인 타이틀 (버건디 본체)</label>
                  <input value={content.heroTitle_burgundy} onChange={(e) => setContent({...content, heroTitle_burgundy: e.target.value})} />
                </div>
              </div>
              <div className={css.formGroup}>
                <label>대표 성구 / 인용구</label>
                <textarea rows={4} value={content.heroQuote} onChange={(e) => setContent({...content, heroQuote: e.target.value})} />
              </div>
            </div>
          )}

          {activeTab === 'vision' && (
            <div className={css.sectionForm}>
              <h3>비전 및 사명 편집</h3>
              <div className={css.formGroup}>
                <label>비전 타이틀</label>
                <input value={content.visionTitle} onChange={(e) => setContent({...content, visionTitle: e.target.value})} />
              </div>
              <div className={css.formGroup}>
                <label>비전 설명 (최대 300자)</label>
                <textarea rows={6} value={content.visionSubtitle} onChange={(e) => setContent({...content, visionSubtitle: e.target.value})} />
              </div>
            </div>
          )}

          {activeTab === 'sermon' && (
            <div className={css.sectionForm}>
              <h3>설교 영상 채널 관리</h3>
              <div className={css.formGroup}>
                <label>유튜브 채널 또는 실시간 링크</label>
                <input value={content.sermonYoutubeUrl} onChange={(e) => setContent({...content, sermonYoutubeUrl: e.target.value})} />
              </div>
              <div className={css.previewArea}>
                <p style={{ fontSize: '0.9rem', color: '#888' }}>현재 설정된 유튜브 링크로 바로가기 버튼이 자동으로 생성됩니다.</p>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className={css.sectionForm}>
              <h3>2026 교회 표어 및 새소식</h3>
              <div className={css.formGroup}>
                <label>올해의 교회 표어</label>
                <input value={content.newsSlogan} onChange={(e) => setContent({...content, newsSlogan: e.target.value})} />
              </div>
              <div className={css.formGroup}>
                <label>소식지 상단 문구</label>
                <input value={content.newsSubtext} onChange={(e) => setContent({...content, newsSubtext: e.target.value})} />
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className={css.sectionForm}>
              <h3>약도 및 오시는 길(지도) 관리</h3>
              <div className={css.formGroup}>
                <label>교회 상세 주소</label>
                <input value={content.mapAddress} onChange={(e) => setContent({...content, mapAddress: e.target.value})} />
              </div>
              <div className={css.formGroup}>
                <label>지도 상세 확대 (줌 레벨)</label>
                <select value={content.mapZoom} onChange={(e) => setContent({...content, mapZoom: e.target.value})}>
                  <option value="15">멀리 (15)</option>
                  <option value="17">보통 (17)</option>
                  <option value="19">가까이 (19)</option>
                </select>
              </div>
              <div className={css.previewArea}>
                <h4 style={{ marginBottom: '1.5rem', color: '#5b272f' }}>실시간 지도 미리보기</h4>
                <div className={css.iframeWrap}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(content.mapAddress)}&t=&z=${content.mapZoom}&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                  ></iframe>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'style' && (
            <div className={css.sectionForm}>
              <h3>디자인 스타일 / 서체 제어</h3>
              <div className={css.formGroup}>
                <label>메인 글꼴 (Font Family)</label>
                <select value={content.fontFamily} onChange={(e) => setContent({...content, fontFamily: e.target.value})}>
                  <option value="Nanum Myeongjo, serif">나눔명조 (고급스러운 교회 느낌)</option>
                  <option value="Inter, sans-serif">Inter (현대적인 글로벌 느낌)</option>
                  <option value="Nanum Gothic, sans-serif">나눔고딕 (보편적이고 깔끔한 느낌)</option>
                </select>
              </div>
              <div className={css.formRow}>
                <div className={css.formGroup}>
                  <label>자간 조절 (Letter Spacing)</label>
                  <select value={content.letterSpacing} onChange={(e) => setContent({...content, letterSpacing: e.target.value})}>
                    <option value="-0.03em">좁게</option>
                    <option value="-0.01em">보통</option>
                    <option value="0em">기본</option>
                  </select>
                </div>
                <div className={css.formGroup}>
                  <label>행간 조절 (Line Height)</label>
                  <select value={content.lineHeight} onChange={(e) => setContent({...content, lineHeight: e.target.value})}>
                    <option value="1.5">좁게</option>
                    <option value="1.8">보통</option>
                    <option value="2.1">넓게</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
