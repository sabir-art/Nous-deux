# RankedBars

Grille de tuiles pastel, une par catégorie, pour voir où en est chaque budget.

**Props** : `title`, `subtitle`, `items` (`[{label, value, emoji?, budget?, tone?}]`), `emoji`.

- Chaque tuile : nom, emoji dans une pastille blanche, pourcentage du budget en grand, barre pilule (piste blanche, remplissage de la couleur foncée qui va avec le pastel) et « 386 € / 400 € ».
- Un dépassement colle un sticker magenta « dépassé » sur le coin de la tuile.
- La couleur de la tuile suit la catégorie (voir le brand book).
- Emoji décoratif devant chaque catégorie (masqué aux lecteurs d'écran, le nom suffit). Six catégories maximum, le reste dans « Autres ».
