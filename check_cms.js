async function run() {
  // Fetch the CMS page and check ALL text related to uploads
  const res = await fetch('https://geojebanseok-church.vercel.app/admin/cms');
  const html = await res.text();
  
  // Check for specific text patterns
  const patterns = [
    '사진이나 영상을 첨부하면',
    '사진, PDF파일, 동영상을 첨부하면',
    '사진 또는 영상을 여기에 드래그하세요',
    '사진, PDF파일, 동영상을 여기에 드래그하세요',
    'AI API 키가 설정되지',
    'GEMINI_API_KEY',
    'OPENAI_API_KEY',
  ];
  
  console.log('=== CMS HTML 텍스트 검사 ===');
  for (const p of patterns) {
    console.log(`"${p}": ${html.includes(p)}`);
  }
  
  // Also find ALL JS bundle paths in the CMS page
  const jsMatches = html.match(/\/_next\/static\/[^"']+\.js/g) || [];
  console.log('\nJS bundles in CMS page:', jsMatches.length);
  
  // Check each JS bundle for our text
  let found = false;
  for (const jsPath of jsMatches) {
    const jsRes = await fetch('https://geojebanseok-church.vercel.app' + jsPath);
    const js = await jsRes.text();
    if (js.includes('사진이나 영상') || js.includes('PDF파일')) {
      console.log('\nFound upload text in:', jsPath.split('/').pop());
      console.log('  OLD text (사진이나 영상):', js.includes('사진이나 영상'));
      console.log('  NEW text (PDF파일):', js.includes('PDF파일'));
      found = true;
    }
  }
  if (!found) {
    console.log('\nUpload text not found in any JS bundle from CMS page.');
    console.log('CMS JS might be loaded dynamically. Checking all unique bundles...');
    
    // Get main page bundles too
    const mainRes = await fetch('https://geojebanseok-church.vercel.app/');
    const mainHtml = await mainRes.text();
    const allJs = new Set([
      ...(html.match(/\/_next\/static\/[^"']+\.js/g) || []),
      ...(mainHtml.match(/\/_next\/static\/[^"']+\.js/g) || []),
    ]);
    
    console.log('Total unique JS bundles:', allJs.size);
    for (const jsPath of allJs) {
      const jsRes = await fetch('https://geojebanseok-church.vercel.app' + jsPath);
      const js = await jsRes.text();
      if (js.includes('사진이나 영상') || js.includes('PDF파일') || js.includes('드래그하세요')) {
        console.log('\nBundle:', jsPath.split('/').pop());
        console.log('  사진이나 영상:', js.includes('사진이나 영상'));
        console.log('  PDF파일:', js.includes('PDF파일'));
        console.log('  드래그하세요:', js.includes('드래그하세요'));
      }
    }
  }
}
run().catch(console.error);
