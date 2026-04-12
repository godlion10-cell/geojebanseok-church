import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CHANNEL_ID = 'UCc_eP0i4YwSQmQ9du5-RHbA';

export async function GET() {
  try {
    // 방법 1: YouTube oembed API로 라이브 영상 확인
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/channel/${CHANNEL_ID}/live&format=json`;
    const oembedRes = await fetch(oembedUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (oembedRes.ok) {
      const oembedData = await oembedRes.json();
      // oembed html에서 video ID 추출
      const iframeMatch = oembedData.html?.match(/embed\/([a-zA-Z0-9_-]+)/);
      if (iframeMatch) {
        const videoId = iframeMatch[1];
        return NextResponse.json({
          live: true,
          videoId,
          title: oembedData.title || '반석교회 실시간 예배',
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
        });
      }
    }

    // 방법 2: 채널 페이지 HTML 파싱 (폴백)
    const res = await fetch(`https://www.youtube.com/channel/${CHANNEL_ID}/live`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      cache: 'no-store',
    });

    const html = await res.text();

    // ytInitialPlayerResponse 또는 ytInitialData에서 비디오 정보 추출
    const playerResMatch = html.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]+?})\s*;/);
    if (playerResMatch) {
      try {
        const playerRes = JSON.parse(playerResMatch[1]);
        const videoDetails = playerRes.videoDetails;

        if (videoDetails && videoDetails.isLiveContent) {
          const videoId = videoDetails.videoId;
          const title = videoDetails.title;
          return NextResponse.json({
            live: true,
            videoId,
            title,
            embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
          });
        }
      } catch {
        // JSON 파싱 실패 시 다음 방법으로
      }
    }

    // 방법 3: HTML에서 canonical URL의 video ID 추출 (라이브 중이면 /watch?v=... 형태)
    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
    if (canonicalMatch) {
      const videoId = canonicalMatch[1];
      // 라이브인지 확인하는 힌트: "isLiveBroadcast" 또는 "LIVE" 키워드
      const isLiveHint = html.includes('"isLiveBroadcast":true') || html.includes('"isLive":true') || html.includes('"LIVE"');
      if (isLiveHint) {
        return NextResponse.json({
          live: true,
          videoId,
          title: '반석교회 실시간 예배',
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
        });
      }
    }

    return NextResponse.json({ live: false, reason: 'No live stream detected' });

  } catch (error: any) {
    return NextResponse.json({ live: false, error: error.message });
  }
}
