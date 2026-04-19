// Test: fetch YouTube channel live page and extract canonical video ID
async function test() {
  const res = await fetch('https://www.youtube.com/@petros-church/live', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+431',
    },
  });
  const html = await res.text();
  console.log('HTML length:', html.length);
  console.log('Status:', res.status);

  // Check canonical
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
  console.log('Canonical:', canonical ? canonical[1] : 'NOT FOUND');

  // Check og:url
  const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/);
  console.log('og:url:', ogUrl ? ogUrl[1] : 'NOT FOUND');

  // Check title
  const title = html.match(/<title>([^<]+)<\/title>/);
  console.log('Title:', title ? title[1] : 'NOT FOUND');

  // Check if isLive signals exist
  console.log('Has isLive:true?', html.includes('"isLive":true'));
  console.log('Has consent page?', html.includes('consent.youtube.com') || html.includes('CONSENT'));
  
  // Look for video IDs near canonical
  const allCanonical = html.match(/canonical.*?watch\?v=([a-zA-Z0-9_-]{11})/);
  console.log('Canonical videoId:', allCanonical ? allCanonical[1] : 'NOT FOUND');

  // Check first 500 chars for consent page
  console.log('\nFirst 500 chars:', html.substring(0, 500));
}
test().catch(e => console.error('Error:', e.message));
