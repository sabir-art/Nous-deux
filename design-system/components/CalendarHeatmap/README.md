# CalendarHeatmap

Calendrier du mois où chaque jour se colore selon le montant dépensé.

**Props** : `title`, `subtitle`, `month`, `startDow` (0 = lundi, colonne du 1er du mois), `days` (`[{day, value, today?}]`).

- Échelle séquentielle d'une seule couleur, `seq-1` à `seq-5`, avec sa légende « Moins / Plus ». Un jour sans dépense reste en `surface-sunken`.
- Chaque jour est focalisable et annonce sa date et son montant.
