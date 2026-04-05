import styles from '../layout.module.css';
import { getOfferings } from '@/app/actions/offerings';
import { getMembers } from '@/app/actions/members';
import OfferingManager from '@/components/OfferingManager';

export const dynamic = 'force-dynamic';

export default async function OfferingsPage() {
  const [offeringsRes, membersRes] = await Promise.all([
    getOfferings(),
    getMembers(),
  ]);

  const initialOfferings = offeringsRes.success && offeringsRes.data ? offeringsRes.data : [];
  
  // 교인 목록은 id, name, role 만 추출하여 가볍게 전달
  const membersList = (membersRes.success && (membersRes.data as any) ? (membersRes.data as any) : []).map((m: any) => ({
    id: m.id,
    name: m.name,
    role: m.role,
  }));

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>헌금 관리</h1>
      </div>
      <div className={styles.dashboardCard}>
        <OfferingManager 
          initialOfferings={initialOfferings} 
          membersList={membersList} 
        />
      </div>
    </>
  );
}
