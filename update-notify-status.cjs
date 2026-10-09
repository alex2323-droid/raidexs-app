const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'console.warn("HankGames Auth Warning:", await tokenRes.text());',
  'const errText = await tokenRes.text(); console.warn("HankGames Auth Warning:", errText); hankGamesResult = { error: "Auth failed: " + errText };'
);

code = code.replace(
  "res.json({ success: true, message: 'Notification sent' });",
  "res.json({ success: true, message: 'Notification sent', hankGamesResult });"
);

fs.writeFileSync('server.ts', code);
console.log('Updated server.ts notify status');
