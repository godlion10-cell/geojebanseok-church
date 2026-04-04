import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Vercel(프로덕션) 환경에서 환경변수가 없으면 명확한 에러 출력
  if (!url) {
    console.error('❌ DATABASE_URL 또는 TURSO_DATABASE_URL 환경변수가 설정되지 않았습니다.');
    throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다. Vercel 프로젝트 설정에서 환경변수를 확인해주세요.');
  }

  const isRemote = url.startsWith('libsql://') || url.startsWith('https://');
  console.log(`📡 DB 접속 시도: ${isRemote ? '원격(Turso Cloud)' : '로컬(Local)'} — ${url.substring(0, 30)}...`);

  const adapter = new PrismaLibSql({
    url: url,
    authToken: authToken,
  });
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
