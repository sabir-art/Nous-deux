# BarChart

Colonnes pour comparer des montants par période, une ou deux séries.

**Props** : `title`, `subtitle`, `data` (`[{label, values: []}]`), `emoji`, `badge` (`{text, tone}`), `headline`, `current` (mois mis en avant), `series` (`[{name, who?, color?}]`, `who` affiche l'avatar dans la légende, la série 1 est toujours la personne A et la 2 la personne B), `unit` (€ par défaut), `xLabel`, `summary` (phrase qui résume le graphique pour les lecteurs d'écran).

- Colonnes en pilule (arrondies aux deux bouts) posées dans une piste pilule grise, comme la `PaydayCard`. Le pic porte une petite étiquette citron penchée.
- Le grand chiffre en haut donne le total du mois en cours, avec un sticker optionnel (`badge`).
- Les mois sont en pastilles sous le graphique, le mois en cours en noir.
- Le reste se lit au survol, au focus clavier ou dans le tableau.
- Six périodes maximum sur mobile.
