async function run() {
  const res = await fetch('https://www.youtube.com/watch?v=XIlWy_4sJfU');
  const text = await res.text();
  const match = text.match(/<title>([^<]+)<\/title>/);
  console.log('Title:', match ? match[1] : 'none');
}
run();
