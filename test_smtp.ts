async function testEmail() {
  try {
    const res = await fetch('http://localhost:3000/api/test-email');
    const data = await res.text();
    console.log('Result:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
testEmail();
