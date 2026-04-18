import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CHANNEL_ID = 'UCc_eP0i4YwSQmQ9du5-RHbA';

export async function GET() {
  try {
    // ========================================
    // YouTube Data API v3로 라이브 여부 확인 (가장 정확)
    // ========================================
    const API_KEY = process.env.YOUTUBE_API_KEY;
    
    // RSS에서 최신 비디오 ID 가져오기 (항상 필요)
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

    if (API_KEY) {
      try {
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`,
          { cache: 'no-store' }
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.items && searchData.items.length > 0) {
            // ✅ YouTube Data API가 실제 라이브를 확인함
            return NextResponse.json({
              live: true,
              videoId: searchData.items[0].id.videoId,
              title: searchData.items[0].snippet.title,
              method: 'youtube-data-api',
            });
          }
          // API 정상 응답 + 라이브 없음 → live: false
          return NextResponse.json({
            live: false,
            videoId: latestVideoId || null,
            title: videoTitle,
            method: 'youtube-data-api',
          });
        }
      } catch (e) {
        console.error('YouTube Data API error:', e);
      }
    }

    // API Key가 없거나 API 오류 시 → 라이브 아닌 것으로 처리
    return NextResponse.json({
      live: false,
      videoId: latestVideoId || null,
      title: videoTitle,
      method: 'rss-only',
    });

  } catch (error: any) {
    return NextResponse.json({ live: false, videoId: null, error: error.message });
  }
}
