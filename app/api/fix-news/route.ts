import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 뉴스 데이터 텍스트 수정용 일회성 API
export async function GET() {
  try {
    // 데이터베이스 연결 체크
    try {
      await prisma.$connect();
    } catch (e) {
      console.warn('⚠️ 데이터베이스 연결 실패 (빌드 중에는 무시될 수 있음):', e);
      return NextResponse.json({ 
        error: '데이터베이스 연결 실패. Vercel 환경변수 설정을 확인해주세요.',
        details: process.env.NODE_ENV === 'development' ? e : undefined
      }, { status: 512 }); // 특정 상태 코드로 빌드 로그에서 식별 가능하게 함
    }

    const newsItems = await prisma.contentItem.findMany({
      where: { type: 'NEWS' },
    });

    const updates = [];

    for (const item of newsItems) {
      let newContent = item.content;
      let changed = false;

      // "이번 주 예배 주제" 수정
      if (item.title.includes('이번 주 예배 주제')) {
        newContent = '• 주일오전\n  무릎 꿇으신 기도자\n  (눅 22:39~44)\n• 수요저녁\n  창세기 45:4-10\n• 금요기도\n  [기도] 책\n• 새벽예배\n  QT책 진도를 따라';
        changed = true;
      }

      // "이음돌 아우팅 안내" 수정
      if (item.title.includes('이음돌 아우팅')) {
        newContent = '오늘은 점심 식사가 없으며,\n각 이음돌 모임별로 아우팅 시간을 보냅니다.\n\n※ 단, 주일학교와 어르신들에게는\n김밥을 제공해 드립니다.';
        changed = true;
      }

      // "다음세대 예배 소식" 수정
      if (item.title.includes('다음세대 예배 소식')) {
        newContent = '• 주일청소년:\n  예수님의 십자가 (막 15장)\n• 주일어린이:\n  구레네 시몬 (막 15:21)\n  사순절 가정학습지를 함께해요.';
        changed = true;
      }

      if (changed) {
        await prisma.contentItem.update({
          where: { id: item.id },
          data: { content: newContent },
        });
        updates.push({ title: item.title, updated: true });
      }
    }

    revalidatePath('/');
    revalidatePath('/admin/cms');

    return NextResponse.json({
      success: true,
      message: `${updates.length}개 뉴스 업데이트 완료`,
      updates,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
