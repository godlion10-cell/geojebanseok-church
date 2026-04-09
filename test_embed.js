async function run() {
  const res = await fetch('https://www.youtube.com/embed/live_stream?channel=UCc_eP0i4YwSQmQ9du5-RHbA');
  const html = await res.text();
  const match = html.match(/<link rel="canonical" href="https:\/\/www.youtube.com\/watch\?v=([^"]+)"/);
  console.log('Canonical videoId:', match ? match[1] : 'none');
}
run();
