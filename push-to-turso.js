const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !url.startsWith('libsql://')) {
  console.error('오류: .env 파일의 DATABASE_URL이 터소 주소(libsql://...)가 아닙니다.');
  process.exit(1);
}

const client = createClient({
  url: url,
  authToken: authToken,
});

async function main() {
  try {
    console.log('🚀 터소(Turso) 서버에 접속 중...');
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // SQL 파일을 세미콜론(;) 기준으로 나누어 개별 실행 (Prisma migrate diff 결과물)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📦 총 ${statements.length}개의 명령어를 전송합니다.`);

    for (const stmt of statements) {
      await client.execute(stmt);
    }

    console.log('✅ 터소 데이터베이스에 모든 테이블이 성공적으로 생성되었습니다!');
  } catch (err) {
    console.error('❌ 실행 중 오류 발생:', err.message);
    if (err.message.includes('Unauthorized')) {
      console.error('⚠️ 팁: TURSO_AUTH_TOKEN이 올바른지 확인해 주세요.');
    }
  } finally {
    client.close();
  }
}

main();
