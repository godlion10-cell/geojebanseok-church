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
 * 채널 /live 페이지에서 canonical URL로 실제 라이브 비디오 ID 추출
 * 여러 방법으로 시도: 직접 fetch → CORS 프록시 → 폴백
 */
async function getVideoIdFromChannelLive(): Promise<{ videoId: string; title: string; method: string } | null> {
  const targetUrl = `https://www.youtube.com/@${CHANNEL_HANDLE}/live`;

  // 시도할 URL 목록 (직접 + 프록시들)
  const fetchUrls = [
    { url: targetUrl, name: 'direct', headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Cookie': 'CONSENT=PENDING+987; SOCS=CAESEwgDEgk2MTcyNTcyNTIaAmVuIAEaBgiA_LyaBg',
    }},
    { url: `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, name: 'corsproxy', headers: {} },
  ];

  for (const attempt of fetchUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃

      const res = await fetch(attempt.url, {
        cache: 'no-store',
        headers: attempt.headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const html = await res.text();
      if (html.length < 10000) continue; // 너무 짧으면 에러 페이지

      // canonical URL에서 비디오 ID 추출
      let videoId: string | null = null;
      const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([^"&]+)"/);
      if (canonicalMatch) {
        videoId = canonicalMatch[1];
      }

      // og:url 폴백
      if (!videoId) {
        const ogMatch = html.match(/<meta\s+property="og:url"\s+content="https:\/\/www\.youtube\.com\/watch\?v=([^"&]+)"/);
        if (ogMatch) videoId = ogMatch[1];
      }

      if (!videoId) continue;

      // oEmbed로 우리 채널 영상인지 검증
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
          { cache: 'no-store' }
        );
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          const authorUrl = (oembed.author_url || '').toLowerCase();
          const authorName = (oembed.author_name || '').toLowerCase();
          const isOurs = authorUrl.includes(CHANNEL_HANDLE) || authorName.includes('반석') || authorName.includes('petros');
          if (!isOurs) {
            console.log(`[youtube-live] Wrong channel via ${attempt.name}: ${oembed.author_name}`);
            continue;
          }
          return { videoId, title: oembed.title || '', method: `canonical-${attempt.name}` };
        }
      } catch {}

      // oEmbed 실패시에도 채널 /live 의 canonical은 해당 채널 영상이므로 신뢰
      return { videoId, title: '', method: `canonical-${attempt.name}-no-verify` };
    } catch (e: any) {
      console.log(`[youtube-live] ${attempt.name} failed: ${e.message}`);
      continue;
    }
  }

  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === '1';

  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const debugInfo: string[] = [];

    // === 방법 1: YouTube Data API v3 (가장 정확) ===
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
          debugInfo.push('Data API: no live streams');
          return NextResponse.json({
            live: false, videoId: null, title: '', method: 'youtube-data-api',
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

    // === 방법 2: 채널 페이지 canonical URL 추출 (직접 + CORS 프록시) ===
    debugInfo.push('Trying canonical URL extraction...');
    const result = await getVideoIdFromChannelLive();

    if (result) {
      debugInfo.push(`Found: ${result.videoId} via ${result.method}`);
      return NextResponse.json({
        live: true,
        videoId: result.videoId,
        title: result.title,
        method: result.method,
        ...(debug && { debug: debugInfo }),
      });
    }
    debugInfo.push('All canonical extraction methods failed');

    // === 방법 3: 예배 시간이면 채널 embed 사용 ===
    if (isWorshipTime()) {
      debugInfo.push('Using worship time fallback');
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
      live: false, videoId: null, title: '', method: 'none',
      ...(debug && { debug: debugInfo }),
    });

  } catch (error: any) {
    if (isWorshipTime()) {
      return NextResponse.json({
        live: true, videoId: null, title: '실시간 예배',
        method: 'error-fallback', channelId: CHANNEL_ID,
      });
    }
    return NextResponse.json({ live: false, videoId: null, error: error.message });
  }
}
