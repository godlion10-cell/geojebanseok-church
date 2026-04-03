'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// 교회 소식 및 설교 말씀 일괄 조회
export async function getContentItems(type?: string) {
  try {
    const items = await prisma.contentItem.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  } catch (error) {
    console.error('Failed to get content items:', error);
    return { success: false, error: '데이터를 불러오지 못했습니다.' };
  }
}

// 콘텐츠 추가 (이미지 업로드 포함)
export async function addContentItem(formData: FormData) {
  try {
    const type = formData.get('type') as string;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;
    const url = formData.get('url') as string; // YouTube URL 등
    const content = formData.get('content') as string;
    const file = formData.get('image') as File | null;

    let imagePath = url;

    // 이미지 파일이 있을 경우 저장
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { mkdir } = await import('fs/promises');
      const tmpDir = join('/tmp', 'uploads');
      await mkdir(tmpDir, { recursive: true });
      const path = join(tmpDir, filename);
      
      await writeFile(path, buffer);
      imagePath = `/uploads/${filename}`;
    }

    const newItem = await prisma.contentItem.create({
      data: {
        type,
        category,
        title,
        url: imagePath,
        content,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin/cms');
    return { success: true, data: newItem };
  } catch (error) {
    console.error('Failed to add content item:', error);
    return { success: false, error: '항목 추가에 실패했습니다.' };
  }
}

// 콘텐츠 수정
export async function updateContentItem(id: string, formData: FormData) {
  try {
    const type = formData.get('type') as string;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const content = formData.get('content') as string;
    const file = formData.get('image') as File | null;

    let imagePath = url;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { mkdir } = await import('fs/promises');
      const tmpDir = join('/tmp', 'uploads');
      await mkdir(tmpDir, { recursive: true });
      const path = join(tmpDir, filename);
      
      await writeFile(path, buffer);
      imagePath = `/uploads/${filename}`;
    }

    const updatedItem = await prisma.contentItem.update({
      where: { id },
      data: {
        type,
        category,
        title,
        url: imagePath,
        content,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin/cms');
    return { success: true, data: updatedItem };
  } catch (error) {
    console.error('Failed to update content item:', error);
    return { success: false, error: '항목 수정에 실패했습니다.' };
  }
}

// 콘텐츠 삭제
export async function deleteContentItem(id: string) {
  try {
    await prisma.contentItem.delete({
      where: { id },
    });
    revalidatePath('/');
    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete content item:', error);
    return { success: false, error: '항목 삭제에 실패했습니다.' };
  }
}

// 기본 데이터 일괄 등록 (Vercel 타임아웃/서버 부하 방지용)
export async function initializeBaseData(type: 'news' | 'sermon', items: any[]) {
  try {
    // 순차적으로 생성 (Turso/SQLite에서는 bulk insert보다 순차 생성이 안전할 수 있음)
    for (const item of items) {
      await prisma.contentItem.create({
        data: {
          type: type.toUpperCase(),
          category: item.category || '',
          title: item.title,
          url: item.url || '',
          content: item.content || '',
        },
      });
    }

    revalidatePath('/');
    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error: any) {
    console.error(`기본 데이터 일괄 등록 실패 (${type}):`, error);
    return { success: false, error: error?.message || '초기화에 실패했습니다.' };
  }
}
