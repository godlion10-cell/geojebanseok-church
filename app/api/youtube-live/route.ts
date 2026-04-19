import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CHANNEL_ID = 'UCc_eP0i4YwSQmQ9du5-RHbA';
const CHANNEL_HANDLE = 'petros-church';

// 예배 시간 체크 (서버 측 - KST 기준)
function isWorshipTime(): boolean {
  // KST = UTC+9
  const now = new Date();
  const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
  const day = kst.getDay();
  const t = kst.getHours() * 60 + kst.getMinutes();
  return (
    (day === 0 && t >= 520 && t <= 640) ||   // 주일 1부 08:40~10:40
    (day === 0 && t >= 630 && t <= 760) ||   // 주일 2부 10:30~12:40
    (day === 0 && t >= 820 && t <= 940) ||   // 주일 오후 13:40~15:40
    (day === 3 && t >= 1150 && t <= 1270) || // 수요 저녁 19:10~21:10
    (day === 5 && t >= 1180 && t <= 1300) || // 금요 기도회 19:40~21:40
    (day >= 1 && day <= 6 && t >= 310 && t <= 400) // 새벽예배 05:10~06:40
  );
}

export async function GET() {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    // === 방법 1: YouTube Data API v3 (가장 정확, API 키 필요) ===
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
          // API 정상 응답 + 라이브 없음
          return NextResponse.json({
            live: false,
            videoId: null,
            title: '',
            method: 'youtube-data-api',
          });
        }
      } catch (e) {
        console.error('YouTube Data API error:', e);
      }
    }

    // === 방법 2: 채널 라이브 페이지 스크래핑 (API 키 불필요) ===
    try {
      const livePageRes = await fetch(
        `https://www.youtube.com/@${CHANNEL_HANDLE}/live`,
        {
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        }
      );

      if (livePageRes.ok) {
        const html = await livePageRes.text();

        // 라이브 중인 비디오 ID 추출 방법들
        let videoId: string | null = null;
        let title: string | null = null;

        // 방법 2-1: canonical URL에서 video ID 추출
        const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
        if (canonicalMatch) {
          videoId = canonicalMatch[1];
        }

        // 방법 2-2: og:url meta tag에서 추출
        if (!videoId) {
          const ogUrlMatch = html.match(/<meta\s+property="og:url"\s+content="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
          if (ogUrlMatch) {
            videoId = ogUrlMatch[1];
          }
        }

        // 방법 2-3: videoId 패턴 매칭
        if (!videoId) {
          const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
          if (videoIdMatch) {
            videoId = videoIdMatch[1];
          }
        }

        // 제목 추출
        const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/);
        if (titleMatch) {
          title = titleMatch[1];
        }

        // 라이브 여부 확인: 페이지 내에서 라이브 관련 시그널 찾기
        const isLiveIndicator =
          html.includes('"isLive":true') ||
          html.includes('"isLiveContent":true') ||
          html.includes('"liveBroadcastDetails"') ||
          html.includes('"isLiveNow":true') ||
          (html.includes('"style":"LIVE"') && html.includes('"isLive"'));

        if (videoId && isLiveIndicator) {
          return NextResponse.json({
            live: true,
            videoId,
            title: title || '',
            method: 'channel-scrape',
          });
        }

        // 스크래핑은 성공했지만 라이브 시그널 없음
        // 예배 시간이면 비디오 ID가 있으면 일단 라이브로 표시 (스크래핑이 완벽하지 않을 수 있음)
        if (videoId && isWorshipTime()) {
          return NextResponse.json({
            live: true,
            videoId,
            title: title || '',
            method: 'channel-scrape-worship-time',
          });
        }

        return NextResponse.json({
          live: false,
          videoId: videoId || null,
          title: title || '',
          method: 'channel-scrape',
        });
      }
    } catch (e) {
      console.error('Channel page scrape error:', e);
    }

    // === 방법 3: 예배 시간이면 채널 라이브 임베드를 직접 사용 ===
    if (isWorshipTime()) {
      return NextResponse.json({
        live: true,
        videoId: null,  // videoId가 null이면 channel embed 사용
        title: '실시간 예배',
        method: 'worship-time-fallback',
      });
    }

    // 아무 방법도 안 되면 비라이브
    return NextResponse.json({
      live: false,
      videoId: null,
      title: '',
      method: 'none',
    });

  } catch (error: any) {
    // 에러 시에도 예배 시간이면 라이브로 처리
    if (isWorshipTime()) {
      return NextResponse.json({
        live: true,
        videoId: null,
        title: '실시간 예배',
        method: 'error-worship-fallback',
      });
    }
    return NextResponse.json({ live: false, videoId: null, error: error.message });
  }
}
