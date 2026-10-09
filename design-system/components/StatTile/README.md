# StatTile

Chiffre clé avec son évolution et une petite courbe de tendance.

**Props** : `tone` (fond pastel, sinon carte blanche), `label`, `value` (texte déjà formaté), `emoji` (décoratif), `delta` (`{value, up, good, vs}` : `up` donne la flèche, `good` la couleur), `trend` (6 à 12 valeurs pour la sparkline).

- La couleur de l'évolution dit si c'est une bonne nouvelle (dépenses en baisse = `success`), la flèche dit le sens, et un texte caché le lit aux lecteurs d'écran : jamais la couleur seule.
- L'évolution est dans une petite pilule blanche, lisible sur tous les fonds pastel.
- Trois tuiles maximum sur une ligne, en tête de l'écran Argent ou du bilan.
