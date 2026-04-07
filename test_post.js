fetch('http://localhost:3000/api/analytics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    timestamp: "2026-04-07T12:00:00Z",
    action: "page_hit",
    version: "1.0.0",
    session_id: "session_abc123",
    payload: "{\"pathname\": \"/home\", \"user-agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0\", \"locale\": \"en-US\", \"referrer\": \"https://google.com\", \"href\": \"https://yourwebsite.com/home\"}"
  })
}).then(r => r.json()).then(console.log).catch(console.error);
