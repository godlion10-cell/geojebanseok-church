'use client';

import { useState, useMemo } from 'react';
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

export default function MemberManager({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleOpenModal = (member?: Member) => {
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
    setTimeout(() => {
      setEditId(null);
    }, 300); // Wait for transition
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

      {/* Modal - Rendered unconditionally but toggled via CSS class to preserve animations */}
      <div className={`${styles.modalOverlay} ${isModalOpen ? styles.active : ''}`}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>{editId ? '교인 정보 수정' : '새 교인 등록'}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>이름 (필수)</label>
              <input
                type="text"
                required
                className={styles.formInput}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
