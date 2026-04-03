'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 교인 전체 목록 조회
export async function getMembers() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: members };
  } catch (error) {
    console.error('Failed to get members:', error);
    return { success: false, error: '교인 목록을 불러오지 못했습니다.' };
  }
}

// 교인 추가
export async function addMember(data: {
  name: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  role: string;
}) {
  try {
    // 날짜 형식이 유효하지 않은 경우를 위해 추가 검증
    let dob: Date | null = null;
    if (data.dateOfBirth && data.dateOfBirth.trim() !== '') {
      const parsedDate = new Date(data.dateOfBirth);
      if (!isNaN(parsedDate.getTime())) {
        dob = parsedDate;
      }
    }

    const newMember = await prisma.member.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
        dateOfBirth: dob,
        role: data.role,
      },
    });
    revalidatePath('/admin/members');
    return { success: true, data: newMember };
  } catch (error: any) {
    console.error('Failed to add member:', error);
    // 구체적인 오류 내용을 알 수 있도록 에러 메시지 반환
    return { 
      success: false, 
      error: `교인 추가 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}` 
    };
  }
}

// 교인 정보 수정
export async function updateMember(id: string, data: {
  name: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  role: string;
}) {
  try {
    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
        dateOfBirth: (data.dateOfBirth && data.dateOfBirth.trim() !== '') ? new Date(data.dateOfBirth) : null,
        role: data.role,
      },
    });
    revalidatePath('/admin/members');
    return { success: true, data: updatedMember };
  } catch (error) {
    console.error('Failed to update member:', error);
    return { success: false, error: '교인 정보 수정에 실패했습니다.' };
  }
}

// 교인 삭제
export async function deleteMember(id: string) {
  try {
    await prisma.member.delete({
      where: { id },
    });
    revalidatePath('/admin/members');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete member:', error);
    return { success: false, error: '교인 삭제에 실패했습니다.' };
  }
}
