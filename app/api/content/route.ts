import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 공개 API: 메인 페이지에서 DB 콘텐츠를 가져오는 엔드포인트
export async function GET() {
  try {
    const [newsItems, sermons, schedules, worshipOrders] = await Promise.all([
      prisma.contentItem.findMany({
        where: { type: 'NEWS' },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.contentItem.findMany({
        where: { type: 'SERMON' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.worshipSchedule.findMany({
        orderBy: { order: 'asc' },
      }),
      prisma.contentItem.findMany({
        where: { type: 'WORSHIP_ORDER' },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      news: newsItems,
      sermons,
      schedules,
      worshipOrders,
    });
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json({
      success: false,
      news: [],
      sermons: [],
      schedules: [],
      worshipOrders: [],
    });
  }
}
