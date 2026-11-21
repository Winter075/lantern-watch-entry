// Procedural night scenes. Each scene is drawn from a seed into a 600 x 500 panel.
// The two panels share the same seed; only the `variant` flag changes the authored details.
import { makeRandom, randBetween } from './random.js';

const TAU = Math.PI * 2;

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
}

function polygon(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function glow(ctx, x, y, radius, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function gradient(ctx, x, y, w, h, stops, vertical = true) {
  const g = ctx.createLinearGradient(x, y, vertical ? x : x + w, vertical ? y + h : y);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function stars(ctx, random, count, maxY, tint = '#e8f2ff') {
  for (let i = 0; i < count; i++) {
    const x = randBetween(random, 5, 595);
    const y = randBetween(random, 8, maxY);
    const r = randBetween(random, 0.6, 1.9);
    ctx.globalAlpha = randBetween(random, 0.35, 1);
    ellipse(ctx, x, y, r, r, tint);
    if (r > 1.55) {
      ctx.globalAlpha *= 0.5;
      line(ctx, x - 4, y, x + 4, y, tint, 0.8);
      line(ctx, x, y - 4, x, y + 4, tint, 0.8);
    }
  }
  ctx.globalAlpha = 1;
}

function moon(ctx, x, y, r, color = '#f5eec8') {
  glow(ctx, x, y, r * 3.2, 'rgba(255,238,180,0.17)');
  ellipse(ctx, x, y, r, r, color);
  ellipse(ctx, x - r * 0.3, y - r * 0.2, r * 0.17, r * 0.17, '#d9d1ad');
  ellipse(ctx, x + r * 0.32, y + r * 0.26, r * 0.12, r * 0.12, '#ded6b2');
}

function windowGrid(ctx, x, y, cols, rows, stepX, stepY, lit, dark) {
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      rect(ctx, x + c * stepX, y + r * stepY, 9, 12, (c * 7 + r * 3) % 5 < 2 ? lit : dark);
    }
  }
}

function lantern(ctx, x, y, scale, color) {
  line(ctx, x, y - 18 * scale, x, y - 7 * scale, '#2b2031', 1.5);
  glow(ctx, x, y, 17 * scale, color === '#ffb457' ? 'rgba(255,170,70,.35)' : 'rgba(255,90,120,.32)');
  ellipse(ctx, x, y, 8 * scale, 10 * scale, color);
  rect(ctx, x - 5 * scale, y - 11 * scale, 10 * scale, 2 * scale, '#2a1c26');
  rect(ctx, x - 5 * scale, y + 9 * scale, 10 * scale, 2 * scale, '#2a1c26');
  line(ctx, x, y + 11 * scale, x + Math.sin(y) * 2, y + 18 * scale, color, 1.5);
}

function waves(ctx, random, yTop, count, color) {
  for (let i = 0; i < count; i++) {
    const y = randBetween(random, yTop, 495);
    const x = randBetween(random, 0, 540);
    const w = randBetween(random, 18, 70);
    ctx.globalAlpha = randBetween(random, 0.18, 0.5);
    line(ctx, x, y, x + w, y, color, 1.4);
  }
  ctx.globalAlpha = 1;
}

function pine(ctx, x, y, h, color = '#0d1b26') {
  rect(ctx, x - 3, y - h * 0.25, 6, h * 0.3, '#182027');
  for (let i = 0; i < 4; i++) {
    const level = y - h * 0.22 - i * h * 0.19;
    const spread = h * (0.28 - i * 0.045);
    polygon(ctx, [[x, level - h * 0.28], [x - spread, level + h * 0.1], [x + spread, level + h * 0.1]], color);
  }
}

function lanternString(ctx, random, y, count, color) {
  ctx.strokeStyle = '#2c2133';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-10, y - 24);
  ctx.quadraticCurveTo(300, y + 22, 610, y - 24);
  ctx.stroke();
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const x = t * 600;
    const bow = 4 * 4 * t * (1 - t);
    lantern(ctx, x, y - 24 + bow, 0.72, i % 3 === 0 && color === '#ff5f7a' ? '#ff5f7a' : color);
    void random;
  }
}

