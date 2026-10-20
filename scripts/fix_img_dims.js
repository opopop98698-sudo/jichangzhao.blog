const fs = require('fs');
const path = require('path');

function processDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) processDir(full);
    else if (f.endsWith('.md')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      content = content.replace(/<img\s+([^>]+)>/gi, (match, attrs) => {
        if (/width=/i.test(attrs) && /height=/i.test(attrs)) return match;
        changed = true;
        let w = '800';
        let h = '450';
        if (attrs.includes('unlock-media')) {
          w = '400';
          h = '260';
        }
        return `<img ${attrs} width="${w}" height="${h}">`;
      });
      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        console.log('Updated:', full);
      }
    }
  }
}

processDir('content');
