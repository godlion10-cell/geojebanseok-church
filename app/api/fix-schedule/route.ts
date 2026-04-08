import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 시간표 데이터 수정용 일회성 API
export async function GET() {
  try {
    const schedules = await prisma.worshipSchedule.findMany({
      orderBy: { order: 'asc' },
    });

    const timeMap: Record<string, string> = {
      '오전 09:00': '오전 9시',
      '오전 11:00': '오전 11시',
      '오후 14:00': '오후 2시',
      '오전 10:00': '오전 10시',
      '저녁 19:30': '저녁 7:30',
      '저녁 20:00': '저녁 8시',
      '오전 05:30': '새벽 5:30',
      // 이미 부분 수정된 경우 대비
      '저녁 7시 30분': '저녁 7:30',
      '저녁 8시': '저녁 8시',
      '새벽 5시 30분': '새벽 5:30',
      '저녁 8:00': '저녁 8시',
    };

    const updates = [];
    for (const schedule of schedules) {
      const newTime = timeMap[schedule.time];
      if (newTime && newTime !== schedule.time) {
        await prisma.worshipSchedule.update({
          where: { id: schedule.id },
          data: { time: newTime },
        });
        updates.push({ title: schedule.title, from: schedule.time, to: newTime });
      }
    }

    revalidatePath('/');
    revalidatePath('/admin/cms');

    return NextResponse.json({
      success: true,
      message: `${updates.length}개 시간표 업데이트 완료`,
      updates,
      all: schedules.map(s => ({ title: s.title, time: s.time })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
