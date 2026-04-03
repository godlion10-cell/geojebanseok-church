import styles from '../layout.module.css';
import { getMembers } from '@/app/actions/members';
import MemberManager from '@/components/MemberManager';

export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const result = await getMembers();
  const initialMembers = result.success && result.data ? result.data : [];

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>교인 관리</h1>
      </div>
      <div className={styles.dashboardCard}>
        <MemberManager initialMembers={initialMembers} />
      </div>
    </>
  );
}
