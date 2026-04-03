import HomeClient from './HomeClient';
import { getContentItems } from './actions/content';
import { getSchedules } from './actions/schedule';

export const revalidate = 0; // 실시간 반영을 위해 캐시 무효화

export default async function Home() {
  // DB에서 데이터 가져오기
  const [newsRes, sermonRes, scheduleRes] = await Promise.all([
    getContentItems('NEWS'),
    getContentItems('SERMON'),
    getSchedules()
  ]);

  const newsItems = newsRes.success ? newsRes.data || [] : [];
  const sermons = sermonRes.success ? sermonRes.data || [] : [];
  const schedules = scheduleRes.success ? scheduleRes.data || [] : [];

  return (
    <HomeClient 
      newsItems={newsItems} 
      sermons={sermons} 
      schedules={schedules} 
    />
  );
}
