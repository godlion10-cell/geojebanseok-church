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
    const newMember = await prisma.member.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        role: data.role,
      },
    });
    revalidatePath('/admin/members');
    return { success: true, data: newMember };
  } catch (error) {
    console.error('Failed to add member:', error);
    return { success: false, error: '교인 추가에 실패했습니다.' };
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
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
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
