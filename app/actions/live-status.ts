// app/actions/live-status.ts
'use server';

import prisma from "@/lib/prisma";

export async function updateLiveStatus(videoId: string) {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${API_KEY}`
    );
    const data = await response.json();
    
    const broadcastStatus = data.items?.[0]?.snippet?.liveBroadcastContent;

    // 방송이 더 이상 라이브가 아니라면 DB 업데이트
    if (broadcastStatus !== 'live') {
      try {
        await (prisma as any).worshipStatus.update({
          where: { id: 'current-worship' }, 
          data: { isLive: false }
        });
      } catch (dbError) {
        // worshipStatus 테이블이나 레코드가 없을 수 있으므로 예외 처리
        console.error("DB 상태 업데이트 실패 (테이블 없음/ID 없음 무시):", dbError);
      }
      return { status: 'ended' };
    }
    
    return { status: 'live' };
  } catch (error) {
    console.error("라이브 상태 체크 실패:", error);
    return { status: 'error' };
  }
}
