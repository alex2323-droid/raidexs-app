const fs = require('fs');
const html = fs.readFileSync('readme.html', 'utf8');
const match = html.match(/id="hub-me" type="application\/json" data-json="(.+?)"/);
if (match) {
   // wait, hub-me has search metaData, but the real data is in a script block.
}
