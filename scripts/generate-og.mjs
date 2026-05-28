import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

GlobalFonts.registerFromPath('/tmp/fonts/NotoSansKR-Bold.otf',    'NotoKR');
GlobalFonts.registerFromPath('/tmp/fonts/NotoSansKR-Regular.otf', 'NotoKR');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ── Background ─────────────────────────────────────────────
ctx.fillStyle = '#0b1c12';
ctx.fillRect(0, 0, W, H);

// Warm radial glow — pulls eye to center
const glow = ctx.createRadialGradient(W * 0.5, H * 0.44, 0, W * 0.5, H * 0.44, W * 0.58);
glow.addColorStop(0,   'rgba(20, 68, 38, 0.72)');
glow.addColorStop(0.55,'rgba(10, 30, 18, 0.32)');
glow.addColorStop(1,   'rgba(0,  0,  0, 0)');
ctx.fillStyle = glow;
ctx.fillRect(0, 0, W, H);

// Film grain — premium tactile texture
for (let i = 0; i < 22000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillStyle = `rgba(255,255,255,${(Math.random() * 0.038).toFixed(3)})`;
    ctx.fillRect(x, y, 1, 1);
}

// ── Canterbury cross ────────────────────────────────────────
function drawCross(cx, cy, size, alpha, color = '#ffffff') {
    const s = size / 64;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.translate(cx - 32 * s, cy - 32 * s);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(26, 26); ctx.lineTo(13, 6);
    ctx.quadraticCurveTo(32, 12, 51, 6);
    ctx.lineTo(38, 26); ctx.lineTo(58, 13);
    ctx.quadraticCurveTo(52, 32, 58, 51);
    ctx.lineTo(38, 38); ctx.lineTo(51, 58);
    ctx.quadraticCurveTo(32, 52, 13, 58);
    ctx.lineTo(26, 38); ctx.lineTo(6, 51);
    ctx.quadraticCurveTo(12, 32, 6, 13);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(32, 32, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Large watermark cross (background)
drawCross(W / 2, H / 2 + 18, 580, 0.072);

// Left gold accent bar
const barGrad = ctx.createLinearGradient(0, 0, 0, H);
barGrad.addColorStop(0,    'rgba(210, 168, 75, 0)');
barGrad.addColorStop(0.2,  'rgba(210, 168, 75, 0.9)');
barGrad.addColorStop(0.78, 'rgba(210, 168, 75, 0.9)');
barGrad.addColorStop(1,    'rgba(210, 168, 75, 0)');
ctx.fillStyle = barGrad;
ctx.fillRect(0, 0, 4, H);

// ── Typography helpers ──────────────────────────────────────
const GOLD  = '#d2a84b';
const WHITE = '#ffffff';
const CX    = W / 2;

function text(str, y, size, weight, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${weight} ${size}px "NotoKR"`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(str, CX, y);
    ctx.restore();
}

// Spaced caps (manual letter-spacing for Latin eyebrow)
function textSpaced(str, y, size, color, alpha = 1, spacing = 6) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `400 ${size}px "NotoKR"`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    const chars = [...str];
    const widths = chars.map(c => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let cx = CX - total / 2;
    for (let i = 0; i < chars.length; i++) {
        ctx.fillText(chars[i], cx, y);
        cx += widths[i] + spacing;
    }
    ctx.restore();
}

function rule(y, w, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = GOLD;
    ctx.fillRect(CX - w / 2, y, w, 1);
    ctx.restore();
}

// ── Layout — vertical rhythm ────────────────────────────────
//   Cross mark     : center y = 112
//   Eyebrow        : baseline y = 181
//   Rule           : y = 198
//   "대한성공회"   : baseline y = 276  (52 px, ascender ~40px → visual top 236)
//   "광명교회"     : baseline y = 393  (106px, ascender ~82px → visual top 311)
//   "성 디모테오"  : baseline y = 443  (20 px, below 광명교회)
//   Rule           : y = 465
//   Slogan         : baseline y = 499  (22 px, gold)
//   URL            : baseline y = 592  (13 px)

// Cross logomark
drawCross(CX, 112, 58, 0.9);

// Eyebrow — letter-spaced caps
textSpaced('ANGLICAN CHURCH  ·  KWANGMYEONG', 181, 13, GOLD, 0.88, 5);

// Top rule
rule(198, 210, 0.38);

// Church name — two lines, strong typographic hierarchy
text('대한성공회', 276, 52, '400', WHITE, 0.76);
text('광명교회',  393, 106, '700', WHITE, 1);

// Sub name — tight beneath main title
text('성  디모테오  성당', 443, 19, '400', WHITE, 0.52);

// Mid rule
rule(465, 140, 0.36);

// Slogan — gold, prominent
text('모든 생명을 환대하는 교회', 499, 22, '400', GOLD, 0.94);

// URL — minimal footer
text('frpsy.github.io/gmchurch_web', 592, 13, '400', WHITE, 0.24);

// ── Export ─────────────────────────────────────────────────
const outPath = `${__dirname}/../og-image-v2.png`;
writeFileSync(outPath, canvas.toBuffer('image/png'));
console.log('✓ og-image-v2.png generated');