// ---------------------------------------------------------------- harbour
function harbourBase(ctx, random) {
  gradient(ctx, 0, 0, 600, 330, [[0, '#0b1433'], [0.55, '#1d2c58'], [1, '#4c4d73']]);
  stars(ctx, random, 110, 260);
  moon(ctx, 465, 82, 31);
  polygon(ctx, [[0, 296], [70, 253], [135, 286], [216, 239], [300, 288], [392, 247], [470, 290], [540, 258], [600, 290], [600, 330], [0, 330]], '#1a2444');
  polygon(ctx, [[0, 315], [95, 280], [180, 310], [275, 275], [365, 314], [455, 281], [600, 316], [600, 340], [0, 340]], '#121b34');
  // warehouses
  rect(ctx, 12, 218, 96, 112, '#1d2139');
  polygon(ctx, [[4, 219], [60, 190], [116, 219]], '#252844');
  windowGrid(ctx, 24, 240, 3, 3, 24, 25, '#ffc06b', '#2c3352');
  rect(ctx, 120, 256, 70, 74, '#171c33');
  polygon(ctx, [[114, 257], [155, 235], [196, 257]], '#202645');
  windowGrid(ctx, 132, 272, 2, 2, 26, 24, '#ffd18a', '#26304e');
  // docks
  rect(ctx, 0, 330, 600, 18, '#483a42');
  rect(ctx, 0, 330, 600, 5, '#66505a');
  for (let x = 24; x < 600; x += 72) rect(ctx, x, 348, 10, 58, '#2c2531');
  // water
  gradient(ctx, 0, 348, 600, 152, [[0, '#203752'], [0.5, '#13263d'], [1, '#0b182b']]);
  waves(ctx, random, 360, 95, '#86b7d4');
  for (let i = 0; i < 12; i++) {
    const x = randBetween(random, 20, 580);
    ctx.globalAlpha = 0.25;
    ellipse(ctx, x, randBetween(random, 370, 480), 16, 2, '#e7ca86');
  }
  ctx.globalAlpha = 1;
  // moored hulls
  polygon(ctx, [[330, 385], [430, 385], [411, 407], [348, 407]], '#2a1f2c');
  rect(ctx, 379, 344, 3, 41, '#59434a');
  polygon(ctx, [[382, 347], [382, 378], [409, 378]], '#e0d5b4');
  polygon(ctx, [[478, 420], [574, 420], [554, 442], [497, 442]], '#241d2a');
  rect(ctx, 525, 375, 3, 45, '#51404a');
  polygon(ctx, [[528, 378], [528, 411], [550, 411]], '#cbbf9e');
  // foreground quay
  polygon(ctx, [[0, 486], [600, 470], [600, 500], [0, 500]], '#080e1a');
}

