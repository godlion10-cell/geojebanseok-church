import styles from './layout.module.css';

export default function AdminDashboard() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>관리자 대시보드</h1>
      </div>
      <div className={styles.dashboardCard}>
        <h2>환영합니다</h2>
        <p style={{ marginTop: '1rem', color: '#666' }}>좌측 메뉴에서 관리할 항목을 선택해주세요.</p>
      </div>
    </>
  );
}
