# PiggyBank

La tirelire cochon : elle se remplit au fil du mois et montre d'un coup d'oeil où en est le budget commun.

**Props** : `variant` (`classique`, `bulle`, `geo`, `pieces`), `label`, `value` et `goal` (nombres en euros), `mode` (`budget` : ce qui est dépensé, ou `epargne` : ce qui est mis de côté), `note` (remplace la phrase automatique), `envelopes` (`[{label, pct, tone}]`, barres par catégorie sous le cochon).

- Le cochon sourit tant que tout va bien ; à partir de 90 % du budget il fronce le sourcil, transpire un peu et le remplissage passe en pêche. Le pourcentage et la phrase disent toujours la même chose en mots.
- En `epargne`, il reste joyeux et la phrase indique combien il manque pour l'objectif (vacances, canapé).
- Une tirelire par budget ; quatre enveloppes maximum, colorées comme leur catégorie.

**Les quatre cochons** :
- `classique` : cochon dessiné au trait, rempli comme un liquide. Pour l'écran Argent.
- `bulle` : cochon rose tout rond, grands yeux de mascotte, sans contour. Pour l'accueil et les notifications.
- `geo` : cochon déstructuré en formes décalées (oreilles, groin et pattes qui débordent, pièce qui flotte). Pour les cartes héros et l'épargne.
- `pieces` : le cochon se remplit de rangées de pièces. Pour un objectif d'épargne qu'on voit grandir.
- Un seul style de cochon par écran ; garde le même pour un même budget d'un écran à l'autre.
