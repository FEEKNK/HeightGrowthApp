const fs = require('fs');
fetch('https://www.bangkokhospital.com/th/siriroj')
  .then(r => r.text())
  .then(t => {
    const match = t.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
    console.log(match ? match[1] : 'not found');
  })
  .catch(console.error);
