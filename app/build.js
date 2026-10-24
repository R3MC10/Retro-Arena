// Builds app/ from the shared game file + the app networking layer.
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const out = path.join(__dirname, 'app');
fs.mkdirSync(path.join(out, 'fonts'), {recursive: true});

esbuild.buildSync({entryPoints: [path.join(__dirname, 'src/net.js')], bundle: true, format: 'iife', platform: 'browser', target: 'chrome120', outfile: path.join(out, 'net.js'), minify: true});

const fonts = [
  ['Press Start 2P', '@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff2', 'press-start-2p.woff2'],
  ['VT323', '@fontsource/vt323/files/vt323-latin-400-normal.woff2', 'vt323.woff2']
];
for (const [, src, dst] of fonts) fs.copyFileSync(require.resolve(src), path.join(out, 'fonts', dst));
const fontCss = fonts.map(([fam, , dst]) => `@font-face{font-family:"${fam}";src:url(fonts/${dst}) format("woff2");font-display:swap}`).join('');

// The game is the one-file bundle of the live Retro Arena (tools/bundle.py); the app adds net.js before the engine.
const game = fs.readFileSync(process.env.GAME || path.join(__dirname, 'retro-arena.html'), 'utf8')
  .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, '');
const html = game.replace(/<head>/i, '<head><style>' + fontCss + '</style><script src="net.js"></script>');
if (html === game) throw new Error('no <head> in the game bundle');
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('built app/ (' + Math.round(html.length / 1024) + ' KB page)');
