const apiKey = 'AIzaSyDqw2PCvdi087zo5OGszQT8YzFsYCKYDqo';

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

listModels().catch(console.error);
