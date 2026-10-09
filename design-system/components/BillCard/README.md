# BillCard

Carte argent : un libellé, un gros montant, un statut en pilule.

**Props** : `label`, `amount` (texte déjà formaté), `status` (`unpaid`, `soon`, `late`, `paid`), `statusText` (remplace le mot par défaut), `children` (contenu sous le montant, par ex. des avatars de payeurs).

- Montant au format français : « 1 250 € », espace insécable avant €.
- Le statut porte toujours un mot ou un délai, jamais la couleur seule.
- Une dépense partagée affiche une `AvatarPair` en `children`.
