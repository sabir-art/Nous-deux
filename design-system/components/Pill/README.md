# Pill

Pastille filtrable : vue, filtre ou choix rapide.

**Props** : `selected` (booléen, remplit la pastille en `ink`), `icon`, `children`, plus les attributs de `<button>`.

- Sélectionnée : fond `ink`, texte `on-ink`. Non sélectionnée : fond `surface`, bordure `line`.
- Une ligne de pastilles défile horizontalement, ne la fais jamais passer à la ligne.
- Pour un groupe exclusif, utilise `PillGroup`.
