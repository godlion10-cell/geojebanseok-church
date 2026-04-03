import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://www.youtube.com/@petros-church/live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      cache: 'no-store',
    });

    const html = await res.text();
    
    // ytInitialPlayerResponse 찾기 (보다 견고한 정규식)
    const playerResMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!playerResMatch) {
      return NextResponse.json({ live: false, reason: 'No player response' });
    }

    const playerRes = JSON.parse(playerResMatch[1]);
    const videoDetails = playerRes.videoDetails;

    if (!videoDetails) {
      return NextResponse.json({ live: false, reason: 'No video details' });
    }

    const isLive = videoDetails.isLiveContent;
    const channelId = videoDetails.channelId;
    const author = videoDetails.author;
    const videoId = videoDetails.videoId;
    const title = videoDetails.title;

    // 채널 ID 정확히 일치 확인
    if (channelId !== 'UCc_eP0i4YwSQmQ9du5-RHbA') {
      return NextResponse.json({ live: false, reason: 'Wrong channel', author, channelId });
    }

    if (!isLive) {
      return NextResponse.json({ live: false, reason: 'Not live stream' });
    }

    return NextResponse.json({
      live: true,
      videoId,
      title,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
    });

  } catch (error: any) {
    return NextResponse.json({ live: false, error: error.message });
  }
}
