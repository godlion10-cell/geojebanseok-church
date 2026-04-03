// YouTube 라이브 비디오 ID 자동 감지 API
// 채널 소유자의 실제 라이브 방송만 감지

import { NextResponse } from 'next/server';

const CHANNEL_ID = 'UCc_eP0i4YwSQmQ9du5-RHbA';
const CHANNEL_NAME = '반석교회';
const CHANNEL_HANDLE = '@petros-church';

export async function GET() {
  try {
    // YouTube 채널 라이브 페이지에서 비디오 ID 추출
    const res = await fetch(`https://www.youtube.com/${CHANNEL_HANDLE}/live`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      cache: 'no-store', // 캐시 비활성화 (항상 최신)
    });

    if (!res.ok) {
      return NextResponse.json({ live: false, error: 'YouTube 접속 실패' });
    }

    const html = await res.text();

    // 1단계: 채널 소유자의 라이브 방송인지 확인
    // channelId가 우리 채널과 일치하는지 체크
    const isOurChannel = html.includes(`"channelId":"${CHANNEL_ID}"`) ||
                         html.includes(`"externalChannelId":"${CHANNEL_ID}"`) ||
                         html.includes(CHANNEL_HANDLE);

    // 2단계: 라이브 방송 여부 확인 (실제 스트리밍 중인지)
    const isLiveBroadcast = html.includes('"isLive":true');
    const isLiveContent = html.includes('"isLiveContent":true');
    const hasLiveBadge = html.includes('"BADGE_STYLE_TYPE_LIVE_NOW"');
    
    const isLive = isLiveBroadcast || (isLiveContent && hasLiveBadge);

    if (!isLive) {
      return NextResponse.json({ 
        live: false, 
        reason: '현재 라이브 방송 없음' 
      });
    }

    // 3단계: 비디오 ID 추출
    let videoId: string | null = null;

    // 정확한 패턴: canonical URL
    const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/);
    if (canonicalMatch) {
      videoId = canonicalMatch[1];
    }

    // og:url 메타태그
    if (!videoId) {
      const ogMatch = html.match(/<meta property="og:url" content="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/);
      if (ogMatch) videoId = ogMatch[1];
    }

    // videoId JSON (첫 번째 매칭만 - 메인 영상)
    if (!videoId) {
      const jsonMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (jsonMatch) videoId = jsonMatch[1];
    }

    if (!videoId) {
      return NextResponse.json({ 
        live: false, 
        reason: '비디오 ID를 찾을 수 없음' 
      });
    }

    // 4단계: 비디오가 우리 채널의 것인지 최종 확인
    // 제목에서 채널/교회 관련 키워드 확인
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '';
    
    const isOurContent = isOurChannel || 
                         title.includes('반석') ||
                         title.includes('예배') ||
                         title.includes('기도회') ||
                         title.includes('설교');

    if (!isOurContent) {
      console.log(`YouTube live detected but not our channel: ${title}`);
      return NextResponse.json({ 
        live: false, 
        reason: '다른 채널의 라이브' 
      });
    }

    console.log(`✅ 라이브 감지: ${title} (ID: ${videoId})`);
    
    return NextResponse.json({
      live: true,
      videoId,
      title,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
    });

  } catch (error: any) {
    console.error('YouTube live check error:', error);
    return NextResponse.json({ live: false, error: error.message });
  }
}
