async function run() {
  // Check all JS bundles for our changes
  const res = await fetch('https://geojebanseok-church.vercel.app/');
  const html = await res.text();
  const jsMatches = html.match(/\/_next\/static\/[^"']+\.js/g) || [];
  
  console.log('Checking', jsMatches.length, 'JS bundles...');
  
  for (const jsPath of jsMatches) {
    const jsRes = await fetch('https://geojebanseok-church.vercel.app' + jsPath);
    const jsContent = await jsRes.text();
    
    const hasPdf = jsContent.includes('PDF');
    const hasLiveNow = jsContent.includes('LIVE NOW');
    const hasLiveVideoId = jsContent.includes('liveVideoId');
    const hasEmbedLive = jsContent.includes('embed/live_stream');
    const hasOldEmbed = jsContent.includes('embed/${liveVideoId}');
    
    if (hasPdf || hasLiveNow || hasLiveVideoId || hasEmbedLive || hasOldEmbed) {
      console.log('\nFound in:', jsPath.split('/').pop());
      console.log('  PDF:', hasPdf);
      console.log('  LIVE NOW:', hasLiveNow);
      console.log('  liveVideoId (old):', hasLiveVideoId);
      console.log('  embed/live_stream (new):', hasEmbedLive);
      console.log('  embed/${liveVideoId} (old):', hasOldEmbed);
    }
  }
  
  console.log('\nDone.');
}
run().catch(console.error);
