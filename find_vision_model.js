const apiKey = 'AIzaSyDqw2PCvdi087zo5OGszQT8YzFsYCKYDqo';

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const models = data.models || [];
  const visionModels = models.filter(m => 
    m.supportedGenerationMethods.includes('generateContent') && 
    (m.name.includes('flash') || m.name.includes('pro'))
  );
  console.log('Available Vision Models:');
  visionModels.forEach(m => console.log(`- ${m.name}`));
}

listModels().catch(console.error);
