"use client";

import { useState, useEffect, useRef } from 'react';
import { getContentItems, addContentItem, updateContentItem, deleteContentItem, initializeBaseData } from '@/app/actions/content';
import { getSchedules, addSchedule, updateSchedule, deleteSchedule, initializeSchedules } from '@/app/actions/schedule';
import css from './cms.module.css';

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

// 기본(Fallback) 데이터
const DEFAULT_NEWS = [
  { title: '환영 및 등록 안내', content: '환영하고 축복합니다. 반석교회는 대한예수교 장로회 합동 측 소속입니다.\n• 유튜브: @petros-church\n• 온라인 헌금: 신협 131-017-687642\n• 다음세대 후원: 신협 131-018-242250' },
  { title: '이번 주 예배 주제', content: '• 주일오전: 무릎 꿇으신 기도자 (눅 22:39~44)\n• 수요저녁: 창세기 45:4-10\n• 금요기도: [기도] 책\n• 새벽예배: QT책 진도를 따라' },
  { title: '고난주일 및 성찬식', content: '오늘은 고난주일(종려주일)로 보냅니다. 오늘 오전 예배 중 성찬식이 경건하게 진행됩니다.' },
  { title: '이음돌 아우팅 안내', content: '오늘은 점심 식사가 없으며, 각 이음돌 모임별로 아우팅 시간을 보냅니다.\n※ 단, 주일학교와 어르신들에게는 김밥을 제공해 드립니다.' },
  { title: '다음세대 예배 소식', content: '• 주일청소년: 예수님의 십자가 (막 15장)\n• 주일어린이: 구레네 시몬 (막 15:21). 사순절 가정학습지를 함께해요.' },
  { title: '고난주간 특별새벽기도', content: '내일부터 고난주간 특별 새벽기도를 준비합니다.\n• 기간: 3월 30일(월) ~ 4월 3일(금)' },
];

const DEFAULT_SERMONS = [
  { title: '무릎 꿇으신 기도자', category: '주일오전 설교', content: '이주민 목사', url: '' },
  { title: '요셉 시리즈 (창세기)', category: '수요예배 말씀', content: '이주민 목사', url: '' },
  { title: '생명의 삶 (매일 새벽)', category: '큐티(QT) 안내', content: '경건의 시간', url: '' },
];

const DEFAULT_SCHEDULES = [
  { title: '주일대예배 (1부)', time: '오전 09:00', place: '2층 본당', officer: '이주민 목사', order: 1 },
  { title: '주일대예배 (2부)', time: '오전 11:00', place: '2층 본당', officer: '이주민 목사', order: 2 },
  { title: '주일오후예배', time: '오후 14:00', place: '2층 본당', officer: '이주민 목사', order: 3 },
  { title: '중고등부예배', time: '오전 10:00', place: '3층 교육관', officer: '김민정 전도사', order: 4 },
  { title: '주일학교예배', time: '오전 11:00', place: '3층 교육관', officer: '김민정 전도사', order: 5 },
  { title: '수요저녁예배', time: '저녁 19:30', place: '2층 본당', officer: '이주민 목사', order: 6 },
  { title: '금요기도회', time: '저녁 20:00', place: '2층 본당', officer: '이주민 목사', order: 7 },
  { title: '새벽예배', time: '오전 05:30', place: '2층 본당', officer: '이주민 목사', order: 8 },
];

