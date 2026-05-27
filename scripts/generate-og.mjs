import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

GlobalFonts.registerFromPath('/tmp/fonts/NotoSansKR-Bold.otf',    'NotoKR');
GlobalFonts.registerFromPath('/tmp/fonts/NotoSansKR-Regular.otf', 'NotoKR');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ── Background ─────────────────────────────────────────────
ctx.fillStyle = '#0a1f12';
ctx.fillRect(0, 0, W, H);

// Radial glow — subtle warmth at center
const glow = ctx.createRadialGradient(W * 0.5, H * 0.48, 0, W * 0.5, H * 0.48, W * 0.65);
glow.addColorStop(0,   'rgba(30, 80, 48, 0.55)');
glow.addColorStop(0.6, 'rgba(12, 35, 20, 0.2)');
glow.addColorStop(1,   'rgba(0,  0,  0, 0.5)');
ctx.fillStyle = glow;
ctx.fillRect(0, 0, W, H);

// Subtle grain — premium tactile texture
for (let i = 0; i < 18000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const a = Math.random() * 0.055;
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    ctx.fillRect(x, y, 1, 1);
}

// ── Canterbury cross watermark ─────────────────────────────
function drawCross(ctx, cx, cy, size, alpha, color = '#ffffff') {
    const s = size / 64;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.translate(cx - 32 * s, cy - 32 * s);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(26, 26);
    ctx.lineTo(13, 6);
    ctx.quadraticCurveTo(32, 12, 51, 6);
    ctx.lineTo(38, 26);
    ctx.lineTo(58, 13);
    ctx.quadraticCurveTo(52, 32, 58, 51);
    ctx.lineTo(38, 38);
    ctx.lineTo(51, 58);
    ctx.quadraticCurveTo(32, 52, 13, 58);
    ctx.lineTo(26, 38);
    ctx.lineTo(6, 51);
    ctx.quadraticCurveTo(12, 32, 6, 13);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(32, 32, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Large faded cross behind all content
drawCross(ctx, W / 2, H / 2 + 10, 560, 0.055);

// ── Gold accent bar ─────────────────────────────────────────
// Thin, elegant — not a thick stripe
const barGrad = ctx.createLinearGradient(0, 0, 0, H);
barGrad.addColorStop(0,   'rgba(180, 148, 90, 0)');
barGrad.addColorStop(0.3, 'rgba(180, 148, 90, 0.8)');
barGrad.addColorStop(0.7, 'rgba(180, 148, 90, 0.8)');
barGrad.addColorStop(1,   'rgba(180, 148, 90, 0)');
ctx.fillStyle = barGrad;
ctx.fillRect(0, 0, 3, H);

// ── Helper: centered text ──────────────────────────────────
function text(str, y, size, weight, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${weight} ${size}px "NotoKR"`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(str, W / 2, y);
    ctx.restore();
}

function rule(y, w, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(W / 2 - w / 2, y, w, 1);
    ctx.restore();
}

// ── Small cross icon (logo mark) ──────────────────────────
drawCross(ctx, W / 2, 158, 46, 0.75);

// ── Eyebrow ────────────────────────────────────────────────
text('ANGLICAN CHURCH  ·  KWANGMYEONG', 218, 15, '400', '#b49a5a', 0.85);

// ── Top hairline ───────────────────────────────────────────
rule(236, 160, '#b49a5a', 0.45);

// ── Main title ────────────────────────────────────────────
// Slightly smaller to preserve elegance; let whitespace breathe
text('대한성공회 광명교회', 338, 78, '700', '#ffffff', 1);

// ── Sub name ──────────────────────────────────────────────
text('성  디모테오  성당', 388, 26, '400', '#ffffff', 0.55);

// ── Bottom hairline + slogan ──────────────────────────────
rule(416, 100, '#b49a5a', 0.4);
text('모든 생명을 환대하는 교회', 454, 22, '400', '#ffffff', 0.42);

// Output
const outPath = `${__dirname}/../og-image-v2.png`;
writeFileSync(outPath, canvas.toBuffer('image/png'));
console.log('✓  og-image-v2.png generated');