const harbourDiffs = [
  {
    id: 'moon-phase', x: 465, y: 82, r: 34, label: 'moon phase',
    draw(ctx, variant) {
      if (variant === 'b') {
        ctx.fillStyle = '#152046';
        ctx.beginPath();
        ctx.arc(478, 73, 29, 0, TAU);
        ctx.fill();
      }
    },
  },
  {
    id: 'warehouse-lantern', x: 101, y: 200, r: 20, label: 'harbour lantern',
    draw(ctx, variant) {
      lantern(ctx, 101, 200, 0.9, variant === 'a' ? '#ffb457' : '#ff5f7a');
    },
  },
  {
    id: 'lit-window', x: 48, y: 252, r: 17, label: 'unlit window',
    draw(ctx, variant) {
      rect(ctx, 48, 252, 12, 15, variant === 'a' ? '#ffd98d' : '#2b3351');
      line(ctx, 54, 252, 54, 267, '#1b2138', 1.4);
    },
  },
  {
    id: 'gull', x: 267, y: 120, r: 22, label: 'gull',
    draw(ctx, variant) {
      if (variant === 'a') {
        ctx.strokeStyle = '#c8d5e4';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(252, 124);
        ctx.quadraticCurveTo(260, 114, 268, 122);
        ctx.quadraticCurveTo(276, 114, 284, 123);
        ctx.stroke();
      }
    },
  },
  {
    id: 'sail', x: 394, y: 365, r: 27, label: 'sail colour',
    draw(ctx, variant) {
      polygon(ctx, [[382, 347], [382, 377], [409, 377]], variant === 'a' ? '#efe4c2' : '#e8a46c');
      line(ctx, 379, 343, 379, 380, '#58424b', 2.5);
    },
  },
  {
    id: 'crate', x: 180, y: 323, r: 17, label: 'missing crate',
    draw(ctx, variant) {
      if (variant === 'b') {
        rect(ctx, 169, 310, 22, 19, '#8a6244');
        line(ctx, 169, 310, 191, 329, '#513b2d', 1.6);
        line(ctx, 191, 310, 169, 329, '#513b2d', 1.6);
      }
    },
  },
  {
    id: 'buoy', x: 552, y: 405, r: 20, label: 'buoy light',
    draw(ctx, variant) {
      polygon(ctx, [[541, 397], [563, 397], [558, 413], [546, 413]], '#c8514a');
      glow(ctx, 552, 389, 14, variant === 'a' ? 'rgba(255,215,110,.7)' : 'rgba(110,220,255,.7)');
      ellipse(ctx, 552, 389, 4, 4, variant === 'a' ? '#ffe08a' : '#8fe5ff');
      line(ctx, 552, 393, 552, 398, '#d7d3c4', 1.5);
    },
  },
  {
    id: 'dock-flag', x: 310, y: 307, r: 20, label: 'dock flag',
    draw(ctx, variant) {
      line(ctx, 300, 285, 300, 330, '#5a4a4c', 2);
      polygon(ctx, [[301, 287], [326, 294], [301, 301]], variant === 'a' ? '#e8705f' : '#69b9c8');
    },
  },
];

// ---------------------------------------------------------------- market
function marketBase(ctx, random) {
  gradient(ctx, 0, 0, 600, 500, [[0, '#18112f'], [0.5, '#2c1a40'], [1, '#100e22']]);
  stars(ctx, random, 48, 190, '#f7d7c8');
  // rooftops
  for (let x = -20; x < 640; x += 96) {
    polygon(ctx, [[x, 180], [x + 48, 145], [x + 96, 180], [x + 96, 205], [x, 205]], '#241735');
    rect(ctx, x + 8, 182, 10, 14, '#4c2f48');
    rect(ctx, x + 72, 182, 10, 14, '#3d2943');
  }
  rect(ctx, 0, 200, 600, 12, '#120e20');
  lanternString(ctx, random, 118, 11, '#ffb457');
  // stall buildings
  rect(ctx, 22, 210, 235, 225, '#2d2035');
  rect(ctx, 338, 205, 244, 230, '#2a1d33');
  // awnings
  for (let i = 0; i < 7; i++) {
    rect(ctx, 20 + i * 34, 218, 17, 42, i % 2 ? '#e7d7bd' : '#c45657');
  }
  for (let i = 0; i < 8; i++) {
    rect(ctx, 338 + i * 31, 214, 16, 43, i % 2 ? '#d9c9b2' : '#4f8e91');
  }
  rect(ctx, 20, 258, 238, 8, '#583b46');
  rect(ctx, 338, 255, 244, 8, '#493744');
  // counter fronts
  rect(ctx, 30, 320, 218, 78, '#3a2638');
  rect(ctx, 348, 318, 222, 80, '#35253a');
  // signs
  rect(ctx, 272, 165, 58, 62, '#5a2e3e');
  rect(ctx, 276, 169, 50, 54, '#79384a');
  for (let i = 0; i < 3; i++) rect(ctx, 284, 176 + i * 16, 34, 4, '#f0c98c');
  // cobbles
  gradient(ctx, 0, 398, 600, 102, [[0, '#2a2131'], [1, '#171521']]);
  for (let y = 410; y < 500; y += 18) {
    for (let x = (y % 36 ? 8 : 22); x < 600; x += 44) {
      ctx.globalAlpha = 0.22;
      ellipse(ctx, x, y, 17, 5, '#8d7c86');
    }
  }
  ctx.globalAlpha = 1;
  // bowls and crates
  ellipse(ctx, 110, 317, 26, 8, '#d6c8ab');
  ellipse(ctx, 424, 315, 24, 7, '#d3c5aa');
  rect(ctx, 172, 296, 40, 22, '#7a533e');
  rect(ctx, 390, 296, 36, 22, '#6e4b3b');
  // silhouettes of shoppers
  for (const [x, s] of [[250, 1], [320, 0.85], [590, 0.9]]) {
    ellipse(ctx, x, 352 * s + 60, 9 * s, 10 * s, '#120e1a');
    polygon(ctx, [[x - 13 * s, 500], [x - 10 * s, 365 * s], [x + 10 * s, 365 * s], [x + 15 * s, 500]], '#120e1a');
  }
}

