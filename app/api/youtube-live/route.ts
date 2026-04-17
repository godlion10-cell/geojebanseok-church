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
        // search API로 현재 라이브 영상 검색
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
          
          // API가 정상 응답했지만 라이브 영상이 없음 → 확실히 라이브 아님
          return NextResponse.json({ 
            live: false, 
            reason: 'No live stream found via YouTube Data API',
            method: 'youtube-data-api',
          });
        }
      } catch (apiError) {
        // API 실패 시 다음 방법으로 폴백
        console.error('YouTube Data API failed:', apiError);
      }
    }

    // ========================================
    // 방법 2: 채널 /live 페이지 HTML 스크래핑
    // ========================================
    try {
      const res = await fetch(`https://www.youtube.com/channel/${CHANNEL_ID}/live`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        cache: 'no-store',
      });

      const html = await res.text();

      // ytInitialPlayerResponse에서 라이브 여부 확인
      const playerResMatch = html.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]+?})\s*;/);
      if (playerResMatch) {
        try {
          const playerRes = JSON.parse(playerResMatch[1]);
          const videoDetails = playerRes.videoDetails;

          // isLiveContent가 true이고, 실제로 현재 라이브 중인지 확인
          if (videoDetails && videoDetails.isLiveContent) {
            // isLive 필드 또는 playability에서 실시간 여부 확인
            const isCurrentlyLive = 
              playerRes.microformat?.playerMicroformatRenderer?.liveBroadcastDetails?.isLiveNow === true ||
              html.includes('"isLive":true') ||
              html.includes('"isLiveBroadcast":true');

            if (isCurrentlyLive) {
              const videoId = videoDetails.videoId;
              const title = videoDetails.title;
              return NextResponse.json({
                live: true,
                videoId,
                title,
                embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
                method: 'html-scraping',
              });
            }
          }
        } catch {
          // JSON 파싱 실패 시 다음 방법으로
        }
      }

      // canonical URL + 라이브 힌트 확인
      const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
      if (canonicalMatch) {
        const videoId = canonicalMatch[1];
        // 실제 라이브 중인지 확인하는 강화된 검증
        const isLiveHint = 
          html.includes('"isLiveBroadcast":true') && 
          (html.includes('"isLive":true') || html.includes('"isLiveNow":true'));
        
        if (isLiveHint) {
          return NextResponse.json({
            live: true,
            videoId,
            title: '반석교회 실시간 예배',
            embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
            method: 'canonical-url',
          });
        }
      }
    } catch (scrapeError) {
      console.error('Channel page scraping failed:', scrapeError);
    }

    // ========================================
    // 방법 3: RSS에서 최신 videoId만 제공 (라이브 아님!)
    // ========================================
    // RSS에서는 라이브 여부를 알 수 없으므로
    // 최신 영상 ID만 참고용으로 내려줌 (live: false)
    try {
      const rssRes = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
        { cache: 'no-store' }
      );
      const xml = await rssRes.text();
      const rssMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      if (rssMatch && rssMatch[1]) {
        return NextResponse.json({
          live: false,
          latestVideoId: rssMatch[1],
          reason: 'No live stream detected. Latest video ID provided for reference.',
          method: 'rss-fallback',
        });
      }
    } catch {
      // RSS도 실패
    }

    return NextResponse.json({ live: false, reason: 'No live stream detected' });

  } catch (error: any) {
    return NextResponse.json({ live: false, error: error.message });
  }
}
