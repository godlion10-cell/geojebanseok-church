async function run() {
  const res = await fetch('https://www.youtube.com/@petros-church/live', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      console.log('VideoDetails:', data.videoDetails.title, data.videoDetails.channelId, data.videoDetails.isLiveContent);
    } catch(e) {
      console.error(e);
    }
  }
}
run();