const marketDiffs = [
  {
    id: 'lantern-colour', x: 150, y: 93, r: 20, label: 'lantern colour',
    draw(ctx, variant) {
      glow(ctx, 150, 93, 19, variant === 'a' ? 'rgba(255,180,87,.5)' : 'rgba(255,95,122,.5)');
      ellipse(ctx, 150, 93, 8, 10, variant === 'a' ? '#ffb457' : '#ff5f7a');
      rect(ctx, 145, 82, 10, 2, '#33202c');
      rect(ctx, 145, 103, 10, 2, '#33202c');
    },
  },
  {
    id: 'banner', x: 331, y: 88, r: 21, label: 'hanging banner',
    draw(ctx, variant) {
      if (variant === 'b') {
        line(ctx, 331, 60, 331, 72, '#5b3d48', 2);
        polygon(ctx, [[318, 72], [344, 72], [344, 113], [331, 105], [318, 113]], '#d8a857');
        rect(ctx, 326, 80, 10, 16, '#7c3f4d');
      }
    },
  },
  {
    id: 'awning-stripe', x: 88, y: 238, r: 20, label: 'awning stripe',
    draw(ctx, variant) {
      rect(ctx, 70, 220, 36, 40, variant === 'a' ? '#c45657' : '#f0dfc0');
      for (let i = 0; i < 3; i++) rect(ctx, 70, 226 + i * 12, 36, 2, '#a4454a');
    },
  },
  {
    id: 'sign-glyph', x: 300, y: 195, r: 20, label: 'shop sign',
    draw(ctx, variant) {
      rect(ctx, 285, 177, 32, 5, '#f4d19a');
      rect(ctx, 285, 194, variant === 'a' ? 32 : 20, 5, '#f4d19a');
    },
  },
  {
    id: 'umbrella', x: 470, y: 255, r: 26, label: 'umbrella colour',
    draw(ctx, variant) {
      polygon(ctx, [[444, 258], [455, 239], [485, 239], [497, 258]], variant === 'a' ? '#d8b458' : '#6eb3ba');
      rect(ctx, 469, 258, 3, 34, '#3c2c36');
    },
  },
  {
    id: 'fruit-basket', x: 190, y: 303, r: 22, label: 'fruit basket',
    draw(ctx, variant) {
      ellipse(ctx, 190, 303, 17, 6, '#9c6c42');
      ellipse(ctx, 184, 298, 6, 6, variant === 'a' ? '#d64f4f' : '#e5a847');
      ellipse(ctx, 195, 297, 6, 6, '#d64f4f');
      if (variant === 'b') ellipse(ctx, 191, 291, 6, 6, '#e5a847');
    },
  },
  {
    id: 'steam', x: 424, y: 292, r: 23, label: 'steam curl',
    draw(ctx, variant) {
      ctx.strokeStyle = 'rgba(255,240,215,.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(418, 304);
      ctx.bezierCurveTo(410, 294, 428, 287, 420, 274);
      ctx.stroke();
      if (variant === 'a') {
        ctx.beginPath();
        ctx.moveTo(432, 304);
        ctx.bezierCurveTo(424, 292, 440, 288, 433, 278);
        ctx.stroke();
      }
    },
  },
  {
    id: 'market-cat', x: 563, y: 440, r: 24, label: 'market cat',
    draw(ctx, variant) {
      if (variant === 'a') {
        ellipse(ctx, 563, 443, 15, 8, '#1a1520');
        ellipse(ctx, 550, 435, 7, 7, '#1a1520');
        polygon(ctx, [[545, 430], [547, 421], [552, 429]], '#1a1520');
        polygon(ctx, [[552, 429], [556, 421], [557, 430]], '#1a1520');
        ctx.strokeStyle = '#1a1520';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(576, 442);
        ctx.quadraticCurveTo(588, 432, 581, 418);
        ctx.stroke();
        ellipse(ctx, 548, 434, 1.4, 1.4, '#f4d17f');
      }
    },
  },
];

