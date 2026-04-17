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
            return NextResponse.json({
              live: true,
              videoId: searchData.items[0].id.videoId,
              title: searchData.items[0].snippet.title,
              method: 'youtube-data-api',
            });
          }
          // API 정상 + 라이브 없음 → live: false
          // 아래 RSS로 최신 videoId라도 가져옴
        }
      } catch (e) {
        console.error('YouTube Data API error:', e);
      }
    }

    // ========================================
    // RSS에서 최신 비디오 ID 가져오기
    // ========================================
    let latestVideoId = '';
    let videoTitle = '';
    try {
      const rssRes = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
        { cache: 'no-store' }
      );
      const xml = await rssRes.text();
      const videoIdMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatches = xml.match(/<title>([^<]+)<\/title>/g);
      if (videoIdMatch) latestVideoId = videoIdMatch[1];
      if (titleMatches && titleMatches.length > 1) {
        videoTitle = titleMatches[1].replace(/<\/?title>/g, '');
      }
    } catch (e) {
      console.error('RSS fetch error:', e);
    }

    if (!latestVideoId) {
      return NextResponse.json({ live: false, videoId: null, reason: 'No video found' });
    }

    // ========================================
    // 방법 2: 라이브 썸네일로 라이브 여부 확인
    // YouTube는 라이브 중인 영상에만 hqdefault_live.jpg를 제공
    // ========================================
    try {
      const thumbRes = await fetch(
        `https://i.ytimg.com/vi/${latestVideoId}/hqdefault_live.jpg`,
        { method: 'HEAD', cache: 'no-store' }
      );

      if (thumbRes.ok && thumbRes.status === 200) {
        return NextResponse.json({
          live: true,
          videoId: latestVideoId,
          title: videoTitle,
          method: 'live-thumbnail',
        });
      }
    } catch {
      // 썸네일 체크 실패 → 라이브 아님으로 판단
    }

    // 라이브가 아님
    return NextResponse.json({
      live: false,
      videoId: latestVideoId,
      title: videoTitle,
      method: 'rss',
    });

  } catch (error: any) {
    return NextResponse.json({ live: false, videoId: null, error: error.message });
  }
}
