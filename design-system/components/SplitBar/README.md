# SplitBar

Barre partagée qui montre la part payée par chacun, avec le rééquilibrage à faire en toutes lettres.

**Props** : `title`, `subtitle`, `items` (`[{name, value, color?}]`, A puis B), `verdict` (remplace la phrase calculée, par exemple « Vous êtes à l'équilibre »).

- La phrase du bas (« Karim doit 100 € à Inès ») est l'information principale ; la barre la rend visible d'un coup d'oeil.
- Deux grosses pilules (couleurs `data-1` pour A et `data-2` pour B) avec l'avatar de chacun et son pourcentage en blanc, gros et gras (lisible à 3:1).
- Le verdict est dans une pilule rose avec une petite mascotte : amoureuse à l'équilibre, contente sinon.
