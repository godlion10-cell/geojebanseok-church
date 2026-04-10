'use client';

import { useState, useMemo, useCallback } from 'react';
import { addMember, updateMember, deleteMember } from '@/app/actions/members';
import styles from './MemberManager.module.css';

type Member = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  dateOfBirth: Date | null;
  role: string;
  registrationDate: Date;
};

// ===== 스마트 붙여넣기 파서 =====
const ROLE_KEYWORDS = ['목사', '전도사', '장로', '권사', '안수집사', '집사', '성도', '청년', '교사', '사모', '부장'];

function parseSmartPaste(text: string): { name: string; role: string; phone: string; dateOfBirth: string } {
  const result = { name: '', role: '성도', phone: '', dateOfBirth: '' };
  if (!text || !text.trim()) return result;

  const trimmed = text.trim();

  // ====== 엑셀 탭 구분 데이터 감지 ======
  if (trimmed.includes('\t')) {
    const parts = trimmed.split('\t').map(p => p.trim()).filter(Boolean);
    // 엑셀 순서: [이름] [직분] [연락처] [생년월일]
    if (parts.length >= 1) result.name = parts[0];
    if (parts.length >= 2) {
      const maybeRole = parts[1];
      if (ROLE_KEYWORDS.some(r => maybeRole.includes(r))) {
        result.role = ROLE_KEYWORDS.find(r => maybeRole.includes(r)) || '성도';
      } else {
        // 직분이 아니면 연락처나 다른 데이터일 수 있음
        result.name = parts[0];
        // 두 번째 값이 전화번호인지 확인
        if (/\d{2,4}[-.]?\d{3,4}[-.]?\d{4}/.test(maybeRole)) {
          result.phone = formatPhone(maybeRole);
        }
      }
    }
    if (parts.length >= 3) {
      const p3 = parts[2];
      if (/\d{2,4}[-.]?\d{3,4}[-.]?\d{4}/.test(p3)) {
        result.phone = formatPhone(p3);
      } else if (parseDateString(p3)) {
        result.dateOfBirth = parseDateString(p3)!;
      }
    }
    if (parts.length >= 4) {
      const p4 = parts[3];
      if (parseDateString(p4)) {
        result.dateOfBirth = parseDateString(p4)!;
      } else if (/\d{2,4}[-.]?\d{3,4}[-.]?\d{4}/.test(p4)) {
        result.phone = formatPhone(p4);
      }
    }
    return result;
  }

  // ====== 카톡/메모장 자유 형식 파싱 ======
  const tokens = trimmed.replace(/[,\/|]/g, ' ').split(/\s+/);

  for (const token of tokens) {
    // 1. 전화번호 추출 (하이픈 유무 무관)
    if (!result.phone && /^0\d{1,2}[-.]?\d{3,4}[-.]?\d{4}$/.test(token)) {
      result.phone = formatPhone(token);
      continue;
    }
    // 전화번호가 붙어있는 경우 (01012345678)
    if (!result.phone && /^01[016789]\d{7,8}$/.test(token)) {
      result.phone = formatPhone(token);
      continue;
    }

    // 2. 생년월일 추출
    if (!result.dateOfBirth) {
      const parsed = parseDateString(token);
      if (parsed) {
        result.dateOfBirth = parsed;
        continue;
      }
    }

    // 3. 직분 키워드 매칭
    const matchedRole = ROLE_KEYWORDS.find(r => token === r || token.endsWith(r));
    if (matchedRole && result.role === '성도') {
      result.role = matchedRole;
      // 직분 앞에 이름이 붙어있는 경우 (예: "홍길동집사")
      const nameBeforeRole = token.replace(matchedRole, '').trim();
      if (nameBeforeRole && /^[가-힣]{2,5}$/.test(nameBeforeRole) && !result.name) {
        result.name = nameBeforeRole;
      }
      continue;
    }

    // 4. 한글 이름 (2~5자)
    if (!result.name && /^[가-힣]{2,5}$/.test(token)) {
      result.name = token;
      continue;
    }
  }

  // 전체 텍스트에서 연속된 전화번호 패턴 재시도
  if (!result.phone) {
    const phoneMatch = trimmed.replace(/\s/g, '').match(/0\d{1,2}\d{3,4}\d{4}/);
    if (phoneMatch) result.phone = formatPhone(phoneMatch[0]);
  }

  return result;
}

