Excellent, j'ai tout ce qu'il me faut ! Voici les specs complètes :

---

# 🎮 Snake Steering — Game Design Document v1.0

## 🌍 Univers
Ambiance **Minecraft** — snake reptilien, mobs inspirés des créatures Minecraft, palette sombre avec accents verts/rouges.

---

## 🐍 Le Snake

### Structure
- Série de **Vehicle** reliés par `arrive()`
- Chaque segment suit le précédent (index `i` arrive vers `index i-1`)
- La **tête** (index 0) suit la souris avec `arrive()`

### Croissance
- Passage d'une porte normale ou éphémère → **+1 segment en queue**
- Segment ajouté à la position actuelle de la queue

### Mort & Game Over
- **Game over définitif** : la tête entre en collision avec un segment du snake lui-même
- **Mort partielle** (pas game over) :
  - Tête touche une extrémité de porte → tous les segments suivants meurent, perte de points
  - Segment (hors tête) touche une extrémité de porte → idem, tous les segments **après** le segment touché meurent
  - Mob **seeker** touche la tête → même effet que ci-dessus
  - Mob **wanderer** touche n'importe quel segment → tous les segments suivants meurent

### Boules de feu 🔥
- Lancées par **clic souris** dans la direction du curseur
- Comportement : **seek** vers la position du mob ciblé (le plus proche du curseur au moment du clic)
- Mobs seekers : **1 hit**
- Mobs wanderers : **2 hits** (afficher visuellement le dégât)
- La boule de feu disparaît à l'impact ou hors écran

---

## 🚪 Les Portes

### Porte Normale 🟢
- Segment vert, extrémités blanches
- Spawn aléatoire sur la map (hors obstacles, hors autres portes)
- Ouverture minimale = **4 × Vehicle.r**
- Passage → **+10 points, +1 segment**
- Toucher une extrémité → **-5 points, mort partielle**
- Disparaît après passage

### Porte Éphémère ✨
- Même visuel que normale mais avec une **aura scintillante**
- Durée de vie : **8 secondes** puis disparaît
- Affichage d'un timer visuel (barre qui se vide)
- Passage → **+20 points (x2), +1 segment**
- Spawn rate : **25% des portes**
- Toucher une extrémité → **-5 points, mort partielle**

### Porte Piégée 🔴
- Segment **rouge**, extrémités rouges
- Spawn rate : **15% des portes**
- Passage → **-15 points, mort partielle**
- Toucher une extrémité → **-5 points, mort partielle**
- Même propriétés de spawn que les normales

### Fin de partie
- Toutes les portes passées → partie terminée (pas perdue)
- Le chrono se fige, popup de résultats affiché
- Nombre total de portes : **à définir selon le niveau**

---

## ⏱️ Chronomètre
- Démarre au lancement de la partie
- Se fige à la fin de partie
- Affiché en haut de l'écran
- Fait partie du score final (meilleur temps pour X portes)

---

## 💀 Les Mobs

Tous les mobs étendent `Vehicle`. Ils **évitent les obstacles** (`avoid()`).

### 🧟 Zombie (Seeker lent)
- Comportement : **seek** la tête du snake
- `maxSpeed` faible, `maxForce` faible
- 1 hit pour mourir
- Si touche la tête → mort partielle du snake
- Spawn : dès le début, nombre croissant avec la taille du snake

### 💚 Creeper (Seeker explosif)
- Comportement : **pursue** la tête du snake (prédit la position future)
- Quand à portée (`< 3 * Vehicle.r` de la tête) → **explose**
- Explosion : détruit tous les segments dans un rayon, **-20 points**
- 1 hit pour mourir (avant explosion)
- Spawn rate : plus rare que le zombie

### 👁️ Enderman (Seeker rapide + téléportation)
- Comportement : **pursue** rapide
- `maxSpeed` élevé, `maxForce` élevé
- Toutes les **5 secondes** : se téléporte à une position aléatoire proche de la tête (`< width/4`)
- 1 hit pour mourir
- Spawn : rare, apparaît quand snake length > 5

### 🐑 Mouton (Wanderer neutre)
- Comportement : **wander** aléatoire + `avoid(obstacles)`
- Si touche un segment → mort partielle
- 2 hits pour mourir (changer de couleur au 1er hit)
- Spawn : présent dès le début, en nombre

---

## 🎯 Système de Score

| Événement | Points |
|---|---|
| Passer une porte normale | +10 |
| Passer une porte éphémère | +20 |
| Passer une porte piégée | -15 |
| Toucher une extrémité de porte | -5 |
| Mort partielle (segments perdus) | -2 par segment perdu |
| Mob wanderer touche le snake | -8 |
| Tuer un zombie | +5 |
| Tuer un creeper (avant explosion) | +10 |
| Tuer un enderman | +15 |
| Tuer un mouton | +3 |

Score minimum bloqué à **0** (pas de score négatif).

---

## 📈 Difficulté

Paramétrique, évolutive avec la **taille du snake** :

| Taille snake | Effet |
|---|---|
| > 4 | +1 zombie spawn |
| > 6 | les zombies accélèrent légèrement |
| > 8 | premier enderman spawn |
| > 10 | creepers apparaissent |
| > 12 | mobs augmentent leur `maxForce` |

---

## 🗂️ Architecture du code

```
vehicle.js        // immuable
obstacle.js       // extend Vehicle — statique, avoid()
goalGate.js       // extend Vehicle — normal, éphémère, piégée
fireball.js       // extend Vehicle — seek() vers mob cible
mob.js            // extend Vehicle — classe de base des mobs
zombie.js         // extend Mob — seek lent
creeper.js        // extend Mob — pursue + explosion
enderman.js       // extend Mob — pursue rapide + téléport
sheep.js          // extend Mob — wander
hud.js            // score, chrono, UI (pas un Vehicle)
sketch.js         // setup() + draw()
index.html
styles.css
/assets
/libraries
```

---

## 🔮 Points d'amélioration futurs
- Système de niveaux paramétrable (fichier de config JSON par niveau)
- Portes bonus (double score temporaire, speed boost...)
- Leaderboard local (localStorage)
- Effets sonores et particules à l'impact
- Nuit/jour cycle visuel

---

Ça te convient ? On peut ajuster n'importe quelle valeur ou règle avant de commencer à coder.