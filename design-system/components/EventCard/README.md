# EventCard

Ligne d'agenda partagé : la date à gauche, une carte colorée selon la personne concernée à droite.

**Props** : `dow`, `day` (colonne date, omise pour un 2e événement du même jour), `today` (cerclé en `action`), `title`, `meta` (horaires ou montant), `who` (`a`, `b`, `nous`), `names` (`[prénomA, prénomB]`), `tone` pour forcer une couleur (`neutre` pour une facture ou un repas planifié).

- La couleur suit la personne : `partner-a`, `partner-b`, ou `together` pour un événement commun. C'est ce qui permet de voir d'un coup d'oeil le temps de chacun.
- Factures et repas planifiés dans l'agenda : `tone: 'neutre'`.
- Horaires au format 24 h : « 20:00 - 23:00 ».
