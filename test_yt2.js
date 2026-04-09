async function run() {
  const res = await fetch('https://www.youtube.com/@petros-church/live', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const playerResMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});\s*var/);
  if (!playerResMatch) {
    console.log('No player config match');
    return;
  }
  const playerRes = JSON.parse(playerResMatch[1]);
  if (playerRes.videoDetails) {
    console.log('VideoDetails:', playerRes.videoDetails.title, playerRes.videoDetails.videoId, playerRes.videoDetails.channelId);
    console.log('Is Live?', playerRes.videoDetails.isLiveContent);
  } else {
    console.log('No videoDetails');
  }
}
run();
