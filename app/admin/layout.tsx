"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>반석교회 관리자</div>
        <nav className={styles.navLinks}>
          <Link 
            href="/admin" 
            className={`${styles.link} ${pathname === '/admin' ? styles.activeLink : ''}`}
          >
            대시보드 홈
          </Link>
          <Link 
            href="/admin/members" 
            className={`${styles.link} ${pathname === '/admin/members' ? styles.activeLink : ''}`}
          >
            교인 관리
          </Link>
          <Link 
            href="/admin/offerings" 
            className={`${styles.link} ${pathname === '/admin/offerings' ? styles.activeLink : ''}`}
          >
            헌금 관리
          </Link>
          <Link 
            href="/admin/cms" 
            className={`${styles.link} ${pathname === '/admin/cms' ? styles.activeLink : ''}`}
          >
            콘텐츠 관리 (CMS)
          </Link>
          <div style={{ marginTop: 'auto', padding: '1rem 2rem' }}>
            <Link href="/" style={{ color: '#928747', fontSize: '0.9rem', textDecoration: 'underline' }}>
              &larr; 홈페이지로 돌아가기
            </Link>
          </div>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
