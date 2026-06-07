import { chromium } from 'playwright';

const OUT = '/Users/andy/Documents/gardenos-trials/video/garden-raw.webm';
const FILE = 'file:///Users/andy/Documents/gardenos-trials/trial-13-flowerforms.html';
const DUR = 79000;   // ms of footage (matches ~77s voiceover + a little tail)

const browser = await chromium.launch({
  headless: false,
  args: ['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu','--autoplay-policy=no-user-gesture-required']
});
const ctx = await browser.newContext({ viewport:{width:1280,height:720}, deviceScaleFactor:1, acceptDownloads:true });
const page = await ctx.newPage();
await page.goto(FILE);
await page.waitForTimeout(3000);                       // let WebGL + instances initialise

const dl = page.waitForEvent('download', { timeout: DUR + 20000 });

await page.evaluate((dur) => new Promise((resolve) => {
  const canvas = document.querySelector('canvas');
  const stream = canvas.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 6000000 });
  const chunks = [];
  rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  rec.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'garden-raw.webm';
    document.body.appendChild(a); a.click();
    setTimeout(resolve, 400);
  };
  // drive the journey: scrub the year, then fade to dusk
  window.__pause(true);
  const ease = x => x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2;
  const t0 = performance.now();
  function tick(){
    const e = (performance.now() - t0) / dur;     // 0..1
    const p = Math.min(1, e / 0.84);              // year scrub finishes at 84%
    window.__setDay(18 + ease(p) * 344);          // day 18 → 362
    window.__sun = e < 0.80 ? 1.0 : (1.0 - 0.9 * Math.min(1,(e-0.80)/0.18)); // dusk in the last fifth
    if (e < 1) requestAnimationFrame(tick);
  }
  rec.start();
  requestAnimationFrame(tick);
  setTimeout(() => rec.stop(), dur);
}), DUR);

const download = await dl;
await download.saveAs(OUT);
await browser.close();
console.log('saved', OUT);
