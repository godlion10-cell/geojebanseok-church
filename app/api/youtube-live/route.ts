// YouTube 라이브 비디오 ID 자동 감지 API

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // YouTube 채널 라이브 페이지에서 비디오 ID 추출
    const res = await fetch('https://www.youtube.com/@petros-church/live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 30 }, // 30초 캐시
    });

    if (!res.ok) {
      return NextResponse.json({ live: false, error: 'YouTube 접속 실패' });
    }

    const html = await res.text();

    // 라이브 방송 비디오 ID를 HTML에서 추출 (여러 패턴 시도)
    let videoId: string | null = null;

    // 패턴 1: canonical URL에서 추출
    const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
    if (canonicalMatch) {
      videoId = canonicalMatch[1];
    }

    // 패턴 2: og:url 메타태그
    if (!videoId) {
      const ogMatch = html.match(/<meta property="og:url" content="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
      if (ogMatch) videoId = ogMatch[1];
    }

    // 패턴 3: videoId JSON에서 추출
    if (!videoId) {
      const jsonMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (jsonMatch) videoId = jsonMatch[1];
    }

    // 패턴 4: embed URL에서 추출
    if (!videoId) {
      const embedMatch = html.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) videoId = embedMatch[1];
    }

    // 라이브 방송 여부 확인
    const isLive = html.includes('"isLive":true') || 
                   html.includes('"isLiveContent":true') ||
                   html.includes('"liveBroadcastDetails"');

    if (videoId && isLive) {
      return NextResponse.json({
        live: true,
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      });
    }

    // 비디오 ID는 있지만 라이브가 아닌 경우 (최근 영상)
    if (videoId && !isLive) {
      return NextResponse.json({
        live: false,
        videoId,
        note: '현재 라이브 방송이 아닙니다.',
      });
    }

    return NextResponse.json({ live: false });

  } catch (error: any) {
    console.error('YouTube live check error:', error);
    return NextResponse.json({ live: false, error: error.message });
  }
}
