async function run() {
  const res = await fetch('https://geojebanseok-church.vercel.app/');
  const html = await res.text();
  
  // Check for our changes in the HTML
  console.log('=== HTML 직접 검사 ===');
  console.log('PDF파일:', html.includes('PDF파일'));
  console.log('LIVE NOW:', html.includes('LIVE NOW'));
  console.log('liveVideoId:', html.includes('liveVideoId'));
  console.log('embed/live_stream:', html.includes('embed/live_stream'));
  console.log('실시간 예배 참여하기:', html.includes('실시간 예배 참여하기'));
  
  // Check CMS page
  const cmsRes = await fetch('https://geojebanseok-church.vercel.app/admin/cms');
  const cmsHtml = await cmsRes.text();
  console.log('\n=== CMS 페이지 검사 ===');
  console.log('PDF파일:', cmsHtml.includes('PDF파일'));
  console.log('사진이나 영상:', cmsHtml.includes('사진이나 영상'));
  console.log('사진, PDF파일, 동영상:', cmsHtml.includes('사진, PDF파일, 동영상'));
  
  // Find JS bundle URLs
  const jsMatches = html.match(/\/_next\/static\/[^"']+\.js/g);
  if (jsMatches) {
    console.log('\n=== JS 번들 수 ===', jsMatches.length);
    // Fetch first chunk to check
    for (const jsPath of jsMatches.slice(0, 3)) {
      const jsRes = await fetch('https://geojebanseok-church.vercel.app' + jsPath);
      const jsContent = await jsRes.text();
      if (jsContent.includes('PDF파일') || jsContent.includes('LIVE NOW') || jsContent.includes('liveVideoId') || jsContent.includes('실시간 예배 참여하기')) {
        console.log('Found changes in:', jsPath);
        console.log('  PDF파일:', jsContent.includes('PDF파일'));
        console.log('  LIVE NOW:', jsContent.includes('LIVE NOW'));
        console.log('  liveVideoId:', jsContent.includes('liveVideoId'));
      }
    }
  }
}
run().catch(console.error);