// ---------------------------------------------------------------- cliff
function cliffBase(ctx, random) {
  gradient(ctx, 0, 0, 600, 500, [[0, '#07152c'], [0.5, '#15304a'], [1, '#3b4352']]);
  stars(ctx, random, 125, 290, '#d9ecff');
  moon(ctx, 420, 95, 26, '#dceaf0');
  // distant ridges
  polygon(ctx, [[0, 290], [72, 208], [130, 254], [212, 172], [290, 266], [365, 205], [450, 274], [520, 220], [600, 280], [600, 500], [0, 500]], '#21364c');
  polygon(ctx, [[0, 330], [95, 258], [180, 318], [280, 236], [380, 322], [480, 260], [600, 334], [600, 500], [0, 500]], '#16283a');
  polygon(ctx, [[0, 386], [116, 330], [212, 374], [330, 310], [430, 380], [530, 336], [600, 375], [600, 500], [0, 500]], '#101f2e');
  // shrine platform
  polygon(ctx, [[232, 373], [368, 373], [400, 418], [202, 418]], '#2b2c37');
  // torii gate
  rect(ctx, 268, 318, 8, 58, '#8b3c43');
  rect(ctx, 326, 318, 8, 58, '#8b3c43');
  rect(ctx, 258, 316, 86, 8, '#a34b4b');
  rect(ctx, 252, 307, 98, 6, '#b85850');
  rect(ctx, 270, 332, 62, 5, '#793239');
  // path
  polygon(ctx, [[270, 376], [330, 376], [385, 500], [215, 500]], '#364050');
  for (let i = 0; i < 7; i++) {
    const y = 390 + i * 16;
    ellipse(ctx, 300 + Math.sin(i * 1.7) * 12, y, 13 + i * 1.2, 4 + i * 0.4, '#4b5563');
  }
  // pines and rocks
  pine(ctx, 65, 382, 128, '#0b1a24');
  pine(ctx, 530, 398, 136, '#0a1821');
  polygon(ctx, [[24, 430], [78, 388], [122, 430], [138, 500], [0, 500]], '#0d1b27');
  polygon(ctx, [[470, 443], [520, 394], [584, 438], [600, 500], [450, 500]], '#0c1924');
  // fireflies
  for (let i = 0; i < 9; i++) {
    const x = randBetween(random, 150, 560);
    const y = randBetween(random, 355, 470);
    glow(ctx, x, y, 7, 'rgba(200,255,150,.5)');
    ellipse(ctx, x, y, 1.6, 1.6, '#d9ffaa');
  }
  gradient(ctx, 0, 474, 600, 26, [[0, 'rgba(4,10,18,0)'], [1, 'rgba(4,10,18,.9)']]);
}

