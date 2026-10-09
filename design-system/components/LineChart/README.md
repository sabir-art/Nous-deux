# LineChart

Courbe pour suivre une évolution dans le temps (épargne, solde du compte commun).

**Props** : `title`, `subtitle`, `labels` (axe du temps), `series` (`[{name, values, color?}]`), `goal` (ligne pointillée d'objectif), `emoji`, `badge`, `headline`, `fromZero`, `unit`, `summary`.

- Courbe douce de 3 px, remplissage léger dessous, gros point final avec anneau blanc. Le grand chiffre en haut donne la dernière valeur.
- L'objectif est une ligne pointillée ronde avec son étiquette noire en pilule.
- Une seule série : léger remplissage à 10 % sous la courbe. Plusieurs séries : légende et pas de remplissage.
- Survol et focus clavier affichent une ligne verticale et toutes les valeurs du mois.
- Un seul axe vertical, jamais deux échelles sur le même graphique.
