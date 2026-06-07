import { execFileSync } from 'child_process';

const CAP = '/Users/andy/Documents/gardenos-trials/documentary/captures/';
// ordered build-journey beats
const imgs = [
  'step03-summer-peak.png',     // abstract light fields
  'step05-spring.png',          // reaction-diffusion engine working
  'step05-year2-winter.png',    // ...then homogenised to a wash (the failure)
  'step05b-year2-summer.png',   // fixed: die-back + seed rain
  'step06b-2-nocturne.png',     // pivot: petri-dish -> first-person, Nocturne
  'step06-spring-bloom.png',    // first-person garden
  'step07b-strokes-spring.png', // "individual plants, like brush strokes"
  'step07c-planttypes-summer.png', // plant archetypes
  'step07d-roundness-spring.png',  // "not all agaves" -> rounder forms
  'step08-summer-hum.png',      // living layers: dapple, pollinators
  'step09-autumn-turn.png',     // the photo -> daytime, leaf nuance
  'step10-autumn-maples.png',   // the merge: brown branches, maples
  'step11-summer.png',          // ground structure: beds, path
  'step12-winter.png',          // real plants + unified clock (winter)
  'step13b-riot.png',           // real flower forms, full beds, live
  'step16-birdbath.png',        // cottage furniture: bath, grass, bulbs
  'step17-cherry.png',          // tree physics + cherry blossom
  'step18-blossom.png',         // apple + cherry blossom, a bird
  'step18-apples.png',          // the apple tree with fruit
  'step19-autumn.png',          // per-tree autumn (gold/russet/green)
  'step20-windfall.png',        // windfall on the grass
  'step20-dusk.png',            // dusk + patio lights (close)
];
const D = 7.3, T = 0.8, FR = Math.round(D*30);
const N = imgs.length;

const args = [];
imgs.forEach(f => { args.push('-i', CAP + f); });

let fc = '';
imgs.forEach((_,i) => {
  fc += `[${i}:v]scale=1536:864:force_original_aspect_ratio=increase,crop=1536:864,`
      + `zoompan=z='min(zoom+0.0006,1.16)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${FR}:s=1280x720:fps=30,`
      + `setsar=1[v${i}];`;
});
let prev = 'v0';
for (let k = 1; k < N; k++) {
  const out = (k === N-1) ? 'vout' : `x${k}`;
  const off = (k*(D-T)).toFixed(2);
  fc += `[${prev}][v${k}]xfade=transition=fade:duration=${T}:offset=${off}[${out}];`;
  prev = out;
}
fc = fc.replace(/;$/,'');

const out = '/Users/andy/Documents/gardenos-trials/video/journey-silent.mp4';
execFileSync('ffmpeg', ['-y', ...args, '-filter_complex', fc, '-map', '[vout]',
  '-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p', out], {stdio:'inherit'});
console.log('total ~', (N*D-(N-1)*T).toFixed(1), 's');
