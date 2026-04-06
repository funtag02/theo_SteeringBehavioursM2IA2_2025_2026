# Snake Steering

## L'idée

Le point de départ c'est simple : et si on prenait le snake classique, mais qu'au lieu de déplacer le serpent case par case sur une grille, chaque segment était un agent autonome régi par des forces physiques ? C'est le principe des steering behaviors de Craig Reynolds, et c'est ce que ce projet explore.

La tête suit la souris, et chaque segment suivant arrive vers le précédent grâce à un comportement d'arrivée progressive. Le résultat c'est un serpent qui ondule de manière organique, qui freine naturellement dans les virages, et qui donne l'impression d'être vivant plutôt que d'être scripté. L'ambiance est inspirée de Minecraft — les ennemis, les créatures, la palette sombre.

## Comment ça marche

On dirige la tête du snake avec la souris. L'objectif est de passer à travers les portes réparties sur la carte. Chaque passage ajoute un segment au serpent et rapporte des points. Quand toutes les portes ont été franchies, la partie se termine et le chrono se fige.

Les portes ne sont pas toutes équivalentes. Les portes vertes classiques rapportent des points. Les portes cyan scintillantes sont éphémères — elles disparaissent au bout de quelques secondes et rapportent le double, mais il faut se dépêcher. Les portes rouges sont des pièges : les franchir fait perdre des points et des segments.

Toucher un poteau de porte (les extrémités) fait également perdre des points et supprime tous les segments après le point de contact.

En plus des portes, des créatures se baladent sur la carte. Les zombies cherchent lentement la tête du snake. Les creepers la pourchassent et explosent à proximité. Les endermen sont plus rapides et se téléportent régulièrement autour de la tête. Les moutons errent aléatoirement et font des dégâts en touchant le corps du serpent.

On peut lancer des boules de feu en cliquant — elles se dirigent automatiquement vers la créature la plus proche du curseur.

La difficulté augmente avec la taille du snake : nouvelles créatures, accélérations, forces augmentées.

## Steering behaviors utilisés

Tout le mouvement du jeu repose sur des forces, jamais sur de la manipulation directe de position. Les comportements utilisés sont :

- **Seek / Arrive** — la tête cherche la souris, chaque segment arrive vers le précédent avec ralentissement
- **Pursue** — les creepers et endermen prédisent la future position de la tête plutôt que de viser sa position actuelle
- **Seek** — les zombies cherchent directement la tête, plus simple et plus lent
- **Wander** — les moutons dévient aléatoirement leur trajectoire de manière continue, sans saccades
- **Avoid** — les créatures sont censées contourner les obstacles circulaires
- **Boundaries** — les moutons restent dans les limites de l'écran
- **Seek (boules de feu)** — les projectiles suivent leur cible en temps réel

## Ce qui ne marche pas encore

Quelques features sont pas finies faute de temps, je les liste ici pour être honnête sur l'état du projet.

Les dégâts des zombies marchent pas exactement comme je voulais. L'idée c'était que si un zombie touche n'importe quel segment du snake, tous les segments après meurent et on perd des points. En pratique la perte de segments fonctionne, mais la perte de points elle se déclenche seulement si c'est la tête qui est touchée. J'ai pas eu le temps de debugger ça correctement.

La fin de partie est cassée dès qu'il y a des portes éphémères. Je me suis rendu compte un peu tard que si une porte éphémère disparaît avant qu'on la passe, le compteur de portes restantes ne sera jamais à zéro, et comme j'ai mis un chrono et pas un timer, la partie devient interminable. C'est un vrai problème de conception que j'aurais du anticiper.

L'évitement des obstacles par les créatures marche pas non plus. La méthode `avoid()` est bien dans la classe Vehicle, mais elle a besoin de `getObstacleLePlusProche()` et `getVehiculeLePlusProche()` qui existaient pas dans la version du fichier que j'avais. J'ai surement mal recopié la méthode depuis un autre projet, et j'ai pas eu le temps de fix ça proprement.

## Points d'amélioration

La fin de partie c'est clairement le truc le plus urgent à retravailler. Je pense que la meilleure solution serait soit de régénérer les portes éphémères ratées, soit de les exclure carrément du décompte final.

J'aimerais aussi avoir un vrai système de niveaux, avec un fichier de config par niveau pour pouvoir paramétrer la difficulté, le nombre de mobs, les types de portes etc. sans toucher au code. J'ai déjà posé les bases avec le `config.js` mais c'est pas exploité jusqu'au bout.

Un leaderboard local serait sympa pour donner un vrai objectif entre les parties, et des effets de particules sur les explosions et les impacts de boules de feu rendraient les collisions beaucoup plus lisibles.

## Contrôles

| Action | Contrôle |
|---|---|
| Diriger le snake | Souris |
| Lancer une boule de feu | Clic gauche |
| Mode debug | D |
| Rejouer | R |