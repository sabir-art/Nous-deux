# ChatThread

Fil de discussion du couple, avec la barre de saisie.

**Props** : `messages` (`[{from: 'me'|'them', text, time}]`), `composer` (`false` pour masquer la saisie), `placeholder`.

- Mes messages : bulle `ink` à droite. Ceux du partenaire : bulle `heart-soft` à gauche.
- Un événement, une facture ou un plat partagé dans la discussion s'affiche avec son propre composant, pas en texte.
