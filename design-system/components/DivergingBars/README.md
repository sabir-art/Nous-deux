# DivergingBars

Barres au-dessus et en dessous d'une ligne zéro, pour voir les mois où l'on épargne et ceux où l'on dépasse.

**Props** : `title`, `subtitle`, `data` (`[{label, value}]`, positif ou négatif), `posLabel`, `negLabel`, `unit`, `summary`.

- Bleu `div-pos` au-dessus, orange `div-neg` en dessous : la paire reste lisible pour les daltoniens, et les valeurs du tableau portent leur signe.
- Jamais le rouge `danger` ni le magenta `heart` ici.
