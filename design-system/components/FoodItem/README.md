# FoodItem

Ligne d'article de courses ou d'ingrédient, avec son emoji qui dit tout de suite ce que c'est.

**Props** : `name`, `qty`, `emoji` (sinon trouvé automatiquement à partir du nom), `tone` (fond de la vignette emoji), `done` + `onToggle`, `checkable={false}` pour une liste d'ingrédients sans case.

- Chaque aliment a son emoji : riz 🍚, banane 🍌, tomate 🍅, lait 🥛, poulet 🍗, pâtes 🍝… La fonction `foodEmoji(nom)` couvre plus de 150 aliments et plats, et renvoie 🍽️ si elle ne trouve rien.
- L'emoji est décoratif (masqué aux lecteurs d'écran) : le nom écrit porte toujours l'information.
