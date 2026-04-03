'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 헌금 내역 전체 조회 (교인 정보 포함)
export async function getOfferings() {
  try {
    const offerings = await prisma.offering.findMany({
      orderBy: { date: 'desc' },
      include: {
        member: {
          select: { id: true, name: true, role: true }
        }
      }
    });
    return { success: true, data: offerings };
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return { success: false, error: '헌금 내역을 불러오지 못했습니다.' };
  }
}

// 헌금 내역 추가
export async function addOffering(data: {
  memberId: string;
  date: string;
  amount: number;
  offeringType: string;
}) {
  try {
    const offeringDate = data.date ? new Date(data.date) : new Date();
    const newOffering = await prisma.offering.create({
      data: {
        memberId: data.memberId,
        date: isNaN(offeringDate.getTime()) ? new Date() : offeringDate,
        amount: data.amount,
        offeringType: data.offeringType,
      },
      include: {
        member: {
          select: { id: true, name: true, role: true }
        }
      }
    });
    revalidatePath('/admin/offerings');
    return { success: true, data: newOffering };
  } catch (error) {
    console.error('Failed to add offering:', error);
    return { success: false, error: '헌금 내역 추가에 실패했습니다.' };
  }
}

// 헌금 내역 수정
export async function updateOffering(id: string, data: {
  memberId: string;
  date: string;
  amount: number;
  offeringType: string;
}) {
  try {
    const offeringDate = data.date ? new Date(data.date) : new Date();
    const updatedOffering = await prisma.offering.update({
      where: { id },
      data: {
        memberId: data.memberId,
        date: isNaN(offeringDate.getTime()) ? new Date() : offeringDate,
        amount: data.amount,
        offeringType: data.offeringType,
      },
      include: {
        member: {
          select: { id: true, name: true, role: true }
        }
      }
    });
    revalidatePath('/admin/offerings');
    return { success: true, data: updatedOffering };
  } catch (error) {
    console.error('Failed to update offering:', error);
    return { success: false, error: '헌금 내역 수정에 실패했습니다.' };
  }
}

// 헌금 내역 삭제
export async function deleteOffering(id: string) {
  try {
    await prisma.offering.delete({
      where: { id },
    });
    revalidatePath('/admin/offerings');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete offering:', error);
    return { success: false, error: '헌금 내역 삭제에 실패했습니다.' };
  }
}
