const fetch = require('node-fetch'); // or use native fetch if Node 18+

async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'admin@shopsphere.com', password: 'password123' })
    });
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testLogin();