const cliffDiffs = [
  {
    id: 'meteor', x: 160, y: 92, r: 28, label: 'shooting star',
    draw(ctx, variant) {
      if (variant === 'b') {
        ctx.strokeStyle = 'rgba(255,232,175,.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(126, 66);
        ctx.lineTo(165, 99);
        ctx.stroke();
        glow(ctx, 168, 101, 13, 'rgba(255,240,190,.9)');
        ellipse(ctx, 168, 101, 3.5, 3.5, '#fff7d6');
      }
    },
  },
  {
    id: 'extra-star', x: 470, y: 155, r: 19, label: 'extra star',
    draw(ctx, variant) {
      if (variant === 'b') {
        ellipse(ctx, 470, 155, 3, 3, '#ffffff');
        line(ctx, 464, 155, 476, 155, 'rgba(255,255,255,.7)', 1);
        line(ctx, 470, 149, 470, 161, 'rgba(255,255,255,.7)', 1);
      }
    },
  },
  {
    id: 'snow-cap', x: 212, y: 172, r: 24, label: 'mountain snow',
    draw(ctx, variant) {
      if (variant === 'a') {
        polygon(ctx, [[212, 172], [188, 201], [201, 196], [212, 205], [224, 195], [238, 201]], '#cdd9e1');
      }
    },
  },
  {
    id: 'pine-shape', x: 65, y: 300, r: 30, label: 'pine silhouette',
    draw(ctx, variant) {
      if (variant === 'b') {
        polygon(ctx, [[65, 250], [42, 292], [88, 292]], '#091720');
        polygon(ctx, [[65, 274], [34, 322], [96, 322]], '#091720');
      }
    },
  },
  {
    id: 'torii-lantern', x: 355, y: 346, r: 21, label: 'shrine lantern',
    draw(ctx, variant) {
      rect(ctx, 350, 341, 12, 17, '#4c3640');
      glow(ctx, 356, 349, 14, variant === 'a' ? 'rgba(255,176,80,.65)' : 'rgba(140,220,255,.6)');
      rect(ctx, 352, 343, 8, 12, variant === 'a' ? '#ffb457' : '#8fe0ff');
    },
  },
  {
    id: 'shrine-roof', x: 300, y: 296, r: 21, label: 'roof ornament',
    draw(ctx, variant) {
      if (variant === 'a') {
        ellipse(ctx, 300, 295, 3, 5, '#e0b97a');
        line(ctx, 294, 300, 306, 300, '#e0b97a', 2);
      }
    },
  },
  {
    id: 'firefly', x: 492, y: 350, r: 20, label: 'extra firefly',
    draw(ctx, variant) {
      if (variant === 'b') {
        glow(ctx, 492, 350, 11, 'rgba(210,255,150,.8)');
        ellipse(ctx, 492, 350, 2.4, 2.4, '#e4ffb4');
      }
    },
  },
  {
    id: 'bridge-rail', x: 414, y: 428, r: 23, label: 'missing railing',
    draw(ctx, variant) {
      if (variant === 'a') {
        line(ctx, 392, 418, 432, 452, '#7d6b60', 4);
        line(ctx, 392, 410, 392, 424, '#7d6b60', 4);
        line(ctx, 432, 444, 432, 458, '#7d6b60', 4);
      }
    },
  },
];