export default function CMSPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'news' | 'sermon' | 'schedule' | 'smart'>('news');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data states
  const [newsItems, setNewsItems] = useState<ContentItem[]>([]);
  const [sermons, setSermons] = useState<ContentItem[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Edit modal state
  const [editModal, setEditModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    id?: string;
    data: Record<string, string>;
  }>({ open: false, mode: 'add', data: {} });

  // AI Smart Upload state
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiPreview, setAiPreview] = useState<string>('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState('');
  const [aiSaving, setAiSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const auth = localStorage.getItem('banseok_cms_auth');
    if (auth === 'true') {
      setIsAuthorized(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [newsRes, sermonRes, scheduleRes] = await Promise.all([
        getContentItems('NEWS'),
        getContentItems('SERMON'),
        getSchedules()
      ]);
      if (newsRes.success) setNewsItems(newsRes.data || []);
      if (sermonRes.success) setSermons(sermonRes.data || []);
      if (scheduleRes.success) setSchedules(scheduleRes.data || []);
    } catch (err: any) {
      console.error('데이터 로딩 실패:', err);
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') {
      setIsAuthorized(true);
      localStorage.setItem('banseok_cms_auth', 'true');
      fetchData();
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem('banseok_cms_auth');
  };

  const handleInitialize = async (type: 'news' | 'sermon' | 'schedule') => {
    if (!confirm(`기본 ${type === 'news' ? '교회 소식' : type === 'sermon' ? '설교 말씀' : '예배 시간표'} 데이터를 일괄 등록하시겠습니까?\n(기존 데이터가 있으면 추가됩니다)`)) return;
    setSaving(true);
    try {
      let res;
      if (type === 'news') {
        const items = DEFAULT_NEWS.map(item => ({ category: '', title: item.title, url: '', content: item.content }));
        res = await initializeBaseData('news', items);
      } else if (type === 'sermon') {
        const items = DEFAULT_SERMONS.map(item => ({ category: item.category, title: item.title, url: item.url, content: item.content }));
        res = await initializeBaseData('sermon', items);
      } else {
        res = await initializeSchedules(DEFAULT_SCHEDULES);
      }
      if (!res?.success) throw new Error(res?.error || '서버 오류');
      alert('기본 데이터가 등록되었습니다!');
      fetchData();
    } catch (err: any) {
      alert(`초기화 중 오류: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleContentSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set('type', activeTab.toUpperCase());
      fd.set('category', editModal.data.category || '');
      fd.set('title', editModal.data.title || '');
      fd.set('url', editModal.data.url || '');
      fd.set('content', editModal.data.content || '');
      let res;
      if (editModal.mode === 'edit' && editModal.id) {
        res = await updateContentItem(editModal.id, fd);
      } else {
        res = await addContentItem(fd);
      }
      if (res.success) {
        alert('저장되었습니다.');
        setEditModal({ open: false, mode: 'add', data: {} });
        fetchData();
      } else {
        alert(res.error || '저장 실패');
      }
    } catch (err: any) {
      alert(`오류: ${err.message || '저장 중 문제가 발생했습니다.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleSave = async () => {
    setSaving(true);
    try {
      const data = {
        title: editModal.data.title || '',
        time: editModal.data.time || '',
        place: editModal.data.place || '',
        officer: editModal.data.officer || '',
        order: parseInt(editModal.data.order || '0'),
      };
      let res;
      if (editModal.mode === 'edit' && editModal.id) {
        res = await updateSchedule(editModal.id, data);
      } else {
        res = await addSchedule(data);
      }
      if (res.success) {
        alert('저장되었습니다.');
        setEditModal({ open: false, mode: 'add', data: {} });
        fetchData();
      } else {
        alert(res.error || '저장 실패');
      }
    } catch (err: any) {
      alert(`오류: ${err.message || '저장 중 문제가 발생했습니다.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, type: 'content' | 'schedule') => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = type === 'schedule' ? await deleteSchedule(id) : await deleteContentItem(id);
    if (res.success) fetchData();
    else alert('삭제 실패');
  };

  const openEdit = (item: any, type: 'news' | 'sermon' | 'schedule') => {
    if (type === 'schedule') {
      setEditModal({ open: true, mode: 'edit', id: item.id, data: { title: item.title, time: item.time, place: item.place, officer: item.officer, order: String(item.order) } });
    } else {
      setEditModal({ open: true, mode: 'edit', id: item.id, data: { title: item.title, category: item.category || '', url: item.url || '', content: item.content || '' } });
    }
  };

  const openAdd = () => {
    if (activeTab === 'schedule') {
      setEditModal({ open: true, mode: 'add', data: { title: '', time: '', place: '', officer: '', order: '0' } });
    } else {
      setEditModal({ open: true, mode: 'add', data: { title: '', category: '', url: '', content: '' } });
    }
  };

  const updateField = (field: string, value: string) => {
    setEditModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));
  };

  // ===== AI Smart Upload handlers =====
  const handleFileSelect = (file: File) => {
    setAiFile(file);
    setAiResult(null);
    setAiError('');
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setAiPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setAiPreview('video');
    } else {
      setAiPreview('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleAiAnalyze = async () => {
    if (!aiFile) return;
    setAiAnalyzing(true);
    setAiError('');
    setAiResult(null);

    try {
      const fd = new FormData();
      fd.append('file', aiFile);
      if (aiInstruction.trim()) {
        fd.append('instruction', aiInstruction.trim());
      }

      const res = await fetch('/api/analyze', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAiError(data.error || 'AI 분석에 실패했습니다.');
      } else {
        setAiResult({ ...data.analysis, uploadedFile: data.uploadedFile });
      }
    } catch (err: any) {
      setAiError(err.message || '네트워크 오류');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleAiSave = async () => {
    if (!aiResult) return;
    setAiSaving(true);
    try {
      if (aiResult.category === 'SCHEDULE' && aiResult.schedules?.length > 0) {
        for (const s of aiResult.schedules) {
          await addSchedule({ title: s.title, time: s.time, place: s.place, officer: s.officer, order: 0 });
        }
        alert(`✅ ${aiResult.schedules.length}개 예배 시간표가 등록되었습니다!`);
      } else {
        const fd = new FormData();
        fd.set('type', aiResult.category || 'NEWS');
        fd.set('category', aiResult.subcategory || '');
        fd.set('title', aiResult.title || '');
        fd.set('url', aiResult.uploadedFile || '');
        fd.set('content', aiResult.content || '');
        const res = await addContentItem(fd);
        if (res.success) {
          alert('✅ AI 분석 결과가 성공적으로 등록되었습니다!');
        } else {
          alert(res.error || '저장 실패');
        }
      }
      setAiFile(null);
      setAiPreview('');
      setAiResult(null);
      fetchData();
    } catch (err: any) {
      alert(`저장 오류: ${err.message}`);
    } finally {
      setAiSaving(false);
    }
  };

  const resetAi = () => {
    setAiFile(null);
    setAiPreview('');
    setAiResult(null);
    setAiError('');
    setAiInstruction('');
  };

  // ===== 로그인 화면 =====
  if (!isAuthorized) {
    return (
      <div className={css.loginContainer}>
        <div className={css.loginCard}>
          <h2>반석교회 관리자</h2>
          <p>비밀번호를 입력하여 접속하세요.</p>
          <form onSubmit={handleLogin}>
            <input type="password" className={css.loginInput} placeholder="비밀번호 입력" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            <button type="submit" className={css.loginBtn}>로그인</button>
          </form>
          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#ccc' }}>초기 비밀번호: 1234</p>
        </div>
      </div>
    );
  }

  const displayNews = newsItems.length > 0 ? newsItems : DEFAULT_NEWS.map((n, i) => ({ id: `default-n${i}`, type: 'NEWS', category: null, title: n.title, url: null, content: n.content }));
  const displaySermons = sermons.length > 0 ? sermons : DEFAULT_SERMONS.map((s, i) => ({ id: `default-s${i}`, type: 'SERMON', category: s.category, title: s.title, url: s.url, content: s.content }));
  const displaySchedules = schedules.length > 0 ? schedules : DEFAULT_SCHEDULES.map((s, i) => ({ id: `default-sc${i}`, ...s }));
  const isDefault = (id: string) => id.startsWith('default-');

  const categoryLabel: Record<string, string> = {
    'NEWS': '📢 교회 소식',
    'SERMON': '📺 설교 말씀',
    'SCHEDULE': '🗓️ 예배 시간표',
  };

  return (
    <div className={css.cmsWrapper}>
      {/* Header */}
      <div className={css.cmsHeader}>
        <div>
          <h1>홈페이지 콘텐츠 관리</h1>
          <p className={css.subtitle}>메인 화면에 표시되는 소식, 설교, 예배 안내를 실시간으로 관리하세요.</p>
        </div>
        <div className={css.headerActions}>
          <button className={css.logoutBtn} onClick={() => fetchData()}>🔄 새로고침</button>
          <button className={css.logoutBtn} onClick={handleLogout}>로그아웃</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={css.cmsMain}>
        <aside className={css.categorySidebar}>
          <button className={`${css.catBtn} ${activeTab === 'smart' ? css.catBtnActive : ''}`} onClick={() => setActiveTab('smart')} style={activeTab !== 'smart' ? { background: 'linear-gradient(135deg, #fdf5ea, #f5ead5)', borderColor: '#e8d5b8' } : {}}>
            🤖 AI 스마트 업로드
          </button>
          <div style={{ height: '0.5rem' }} />
          <button className={`${css.catBtn} ${activeTab === 'news' ? css.catBtnActive : ''}`} onClick={() => setActiveTab('news')}>📢 교회 소식</button>
          <button className={`${css.catBtn} ${activeTab === 'sermon' ? css.catBtnActive : ''}`} onClick={() => setActiveTab('sermon')}>📺 설교 말씀</button>
          <button className={`${css.catBtn} ${activeTab === 'schedule' ? css.catBtnActive : ''}`} onClick={() => setActiveTab('schedule')}>🗓️ 예배 안내</button>
        </aside>

        <main className={css.editorCard}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>로딩 중...</div>
          ) : activeTab === 'smart' ? (
            /* ============================== */
            /* ===== AI 스마트 업로드 탭 ===== */
            /* ============================== */
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', color: '#5b272f', borderLeft: '5px solid #c19c72', paddingLeft: '1rem' }}>
                  🤖 AI 스마트 업로드
                </h3>
                <p style={{ margin: 0, color: '#888', fontSize: '0.95rem', paddingLeft: '1.5rem' }}>
                  사진, PDF파일, 동영상을 첨부하면 AI가 자동으로 분석하여 적절한 카테고리에 등록합니다.
                </p>
              </div>

              {/* 파일 업로드 영역 */}
              {!aiFile && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `3px dashed ${dragOver ? '#c19c72' : '#e0d5c5'}`,
                    borderRadius: '24px',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? '#fdf5ea' : '#fdfbf7',
                    transition: 'all 0.3s',
                    transform: dragOver ? 'scale(1.01)' : 'scale(1)',
                  }}
                >
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.6 }}>📤</div>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#5b272f', margin: '0 0 0.5rem' }}>
                    사진, PDF파일, 동영상을 여기에 드래그하세요
                  </p>
                  <p style={{ color: '#999', fontSize: '0.9rem', margin: 0 }}>
                    또는 클릭하여 파일 선택 (주보 사진, 교회 활동 사진, 설교 영상 등)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
                  />
                </div>
              )}

              {/* 파일 미리보기 + 분석 */}
              {aiFile && !aiResult && (
                <div style={{ background: '#fdfbf7', borderRadius: '20px', padding: '2rem', border: '1px solid #f0e8dc' }}>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* 미리보기 */}
                    <div style={{ flex: '0 0 280px' }}>
                      {aiPreview === 'video' ? (
                        <div style={{ width: '280px', height: '200px', borderRadius: '16px', background: '#2a1a1f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem' }}>📹</div>
                      ) : aiPreview ? (
                        <img src={aiPreview} alt="미리보기" style={{ width: '280px', height: '200px', objectFit: 'cover', borderRadius: '16px', border: '1px solid #e0d5c5' }} />
                      ) : null}
                      <p style={{ margin: '0.8rem 0 0', fontSize: '0.85rem', color: '#888', wordBreak: 'break-all' }}>📎 {aiFile.name}</p>
                      <p style={{ margin: '0.3rem 0', fontSize: '0.8rem', color: '#bbb' }}>{(aiFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>

                    {/* 분석 버튼 */}
                    {/* 지시사항 입력 */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', minHeight: '200px' }}>
                      <div style={{ background: 'white', borderRadius: '14px', padding: '1rem', border: '1px solid #f0e8dc' }}>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#5b272f', marginBottom: '0.5rem' }}>
                          📝 AI에게 지시사항 (선택)
                        </label>
                        <textarea
                          value={aiInstruction}
                          onChange={(e) => setAiInstruction(e.target.value)}
                          rows={3}
                          placeholder={'예시:\n• "교회 소식에서 헌금 안내만 추출해줘"\n• "설교 제목과 성경 본문만 정리해줘"\n• "이번 주 예배 시간표를 업데이트해줘"'}
                          style={{
                            width: '100%',
                            padding: '0.8rem',
                            border: '2px solid #f0f0f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            background: '#fafafb',
                            transition: 'border-color 0.2s',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = '#c19c72')}
                          onBlur={(e) => (e.target.style.borderColor = '#f0f0f0')}
                        />
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: '#bbb' }}>
                          비워두면 AI가 자동으로 판단합니다. 원하는 수정사항을 입력하면 그에 맞게 분석합니다.
                        </p>
                      </div>
                      {aiError && (
                        <div style={{ padding: '1rem 1.5rem', background: '#fff5f5', border: '1px solid #f5c6c6', borderRadius: '12px', color: '#e74c3c', fontSize: '0.9rem' }}>
                          ⚠️ {aiError}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          onClick={handleAiAnalyze}
                          disabled={aiAnalyzing}
                          className={css.saveBtn}
                          style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          {aiAnalyzing ? (
                            <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span> AI 분석 중...</>
                          ) : (
                            <>🤖 AI 분석 시작</>
                          )}
                        </button>
                        <button onClick={resetAi} className={css.logoutBtn}>✕ 취소</button>
                      </div>

                      {aiAnalyzing && (
                        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #f0e8dc' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                            <div style={{ width: '24px', height: '24px', border: '3px solid #c19c72', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <span style={{ fontWeight: 700, color: '#5b272f' }}>Google Gemini가 분석하고 있습니다...</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>
                            이미지에서 텍스트를 추출하고, 카테고리를 판별하고 있습니다.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* AI 분석 결과 */}
              {aiResult && (
                <div style={{ background: '#fdfbf7', borderRadius: '20px', padding: '2rem', border: '2px solid #c19c72' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#5b272f', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      ✅ AI 분석 완료
                    </h4>
                    <span style={{
                      padding: '0.3rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: aiResult.category === 'NEWS' ? '#e8f5e9' : aiResult.category === 'SERMON' ? '#e3f2fd' : '#fff3e0',
                      color: aiResult.category === 'NEWS' ? '#2e7d32' : aiResult.category === 'SERMON' ? '#1565c0' : '#e65100',
                    }}>
                      {categoryLabel[aiResult.category] || aiResult.category}
                    </span>
                  </div>

                  {/* 미리보기 이미지 */}
                  {aiPreview && aiPreview !== 'video' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <img src={aiPreview} alt="업로드된 이미지" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '12px', border: '1px solid #e0d5c5' }} />
                    </div>
                  )}

                  {/* 분석 결과 필드 (수정 가능) */}
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div className={css.formGroup} style={{ marginBottom: 0 }}>
                      <label>카테고리</label>
                      <select
                        value={aiResult.category}
                        onChange={(e) => setAiResult({ ...aiResult, category: e.target.value })}
                      >
                        <option value="NEWS">📢 교회 소식</option>
                        <option value="SERMON">📺 설교 말씀</option>
                        <option value="SCHEDULE">🗓️ 예배 시간표</option>
                      </select>
                    </div>

                    {aiResult.category !== 'SCHEDULE' && (
                      <>
                        <div className={css.formGroup} style={{ marginBottom: 0 }}>
                          <label>제목</label>
                          <input value={aiResult.title || ''} onChange={(e) => setAiResult({ ...aiResult, title: e.target.value })} />
                        </div>
                        {aiResult.subcategory && (
                          <div className={css.formGroup} style={{ marginBottom: 0 }}>
                            <label>세부 카테고리</label>
                            <input value={aiResult.subcategory || ''} onChange={(e) => setAiResult({ ...aiResult, subcategory: e.target.value })} />
                          </div>
                        )}
                        <div className={css.formGroup} style={{ marginBottom: 0 }}>
                          <label>내용</label>
                          <textarea
                            value={aiResult.content || ''}
                            onChange={(e) => setAiResult({ ...aiResult, content: e.target.value })}
                            rows={8}
                            style={{ resize: 'vertical' }}
                          />
                        </div>
                      </>
                    )}

                    {aiResult.category === 'SCHEDULE' && aiResult.schedules?.length > 0 && (
                      <div>
                        <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', color: '#5b272f', marginBottom: '0.8rem' }}>추출된 예배 시간표</label>
                        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '12px', overflow: 'hidden' }}>
                          <thead>
                            <tr style={{ background: '#5b272f', color: 'white' }}>
                              <th style={{ padding: '0.8rem', textAlign: 'left' }}>예배명</th>
                              <th style={{ padding: '0.8rem', textAlign: 'center' }}>시간</th>
                              <th style={{ padding: '0.8rem', textAlign: 'center' }}>장소</th>
                              <th style={{ padding: '0.8rem', textAlign: 'center' }}>담당</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aiResult.schedules.map((s: any, i: number) => (
                              <tr key={i} style={{ background: i % 2 === 0 ? '#fdfbf7' : 'white', borderBottom: '1px solid #f0e8dc' }}>
                                <td style={{ padding: '0.8rem', fontWeight: 600 }}>{s.title}</td>
                                <td style={{ padding: '0.8rem', textAlign: 'center', color: '#c19c72' }}>{s.time}</td>
                                <td style={{ padding: '0.8rem', textAlign: 'center' }}>{s.place}</td>
                                <td style={{ padding: '0.8rem', textAlign: 'center' }}>{s.officer}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* 저장/취소 버튼 */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                    <button onClick={resetAi} className={css.logoutBtn}>취소</button>
                    <button
                      onClick={handleAiSave}
                      disabled={aiSaving}
                      className={css.saveBtn}
                      style={{ padding: '0.9rem 2.5rem' }}
                    >
                      {aiSaving ? '저장 중...' : '💾 홈페이지에 등록하기'}
                    </button>
                  </div>
                </div>
              )}

              {/* AI 기능 안내 */}
              <div style={{ marginTop: '2rem', padding: '1.5rem 2rem', background: '#fdf5ea', borderRadius: '16px', border: '1px solid #f5ead5' }}>
                <h4 style={{ margin: '0 0 1rem', color: '#5b272f', fontSize: '1rem' }}>💡 AI가 자동으로 처리하는 것들</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' }}>
                  {[
                    { icon: '📋', text: '주보 사진 → 교회 소식 텍스트 추출' },
                    { icon: '🎬', text: '설교 영상 → 제목·설교자 자동 입력' },
                    { icon: '⏰', text: '시간표 사진 → 예배 시간 일괄 등록' },
                    { icon: '📸', text: '행사 사진 → 소식 제목·설명 생성' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#666' }}>
                      <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 기존 콘텐츠 관리 영역 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#5b272f', borderLeft: '5px solid #c19c72', paddingLeft: '1rem' }}>
                  {activeTab === 'news' ? '📢 교회 소식' : activeTab === 'sermon' ? '📺 설교 말씀' : '🗓️ 예배 시간표'}
                  <span style={{ fontSize: '0.85rem', color: '#999', marginLeft: '0.8rem', fontWeight: 400 }}>
                    ({activeTab === 'news' ? newsItems.length : activeTab === 'sermon' ? sermons.length : schedules.length}개 등록됨)
                  </span>
                </h3>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  {(activeTab === 'news' ? newsItems : activeTab === 'sermon' ? sermons : schedules).length === 0 && (
                    <button className={css.logoutBtn} style={{ fontSize: '0.85rem' }} onClick={() => handleInitialize(activeTab)} disabled={saving}>
                      {saving ? '등록 중...' : '📥 기본 데이터 일괄 등록'}
                    </button>
                  )}
                  <button className={css.saveBtn} style={{ padding: '0.7rem 1.5rem' }} onClick={openAdd}>
                    + {activeTab === 'news' ? '소식' : activeTab === 'sermon' ? '설교' : '시간표'} 추가
                  </button>
                </div>
              </div>

              {/* 교회 소식 */}
              {activeTab === 'news' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
                  {displayNews.map((news, idx) => (
                    <div key={news.id} style={{ background: '#fdfbf7', border: '1px solid #f0e8dc', borderRadius: '16px', padding: '1.5rem', position: 'relative', transition: 'all 0.2s', opacity: isDefault(news.id) ? 0.65 : 1 }}>
                      {isDefault(news.id) && <div style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '0.7rem', background: '#f5ead5', padding: '2px 8px', borderRadius: '8px', color: '#b8860b' }}>기본값</div>}
                      {news.url && news.url.includes('/uploads/') && (
                        <img src={news.url} alt={news.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '0.8rem' }} />
                      )}
                      <h4 style={{ margin: '0 0 0.8rem', fontSize: '1.05rem', color: '#5b272f' }}>{idx + 1}. {news.title}</h4>
                      {news.content && <p style={{ margin: 0, fontSize: '0.88rem', color: '#666', whiteSpace: 'pre-line', lineHeight: 1.6, maxHeight: '120px', overflow: 'hidden' }}>{news.content}</p>}
                      {!isDefault(news.id) && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => openEdit(news, 'news')} style={{ padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>✏️ 수정</button>
                          <button onClick={() => handleDelete(news.id, 'content')} style={{ padding: '0.4rem 1rem', border: '1px solid #f5c6c6', borderRadius: '8px', background: '#fff5f5', cursor: 'pointer', fontSize: '0.8rem', color: '#e74c3c' }}>🗑️ 삭제</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 설교 말씀 */}
              {activeTab === 'sermon' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                  {displaySermons.map((sermon) => (
                    <div key={sermon.id} style={{ background: '#fdfbf7', border: '1px solid #f0e8dc', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', opacity: isDefault(sermon.id) ? 0.65 : 1 }}>
                      {isDefault(sermon.id) && <div style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '0.7rem', background: '#f5ead5', padding: '2px 8px', borderRadius: '8px', color: '#b8860b' }}>기본값</div>}
                      <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#f5ead5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                        {sermon.category === '큐티(QT) 안내' ? '🔗' : '📖'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#5b272f' }}>{sermon.category || '설교말씀'}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '2px' }}>{sermon.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '2px' }}>{sermon.content}</div>
                      </div>
                      {!isDefault(sermon.id) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <button onClick={() => openEdit(sermon, 'sermon')} style={{ padding: '0.3rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.75rem' }}>✏️</button>
                          <button onClick={() => handleDelete(sermon.id, 'content')} style={{ padding: '0.3rem 0.8rem', border: '1px solid #f5c6c6', borderRadius: '8px', background: '#fff5f5', cursor: 'pointer', fontSize: '0.75rem', color: '#e74c3c' }}>🗑️</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 예배 시간표 */}
              {activeTab === 'schedule' && (
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0e8dc' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#5b272f', color: 'white' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>예배 명칭</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 700 }}>시간</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 700 }}>장소</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 700 }}>담당</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, width: '100px' }}>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displaySchedules.map((schedule, idx) => (
                        <tr key={schedule.id} style={{ background: idx % 2 === 0 ? '#fdfbf7' : 'white', borderBottom: '1px solid #f0e8dc', opacity: isDefault(schedule.id) ? 0.65 : 1 }}>
                          <td style={{ padding: '1rem', fontWeight: 700, color: '#5b272f' }}>
                            {schedule.title}
                            {isDefault(schedule.id) && <span style={{ fontSize: '0.65rem', background: '#f5ead5', padding: '1px 6px', borderRadius: '6px', color: '#b8860b', marginLeft: '0.5rem' }}>기본</span>}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: '#c19c72', fontWeight: 600 }}>{schedule.time}</td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>{schedule.place}</td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: '#666', whiteSpace: 'nowrap' }}>{schedule.officer}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {!isDefault(schedule.id) ? (
                              <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                                <button onClick={() => openEdit(schedule, 'schedule')} style={{ padding: '0.3rem 0.6rem', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.75rem' }}>✏️</button>
                                <button onClick={() => handleDelete(schedule.id, 'schedule')} style={{ padding: '0.3rem 0.6rem', border: '1px solid #f5c6c6', borderRadius: '6px', background: '#fff5f5', cursor: 'pointer', fontSize: '0.75rem', color: '#e74c3c' }}>🗑️</button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#ccc' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(activeTab === 'news' ? newsItems : activeTab === 'sermon' ? sermons : schedules).length === 0 && (
                <div style={{ marginTop: '1.5rem', padding: '1.2rem 1.5rem', background: '#fdf5ea', borderRadius: '12px', border: '1px solid #f5ead5', fontSize: '0.9rem', color: '#b8860b' }}>
                  💡 현재 기본 데이터가 표시되고 있습니다. <strong>"기본 데이터 일괄 등록"</strong> 버튼을 눌러 DB에 저장하면, 이후 자유롭게 수정하고 삭제할 수 있습니다.
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ===== 편집 모달 ===== */}
      {editModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 2rem', fontSize: '1.4rem', color: '#5b272f' }}>
              {editModal.mode === 'edit' ? '✏️ 항목 수정' : '➕ 새 항목 추가'}
            </h3>
            {activeTab === 'schedule' ? (
              <div style={{ display: 'grid', gap: '1.2rem' }}>
                <div className={css.formGroup}><label>예배 명칭</label><input value={editModal.data.title || ''} onChange={e => updateField('title', e.target.value)} placeholder="예: 주일대예배 (1부)" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={css.formGroup}><label>예배 시간</label><input value={editModal.data.time || ''} onChange={e => updateField('time', e.target.value)} placeholder="예: 오전 11:00" /></div>
                  <div className={css.formGroup}><label>장소</label><input value={editModal.data.place || ''} onChange={e => updateField('place', e.target.value)} placeholder="예: 2층 본당" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={css.formGroup}><label>담당자</label><input value={editModal.data.officer || ''} onChange={e => updateField('officer', e.target.value)} placeholder="예: 이주민 목사" /></div>
                  <div className={css.formGroup}><label>정렬 순서</label><input type="number" value={editModal.data.order || '0'} onChange={e => updateField('order', e.target.value)} /></div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.2rem' }}>
                <div className={css.formGroup}><label>제목</label><input value={editModal.data.title || ''} onChange={e => updateField('title', e.target.value)} placeholder="제목을 입력하세요" /></div>
                {activeTab === 'sermon' && (
                  <div className={css.formGroup}><label>카테고리</label><input value={editModal.data.category || ''} onChange={e => updateField('category', e.target.value)} placeholder="예: 주일오전 설교, 수요예배 말씀" /></div>
                )}
                {activeTab === 'sermon' && (
                  <div className={css.formGroup}><label>유튜브 링크 (선택)</label><input value={editModal.data.url || ''} onChange={e => updateField('url', e.target.value)} placeholder="https://youtube.com/..." /></div>
                )}
                <div className={css.formGroup}>
                  <label>내용</label>
                  <textarea value={editModal.data.content || ''} onChange={e => updateField('content', e.target.value)} rows={6} placeholder={activeTab === 'news' ? '교회 소식 내용을 입력하세요.\n줄바꿈은 엔터(Enter)로 가능합니다.' : '설교자 이름 등 부가 정보'} style={{ resize: 'vertical' }} />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <button className={css.logoutBtn} onClick={() => setEditModal({ open: false, mode: 'add', data: {} })}>취소</button>
              <button className={css.saveBtn} disabled={saving} onClick={activeTab === 'schedule' ? handleScheduleSave : handleContentSave}>
                {saving ? '저장 중...' : '💾 저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 스피너 애니메이션 */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
