async function run() {
  const res = await fetch('https://www.youtube.com/channel/UCc_eP0i4YwSQmQ9du5-RHbA', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const text = await res.text();
  const titleMatch = text.match(/<title>([^<]+)<\/title>/);
  console.log('Channel Title:', titleMatch ? titleMatch[1] : 'none');
}
run();
