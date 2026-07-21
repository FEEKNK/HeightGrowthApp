const fs = require('fs');
const https = require('https');

https.get('https://raw.githubusercontent.com/google/fonts/main/ofl/kanit/Kanit-Regular.ttf', (res) => {
    let data = [];
    res.on('data', chunk => data.push(chunk));
    res.on('end', () => {
        const buffer = Buffer.concat(data);
        const base64 = buffer.toString('base64');
        const jsContent = `window.kanitBase64 = "${base64}";`;
        fs.writeFileSync('d:\\HeightGrowthApp\\kanit-font.js', jsContent);
        console.log('Font downloaded and converted to kanit-font.js');
    });
}).on('error', (e) => {
    console.error(e);
});
