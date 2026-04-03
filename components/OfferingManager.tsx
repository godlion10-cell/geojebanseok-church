'use client';

import { useState, useMemo } from 'react';
import { addOffering, updateOffering, deleteOffering } from '@/app/actions/offerings';
import styles from './OfferingManager.module.css';

type SimpleMember = {
  id: string;
  name: string;
  role: string;
};

type Offering = {
  id: string;
  memberId: string;
  member: SimpleMember;
  date: Date;
  amount: number;
  offeringType: string;
  createdAt: Date;
};

export default function OfferingManager({ 
  initialOfferings, 
  membersList 
}: { 
  initialOfferings: Offering[];
  membersList: SimpleMember[];
}) {
  const [offerings, setOfferings] = useState<Offering[]>(initialOfferings);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    memberId: membersList.length > 0 ? membersList[0].id : '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    offeringType: '십일조',
  });

  const filteredOfferings = useMemo(() => {
    return offerings.filter((o) =>
      o.member.name.includes(searchQuery) ||
      o.offeringType.includes(searchQuery)
    );
  }, [offerings, searchQuery]);

  const handleOpenModal = (o?: Offering) => {
    if (o) {
      setEditId(o.id);
      setFormData({
        memberId: o.memberId,
        date: new Date(o.date).toISOString().split('T')[0],
        amount: o.amount.toString(),
        offeringType: o.offeringType,
      });
    } else {
      setEditId(null);
      setFormData({
        memberId: membersList.length > 0 ? membersList[0].id : '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        offeringType: '십일조',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditId(null);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId) {
      alert('교인을 먼저 선택해주세요. 등록된 교인이 없다면 교인 관리에서 추가해주세요.');
      return;
    }

    setIsSubmitting(true);
    const submitData = {
      ...formData,
      amount: parseInt(formData.amount.replace(/,/g, ''), 10) || 0,
    };

    try {
      if (editId) {
        const res = await updateOffering(editId, submitData);
        if (res.success && res.data) {
          setOfferings(offerings.map((o) => (o.id === editId ? res.data as Offering : o)));
          handleCloseModal();
        } else {
          alert(res.error || '수정 중 오류가 발생했습니다.');
        }
      } else {
        const res = await addOffering(submitData);
        if (res.success && res.data) {
          setOfferings([res.data as Offering, ...offerings]);
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

  const handleDelete = async (id: string, name: string, type: string) => {
    if (confirm(`${name} 교인님의 '${type}' 헌금 내역을 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      const res = await deleteOffering(id);
      if (res.success) {
        setOfferings(offerings.filter((o) => o.id !== id));
      } else {
        alert(res.error || '삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 100,000 포맷을 위한 유틸함수
  const formatAmount = (num: number) => new Intl.NumberFormat('ko-KR').format(num) + ' 원';

  return (
    <div className={styles.container}>
      <div className={styles.tableHeader}>
        <input
          type="text"
          placeholder="교인 이름, 헌금 종류(예: 십일조) 검색..."
          className={styles.searchBar}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className={styles.primaryBtn} onClick={() => handleOpenModal()}>
          + 새 헌금 내역 등록
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.offeringTable}>
          <thead>
            <tr>
              <th>헌금 일자</th>
              <th>교인명</th>
              <th>헌금 종류</th>
              <th style={{ textAlign: 'right' }}>금액</th>
              <th style={{ textAlign: 'right' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredOfferings.length > 0 ? (
              filteredOfferings.map((o) => (
                <tr key={o.id}>
                  <td>{new Date(o.date).toLocaleDateString('ko-KR')}</td>
                  <td style={{ fontWeight: 600 }}>
                    {o.member.name} <span style={{ fontSize: '0.85em', color: '#666', fontWeight: 400 }}>({o.member.role})</span>
                  </td>
                  <td>
                    <span className={styles.typeBadge}>{o.offeringType}</span>
                  </td>
                  <td className={styles.amountCell}>
                    {formatAmount(o.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => handleOpenModal(o)}
                      >
                        수정
                      </button>
                      <button
                        className={styles.dangerBtn}
                        onClick={() => handleDelete(o.id, o.member.name, o.offeringType)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888' }}>
                  {searchQuery ? '검색된 내역이 없습니다.' : '등록된 헌금 내역이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <div className={`${styles.modalOverlay} ${isModalOpen ? styles.active : ''}`}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>{editId ? '헌금 내역 수정' : '새 헌금 내역 등록'}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>교인명 (필수)</label>
              <select
                required
                className={styles.formInput}
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              >
                <option value="" disabled>-- 교인 선택 --</option>
                {membersList.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>헌금 종류</label>
              <select
                className={styles.formInput}
                value={formData.offeringType}
                onChange={(e) => setFormData({ ...formData, offeringType: e.target.value })}
              >
                <option value="십일조">십일조</option>
                <option value="감사헌금">감사헌금</option>
                <option value="주일헌금">주일헌금</option>
                <option value="건축헌금">건축헌금</option>
                <option value="선교헌금">선교헌금</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>헌금 일자</label>
              <input
                type="date"
                required
                className={styles.formInput}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>금액 (원)</label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                className={styles.formInput}
                placeholder="예: 50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
