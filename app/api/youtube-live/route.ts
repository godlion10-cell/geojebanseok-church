import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CHANNEL_ID = 'UCc_eP0i4YwSQmQ9du5-RHbA';

export async function GET() {
  try {
    // ========================================
    // 방법 1: YouTube Data API v3 (가장 정확)
    // ========================================
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (API_KEY) {
      try {
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`,
          { cache: 'no-store' }
        );
        
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          
          if (searchData.items && searchData.items.length > 0) {
            const liveItem = searchData.items[0];
            const videoId = liveItem.id.videoId;
            const title = liveItem.snippet.title;
            
            return NextResponse.json({
              live: true,
              videoId,
              title,
              embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
              method: 'youtube-data-api',
            });
          }
          
          // API 정상 응답 + 라이브 없음 → 최신 RSS 비디오라도 제공
        }
      } catch (apiError) {
        console.error('YouTube Data API failed:', apiError);
      }
    }

    // ========================================
    // 방법 2: RSS에서 최신 비디오 ID 가져오기
    // 예배 시간이면 클라이언트가 이 영상을 임베드함
    // (라이브 중이면 이 영상 자체가 라이브 영상)
    // ========================================
    try {
      const rssRes = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
        { cache: 'no-store' }
      );
      const xml = await rssRes.text();
      const rssMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = xml.match(/<title>([^<]+)<\/title>/g);
      
      if (rssMatch && rssMatch[1]) {
        // 두 번째 title이 최신 영상의 제목 (첫 번째는 채널 이름)
        const videoTitle = titleMatch && titleMatch.length > 1 
          ? titleMatch[1].replace(/<\/?title>/g, '') 
          : '반석교회 예배';
        
        return NextResponse.json({
          live: false,
          videoId: rssMatch[1],
          title: videoTitle,
          method: 'rss',
        });
      }
    } catch {
      // RSS 실패
    }

    return NextResponse.json({ live: false, reason: 'No video found' });

  } catch (error: any) {
    return NextResponse.json({ live: false, error: error.message });
  }
}
