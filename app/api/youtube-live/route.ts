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
    (day >= 1 && day <= 6 && t >= 310 && t <= 400) // 새벽예배 05:10~06:40
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
        },
      }
    );

    if (!livePageRes.ok) return null;
    const html = await livePageRes.text();

    // canonical URL에서 비디오 ID 추출
    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([^"&]+)"/);
    if (!canonicalMatch) return null;
    const videoId = canonicalMatch[1];

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
          return null;
        }

        return { videoId, title: oembedData.title || '' };
      }
    } catch {
      // oEmbed 실패시 canonical의 videoId를 그대로 신뢰
    }

    // oEmbed 실패해도, 채널 /live 페이지의 canonical은 해당 채널 라이브를 가리키므로 신뢰
    return { videoId, title: '' };
  } catch (e: any) {
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
