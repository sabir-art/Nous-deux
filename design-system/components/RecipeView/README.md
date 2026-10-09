# RecipeView

Fiche recette complète, ouverte après un match ou depuis la liste des recettes.

**Props** : `recipe` (`{name, emoji?, image?, tone, matched?, by?, time, difficulty, servings, ingredients: [{name, qty, emoji?, tone?}], steps: [{title, text, timer?, timerLabel?}]}`), `favorite`, `onClose`, `onAddToList`.

- En-tête coloré avec l'emoji du plat (ou une photo), boutons ronds Fermer et Favori, sticker « votre match » si elle vient du jeu.
- Feuille arrondie qui chevauche l'en-tête : titre, qui l'a ajoutée, trois tuiles (temps, difficulté, portions).
- « Pour combien ? » : le compteur recalcule toutes les quantités.
- Onglets noirs en pilule Ingrédients / Étapes. Les ingrédients sont des `FoodItem` à cocher avec leur emoji ; l'étape en cours ressort en carte blanche, avec un minuteur si l'étape en a un.
- « Ajouter aux courses » envoie les ingrédients non cochés dans la liste commune.
