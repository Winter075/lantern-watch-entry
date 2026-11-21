// Hands in the Lantern Watch entry: copies the static game and real screenshots to the output
// directory, then writes the judge's dossier with the vendored make.fun library.
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

const shotDir = join(out, 'screenshots');
const shotCount = existsSync(shotDir) ? readdirSync(shotDir).length : 0;
if (shotCount < 3 || shotCount > 4) {
  throw new Error(`Lantern Watch needs 3 or 4 screenshots; found ${shotCount}`);
}
console.log(`Including ${shotCount} real browser screenshots`);

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
console.log(`Lantern Watch entry written to ${out}`);
