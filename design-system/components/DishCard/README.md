# DishCard

Carte du jeu « Qu'est-ce qu'on mange ? » : chacun swipe de son côté, sans voir les choix de l'autre.

**Props** : `name`, `emoji` (sinon trouvé automatiquement à partir du nom avec `foodEmoji`) ou `image` (URL), `tone` (fond du visuel), `tags`, `onNo`, `onYes`, `actions={false}` pour masquer les boutons.

- Swipe à droite ou coeur `heart` = j'ai envie ; à gauche ou croix = pas envie.
- N'affiche jamais le choix du partenaire avant le match.
- Une photo réelle du plat remplace l'emoji dès qu'elle existe.
- Chaque plat montre l'emoji qui le représente : lasagnes 🍝, riz 🍚, banane 🍌, tajine 🥘, curry 🍛. Un plat inconnu prend 🍽️ ; dans ce cas, passe l'emoji à la main.
