# SwipeDeck

Le jeu « Qu'est-ce qu'on mange ? » : chacun swipe les plats de son côté, comme sur une app de rencontre, sans voir les choix de l'autre.

**Props** : `dishes` (`[{name, emoji?, tone, tags}]`), `partner` (`{name, partner}`), `partnerDone` (l'autre a fini), `partnerLikes` (les plats que l'autre a aimés, connus du serveur seulement), `onFinish(likes)`, `onOpenRecipe(dish)`.

**Le parcours** :
1. L'un lance un match depuis Recettes ; l'autre reçoit une notification.
2. Chacun swipe : à droite ou cœur = « miam ! », à gauche ou croix = « bof ». La carte suit le doigt et un sticker apparaît selon le sens.
3. Un cadenas rappelle « Inès ne voit pas tes choix ». On voit seulement si l'autre a fini, jamais ce qu'il a choisi.
4. Quand les deux ont fini : `MatchSticker` sur le premier plat en commun, la liste des autres matchs, puis « Voir la recette ». Pas de match : une mascotte endormie propose de rejouer.

- Clavier : la pile est focalisable, flèche droite = j'ai envie, flèche gauche = pas envie. Chaque choix est annoncé aux lecteurs d'écran.
- Les deux boutons ronds restent toujours visibles : le swipe n'est jamais le seul moyen.
