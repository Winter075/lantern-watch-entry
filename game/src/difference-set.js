// Scene catalogue and difference placement. The art module owns the drawing; this module
// owns the names, coordinates and click radii that make those drawings a fair puzzle.
import { SCENE_ART } from './scene-art.js';

export const PANEL_WIDTH = 600;
export const PANEL_HEIGHT = 500;

export const SCENES = [
  {
    name: 'Harbour at Midnight',
    subtitle: 'Moonlit boats and quiet docks',
    accent: '#f3c177',
    background: '#0b1229',
    art: SCENE_ART[0],
    diffs: SCENE_ART[0].diffs,
  },
  {
    name: 'The Lantern Market',
    subtitle: 'Spice, steam and paper lights',
    accent: '#ff9c86',
    background: '#1b1029',
    art: SCENE_ART[1],
    diffs: SCENE_ART[1].diffs,
  },
  {
    name: 'Cliff Ridge Shrine',
    subtitle: 'Fireflies above the old path',
    accent: '#a8dcb2',
    background: '#0b1826',
    art: SCENE_ART[2],
    diffs: SCENE_ART[2].diffs,
  },
  {
    name: 'Starward Observatory',
    subtitle: 'A telescope aimed at the unknown',
    accent: '#a9c6ff',
    background: '#0e1330',
    art: SCENE_ART[3],
    diffs: SCENE_ART[3].diffs,
  },
];

export const TOTAL_DIFFERENCES = SCENES.reduce((sum, scene) => sum + scene.diffs.length, 0);

export function findDifferenceAt(sceneIndex, x, y) {
  if (x < 0 || y < 0 || x > PANEL_WIDTH || y > PANEL_HEIGHT) return null;
  const diffs = SCENES[sceneIndex].diffs;
  for (let i = diffs.length - 1; i >= 0; i--) {
    const d = diffs[i];
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= (d.r + 8) * (d.r + 8)) return i;
  }
  return null;
}
