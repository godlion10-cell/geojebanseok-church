async function run() {
  const res = await fetch('https://www.youtube.com/@petros-church/live', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const text = await res.text();
  const canonicalMatch = text.match(/<link rel="canonical" href="([^"]+)"/);
  console.log('Canonical:', canonicalMatch ? canonicalMatch[1] : 'none');
  const titleMatch = text.match(/<title>([^<]+)<\/title>/);
  console.log('Title:', titleMatch ? titleMatch[1] : 'none');
  console.log('isLive:', text.includes('"isLive":true') || text.includes('"isLiveContent":true'));
  const isOurChannel = text.includes('"channelId":"UCc_eP0i4YwSQmQ9du5-RHbA"') || text.includes('@petros-church');
  console.log('isOurChannel:', isOurChannel);
}
run();
