# Web Mario — Cocos Creator

A browser-based Mario platformer built with Cocos Creator and deployed on Firebase Hosting.

---

## How to Play

**Movement**
| Key | Action |
|-----|--------|
| `←` / `A` | Move left |
| `→` / `D` | Move right |
| `Space` / `↑` / `W` | Jump |

**Objective:** Reach the flag at the end of each level before the timer runs out.

**Lives:** You start with 3 lives. Falling into a pit or touching an enemy costs 1 life.  
**Mushroom:** Collect a mushroom from a ? block to grow big — big Mario survives one hit.  
**Coins:** Hit ? blocks or coin blocks to collect coins. Every coin adds 50 points.

---

## Enemies

| Enemy | Behaviour |
|-------|-----------|
| Goomba | Walks back and forth, turns at edges. Stomp to defeat (+100 pts). |
| Koopa Troopa | Walks back and forth. Stomp once → shell. Kick the shell → it slides and kills other enemies. |
| Piranha Plant | Rises from pipes on a timer. Cannot be stomped — avoid it. |

---

## Features

- Physics-based movement and collision (Cocos Creator Box2D)
- Animated sprites: idle, walk, jump, grow, shrink, die
- Score, lives, coins, and countdown timer HUD
- ? Blocks (mushroom) and Coin Blocks (multi-hit)
- Camera follows Mario and clamps to map bounds so there are no black edges
- Game Over and Level Clear screens
- Persistent game data across scenes (GameData singleton)

---

## BONUS Features

### 1. Firebase Hosting — Live Deployment

The game is deployed as a public web app via Firebase Hosting so anyone can play it in a browser without installing anything.

- Build output (`build/web-mobile`) is served at the Firebase project URL
- Cache-Control headers are set to `no-cache` on all `.js` files so players always get the latest build after a redeploy
- Deployment command: `firebase deploy`

---

### 2. Online Leaderboard — Firebase Firestore

After completing a level, the player's score is saved to Cloud Firestore and shown on a global leaderboard.

- Top 6 scores are displayed with medal icons
- If the current player is outside the top 6, their rank is shown separately with a red highlight
- Scores are fetched from Firestore, sorted by score descending, and sliced to top 10

---

### 3. Koopa Shell Mechanics

Koopa Troopas have a three-state machine (`walk → shell_idle → shell_move`):

- Stomp a walking Koopa → it goes into its shell (idle, harmless)
- Kick an idle shell → it slides fast and kills any enemy it hits
- Stomp a moving shell → it stops back to idle
- Shell bounces off walls indefinitely

---

## Project Structure

```
assets/Script/
├── PlayerController.ts   — movement, jump, damage, collision
├── GameManager.ts        — BGM, HUD, timer
├── GameData.ts           — persistent singleton (lives, score, coins)
├── Enemy_Goomba.ts       — Goomba AI
├── Enemy_Koopa.ts        — Koopa + shell state machine
├── PiranhaPlant.ts       — pipe enemy with tween cycle
├── Qblock.ts             — ? block (spawns mushroom)
├── CoinBlock.ts          — multi-hit coin block
├── Mushroom.ts           — power-up pickup
├── FlagPole.ts           — level clear trigger
├── FirebaseService.ts    — Firestore leaderboard
├── LeaderboardScene.ts   — leaderboard UI
├── MainMenu.ts           — main menu
├── GameoverScene.ts      — game over screen
└── LevelClear.ts         — level clear screen
```

---

## AI Usage

AI assistance was used during development. See [AI_reference.md](AI_reference.md) for prompts, AI responses, and what was changed.
