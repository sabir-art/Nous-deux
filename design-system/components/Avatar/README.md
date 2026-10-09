# Avatar

Pastille d'initiales colorée par personne : c'est ce qui dit « qui » partout dans l'app.

**Props** : `name` (prénom, sert aux initiales et au nom accessible), `partner` (`a`, `b` ou `nous`), `size` en px (36 par défaut).

- Personne A toujours en `partner-a`, personne B toujours en `partner-b`, sur tous les écrans. Ne réattribue jamais ces couleurs.
- Une photo peut remplacer les initiales plus tard, mais garde l'anneau `surface` de 2px.
