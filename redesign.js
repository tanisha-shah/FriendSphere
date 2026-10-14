const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const srcDir = path.join(__dirname, 'frontend', 'src');

walkDir(srcDir, function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix border radius
    content = content.replace(/rounded-3xl/g, 'rounded-xl');
    content = content.replace(/rounded-2xl/g, 'rounded-lg');
    content = content.replace(/rounded-full/g, 'rounded-full'); // keep full for avatars only, maybe leave it alone

    // Remove gradients
    content = content.replace(/bg-gradient-to-[a-z]+\s+/g, '');
    content = content.replace(/from-brand-[0-9]+\s+/g, 'bg-brand-600 ');
    content = content.replace(/to-[a-z]+-[0-9]+\s+/g, '');
    content = content.replace(/via-[a-z]+-[0-9]+\s+/g, '');
    
    // Remove glow and shadow effects
    content = content.replace(/shadow-[a-z]+-[0-9]+\/[0-9]+/g, 'shadow-sm');
    content = content.replace(/shadow-lg/g, 'shadow-sm');
    content = content.replace(/shadow-xl/g, 'shadow-md');
    content = content.replace(/shadow-2xl/g, 'shadow-md');
    
    // Replace text colors that might clash
    content = content.replace(/text-indigo-[0-9]+/g, 'text-brand-400');
    content = content.replace(/text-teal-[0-9]+/g, 'text-brand-400');
    content = content.replace(/text-emerald-[0-9]+/g, 'text-brand-400');
    content = content.replace(/text-amber-[0-9]+/g, 'text-slate-400');
    content = content.replace(/text-rose-[0-9]+/g, 'text-slate-400');
    content = content.replace(/text-purple-[0-9]+/g, 'text-brand-400');
    
    // Remove glassmorphism
    content = content.replace(/backdrop-blur-[a-z0-9]+/g, '');
    content = content.replace(/bg-slate-[0-9]+\/[0-9]+/g, (match) => {
      // replace bg-slate-900/60 with bg-slate-850 or similar
      return match.split('/')[0];
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
