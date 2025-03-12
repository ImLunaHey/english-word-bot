import sharp from 'sharp';

const WIDTH = 800;
const HEIGHT = 800;
const MIN_FONT_SIZE = 32;
const MAX_FONT_SIZE = 200;
const PADDING = 40;

// Design variations
const DESIGNS = [
  {
    name: 'midnight-blue',
    gradient: {
      start: '#1a1a2e',
      end: '#16213e',
    },
    glow: {
      color: 'white',
      strength: 3,
    },
    decorative: [
      { type: 'circle', x: 0.1, y: 0.8, size: 40, opacity: 0.03 },
      { type: 'circle', x: 0.9, y: 0.2, size: 60, opacity: 0.03 },
    ],
  },
  {
    name: 'forest-depths',
    gradient: {
      start: '#1B4242',
      end: '#092635',
    },
    glow: {
      color: '#9EC8B9',
      strength: 4,
    },
    decorative: [
      { type: 'rect', x: 0.1, y: 0.1, width: 80, height: 80, rotation: 45, opacity: 0.04 },
      { type: 'rect', x: 0.9, y: 0.9, width: 60, height: 60, rotation: -45, opacity: 0.04 },
    ],
  },
  {
    name: 'cosmic-purple',
    gradient: {
      start: '#2D033B',
      end: '#810CA8',
    },
    glow: {
      color: '#C147E9',
      strength: 3,
    },
    decorative: [
      { type: 'star', points: 5, x: 0.15, y: 0.2, size: 30, opacity: 0.05 },
      { type: 'star', points: 5, x: 0.85, y: 0.8, size: 40, opacity: 0.05 },
    ],
  },
  {
    name: 'sunset-vibes',
    gradient: {
      start: '#3A1C71',
      end: '#D76D77',
    },
    glow: {
      color: '#FFB88C',
      strength: 4,
    },
    decorative: [{ type: 'wave', x: 0, y: 0.8, width: WIDTH, height: 60, opacity: 0.05 }],
  },
  {
    name: 'deep-ocean',
    gradient: {
      start: '#000428',
      end: '#004e92',
    },
    glow: {
      color: '#00ccff',
      strength: 3,
    },
    decorative: [
      { type: 'bubble', x: 0.2, y: 0.3, size: 30, opacity: 0.04 },
      { type: 'bubble', x: 0.8, y: 0.6, size: 40, opacity: 0.04 },
      { type: 'bubble', x: 0.5, y: 0.2, size: 25, opacity: 0.04 },
    ],
  },
  {
    name: 'emerald-night',
    gradient: {
      start: '#004D40',
      end: '#00251a',
    },
    glow: {
      color: '#00E676',
      strength: 3,
    },
    decorative: [
      { type: 'hex', x: 0.1, y: 0.2, size: 50, opacity: 0.03 },
      { type: 'hex', x: 0.9, y: 0.8, size: 70, opacity: 0.03 },
    ],
  },
  {
    name: 'cherry-blossom',
    gradient: {
      start: '#2b2024',
      end: '#3d2c33',
    },
    glow: {
      color: '#ffb7c5',
      strength: 3,
    },
    decorative: [
      { type: 'flower', x: 0.15, y: 0.15, size: 40, opacity: 0.04 },
      { type: 'flower', x: 0.85, y: 0.85, size: 40, opacity: 0.04 },
    ],
  },
  {
    name: 'tech-noir',
    gradient: {
      start: '#0a192f',
      end: '#112240',
    },
    glow: {
      color: '#64ffda',
      strength: 3,
    },
    decorative: [{ type: 'grid', opacity: 0.02 }],
  },
  {
    name: 'golden-hours',
    gradient: {
      start: '#2C3E50',
      end: '#3498DB',
    },
    glow: {
      color: '#F1C40F',
      strength: 4,
    },
    decorative: [{ type: 'sun', x: 0.85, y: 0.15, size: 60, opacity: 0.05 }],
  },
  {
    name: 'northern-lights',
    gradient: {
      start: '#000428',
      end: '#004e92',
    },
    glow: {
      color: '#80FF72',
      strength: 4,
    },
    decorative: [{ type: 'aurora', opacity: 0.06 }],
  },
];

function generateDecorativeElement(element: any): string {
  switch (element.type) {
    case 'circle':
      return `<circle cx="${WIDTH * element.x}" cy="${HEIGHT * element.y}" r="${element.size}" 
                    fill="#ffffff" fill-opacity="${element.opacity}"/>`;
    case 'rect':
      return `<rect x="${WIDTH * element.x - element.width / 2}" y="${HEIGHT * element.y - element.height / 2}" 
                    width="${element.width}" height="${element.height}"
                    transform="rotate(${element.rotation}, ${WIDTH * element.x}, ${HEIGHT * element.y})"
                    fill="#ffffff" fill-opacity="${element.opacity}"/>`;
    case 'star':
      const points = createStarPoints(WIDTH * element.x, HEIGHT * element.y, element.size, element.points);
      return `<polygon points="${points}" fill="#ffffff" fill-opacity="${element.opacity}"/>`;
    case 'wave':
      return `<path d="M0,${HEIGHT * 0.8} C${WIDTH / 4},${HEIGHT * 0.7} ${(WIDTH * 3) / 4},${HEIGHT * 0.9} ${WIDTH},${
        HEIGHT * 0.8
      }"
                    stroke="#ffffff" stroke-opacity="${element.opacity}" fill="none" stroke-width="30"/>`;
    case 'bubble':
      return `<circle cx="${WIDTH * element.x}" cy="${HEIGHT * element.y}" r="${element.size}"
                    fill="white" fill-opacity="${element.opacity}">
                    <animate attributeName="cy" values="${HEIGHT * element.y};${HEIGHT * element.y - 20};${
        HEIGHT * element.y
      }"
                    dur="3s" repeatCount="indefinite"/>
                    </circle>`;
    case 'hex':
      return createHexagon(WIDTH * element.x, HEIGHT * element.y, element.size, element.opacity);
    case 'flower':
      return createFlower(WIDTH * element.x, HEIGHT * element.y, element.size, element.opacity);
    case 'grid':
      return createGrid(element.opacity);
    case 'sun':
      return createSun(WIDTH * element.x, HEIGHT * element.y, element.size, element.opacity);
    case 'aurora':
      return createAurora(element.opacity);
    default:
      return '';
  }
}

