# Kings of Pathz

**A first-person low-poly sword combat game** built with Three.js, Vite, and TypeScript.

Inspired by **Scion of Fate (Yulgang)** with weapon enhancement system and special abilities!

## ✨ Features

- **4 Weapon Types** - Sword, Axe, Spear, Hammer
- **Enhancement System** - Upgrade weapons from +0 to +20 (Scion of Fate style)
- **6 Special Abilities** - Unlock powerful moves as you enhance
- **Dynamic Lighting** - Weapon glows based on enhancement level
- **Cross-platform** - Desktop (mouse + keyboard) and mobile (touch)
- **Low-poly Aesthetic** - Beautiful flat-shaded graphics

## 🎮 Controls

### Desktop
```
WASD            → Move
Mouse           → Look (click canvas to lock)
LEFT CLICK      → Attack
1-4             → Switch Weapon
Q, W, R         → Switch Ability Slot  
SPACEBAR        → Activate Special Ability
I               → Toggle Stats Display
E               → Enhance Weapon
```

### Mobile
```
Left Side       → Swipe to move
Right Side      → Swipe to look
SWING Button    → Attack
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Windowsz/Kings-of-pathz.git
cd Kings-of-pathz
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Built files will be in the `dist` directory.

## 🎯 Weapon System

### Weapons

| Weapon | Damage | Speed | Range | Knockback |
|--------|--------|-------|-------|----------|
| ⚔️ Sword | 15 | 1.0x | 3.5m | 5 |
| 🪓 Axe | 25 | 0.7x | 3.0m | 10 |
| 🔱 Spear | 18 | 0.9x | 5.0m | 3 |
| 🔨 Hammer | 30 | 0.5x | 3.5m | 15 |

### Enhancement

- **Safe Zone (+0 to +10)** - 100% success, no downgrade
- **Danger Zone (+11 to +20)** - Decreasing success, risk of destruction
- **Material Cost** - Exponentially increases with level
- **Stat Boost** - 8% increase per enhancement level

### Special Abilities

| Ability | DMG | CD | Unlock | Effect |
|---------|-----|----|---------| -------|
| ✂️ Quick Slash | 1.5x | 3s | +0 | Fast attack |
| 🌪️ Whirlwind | 2.0x | 6s | +5 | Hit all nearby enemies |
| 🔱 Piercing Thrust | 2.5x | 5s | +7 | Extended range |
| ⚡ Shockwave | 3.0x | 8s | +10 | Massive blast |
| 🔴 Spin Attack | 2.2x | 7s | +8 | Full rotation |
| 💥 Charging Blow | 3.5x | 10s | +12 | Maximum damage |

## 📁 Project Structure

```
src/
├── game/
│   ├── scenes/
│   │   └── GameScene.ts
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── Monster.ts
│   │   ├── WeaponSystem.ts
│   │   └── SpecialAbilitySystem.ts
│   ├── controls/
│   │   ├── DesktopControls.ts
│   │   └── MobileControls.ts
│   ├── managers/
│   │   ├── GameManager.ts
│   │   ├── EntityManager.ts
│   │   ├── WeaponManager.ts
│   │   ├── CombatManager.ts
│   │   └── ScoreManager.ts
│   ├── ui/
│   │   └── WeaponUIManager.ts
│   └── utils/
│       ├── Constants.ts
│       └── DeviceDetector.ts
├── styles/
│   └── main.css
├── main.ts
└── index.html
```

## 🛠️ Tech Stack

- **Three.js** - 3D graphics rendering
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool & dev server
- **HTML5 / CSS3** - UI and styling

## 📝 License

MIT

## 🎮 Game Tips

1. **Start with Safe Zone** - Enhance +0 to +10 for guaranteed success
2. **Unlock Abilities** - Different abilities unlock at higher enhancement levels
3. **Use Abilities Wisely** - Each ability has a cooldown, use strategically
4. **Combine Weapons** - Switch between weapons for different strategies
5. **Watch the Glow** - Weapon color changes indicate enhancement level

## 🚀 Deployment

### Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Vercel auto-detects Vite config
4. Deploy!

```bash
# Or deploy via CLI
npm i -g vercel
vercel
```

## 🐛 Troubleshooting

### Build errors on Vercel
Make sure `package.json` has correct Three.js version:
```json
"dependencies": {
  "three": "^0.160.0"
}
```

### Weapon not showing
- Check browser console (F12)
- Verify Three.js is loaded
- Try refreshing page

### Performance issues
- Reduce monster count in `Constants.ts`
- Lower shadow map resolution
- Disable some visual effects

## 💡 Future Enhancements

- [ ] Multiplayer support
- [ ] More weapon types
- [ ] Boss battles
- [ ] Skill tree system
- [ ] Daily challenges
- [ ] Leaderboards
- [ ] Sound effects & music
- [ ] In-game shop

---

**Made with ❤️ by [Windowsz](https://github.com/Windowsz)**
