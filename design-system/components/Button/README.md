# Button

Bouton en pilule pour toutes les actions de l'app.

**Props** : `variant` (`primary` par défaut, `love`, `secondary`, `ghost`, `ink`, `outline`), `size` (`md` ou `lg`), `icon` (nom d'une `Icon`), `children` (le libellé), plus tout attribut de `<button>`.

- `primary` (fond `action`) : l'action principale de l'écran, une seule visible à la fois.
- `love` (fond `heart`) : uniquement pour les gestes de couple (lancer un match, envoyer un coeur, valider un plat ensemble).
- `secondary` : alternative calme à côté d'un primaire.
- `ink` : action principale dans une carte héros citron ou pastel.
- `outline` : action sur fond `sapin` ou foncé, prend la couleur du texte.
- `ghost` : liens d'action dans une liste (« Voir tout »).
- Libellé à l'infinitif ou en verbe court, tutoiement : « Ajouter », « On matche ? ». Jamais en majuscules.
- Ne mets pas deux `love` côte à côte.
