async function run() {
  const res = await fetch('https://www.youtube.com/@petros-church/live', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
  if (match) {
    console.log('Match length:', match[1].length);
  } else {
    console.log('No match for ytInitialPlayerResponse. String index:', html.indexOf('ytInitialPlayerResponse'));
  }
}
run();
