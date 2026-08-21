import { readFileSync, writeFileSync, mkdirSync } from 'fs';
const key = readFileSync('/Users/paolo/.claude/.env', 'utf8').match(/GOOGLE_API_KEY=(\S+)/)[1];
mkdirSync('stardust/prototypes/assets/horizon/media/gen', { recursive: true });
const BASE = 'stardust/prototypes/assets/horizon/media/gen/';
const STYLE = 'Documentary photography, shot on 35mm, natural light, warm hopeful tone, authentic candid moment, shallow depth of field, no text, no watermark, photorealistic. Editorial healthcare photography for a leading cancer center.';
const jobs = [
  { f: 'hero-dawn.jpg', ar: '16:9', size: '2K', p: `Wide cinematic shot from behind: a diverse group of five people — different ages, a family and friends — standing arm in arm on a grassy rise, facing the first golden light of dawn. Backlit silhouettes with warm rim light, expansive sky, quiet strength and hope. ${STYLE}` },
  { f: 'care-room.jpg', ar: '16:9', size: '2K', p: `An oncology nurse in modern scrubs sits at eye level beside an older female patient in a bright, contemporary hospital room, sharing a warm genuine laugh. Soft morning window light, calm and dignified. ${STYLE}` },
  { f: 'why-hands.jpg', ar: '4:5', size: '1K', p: `Close-up of two pairs of hands gently clasped — an elderly patient's hands held by a younger caregiver's. Warm directional window light, dignity and tenderness, textured skin detail. ${STYLE}` },
  { f: 'act-giving.jpg', ar: '16:9', size: '2K', p: `Overhead shot of many diverse hands reaching together toward the center, layered and united, on a deep warm-red toned background. Community, giving, solidarity. Rich crimson tonality. ${STYLE}` },
  { f: 'film-survivor.jpg', ar: '3:4', size: '1K', p: `Portrait of a woman in her 50s with short regrown hair, standing outdoors in soft golden-hour light, looking off-frame with a calm confident smile. A cancer survivor's quiet strength. ${STYLE}` },
  { f: 'film-caregiver.jpg', ar: '3:4', size: '1K', p: `A middle-aged man donating blood in a bright modern donation center, seated comfortably, warm smile toward a nurse adjusting the armrest. Hopeful, generous. ${STYLE}` },
  { f: 'film-research.jpg', ar: '3:4', size: '1K', p: `A young female scientist in a white lab coat examines a sample vial in a bright research laboratory, golden late-afternoon light through windows, focused wonder. ${STYLE}` },
  { f: 'film-clinic.jpg', ar: '3:4', size: '1K', p: `A physician and a patient sit side by side reviewing a scan together on a screen in a warm, modern consultation room; collaborative, human, reassuring. ${STYLE}` },
];
const models = ['gemini-3-pro-image', 'gemini-3.1-flash-image', 'gemini-2.5-flash-image'];
async function gen(job) {
  for (const m of models) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: 'POST', headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: job.p }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: job.ar, imageSize: job.size } }
        })
      });
      if (!r.ok) { console.log(job.f, m, 'HTTP', r.status, (await r.text()).slice(0, 130).replace(/\n/g, ' ')); continue; }
      const j = await r.json();
      const part = j?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (!part) { console.log(job.f, m, 'no image part', JSON.stringify(j).slice(0, 130)); continue; }
      writeFileSync(BASE + job.f, Buffer.from(part.inlineData.data, 'base64'));
      console.log('OK', job.f, m, Math.round(part.inlineData.data.length * 0.75 / 1024) + 'KB', part.inlineData.mimeType);
      return;
    } catch (e) { console.log(job.f, m, 'ERR', String(e).slice(0, 120)); }
  }
  console.log('FAILED', job.f);
}
for (const job of jobs) await gen(job);
