# Wonder Boy in Monster Land — Claude Project Context

## Game Overview
HTML5 Canvas clone of the 1987 Sega arcade game. Pure ES modules, no build step.
Canvas: 640×360 logical, rendered at devicePixelRatio for crisp pixels.
HUD: 112px left panel. Game viewport: 528px right panel.

## Key Constants
```
CANVAS_W=640, CANVAS_H=360
HUD_W=112, VIEW_W=528
GRAVITY=0.45, JUMP_FORCE=-10, PLAYER_SPEED=2.2
GROUND_Y=300   ← ground surface Y
S=3            ← pixel art scale (native 16×26 → 48×78 on canvas)
```

## File Map
| File | Role |
|------|------|
| src/constants.js | All game constants |
| src/equipment.js | Equipment data (sword/shield/armor/boots) |
| src/sprites.js | Pixel art renderer — S=3, idle=3/4 view, walk=side profile |
| src/player.js | Player physics, state machine, attack hitbox |
| src/enemy.js | Enemy types: blob/snake/bat/knight |
| src/stage.js | Stage builder, platforms, doors, enemy spawns |
| src/game.js | Game loop, camera, combat resolution |
| src/ui.js | HUD: score/hearts/gold/equip grid/timer |
| src/shop.js | Shop overlay: navigate with ↑↓, buy with Z |
| src/input.js | Keyboard input: wasPressed / isDown |

## Equipment Tiers
**Swords** — id/atk/reach: none/0/0, gradius/2/14, broad/4/18, great/6/22, excalibur/9/26, legend/14/30  
**Shields** — none, wood, knight, hard, legend  
**Armor** — none, leather, knight(gold #d8b840), hard(blue-gray #5870a0), legend(white #e8e8e0)  
**Boots** — none, leather, knight, legend(red #e03020)

## Known Bugs
1. **Sword hitbox Y mismatch**: `getAttackBox()` sets `y: this.y + 12` but ground enemies are at GROUND_Y - h ≈ 282. Player.y = 228, so attack box is at 240—no overlap. Fix: `y: this.y + 45, h: 28`.
2. **UI blur**: Canvas not scaled to devicePixelRatio. All text and graphics look fuzzy on Retina/HiDPI screens.

## Agent Roles (6 Specialists)
When working on this project, match your behavior to the file being touched:

| Agent | Files | Focus |
|-------|-------|-------|
| **Sprite Agent** | sprites.js | S=3 pixel grid, palette (#f4a060 skin, #f0c800 hair…), idle vs side-profile correctness |
| **Combat Agent** | player.js, enemy.js | Hitbox AABB math, ATTACK_FRAMES=22, stateTimer, invincible frames, knockback |
| **Stage Agent** | stage.js | Platform layout, door x-positions (WPN/SHD/ARM/BTS), enemy spawn variety per stage |
| **UI Agent** | ui.js, shop.js | 112px HUD constraints, pixel font legibility, shop menu navigation |
| **Equipment Agent** | equipment.js | Stat progression, bladeColor/guardColor correctness, getShopItems tier gates |
| **QA Agent** | game.js, constants.js, main.js | Full-game consistency, camera clamp, overlap() correctness, game state flow |
