import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CHANNEL_ID = 'UCc_eP0i4YwSQmQ9du5-RHbA';

// 예배 시간 체크 (서버 측 - KST 기준)
function isWorshipTime(): boolean {
  const now = new Date();
  // Vercel 서버는 UTC 기준이므로 KST로 변환
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
            // ✅ YouTube Data API가 실제 라이브를 확인 → 정확한 videoId 반환
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

    // === 방법 2: 채널 oEmbed API로 라이브 확인 (API 키 불필요) ===
    // YouTube oEmbed는 채널 라이브 URL이 유효한지 확인 가능
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/channel/${CHANNEL_ID}/live&format=json`,
        {
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }
      );
      
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        // oEmbed가 성공하면 해당 채널에 라이브가 있다는 뜻
        // title에서 채널명이 나오는지 확인 (우리 채널 영상인지 검증)
        const title = oembedData.title || '';
        const authorName = oembedData.author_name || '';
        
        // 채널명이 "거제반석교회" 또는 "petros"를 포함하는지 확인
        const isOurChannel = authorName.includes('반석') || authorName.includes('petros') || authorName.includes('Petros');
        
        if (isOurChannel) {
          // ✅ 우리 채널의 라이브가 확인됨
          // videoId는 없지만, 프론트엔드에서 채널 기반 embed 사용
          return NextResponse.json({
            live: true,
            videoId: null,  // 채널 embed 사용 신호
            title: title,
            method: 'oembed',
            channelId: CHANNEL_ID,
          });
        }
      }
    } catch (e) {
      console.error('oEmbed check error:', e);
    }

    // === 방법 3: 예배 시간이면 채널 라이브 embed를 바로 사용 ===
    // videoId 없이 채널 기반 embed URL을 프론트에서 직접 사용
    // YouTube가 자동으로 현재 라이브 중인 영상으로 연결해줌
    if (isWorshipTime()) {
      return NextResponse.json({
        live: true,
        videoId: null,  // videoId를 null로 보내면 프론트에서 채널 embed 사용
        title: '실시간 예배',
        method: 'worship-time-fallback',
        channelId: CHANNEL_ID,
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
    // 에러 시에도 예배 시간이면 라이브로 처리 (채널 embed 사용)
    if (isWorshipTime()) {
      return NextResponse.json({
        live: true,
        videoId: null,
        title: '실시간 예배',
        method: 'error-worship-fallback',
        channelId: CHANNEL_ID,
      });
    }
    return NextResponse.json({ live: false, videoId: null, error: error.message });
  }
}
