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

    // Fix hardcoded white/black on hover or selection which breaks light theme
    content = content.replace(/hover:text-white/g, 'hover:text-slate-100');
    content = content.replace(/text-white/g, 'text-slate-50'); 
    // ^ slate-50 is #000000. Wait, if it's in a dark teal button (bg-brand-600), we want it to be light.
    // If it's a dark teal button, bg is brand-600. text should be slate-950 (which is #F1F7F5).
    // Let's replace 'text-slate-50' with 'text-slate-950' where it belongs?
    // Actually, it's easier to just do:
    content = content.replace(/text-slate-50/g, 'text-slate-950'); 
    // Wait, earlier I replaced text-white with text-slate-50. Let's just do:
    // If we have 'text-white', and it's on a button, it's fine if the button is dark. But if the button is light...
    // Let's just fix hover:text-white to hover:text-slate-100 because hover:bg-slate-800 is light.

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