// ------------------------------------------------------------ observatory
function observatoryBase(ctx, random) {
  gradient(ctx, 0, 0, 600, 500, [[0, '#0a102b'], [0.45, '#1c2350'], [1, '#3a3858']]);
  // nebula haze
  const neb = ctx.createRadialGradient(170, 120, 10, 170, 120, 220);
  neb.addColorStop(0, 'rgba(122,80,160,.35)');
  neb.addColorStop(1, 'rgba(122,80,160,0)');
  ctx.fillStyle = neb;
  ctx.fillRect(0, 0, 420, 350);
  stars(ctx, random, 145, 320);
  // constellation lines
  ctx.strokeStyle = 'rgba(160,205,255,.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(112, 105);
  ctx.lineTo(148, 82);
  ctx.lineTo(185, 112);
  ctx.lineTo(216, 88);
  ctx.stroke();
  for (const [x, y] of [[112, 105], [148, 82], [185, 112], [216, 88]]) ellipse(ctx, x, y, 2.4, 2.4, '#e9f3ff');
  // hills
  polygon(ctx, [[0, 350], [100, 285], [205, 348], [320, 280], [430, 350], [520, 300], [600, 348], [600, 500], [0, 500]], '#1a2038');
  polygon(ctx, [[0, 400], [130, 352], [270, 402], [400, 350], [600, 405], [600, 500], [0, 500]], '#121829');
  // observatory body
  rect(ctx, 206, 300, 190, 126, '#3b425c');
  gradient(ctx, 206, 300, 190, 126, [[0, 'rgba(255,255,255,.08)'], [1, 'rgba(0,0,0,.2)']]);
  // dome
  ctx.fillStyle = '#6b748f';
  ctx.beginPath();
  ctx.arc(301, 300, 98, Math.PI, 0);
  ctx.fill();
  polygon(ctx, [[290, 206], [326, 206], [334, 285], [282, 285]], '#2a3047');
  line(ctx, 301, 204, 301, 282, '#8e98b0', 2);
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = 'rgba(24,30,48,.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(301, 300, 98 - i * 22, Math.PI, 0);
    ctx.stroke();
  }
  ellipse(ctx, 301, 300, 100, 9, '#7d869e');
  // entrance
  rect(ctx, 276, 358, 50, 68, '#1e2337');
  ctx.fillStyle = '#2b3249';
  ctx.beginPath();
  ctx.moveTo(276, 358);
  ctx.lineTo(301, 336);
  ctx.lineTo(326, 358);
  ctx.fill();
  // windows
  for (const x of [224, 240, 352, 368]) rect(ctx, x, 334, 10, 14, '#d9ae6a');
  // small shed
  rect(ctx, 468, 388, 92, 70, '#2e344a');
  polygon(ctx, [[460, 390], [514, 362], [568, 390]], '#41495f');
  rect(ctx, 500, 412, 24, 46, '#1b2033');
  // fence
  for (let x = 0; x < 600; x += 26) rect(ctx, x, 452, 5, 38, '#262c41');
  line(ctx, 0, 464, 600, 464, '#353c52', 3);
  line(ctx, 0, 482, 600, 482, '#2c3348', 3);
  // trees
  pine(ctx, 45, 425, 115, '#0d1525');
  pine(ctx, 585, 430, 100, '#0d1525');
  gradient(ctx, 0, 480, 600, 20, [[0, 'rgba(5,9,20,0)'], [1, 'rgba(5,9,20,.85)']]);
}

