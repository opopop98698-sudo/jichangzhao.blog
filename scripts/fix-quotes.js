const fs = require('fs');
const path = require('path');

function walk(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      count += walk(full);
    } else if (f.endsWith('.md')) {
      let content = fs.readFileSync(full, 'utf8');
      if (content.startsWith('---')) {
        const parts = content.split('---');
        if (parts.length >= 3) {
          let lines = parts[1].split('\n');
          let modified = false;
          for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.startsWith('title:')) {
              let val = line.substring(6).trim();
              if (val.startsWith('"') && val.endsWith('"')) {
                let inner = val.slice(1, -1);
                // if there are inner quotes, replace them with Chinese quotes
                if (inner.includes('"')) {
                  inner = inner.replace(/"/g, '“');
                  lines[i] = 'title: "' + inner + '"';
                  modified = true;
                }
              }
            } else if (line.startsWith('description:')) {
              let val = line.substring(12).trim();
              if (val.startsWith('"') && val.endsWith('"')) {
                let inner = val.slice(1, -1);
                if (inner.includes('"')) {
                  inner = inner.replace(/"/g, '“');
                  lines[i] = 'description: "' + inner + '"';
                  modified = true;
                }
              }
            }
          }
          if (modified) {
            parts[1] = lines.join('\n');
            fs.writeFileSync(full, parts.join('---'), 'utf8');
            count++;
          }
        }
      }
    }
  }
  return count;
}

const fixed = walk('content');
console.log('Fixed markdown files count:', fixed);
