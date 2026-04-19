import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CHANNEL_ID = 'UCc_eP0i4YwSQmQ9du5-RHbA';
const CHANNEL_HANDLE = 'petros-church';

// 예배 시간 체크 (서버 측 - KST 기준)
function isWorshipTime(): boolean {
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
    // 🔴 새벽기도 추가 (월~금요일, 05:25 ~ 06:20)
    (day >= 1 && day <= 5 && t >= 325 && t <= 380) 
  );
}

/**
 * 채널 /live 페이지의 canonical URL에서 실제 라이브 비디오 ID를 추출
 * + oEmbed API로 우리 채널 영상인지 검증
 */
async function getVideoIdFromChannelLive(): Promise<{ videoId: string; title: string; debug?: string } | null> {
  try {
    const livePageRes = await fetch(
      `https://www.youtube.com/@${CHANNEL_HANDLE}/live`,
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Cookie': 'CONSENT=PENDING+987; SOCS=CAESEwgDEgk2MTcyNTcyNTIaAmVuIAEaBgiA_LyaBg',
        },
      }
    );

    if (!livePageRes.ok) {
      console.log(`[scrape] HTTP ${livePageRes.status}`);
      return null;
    }
    const html = await livePageRes.text();
    console.log(`[scrape] HTML length: ${html.length}`);

    // 실제 라이브 방송 중인지 확인
    // "isLive":true는 채널에 라이브URL이 있으면 항상 true이므로 사용 불가
    // BADGE_STYLE_TYPE_LIVE_NOW가 실제 방송 중일 때만 나타남
    const isActuallyLive = html.includes('BADGE_STYLE_TYPE_LIVE_NOW');
    if (!isActuallyLive) {
      console.log('[scrape] Not actually live (no LIVE_NOW badge)');
      return null;
    }

    // canonical URL에서 비디오 ID 추출
    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([^"&]+)"/);
    if (!canonicalMatch) {
      // og:url도 시도
      const ogMatch = html.match(/<meta\s+property="og:url"\s+content="https:\/\/www\.youtube\.com\/watch\?v=([^"&]+)"/);
      if (!ogMatch) {
        console.log(`[scrape] No canonical or og:url found. Has consent: ${html.includes('consent.youtube.com')}`);
        // 마지막 시도: 제목에서 videoId 패턴 찾기
        const titleVideoId = html.match(/"videoId":"([a-zA-Z0-9_-]{11})","title":"[^"]*반석/);
        if (titleVideoId) {
          return { videoId: titleVideoId[1], title: '' };
        }
        return null;
      }
      const videoId = ogMatch[1];
      console.log(`[scrape] Found via og:url: ${videoId}`);
      return { videoId, title: '' };
    }
    const videoId = canonicalMatch[1];
    console.log(`[scrape] Found via canonical: ${videoId}`);

    // oEmbed API로 이 비디오가 우리 채널의 것인지 검증
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { cache: 'no-store' }
      );

      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        const authorUrl = (oembedData.author_url || '').toLowerCase();
        const authorName = (oembedData.author_name || '').toLowerCase();

        const isOurChannel =
          authorUrl.includes(CHANNEL_HANDLE) ||
          authorName.includes('반석') ||
          authorName.includes('petros');

        if (!isOurChannel) {
          console.log(`[scrape] Wrong channel: ${oembedData.author_name}`);
          return null;
        }

        return { videoId, title: oembedData.title || '' };
      }
    } catch (_e) {
      // oEmbed 실패시 canonical의 videoId를 그대로 신뢰
    }

    return { videoId, title: '' };
  } catch (e: any) {
    console.log(`[scrape] Error: ${e.message}`);
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === '1';

  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const debugInfo: string[] = [];

    // === 방법 1: YouTube Data API v3 ===
    if (API_KEY) {
      try {
        debugInfo.push('Trying YouTube Data API...');
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
              ...(debug && { debug: debugInfo }),
            });
          }
          debugInfo.push('Data API: no live items found');
          return NextResponse.json({
            live: false,
            videoId: null,
            title: '',
            method: 'youtube-data-api',
            ...(debug && { debug: debugInfo }),
          });
        } else {
          debugInfo.push(`Data API error: ${searchRes.status}`);
        }
      } catch (e: any) {
        debugInfo.push(`Data API exception: ${e.message}`);
      }
    } else {
      debugInfo.push('No YOUTUBE_API_KEY');
    }

    // === 방법 2: 채널 /live 페이지 canonical + oEmbed 검증 ===
    debugInfo.push('Trying canonical URL scrape...');
    const channelResult = await getVideoIdFromChannelLive();

    if (channelResult) {
      debugInfo.push(`Found videoId: ${channelResult.videoId}`);
      return NextResponse.json({
        live: true,
        videoId: channelResult.videoId,
        title: channelResult.title,
        method: 'canonical-oembed',
        ...(debug && { debug: debugInfo }),
      });
    } else {
      debugInfo.push('Canonical scrape failed or returned null');
    }

    // === 방법 3: 예배 시간 폴백 ===
    if (isWorshipTime()) {
      debugInfo.push('Falling back to worship time');
      return NextResponse.json({
        live: true,
        videoId: null,
        title: '실시간 예배',
        method: 'worship-time-fallback',
        channelId: CHANNEL_ID,
        ...(debug && { debug: debugInfo }),
      });
    }

    return NextResponse.json({
      live: false,
      videoId: null,
      title: '',
      method: 'none',
      ...(debug && { debug: debugInfo }),
    });

  } catch (error: any) {
    if (isWorshipTime()) {
      return NextResponse.json({
        live: true,
        videoId: null,
        title: '실시간 예배',
        method: 'error-fallback',
        channelId: CHANNEL_ID,
      });
    }
    return NextResponse.json({ live: false, videoId: null, error: error.message });
  }
}