// 전화번호 포맷 (010-1234-5678 형태)
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return raw;
}

// 날짜 문자열 파싱 → YYYY-MM-DD
function parseDateString(raw: string): string | null {
  const cleaned = raw.replace(/\D/g, '');

  // 8자리: 19990101 or 20010305
  if (/^\d{8}$/.test(cleaned)) {
    const y = cleaned.slice(0, 4);
    const m = cleaned.slice(4, 6);
    const d = cleaned.slice(6, 8);
    if (+m >= 1 && +m <= 12 && +d >= 1 && +d <= 31) return `${y}-${m}-${d}`;
  }

  // 6자리: 990101 → 1999-01-01
  if (/^\d{6}$/.test(cleaned)) {
    let y = +cleaned.slice(0, 2);
    const m = cleaned.slice(2, 4);
    const d = cleaned.slice(4, 6);
    y = y >= 0 && y <= 30 ? 2000 + y : 1900 + y;
    if (+m >= 1 && +m <= 12 && +d >= 1 && +d <= 31) return `${y}-${m}-${d}`;
  }

  // 점 또는 하이픈 구분 날짜: 1999.01.01, 99-01-01
  const dotMatch = raw.match(/^(\d{2,4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (dotMatch) {
    let y = +dotMatch[1];
    const m = dotMatch[2].padStart(2, '0');
    const d = dotMatch[3].padStart(2, '0');
    if (y < 100) y = y >= 0 && y <= 30 ? 2000 + y : 1900 + y;
    if (+m >= 1 && +m <= 12 && +d >= 1 && +d <= 31) return `${y}-${m}-${d}`;
  }

  return null;
}

export default function MemberManager({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smartPasteHint, setSmartPasteHint] = useState('');
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    role: '성도',
  });

  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      m.name.includes(searchQuery) ||
      m.role.includes(searchQuery) ||
      (m.phone && m.phone.includes(searchQuery))
    );
  }, [members, searchQuery]);

  // ===== 스마트 붙여넣기 핸들러 =====
  const handleSmartPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted || !pasted.trim()) return;

    // 단순한 값 (이름만, 번호만 등)은 기본 동작 유지
    const hasMultipleFields = pasted.includes('\t') || 
      (pasted.trim().split(/\s+/).length >= 2 && /[가-힣]/.test(pasted) && /\d/.test(pasted));

    if (!hasMultipleFields) return; // 단일 값이면 기본 붙여넣기

    e.preventDefault(); // 기본 붙여넣기 차단

    const parsed = parseSmartPaste(pasted);
    const newForm = { ...formData };
    
    if (parsed.name) newForm.name = parsed.name;
    if (parsed.role !== '성도' || !newForm.role) newForm.role = parsed.role;
    if (parsed.phone) newForm.phone = parsed.phone;
    if (parsed.dateOfBirth) newForm.dateOfBirth = parsed.dateOfBirth;

    setFormData(newForm);

    // 사용자에게 피드백
    const filled = [];
    if (parsed.name) filled.push(`이름: ${parsed.name}`);
    if (parsed.role !== '성도') filled.push(`직분: ${parsed.role}`);
    if (parsed.phone) filled.push(`연락처: ${parsed.phone}`);
    if (parsed.dateOfBirth) filled.push(`생년월일: ${parsed.dateOfBirth}`);
    
    if (filled.length > 0) {
      setSmartPasteHint(`✅ 자동 입력됨 → ${filled.join(', ')}`);
      setTimeout(() => setSmartPasteHint(''), 4000);
    }
  }, [formData]);

  const handleOpenModal = (member?: Member) => {
    setSmartPasteHint('');
    if (member) {
      setEditId(member.id);
      setFormData({
        name: member.name,
        phone: member.phone || '',
        address: member.address || '',
        dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
        role: member.role,
      });
    } else {
      setEditId(null);
      setFormData({
        name: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        role: '성도',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSmartPasteHint('');
    setTimeout(() => {
      setEditId(null);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editId) {
        const res = await updateMember(editId, formData);
        if (res.success && res.data) {
          setMembers(members.map((m) => (m.id === editId ? res.data : m)));
          handleCloseModal();
        } else {
          alert(res.error || '수정 중 오류가 발생했습니다.');
        }
      } else {
        const res = await addMember(formData);
        if (res.success && res.data) {
          setMembers([res.data, ...members]);
          handleCloseModal();
        } else {
          alert(res.error || '추가 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error(error);
      alert('요청 처리 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`'${name}' 님의 정보를 정말 삭제하시겠습니까?`)) {
      const res = await deleteMember(id);
      if (res.success) {
        setMembers(members.filter((m) => m.id !== id));
      } else {
        alert(res.error || '삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableHeader}>
        <input
          type="text"
          placeholder="이름, 직분, 연락처로 검색..."
          className={styles.searchBar}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className={styles.primaryBtn} onClick={() => handleOpenModal()}>
          + 새 교인 등록
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.memberTable}>
          <thead>
            <tr>
              <th>이름</th>
              <th>직분</th>
              <th>연락처</th>
              <th>생년월일</th>
              <th>등록일</th>
              <th style={{ textAlign: 'right' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td style={{ fontWeight: 600 }}>{member.name}</td>
                  <td>
                    <span className={styles.roleBadge}>{member.role}</span>
                  </td>
                  <td>{member.phone || '-'}</td>
                  <td>
                    {member.dateOfBirth
                      ? new Date(member.dateOfBirth).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td>{new Date(member.registrationDate).toLocaleDateString('ko-KR')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => handleOpenModal(member)}
                      >
                        수정
                      </button>
                      <button
                        className={styles.dangerBtn}
                        onClick={() => handleDelete(member.id, member.name)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888' }}>
                  {searchQuery ? '검색된 교인이 없습니다.' : '등록된 교인이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <div className={`${styles.modalOverlay} ${isModalOpen ? styles.active : ''}`}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>{editId ? '교인 정보 수정' : '새 교인 등록'}</h2>
          
          {/* 스마트 붙여넣기 안내 */}
          {!editId && (
            <div style={{
              background: 'linear-gradient(135deg, #f0f7ff, #e8f4fd)',
              border: '1px solid #c5ddf5',
              borderRadius: '10px',
              padding: '0.7rem 1rem',
              marginBottom: '1.2rem',
              fontSize: '0.82rem',
              color: '#4a7ab5',
              lineHeight: 1.6,
            }}>
              💡 <strong>스마트 붙여넣기:</strong> 카톡이나 엑셀에서 복사한 텍스트를 아무 칸에 붙여넣으면 자동으로 분류됩니다.
            </div>
          )}

          {/* 스마트 붙여넣기 결과 피드백 */}
          {smartPasteHint && (
            <div style={{
              background: '#f0faf0',
              border: '1px solid #b5e2b5',
              borderRadius: '10px',
              padding: '0.6rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              color: '#2d7a2d',
              fontWeight: 600,
              animation: 'fadeIn 0.3s ease',
            }}>
              {smartPasteHint}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>이름 (필수)</label>
              <input
                type="text"
                required
                className={styles.formInput}
                placeholder="이름을 입력하거나, 전체 정보를 붙여넣기 하세요"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onPaste={handleSmartPaste}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>직분</label>
              <select
                className={styles.formInput}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="목사">목사</option>
                <option value="전도사">전도사</option>
                <option value="장로">장로</option>
                <option value="권사">권사</option>
                <option value="안수집사">안수집사</option>
                <option value="집사">집사</option>
                <option value="성도">성도</option>
                <option value="청년">청년</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>연락처 (선택)</label>
              <input
                type="tel"
                className={styles.formInput}
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onPaste={handleSmartPaste}
              />
            </div>

            <div className={styles.formGroup}>
              <label>생년월일 (선택)</label>
              <input
                type="date"
                className={styles.formInput}
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>주소 (선택)</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="거제시..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                onPaste={handleSmartPaste}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handleCloseModal}
                disabled={isSubmitting}
                style={{ padding: '0.6rem 1.2rem', fontSize: '1rem' }}
              >
                취소
              </button>
              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? '처리 중...' : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