const observatoryDiffs = [
  {
    id: 'planet-ring', x: 486, y: 86, r: 27, label: 'planet ring',
    draw(ctx, variant) {
      glow(ctx, 486, 86, 24, 'rgba(255,186,120,.4)');
      ellipse(ctx, 486, 86, 14, 14, '#e5a97d');
      ellipse(ctx, 481, 81, 4, 4, '#c98e70');
      if (variant === 'a') {
        ctx.strokeStyle = '#f0d0a4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(486, 86, 25, 8, -0.4, 0, TAU);
        ctx.stroke();
      }
    },
  },
  {
    id: 'constellation-star', x: 160, y: 140, r: 18, label: 'constellation star',
    draw(ctx, variant) {
      if (variant === 'b') {
        ellipse(ctx, 160, 140, 3, 3, '#fff6d0');
        line(ctx, 148, 112, 160, 140, 'rgba(160,205,255,.4)', 1);
      }
    },
  },
  {
    id: 'comet', x: 556, y: 165, r: 26, label: 'comet',
    draw(ctx, variant) {
      if (variant === 'b') {
        ctx.strokeStyle = 'rgba(190,225,255,.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(523, 143);
        ctx.lineTo(557, 167);
        ctx.stroke();
        glow(ctx, 559, 169, 14, 'rgba(200,235,255,.9)');
        ellipse(ctx, 559, 169, 3.5, 3.5, '#f5fbff');
      }
    },
  },
  {
    id: 'dome-light', x: 303, y: 253, r: 21, label: 'dome light',
    draw(ctx, variant) {
      glow(ctx, 303, 253, 17, variant === 'a' ? 'rgba(255,196,100,.65)' : 'rgba(120,205,255,.6)');
      ellipse(ctx, 303, 253, 6, 6, variant === 'a' ? '#ffd084' : '#92dcff');
    },
  },
  {
    id: 'telescope', x: 320, y: 232, r: 28, label: 'telescope angle',
    draw(ctx, variant) {
      ctx.save();
      ctx.translate(320, 232);
      ctx.rotate(variant === 'a' ? -0.65 : -1.05);
      rect(ctx, -11, -7, 58, 14, '#aeb9cc');
      rect(ctx, 41, -10, 12, 20, '#d2dbea');
      rect(ctx, -15, -10, 9, 20, '#68748d');
      ctx.restore();
      ellipse(ctx, 318, 238, 8, 5, '#515a73');
    },
  },
  {
    id: 'dish', x: 103, y: 344, r: 24, label: 'radio dish',
    draw(ctx, variant) {
      ctx.save();
      ctx.translate(103, 344);
      ctx.rotate(variant === 'a' ? -0.2 : 0.35);
      ctx.fillStyle = '#8892a9';
      ctx.beginPath();
      ctx.ellipse(0, 0, 21, 9, 0, Math.PI, TAU);
      ctx.fill();
      line(ctx, 0, 0, 0, 18, '#69738b', 3);
      ellipse(ctx, 0, -1, 3, 3, '#d7dfeb');
      ctx.restore();
    },
  },
  {
    id: 'extra-window', x: 410, y: 341, r: 18, label: 'lit window',
    draw(ctx, variant) {
      if (variant === 'b') {
        rect(ctx, 405, 334, 10, 14, '#ffd18a');
        glow(ctx, 410, 341, 14, 'rgba(255,190,100,.45)');
      }
    },
  },
  {
    id: 'potted-plant', x: 82, y: 449, r: 22, label: 'plant leaves',
    draw(ctx, variant) {
      polygon(ctx, [[70, 448], [94, 448], [90, 474], [74, 474]], '#9a5b4a');
      for (let i = -1; i <= 1; i++) {
        ellipse(ctx, 82 + i * 9, 438 - Math.abs(i) * 5, 5, 12, '#2f624f');
      }
      if (variant === 'a') ellipse(ctx, 82, 425, 5, 12, '#39775e');
    },
  },
];

export const SCENE_ART = [
  { base: harbourBase, diffs: harbourDiffs },
  { base: marketBase, diffs: marketDiffs },
  { base: cliffBase, diffs: cliffDiffs },
  { base: observatoryBase, diffs: observatoryDiffs },
];

export function drawScene(ctx, sceneIndex, variant, seed) {
  const art = SCENE_ART[sceneIndex];
  const random = makeRandom(seed + sceneIndex * 7919);
  art.base(ctx, random);
  for (const diff of art.diffs) diff.draw(ctx, variant);
  // crisp frame, shared by both panels
  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 598, 498);
}
