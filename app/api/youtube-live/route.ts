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
 * 채널 /live 페이지의 canonical URL에서 실제 라이브 비디오 ID를 추출하고,
 * oEmbed API로 해당 비디오가 우리 채널 소유인지 검증합니다.
 */
async function getVideoIdFromChannelLive(): Promise<{ videoId: string; title: string } | null> {
  try {
    // 1단계: 채널 /live 페이지에서 canonical URL 추출
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

    // canonical URL에서 비디오 ID 추출 (이것이 해당 페이지의 메인 비디오)
    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([^"&]+)"/);
    if (!canonicalMatch) return null;
    const videoId = canonicalMatch[1];

    // 2단계: oEmbed API로 이 비디오가 우리 채널의 것인지 검증
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { cache: 'no-store' }
    );

    if (!oembedRes.ok) {
      // oEmbed 실패해도 canonical에서 추출한 ID는 신뢰할 수 있음
      // (채널 /live 페이지의 canonical은 해당 채널의 라이브 영상을 가리킴)
      return { videoId, title: '' };
    }

    const oembedData = await oembedRes.json();
    const authorUrl = (oembedData.author_url || '').toLowerCase();
    const authorName = (oembedData.author_name || '').toLowerCase();

    // 우리 채널의 영상인지 확인
    const isOurChannel =
      authorUrl.includes(CHANNEL_HANDLE) ||
      authorName.includes('반석') ||
      authorName.includes('petros');

    if (!isOurChannel) {
      console.warn(`[youtube-live] 다른 채널의 영상 감지됨: ${oembedData.author_name} (${oembedData.title})`);
      return null;
    }

    return {
      videoId,
      title: oembedData.title || '',
    };
  } catch (e) {
    console.error('[youtube-live] 채널 라이브 페이지 파싱 실패:', e);
    return null;
  }
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

    // === 방법 2: 채널 /live 페이지 canonical URL + oEmbed 검증 ===
    // API 키 없이도 정확한 라이브 비디오 ID를 가져올 수 있음
    const channelLiveResult = await getVideoIdFromChannelLive();

    if (channelLiveResult) {
      return NextResponse.json({
        live: true,
        videoId: channelLiveResult.videoId,
        title: channelLiveResult.title,
        method: 'canonical-oembed',
      });
    }

    // === 방법 3: 예배 시간이면 채널 라이브 embed 사용 ===
    if (isWorshipTime()) {
      return NextResponse.json({
        live: true,
        videoId: null,
        title: '실시간 예배',
        method: 'worship-time-fallback',
        channelId: CHANNEL_ID,
      });
    }

    // 라이브 없음
    return NextResponse.json({
      live: false,
      videoId: null,
      title: '',
      method: 'none',
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
