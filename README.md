# Kings of Pathz

A first-person low-poly sword combat game built with Three.js, Vite, and TypeScript.

## Features

- **Cross-platform**: Desktop (mouse + keyboard) and mobile (touch controls)
- **Low-poly aesthetic**: Flat-shaded 3D graphics with soft shadows
- **Real-time combat**: Swing your sword to defeat monsters and earn points
- **Responsive controls**: Optimized for both desktop and mobile devices

## Project Structure

```
src/
├── game/
│   ├── scenes/       # Scene setup and terrain
│   ├── entities/     # Player, monsters, weapons
│   ├── controls/     # Input handling (desktop/mobile)
│   ├── managers/     # Game logic management
│   └── utils/        # Constants and helpers
├── styles/           # CSS styling
└── main.ts           # Entry point
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## Controls

### Desktop
- **WASD**: Move
- **Mouse**: Look around (click to lock)
- **Left Click**: Attack

### Mobile
- **Left side**: Swipe to move
- **Right side**: Swipe to look
- **Attack Button**: Swing sword

## Technologies

- **Three.js**: 3D graphics
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **HTML5/CSS3**: UI and styling

## License

MIT