function createStarPoints(cx: number, cy: number, size: number, points: number): string {
  let result = '';
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? size : size / 2;
    const angle = (i * Math.PI) / points;
    const x = cx + radius * Math.sin(angle);
    const y = cy + radius * Math.cos(angle);
    result += `${x},${y} `;
  }
  return result.trim();
}

function createHexagon(cx: number, cy: number, size: number, opacity: number): string {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
  return `<polygon points="${points}" fill="#ffffff" fill-opacity="${opacity}"/>`;
}

function createFlower(cx: number, cy: number, size: number, opacity: number): string {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3;
    const x1 = cx + size * Math.cos(angle);
    const y1 = cy + size * Math.sin(angle);
    return `<circle cx="${x1}" cy="${y1}" r="${size / 3}" fill="#ffffff" fill-opacity="${opacity}"/>`;
  }).join('');
  return `${petals}<circle cx="${cx}" cy="${cy}" r="${size / 4}" fill="#ffffff" fill-opacity="${opacity}"/>`;
}

function createGrid(opacity: number): string {
  const lines: string[] = [];
  const spacing = 50;
  for (let i = spacing; i < WIDTH; i += spacing) {
    lines.push(`<line x1="${i}" y1="0" x2="${i}" y2="${HEIGHT}" stroke="#ffffff" stroke-opacity="${opacity}"/>`);
  }
  for (let i = spacing; i < HEIGHT; i += spacing) {
    lines.push(`<line x1="0" y1="${i}" x2="${WIDTH}" y2="${i}" stroke="#ffffff" stroke-opacity="${opacity}"/>`);
  }
  return lines.join('');
}

function createSun(cx: number, cy: number, size: number, opacity: number): string {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * Math.PI) / 6;
    const x1 = cx + size * Math.cos(angle);
    const y1 = cy + size * Math.sin(angle);
    const x2 = cx + size * 1.5 * Math.cos(angle);
    const y2 = cy + size * 1.5 * Math.sin(angle);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-opacity="${opacity}"/>`;
  }).join('');
  return `${rays}<circle cx="${cx}" cy="${cy}" r="${size}" fill="#ffffff" fill-opacity="${opacity}"/>`;
}

function createAurora(opacity: number): string {
  const paths = Array.from({ length: 3 }, (_, i) => {
    const y = HEIGHT * (0.3 + i * 0.2);
    return `<path d="M0,${y} C${WIDTH / 4},${y - 50} ${WIDTH / 2},${y + 50} ${WIDTH},${y - 30}"
                stroke="#ffffff" stroke-opacity="${opacity}" fill="none" stroke-width="40">
                <animate attributeName="d" 
                    values="M0,${y} C${WIDTH / 4},${y - 50} ${WIDTH / 2},${y + 50} ${WIDTH},${y - 30};
                            M0,${y} C${WIDTH / 4},${y + 50} ${WIDTH / 2},${y - 50} ${WIDTH},${y + 30};
                            M0,${y} C${WIDTH / 4},${y - 50} ${WIDTH / 2},${y + 50} ${WIDTH},${y - 30}"
                    dur="10s" repeatCount="indefinite"/>
                </path>`;
  }).join('');
  return paths;
}

export async function createWordImage(word: string, watermark: string): Promise<Buffer> {
  const design = DESIGNS[Math.floor(Math.random() * DESIGNS.length)];
  const availableWidth = WIDTH - PADDING * 2;
  const fontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, Math.floor(availableWidth / (word.length * 0.8))));

  const decorativeElements = design.decorative.map((element) => generateDecorativeElement(element)).join('\n');

  const svgText = `
        <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${design.gradient.start}" />
                    <stop offset="100%" style="stop-color:${design.gradient.end}" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="${design.glow.strength}" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            <!-- Background -->
            <rect width="100%" height="100%" fill="url(#backgroundGradient)"/>
            
            <!-- Decorative elements -->
            ${decorativeElements}
            
            <!-- Main text -->
            <text
                x="50%"
                y="50%"
                dy="0.35em"
                text-anchor="middle"
                dominant-baseline="middle"
                font-size="${fontSize}px"
                fill="${design.glow.color}"
                font-family="Arial, sans-serif"
                font-weight="bold"
                filter="url(#glow)"
            >${word}</text>
            
            <!-- Watermark -->
            <text
                x="50%"
                y="${HEIGHT - 20}"
                text-anchor="middle"
                font-family="Arial, sans-serif"
                font-size="14px"
                fill="white"
                fill-opacity="0.5"
            >${watermark}</text>
        </svg>
    `;

  const imageBuffer = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([
      {
        input: Buffer.from(svgText),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  return imageBuffer;
}
