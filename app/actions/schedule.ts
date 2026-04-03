'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 예배 시간표 조회
export async function getSchedules() {
  try {
    const schedules = await prisma.worshipSchedule.findMany({
      orderBy: { order: 'asc' },
    });
    return { success: true, data: schedules };
  } catch (error) {
    console.error('Failed to get schedules:', error);
    return { success: false, error: '시간표를 불러오지 못했습니다.' };
  }
}

// 예배 시간표 추가
export async function addSchedule(data: {
  title: string;
  time: string;
  place: string;
  officer: string;
  order: number;
}) {
  try {
    const newSchedule = await prisma.worshipSchedule.create({
      data: {
        title: data.title,
        time: data.time,
        place: data.place,
        officer: data.officer,
        order: data.order,
      },
    });
    revalidatePath('/');
    revalidatePath('/admin/cms');
    return { success: true, data: newSchedule };
  } catch (error) {
    console.error('Failed to add schedule:', error);
    return { success: false, error: '시간표 추가에 실패했습니다.' };
  }
}

// 예배 시간표 수정
export async function updateSchedule(id: string, data: {
  title: string;
  time: string;
  place: string;
  officer: string;
  order: number;
}) {
  try {
    const updatedSchedule = await prisma.worshipSchedule.update({
      where: { id },
      data: {
        title: data.title,
        time: data.time,
        place: data.place,
        officer: data.officer,
        order: data.order,
      },
    });
    revalidatePath('/');
    revalidatePath('/admin/cms');
    return { success: true, data: updatedSchedule };
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return { success: false, error: '시간표 수정에 실패했습니다.' };
  }
}

// 예배 시간표 삭제
export async function deleteSchedule(id: string) {
  try {
    await prisma.worshipSchedule.delete({
      where: { id },
    });
    revalidatePath('/');
    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    return { success: false, error: '시간표 삭제에 실패했습니다.' };
  }
}

// 예배 시간표 기본 데이터 일괄 등록
export async function initializeSchedules(schedules: any[]) {
  try {
    for (const schedule of schedules) {
      await prisma.worshipSchedule.create({
        data: schedule,
      });
    }
    revalidatePath('/');
    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error: any) {
    console.error('시간표 일괄 등록 실패:', error);
    return { success: false, error: error?.message || '초기화에 실패했습니다.' };
  }
}
