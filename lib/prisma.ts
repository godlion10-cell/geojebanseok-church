import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Vercel(프로덕션) 환경에서 환경변수가 없어도 빌드가 중단되지 않도록 경고만 출력
  if (!url) {
    console.warn('⚠️ DATABASE_URL 또는 TURSO_DATABASE_URL 환경변수가 설정되지 않았습니다.');
    console.warn('빌드 중에는 무시되지만, 실제 구동을 위해서는 Vercel 설정에서 지정해야 합니다.');
    // 빌드 시점에는 에러를 던지지 않고 null 반환 등으로 처리하거나,
    // 실제 런타임에서 사용될 때 에러를 내도록 유도
    return new Proxy({} as any, {
      get: (_, prop) => {
        if (prop === 'then') return undefined;
        return () => {
          throw new Error('DATABASE_URL이 설정되지 않아 데이터베이스에 접근할 수 없습니다. Vercel 설정을 확인해주세요.');
        };
      },
    });
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
