// @ts-nocheck
'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function checkAndEndLive(videoId: string) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) return { error: "API Key missing" };

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${API_KEY}`);
    const data = await res.json();
    const status = data.items[0]?.snippet?.liveBroadcastContent;

    // 'live'가 아니면(none, completed 등) 방송 종료 처리
    if (status !== 'live') {
      await prisma.worshipStatus.updateMany({
        data: { isLive: false }
      });
      revalidatePath("/");
      return { ended: true };
    }
    return { ended: false };
  } catch (e: any) {
    return { error: e.message };
  }
}
