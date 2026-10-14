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
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Backgrounds
    content = content.replace(/bg-slate-950/g, 'bg-bg');
    content = content.replace(/bg-slate-900\/60/g, 'bg-surface-sec');
    content = content.replace(/bg-slate-900/g, 'bg-surface-sec');
    content = content.replace(/bg-slate-850\/60/g, 'bg-surface-sec');
    content = content.replace(/bg-slate-850/g, 'bg-surface-sec');
    content = content.replace(/bg-slate-800\/60/g, 'bg-surface');
    content = content.replace(/bg-slate-800\/50/g, 'bg-surface');
    content = content.replace(/bg-slate-800/g, 'bg-surface');
    content = content.replace(/bg-slate-750/g, 'bg-surface-hov');
    
    // Hover backgrounds
    content = content.replace(/hover:bg-slate-800/g, 'hover:bg-surface-hov');
    content = content.replace(/hover:bg-slate-750/g, 'hover:bg-surface-hov');
    
    // Text
    content = content.replace(/text-slate-100/g, 'text-text-primary');
    content = content.replace(/text-slate-200/g, 'text-text-primary');
    content = content.replace(/text-slate-300/g, 'text-text-secondary');
    content = content.replace(/text-slate-400/g, 'text-text-secondary');
    content = content.replace(/text-slate-500/g, 'text-text-muted');
    content = content.replace(/text-slate-950/g, 'text-surface'); // for button text
    content = content.replace(/text-white/g, 'text-surface');

    // Borders
    content = content.replace(/border-slate-800/g, 'border-border-subtle');
    content = content.replace(/border-slate-700\/50/g, 'border-border-subtle');
    content = content.replace(/border-slate-700/g, 'border-border-subtle');
    content = content.replace(/border-slate-600/g, 'border-border-strong');
    
    // Brand/Teal mappings
    content = content.replace(/bg-brand-600/g, 'bg-teal-primary');
    content = content.replace(/hover:bg-brand-600/g, 'hover:bg-teal-hover');
    content = content.replace(/bg-brand-500\/10/g, 'bg-seafoam');
    content = content.replace(/bg-brand-500\/20/g, 'bg-seafoam');
    content = content.replace(/bg-brand-500/g, 'bg-teal-primary');
    
    content = content.replace(/text-brand-400/g, 'text-teal-dark');
    content = content.replace(/text-brand-300/g, 'text-teal-primary');
    content = content.replace(/hover:text-brand-400/g, 'hover:text-teal-dark');
    content = content.replace(/hover:text-brand-300/g, 'hover:text-teal-primary');

    content = content.replace(/border-brand-500\/30/g, 'border-teal-primary/30');
    content = content.replace(/border-brand-500\/40/g, 'border-teal-primary/40');
    content = content.replace(/border-brand-500/g, 'border-teal-primary');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
