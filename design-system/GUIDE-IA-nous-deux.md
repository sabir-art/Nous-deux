# Design system « Nous deux » (A2)

Application d'organisation pour un couple : maison, argent, courses, agenda partagé, discussion, recettes avec matching, jeux du quotidien, plantes. Ce document est la référence complète : couleurs, typographie, espacements, composants et règles. Respecte-le strictement pour tout écran, maquette ou code.

## Brand book

Nous deux (A2) est l'app d'organisation du couple : la maison, l'argent, les courses, l'agenda partagé, la discussion et les petits jeux du quotidien, au même endroit. Le ton est celui de deux personnes qui s'organisent ensemble : doux, clair, un peu joueur, jamais infantilisant. Chaque écran répond à une question simple : « qu'est-ce qui nous attend ? », « où en est-on ? », « qui s'en occupe ? ».

## Principes

- **Toujours savoir qui.** Chaque élément appartient à A, à B ou aux deux. Utilise `partner-a`, `partner-b` et `together` de façon constante, sur tous les écrans, pour que l'agenda se lise d'un coup d'oeil.
- **Une chose importante par carte.** Un titre, un chiffre ou un horaire, un statut. Les détails s'ouvrent au toucher.
- **Le pastel pour classer, le bleu pour agir, le magenta pour aimer.** `action` ne sert qu'aux actions, `heart` qu'aux moments à deux.
- **Déstructuré, pas désordonné.** Les stickers penchent, les formes débordent des cartes, les mascottes dépassent des bords ; la grille, les textes et les chiffres, eux, restent droits et alignés.
- **Le jeu reste léger.** Match de plats, tirage « qui cuisine », points de corvées : une touche de plaisir, jamais de pression ni de classement humiliant.

## Ton et écriture

- Français, tutoiement, et « on » pour le couple : « On mange quoi ce soir ? », « Vous avez matché ! », « Qui s'en occupe ? ».
- Phrases courtes, casse de phrase (« Courses de la semaine », jamais « Courses De La Semaine »), pas de majuscules entières.
- Emoji : un seul, à la fin d'un intitulé d'événement ou de liste (« Course sur la côte 🏃 », « Factures 💸 »). Jamais dans un bouton, un montant ou un statut.
- Dates : « jeu. 6 », « samedi 8 février ». Heures en 24 h : « 20:00 - 23:00 ».
- Argent : « 1 250 € », espace insécable avant €. Récurrent : « 54 € / mois ».
- Statuts toujours en mots : « Payé », « À payer », « Dans 2 jours », « En retard ».
- Salutation d'accueil : « Bonjour, Inès ! » le matin, « Bonsoir, Inès ! » après 18 h.

## Couleurs

- Fond d'écran `canvas` (blanc cassé chaud). Cartes en `surface` avec `shadow-card`. Cartes neutres (factures, recettes) en `surface-sunken`, sans ombre.
- Texte en `ink`, secondaire en `ink-muted`. `ink` se lit aussi sur toutes les couleurs pastel.
- Catégories, toujours la même couleur :
  - `menthe` : Courses et maison
  - `rose` : Repas et sorties à deux
  - `lilas` : Famille et enfants
  - `lavande` : Sport et loisirs
  - `beurre` : Notes et idées
  - `peche` : Voyages
- Personnes : `partner-a` (lavande) et `partner-b` (pêche) pour l'avatar et les événements perso, `together` (rose) pour les événements communs.
- `action` (bleu) : bouton principal, bouton +, date du jour, case cochée. Un seul bouton `action` visible par écran.
- `heart` (magenta du logo) : match, cœur, bouton « On matche ? », autocollant de célébration. Jamais pour une erreur, l'erreur est `danger`. `marque` est la même teinte figée, réservée au logo.
- `citron` : énergie et bonnes nouvelles (carte héros de l'Accueil, stickers). `sapin` : l'ambiance vert profond du module Plantes, texte `on-sapin`.
- Mascottes et tirelire : couleurs `buddy-*`, identiques dans les deux thèmes, avec yeux `eye` et pupilles `pupil`.
- `success`, `warning`, `danger` : statuts uniquement, toujours avec le mot.
- Thème sombre : mêmes rôles, les pastels deviennent des teintes profondes, le texte reste `ink` (clair).

## Typographie

- **Figtree** (`--font-sans`) pour toute l'interface : textes, boutons, montants, graphiques, titres.
- **Fraunces** (`--font-fun`), réglée en version douce (axe SOFT à 100) et surtout en italique, pour la voix fun : stickers, mot clé des titres héros, bulles des plantes, moments de complicité. Jamais pour un paragraphe, un montant ou un formulaire.
- `display` : titre d'écran (« Février », « Argent », « Repas »), en haut à gauche.
- `title` : salutation, titre de feuille. `headline` : titre de carte.
- `body-lg` : bulles et intitulés de tâches. `body` : notes. `label` : pastilles, boutons, onglets. `caption` : heures, compteurs.
- `amount` et `amount-sm` : montants, en chiffres tabulaires.
- `romance` : une ligne maximum par écran. `sticker` : mots des stickers, en minuscules. `hero` : titres des cartes héros en Figtree, avec un seul mot en Fraunces italique (« Prêts à *planter* ? »).

## Espacement, rayons, ombres

- Tout espacement vient de l'échelle `space-*` (grille de 4 px) : aucune valeur libre dans les marges, paddings et écarts.
- Padding interne : pastilles et petits badges `space-1` à `space-2` vertical, `space-3` à `space-4` horizontal ; boutons `space-3` / `space-6` ; cartes `space-5` ; grandes cartes et graphiques `space-5` à `space-6`.
- Une carte a toujours le même padding sur ses quatre côtés, sauf les cartes à visuel pleine largeur (plat, plante).
- Entre un titre et son contenu : `space-3`. Entre deux cartes : `space-3`. Entre deux sections : `space-8`.
- Marge latérale d'écran `space-4`. Écart entre cartes `space-3`. Padding des cartes `space-5`, grandes cartes `space-6`. Entre sections `space-8`.
- Rayons généreux : `radius-lg` pour les cartes et tuiles, `radius-xl` pour les feuilles et la carte plat, `radius-pill` pour pastilles, boutons, avatars et barre de saisie, `radius-md` pour bulles et champs.
- Ombres discrètes : `shadow-card` sur les cartes blanches, `shadow-lift` pour ce qui flotte (carte en cours de swipe, bouton +). Les cartes pastel n'ont pas d'ombre.

## Style déstructuré

- **Stickers** : mots en pilule (`Sticker`), penchés entre -10° et 10°, qui chevauchent un bord de carte ou de photo. Empilés en zigzag (`StickerStack`) sur les écrans d'accueil de module et les états vides.
- **Mascottes** (`Buddy`) : formes douces à grands yeux (blob, pilule, fleur, dôme, pot). Elles réagissent : `love` au match, `happy` quand c'est fait, `wow` pour accueillir, `sleepy` pour un vide ou une plante assoiffée. Elles dépassent du bas des cartes, coupées par le bord, jamais centrées sagement.
- **Formes organiques** : une forme molle ou une fleur qui déborde du coin d'une carte héros (`HeroCard`). Une par carte.
- **Mélange typographique** : Figtree pour la structure, un mot en Fraunces italique pour l'émotion.
- **Mesure** : au plus deux éléments fun par écran (une mascotte et une pile de stickers, par exemple). Les listes, montants, horaires et formulaires restent sobres.

## États et interaction

- Appui : légère réduction (`scale .97`). Survol inutile sur mobile.
- Focus clavier : anneau `focus` plein de 2px, décalé de 2px, sur tout élément interactif.
- Élément fait : barré, `ink-muted`, descend sous un séparateur « Fait ».
- Swipe de plat : la carte suit le doigt et pivote légèrement ; à droite = envie (`heart`), à gauche = pas envie. Toujours doublé par les deux boutons ronds.
- Mouvements courts (150 à 250 ms, sortie douce). Le match a droit à une animation festive : le sticker apparaît en rebond et les mascottes se balancent. Tout s'arrête si l'utilisateur a réduit les animations.

## Modules et composants

- **Accueil** : `HeroCard` citron, salutation `title`, champ « Demande-moi », résumé du jour (« 2 événements et 1 facture ») en `EventCard` et `TodoItem`, raccourcis en `CategoryTile`.
- **Agenda partagé** : `PillGroup` (Nous deux / Inès / Karim), `DayStrip`, liste d'`EventCard` colorées par personne.
- **Argent** : `PiggyBank` en tête d'écran (la tirelire se remplit avec le budget du mois, s'inquiète au-delà de 90 %), `PaydayCard`, `BillCard` pour factures et abonnements, dépenses partagées marquées par `AvatarPair`.
- **Plantes** : `HeroCard` sapin « Prêts à planter ? », puis une `PlantCard` par plante. Chaque plante est une mascotte feuille (`PlantBuddy`) avec un prénom : son humeur change avec le temps depuis le dernier arrosage, elle le dit dans une bulle (« Psst ! C'est l'heure de l'arrosage. »), penche et jaunit quand elle a soif, fane si on l'oublie, et saute de joie quand on l'arrose.
- **Courses et corvées** : listes de `TodoItem`, avec `points` pour les corvées et un tableau des scores.
- **Repas à deux** (détail plus bas) : chacun swipe des `DishCard` de son côté ; au premier plat en commun, `MatchSticker` « C'est un match ! » (deux mascottes qui se trouvent), puis tirage au sort « qui cuisine » annoncé par un second `MatchSticker`.
- **Discussion** : `ChatThread`, qui peut contenir une `EventCard`, une `BillCard` ou une `DishCard` partagée.
- **Navigation** : `TabBar` (Accueil, Agenda, Ajouter, Argent, Nous).

## Graphiques et données

- Les graphiques parlent la même langue que le reste de l'app : carte blanche très arrondie (`radius-xl`) avec une forme pastel qui déborde du coin, pastille emoji à côté du titre, grand chiffre clé en Figtree 800 avec un sticker penché, et le reste en pilules.
- Composants : `StatTile` et `GaugeTile` (tuiles pastel), `BarChart` (colonnes en pilule dans des pistes grises, comme la `PaydayCard`), `LineChart` (courbe douce et objectif en étiquette noire), `SplitBar` (deux grosses pilules avec les avatars), `RankedBars` (tuiles pastel par catégorie), `DivergingBars` (pilules vers le haut ou le bas), `CalendarHeatmap` (jours en ronds), et la tirelire `PiggyBank`.
- Choisis la forme selon la question : une évolution dans le temps = courbe ; la part de chacun = `SplitBar` ; un budget par catégorie = `RankedBars` ; un objectif = `GaugeTile` ; un seul chiffre = `StatTile`. Pas de camembert.
- Les mois sont en pastilles sous le graphique ; le mois en cours (ou celui survolé) passe en noir.
- Couleurs de séries `data-1` à `data-6`, dans cet ordre, jamais permutées : `data-1` est toujours la personne A, `data-2` la personne B, et la légende montre leurs avatars. Palette vérifiée pour les daltoniens et à 3:1 minimum sur le blanc, en clair comme en sombre.
- Sur une tuile pastel, la barre ou la jauge prend la teinte foncée de sa famille (`menthe` va avec `data-3`, `rose` avec `data-5`, `peche` avec `data-2`, `lavande` avec `data-1`, `beurre` avec `data-6`) sur une piste blanche, et le pourcentage est toujours écrit en grand.
- Intensité (calendrier) : `seq-1` à `seq-5`. Positif ou négatif : `div-pos` (bleu) et `div-neg` (orange), jamais le rouge `danger` ni le magenta `heart`.
- Pas de grille ni d'axe chiffré : le grand chiffre, l'étiquette du pic et les pastilles de mois suffisent. Les valeurs exactes se lisent au survol, au focus clavier et dans le tableau (bouton « Tableau »).
- Le texte n'est jamais dans la couleur d'une série, sauf en blanc gras sur une grosse pilule (`SplitBar`).

## Repas à deux : le parcours

1. **Recettes** : liste de `RecipeRow` (vignette emoji, temps, note, qui l'a ajoutée), filtres en `PillGroup`, bouton « Lancer un match ».
2. **Match** : `SwipeDeck`. Chacun swipe de son côté, à droite « miam ! », à gauche « bof ». Un cadenas rappelle que l'autre ne voit pas les choix ; on voit seulement s'il a fini.
3. **Révélation** : quand les deux ont fini, `MatchSticker` sur le premier plat en commun, les autres matchs en dessous, et « Voir la recette ». Pas de match : une mascotte endormie propose de rejouer.
4. **Recette** : `RecipeView` avec le sticker « votre match », le compteur de personnes qui recalcule les quantités, les ingrédients à cocher, les étapes avec minuteur, et « Ajouter aux courses ».
5. **Qui fait quoi** : `WhoDoesItGame`, la roue aux couleurs de chacun tire au sort la cuisine, la vaisselle, les courses ; celui qui ne cuisine pas peut faire automatiquement la vaisselle. « C'est noté » envoie les tâches dans les corvées.

## Iconographie

- Icônes au trait, 24 px, trait 2 px, extrémités et angles arrondis, couleur héritée du texte (`Icon`). Taille 18 px dans les boutons et pastilles.
- Pas de logo de marque tierce dans l'interface : un abonnement s'affiche avec son nom en texte.
- Logo : une maison posée sur un cœur qui sourit, en magenta `marque` (#d60b52). Fichiers dans le groupe Logos : symbole magenta pour les fonds clairs, blanc pour le magenta, le sapin, l'ink et le thème sombre, encre pour le noir et blanc, et l'icône d'application (blanc sur magenta). Règles complètes sur la page Logo : zone de protection, 24 px minimum (32 px pour l'icône), aucune déformation ni autre couleur.
- Le sourire du logo est celui des mascottes : quand elles accompagnent le logo, elles sourient.

## Accessibilité (RGAA 4.1)

Chaque composant est conçu pour respecter le RGAA. Les points à garder en construisant les écrans :

- **Couleurs (thème 3)** : texte à 4,5:1 minimum (3:1 au-delà de 24 px ou 19 px gras), éléments graphiques porteurs de sens et anneau de focus à 3:1. Vérifié pour toutes les paires des notes de tokens, en clair et en sombre. L'information n'est jamais donnée par la couleur seule : statut écrit, flèche + texte, avatar à initiales.
- **Images (thème 1)** : emoji, mascottes, fleurs et formes décoratives sont masqués (`aria-hidden`). Les images porteuses d'information ont une alternative : la tirelire annonce son pourcentage, chaque graphique a un résumé et un tableau de données.
- **Tableaux (thème 5)** : la vue tableau des graphiques a un titre (`caption`), des en-têtes de colonnes et de lignes (`scope`).
- **Liens et boutons (thème 6, 7)** : tout bouton a un nom accessible ; un bouton icône seul porte un `aria-label` (« Envoyer », « J'ai envie »). Les cases à cocher sont des `role="checkbox"` avec `aria-checked`, les filtres des boutons `aria-pressed`, l'onglet actif `aria-current`.
- **Animations (thème 13)** : les mascottes se balancent deux fois puis s'arrêtent (moins de 5 secondes), et toute animation s'arrête si l'utilisateur a réduit les animations.
- **Structure (thème 9)** : un seul titre `display` par écran en `h1`, titres de cartes et de graphiques dans l'ordre logique ; langue `fr` sur la page.
- **Présentation (thème 10)** : focus clavier toujours visible (anneau `focus` de 2 px) ; le texte reste lisible zoomé à 200 % et en largeur de 320 px ; pas d'information portée uniquement par la forme ou la position.
- **Formulaires (thème 11)** : chaque champ a une étiquette (visible ou `aria-label`), la barre de saisie montre son focus.
- **Navigation au clavier (thème 12)** : barres, points et jours des graphiques sont atteignables à la touche Tab et affichent leur valeur au focus.
- **Cibles** : 44 px minimum pour boutons, pastilles, onglets et cases.

- Toutes les paires texte et fond listées dans les notes des tokens atteignent au moins 4,5:1, en clair comme en sombre.
- Les couleurs de personne et de statut ne portent jamais seules l'information : avatar à initiales, mot de statut, délai écrit.
- Cibles tactiles d'au moins 44 px.


## Couleurs (clair / sombre)

| Token | Clair | Sombre | Usage |
|---|---|---|---|
| `canvas` | #f6f3ef | #131116 | Fond d'écran de toutes les pages. |
| `surface` | #ffffff | #1e1b22 | Cartes, feuilles, barre d'onglets. |
| `surface-sunken` | #efebe6 | #29252e | Cartes neutres (factures, recettes), champs de saisie, pastilles non sélectionnées. |
| `line` | #e3ded8 | #3a3541 | Filets, bordures de pastilles et de champs. |
| `ink` | #1d1a23 | #f4f1f6 | Texte principal sur canvas, surface, surface-sunken et sur toutes les couleurs pastel. Remplit la pastille sélectionnée. |
| `ink-muted` | #655f6e | #ada6b6 | Texte secondaire (heures, métadonnées) sur canvas, surface et surface-sunken. |
| `on-ink` | #ffffff | #131116 | Texte sur un fond ink (pastille sélectionnée, bulle sombre). |
| `action` | #0a66cc | #5aa8ff | Action principale : bouton primaire, bouton +, coche validée, date du jour. Texte action sur canvas et surface. |
| `on-action` | #ffffff | #0a1626 | Texte et icônes posés sur action. |
| `action-soft` | #e2eefc | #172a42 | Fond teinté derrière une info liée à une action (rappel, lien). |
| `marque` | #d60b52 | #d60b52 | Magenta exact du logo Nous deux, identique dans les deux thèmes. Réservé au logo et à l'icône d'app ; dans l'interface, utilise heart. |
| `heart` | #d60b52 | #ff6b9b | Le couple et la marque : magenta du logo. Match, coeur, moments à deux, bouton « On matche ? ». Jamais pour une erreur. Texte heart sur canvas et surface (4,7:1 et plus). |
| `on-heart` | #ffffff | #2a0a12 | Texte posé sur heart. |
| `heart-soft` | #fce3e8 | #3b1b23 | Fond des messages du partenaire et des bandeaux de match. |
| `lavande` | #cdcdf5 | #302e55 | Catégorie Sport et loisirs, partenaire A. Texte ink. |
| `rose` | #fbc2da | #4b2439 | Catégorie Repas et sorties à deux. Texte ink. |
| `lilas` | #eac4ee | #41294b | Catégorie Famille et enfants. Texte ink. |
| `menthe` | #b0ead5 | #183f33 | Catégorie Courses et maison. Texte ink. |
| `beurre` | #faec94 | #3f3816 | Catégorie Notes et idées, tirelire, mise en avant légère. Texte ink. |
| `peche` | #ffd4ba | #4a2d1c | Partenaire B, catégorie Voyages. Texte ink. |
| `citron` | #cbef5c | #3b4712 | Énergie, bonne nouvelle, cartes héros et stickers. Texte ink. |
| `sapin` | #1e4d3b | #2c6a50 | Module Plantes : panneaux et cartes plante. Texte on-sapin. |
| `on-sapin` | #fff7e3 | #fff7e3 | Texte crème posé sur sapin. |
| `eye` | #ffffff | #ffffff | Blanc des yeux des mascottes, identique dans les deux thèmes. |
| `pupil` | #1d1a23 | #1d1a23 | Pupilles et sourcils des mascottes, identique dans les deux thèmes. |
| `buddy-lavande` | #cdcdf5 | #cdcdf5 | Corps des mascottes (Buddy) et de la tirelire en lavande, identique dans les deux thèmes pour garder des mascottes vives en sombre. |
| `buddy-rose` | #fbc2da | #fbc2da | Corps des mascottes (Buddy) et de la tirelire en rose, identique dans les deux thèmes pour garder des mascottes vives en sombre. |
| `buddy-lilas` | #eac4ee | #eac4ee | Corps des mascottes (Buddy) et de la tirelire en lilas, identique dans les deux thèmes pour garder des mascottes vives en sombre. |
| `buddy-menthe` | #b0ead5 | #b0ead5 | Corps des mascottes (Buddy) et de la tirelire en menthe, identique dans les deux thèmes pour garder des mascottes vives en sombre. |
| `buddy-beurre` | #faec94 | #faec94 | Corps des mascottes (Buddy) et de la tirelire en beurre, identique dans les deux thèmes pour garder des mascottes vives en sombre. |
| `buddy-peche` | #ffd4ba | #ffd4ba | Corps des mascottes (Buddy) et de la tirelire en peche, identique dans les deux thèmes pour garder des mascottes vives en sombre. |
| `buddy-citron` | #cbef5c | #cbef5c | Corps des mascottes (Buddy) et de la tirelire en citron, identique dans les deux thèmes pour garder des mascottes vives en sombre. |
| `leaf` | #8fd16f | #8fd16f | Feuillage des mascottes plantes en forme. Identique dans les deux thèmes, décoratif. |
| `leaf-deep` | #3f8f45 | #3f8f45 | Tiges, nervures et petites feuilles des mascottes plantes. Identique dans les deux thèmes, décoratif. |
| `leaf-dry` | #c9cc62 | #c9cc62 | Feuillage d'une plante qui a soif. Identique dans les deux thèmes, décoratif. |
| `leaf-wilt` | #c4a067 | #c4a067 | Feuillage d'une plante qui fane, pas arrosée depuis trop longtemps. Identique dans les deux thèmes, décoratif. |
| `water` | #5aa8ff | #5aa8ff | Gouttes d'eau et de sueur des mascottes. Identique dans les deux thèmes, décoratif. |
| `partner-a` | #cdcdf5 | #302e55 | Couleur de la personne A : avatar, événements perso dans l'agenda partagé. |
| `partner-b` | #ffd4ba | #4a2d1c | Couleur de la personne B : avatar, événements perso dans l'agenda partagé. |
| `together` | #fbc2da | #4b2439 | Ce qui concerne les deux : événements communs, dépenses partagées. |
| `success` | #18714a | #62d6a2 | Statut Payé, tâche faite. Toujours accompagné du mot. |
| `warning` | #9a5200 | #ffb866 | Échéance proche (moins de 3 jours). Toujours accompagné du délai. |
| `danger` | #b8301c | #ff8c78 | Retard, erreur. Toujours accompagné du mot. |
| `focus` | #0a66cc | #5aa8ff | Anneau de focus clavier, 2px plein, décalé de 2px. |
| `data-1` | #6a5fd8 | #7f74e6 | Série 1 des graphiques, et toujours la personne A (lavande). Ordre fixe, jamais permuté. Marques uniquement, jamais du texte. |
| `data-2` | #d4701c | #d27426 | Série 2, et toujours la personne B (pêche). Ordre fixe, jamais permuté. Marques uniquement, jamais du texte. |
| `data-3` | #167a5a | #1b9470 | Série 3 (vert). Ordre fixe, jamais permuté. Marques uniquement, jamais du texte. |
| `data-4` | #2f86d6 | #3a8ae0 | Série 4 (bleu), pôle positif des graphiques divergents. Ordre fixe, jamais permuté. Marques uniquement, jamais du texte. |
| `data-5` | #d9487a | #d9578a | Série 5 (rose). Ordre fixe, jamais permuté. Marques uniquement, jamais du texte. |
| `data-6` | #8f830a | #9d9016 | Série 6 (olive). Au-delà de 6 séries, regrouper en « Autres ». Ordre fixe, jamais permuté. Marques uniquement, jamais du texte. |
| `seq-1` | #e1f4ea | #1d2a25 | Échelle séquentielle (intensité), pas 1 sur 5, du plus faible au plus fort. Calendrier de dépenses. |
| `seq-2` | #a9e3c8 | #1f4a3a | Échelle séquentielle (intensité), pas 2 sur 5, du plus faible au plus fort. Calendrier de dépenses. |
| `seq-3` | #5cbf93 | #2c7a5a | Échelle séquentielle (intensité), pas 3 sur 5, du plus faible au plus fort. Calendrier de dépenses. |
| `seq-4` | #1f8058 | #4fb487 | Échelle séquentielle (intensité), pas 4 sur 5, du plus faible au plus fort. Calendrier de dépenses. |
| `seq-5` | #11573d | #a3e8c8 | Échelle séquentielle (intensité), pas 5 sur 5, du plus faible au plus fort. Calendrier de dépenses. |
| `div-pos` | #2f86d6 | #3a8ae0 | Graphique divergent : côté positif (épargné, sous le budget). |
| `div-neg` | #d4701c | #d27426 | Graphique divergent : côté négatif (dépassé). Bleu et orange restent distincts pour les daltoniens. |
| `chart-grid` | #ebe7e2 | #2f2b35 | Lignes de grille et ligne de base, 1px plein. |
| `chart-muted` | #9a93a3 | #6f6878 | Courbe secondaire (sparkline, période précédente). |


## Typographie

Polices : Figtree (interface) et Fraunces SOFT 100 (voix fun, surtout en italique), sur Google Fonts.


| Style | Police | Taille / interligne | Graisse | Usage |
|---|---|---|---|---|
| `display` | Figtree | 40px / 44px | 800 | Titre d'écran, un seul par écran, en haut à gauche. |
| `title` | Figtree | 28px / 32px | 700 | Salutation, titre de feuille ou de section forte. |
| `headline` | Figtree | 22px / 28px | 700 | Titre de carte (événement, tuile, plat). |
| `body-lg` | Figtree | 18px / 26px | 500 | Bulles de discussion, intitulés de tâches. |
| `body` | Figtree | 16px / 22px | 400 | Texte courant, notes sous un intitulé. |
| `label` | Figtree | 14px / 18px | 600 | Pastilles, boutons, en-têtes de jour, onglets. |
| `caption` | Figtree | 13px / 16px | 500 | Heures, compteurs, métadonnées. |
| `amount` | Figtree | 44px / 48px | 800 | Montants clés (factures, budget), chiffres proportionnels en grand. |
| `amount-sm` | Figtree | 22px / 28px | 700 | Montants dans une liste ou une carte secondaire. |
| `romance` | Fraunces | 34px / 38px | 500 italique | Moments à deux en Fraunces italique : match de plat, objectif atteint. Une ligne maximum par écran. |
| `sticker` | Fraunces | 30px / 34px | 800 italique | Mots des stickers (Sticker, StickerStack), un à trois mots, en minuscules, en Fraunces italique. |
| `hero` | Figtree | 44px / 44px | 800 | Titre des cartes héros, en Figtree, avec un mot clé en Fraunces italique. |


## Espacements

| Token | Valeur | Usage |
|---|---|---|
| `space-1` | 4px | Écart entre icône et compteur. |
| `space-2` | 8px | Écart entre pastilles, entre avatars et texte. |
| `space-3` | 12px | Écart entre cartes d'une liste. |
| `space-4` | 16px | Marge latérale d'écran, padding des petites cartes. |
| `space-5` | 20px | Padding des cartes d'événement et de tuiles. |
| `space-6` | 24px | Padding des grandes cartes (argent, plat). |
| `space-8` | 32px | Séparation entre sections d'un écran. |
| `space-10` | 40px | Respiration sous le titre d'écran. |


## Rayons

| Token | Valeur | Usage |
|---|---|---|
| `radius-sm` | 8px | Badge compteur dans une tuile. |
| `radius-md` | 16px | Champs de saisie, petites cartes, bulles. |
| `radius-lg` | 24px | Cartes d'événement, tuiles, cartes argent. |
| `radius-xl` | 32px | Feuilles modales, carte plat à swiper. |
| `radius-pill` | 999px | Pastilles, boutons, avatars, barre de saisie. |


## Ombres

| Token | Clair | Usage |
|---|---|---|
| `shadow-card` | 0 1px 2px rgba(29,26,35,0.04), 0 8px 24px rgba(29,26,35,0.06) | Cartes blanches posées sur canvas. |
| `shadow-lift` | 0 12px 32px rgba(29,26,35,0.16) | Carte plat en cours de swipe, bouton + flottant. |


## Composants

Tous les composants existent en React dans `components/bundle.js` (objet global `window.NousDeux`) avec leurs styles dans `components/bundle.css` et leurs props dans `components/index.d.ts`.

### Avatar

Pastille d'initiales colorée par personne : c'est ce qui dit « qui » partout dans l'app.

**Props** : `name` (prénom, sert aux initiales et au nom accessible), `partner` (`a`, `b` ou `nous`), `size` en px (36 par défaut).

- Personne A toujours en `partner-a`, personne B toujours en `partner-b`, sur tous les écrans. Ne réattribue jamais ces couleurs.
- Une photo peut remplacer les initiales plus tard, mais garde l'anneau `surface` de 2px.


### AvatarPair

Les deux avatars chevauchés : marque tout ce qui concerne le couple (événement commun, dépense partagée, liste commune).

**Props** : `a`, `b` (prénoms), `size`.

- Ordre fixe : A puis B.


### BarChart

Colonnes pour comparer des montants par période, une ou deux séries.

**Props** : `title`, `subtitle`, `data` (`[{label, values: []}]`), `emoji`, `badge` (`{text, tone}`), `headline`, `current` (mois mis en avant), `series` (`[{name, who?, color?}]`, `who` affiche l'avatar dans la légende, la série 1 est toujours la personne A et la 2 la personne B), `unit` (€ par défaut), `xLabel`, `summary` (phrase qui résume le graphique pour les lecteurs d'écran).

- Colonnes en pilule (arrondies aux deux bouts) posées dans une piste pilule grise, comme la `PaydayCard`. Le pic porte une petite étiquette citron penchée.
- Le grand chiffre en haut donne le total du mois en cours, avec un sticker optionnel (`badge`).
- Les mois sont en pastilles sous le graphique, le mois en cours en noir.
- Le reste se lit au survol, au focus clavier ou dans le tableau.
- Six périodes maximum sur mobile.


### BillCard

Carte argent : un libellé, un gros montant, un statut en pilule.

**Props** : `label`, `amount` (texte déjà formaté), `status` (`unpaid`, `soon`, `late`, `paid`), `statusText` (remplace le mot par défaut), `children` (contenu sous le montant, par ex. des avatars de payeurs).

- Montant au format français : « 1 250 € », espace insécable avant €.
- Le statut porte toujours un mot ou un délai, jamais la couleur seule.
- Une dépense partagée affiche une `AvatarPair` en `children`.


### Buddy

Les mascottes de l'app : des formes douces avec des grands yeux, qui réagissent à ce qui se passe.

**Props** : `shape` (`blob`, `pill`, `flower`, `dome`, `pot`), `tone` (`lavande`, `rose`, `lilas`, `menthe`, `beurre`, `peche`, `citron`, `heart`), `mood` (`wow`, `happy`, `love`, `sleepy`), `look` (`left`, `right`, `up`, `down`), `size` en px (96 par défaut), `bob` (balancement doux), `label` si la mascotte porte un sens.

- `love` pour un match ou un geste à deux, `happy` pour une tâche faite ou un objectif atteint, `wow` pour accueillir ou surprendre, `sleepy` pour un état vide ou en attente (plante assoiffée, liste vide).
- Place-les en débord : qui dépassent du bas d'une carte (`dome`), coupées par un bord, jamais centrées sagement au milieu.
- Une ou deux mascottes par écran maximum. Elles ne remplacent jamais un texte d'information.


### Button

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


### CalendarHeatmap

Calendrier du mois où chaque jour se colore selon le montant dépensé.

**Props** : `title`, `subtitle`, `month`, `startDow` (0 = lundi, colonne du 1er du mois), `days` (`[{day, value, today?}]`).

- Échelle séquentielle d'une seule couleur, `seq-1` à `seq-5`, avec sa légende « Moins / Plus ». Un jour sans dépense reste en `surface-sunken`.
- Chaque jour est focalisable et annonce sa date et son montant.


### CategoryTile

Tuile pastel d'entrée vers un module, avec un compteur. Reprend la grille colorée des fiches santé.

**Props** : `title`, `count` (nombre ou texte court comme « O+ »), `tone` (`lavande`, `rose`, `lilas`, `menthe`, `beurre`, `peche`, `neutre`), `onClick`.

- Toujours en grille de 2 colonnes, espacées de `space-3`.
- Couleur fixe par catégorie (voir le brand book), ne la change pas d'un écran à l'autre.
- Un titre de deux mots maximum.


### ChatThread

Fil de discussion du couple, avec la barre de saisie.

**Props** : `messages` (`[{from: 'me'|'them', text, time}]`), `composer` (`false` pour masquer la saisie), `placeholder`.

- Mes messages : bulle `ink` à droite. Ceux du partenaire : bulle `heart-soft` à gauche.
- Un événement, une facture ou un plat partagé dans la discussion s'affiche avec son propre composant, pas en texte.


### DayStrip

Bande de la semaine en haut de l'agenda, avec des points de couleur par personne sous chaque jour.

**Props** : `days` (`[{dow, day, who: ['a'|'b'|'nous']}]`), `selected` (numéro du jour), `onSelect`.

- Le jour sélectionné est cerclé en `action`.
- Trois points maximum par jour.


### DishCard

Carte du jeu « Qu'est-ce qu'on mange ? » : chacun swipe de son côté, sans voir les choix de l'autre.

**Props** : `name`, `emoji` (sinon trouvé automatiquement à partir du nom avec `foodEmoji`) ou `image` (URL), `tone` (fond du visuel), `tags`, `onNo`, `onYes`, `actions={false}` pour masquer les boutons.

- Swipe à droite ou coeur `heart` = j'ai envie ; à gauche ou croix = pas envie.
- N'affiche jamais le choix du partenaire avant le match.
- Une photo réelle du plat remplace l'emoji dès qu'elle existe.
- Chaque plat montre l'emoji qui le représente : lasagnes 🍝, riz 🍚, banane 🍌, tajine 🥘, curry 🍛. Un plat inconnu prend 🍽️ ; dans ce cas, passe l'emoji à la main.


### DivergingBars

Barres au-dessus et en dessous d'une ligne zéro, pour voir les mois où l'on épargne et ceux où l'on dépasse.

**Props** : `title`, `subtitle`, `data` (`[{label, value}]`, positif ou négatif), `posLabel`, `negLabel`, `unit`, `summary`.

- Bleu `div-pos` au-dessus, orange `div-neg` en dessous : la paire reste lisible pour les daltoniens, et les valeurs du tableau portent leur signe.
- Jamais le rouge `danger` ni le magenta `heart` ici.


### EventCard

Ligne d'agenda partagé : la date à gauche, une carte colorée selon la personne concernée à droite.

**Props** : `dow`, `day` (colonne date, omise pour un 2e événement du même jour), `today` (cerclé en `action`), `title`, `meta` (horaires ou montant), `who` (`a`, `b`, `nous`), `names` (`[prénomA, prénomB]`), `tone` pour forcer une couleur (`neutre` pour une facture ou un repas planifié).

- La couleur suit la personne : `partner-a`, `partner-b`, ou `together` pour un événement commun. C'est ce qui permet de voir d'un coup d'oeil le temps de chacun.
- Factures et repas planifiés dans l'agenda : `tone: 'neutre'`.
- Horaires au format 24 h : « 20:00 - 23:00 ».


### FoodItem

Ligne d'article de courses ou d'ingrédient, avec son emoji qui dit tout de suite ce que c'est.

**Props** : `name`, `qty`, `emoji` (sinon trouvé automatiquement à partir du nom), `tone` (fond de la vignette emoji), `done` + `onToggle`, `checkable={false}` pour une liste d'ingrédients sans case.

- Chaque aliment a son emoji : riz 🍚, banane 🍌, tomate 🍅, lait 🥛, poulet 🍗, pâtes 🍝… La fonction `foodEmoji(nom)` couvre plus de 150 aliments et plats, et renvoie 🍽️ si elle ne trouve rien.
- L'emoji est décoratif (masqué aux lecteurs d'écran) : le nom écrit porte toujours l'information.


### GaugeTile

Tuile pastel avec une jauge en demi-cercle, pour un objectif ou un budget d'un coup d'oeil.

**Props** : `label`, `emoji`, `value`, `max` (100 par défaut), `display` (valeur écrite, par exemple « 386 € / 400 € »), `caption`, `tone` (fond pastel), `color` (couleur de la jauge, sinon celle qui va avec le ton).

- Le pourcentage est écrit au centre et la valeur dessous : la jauge n'est jamais la seule information.
- Deux ou trois tuiles côte à côte, en grille.


### HeroCard

Grande carte d'en-tête au style déstructuré : forme organique qui déborde en haut, mascotte qui dépasse en bas, titre qui mêle Figtree et Fraunces.

**Props** : `tone` (`citron`, `sapin`, ou une couleur pastel), `title` (un `<em>` y passe le mot clé en Fraunces italique), `text`, `action` (libellé du bouton), `onAction`, `buddy` (props de `Buddy`).

- Une seule par écran, tout en haut de l'Accueil ou d'un module.
- Un seul mot en `<em>` dans le titre.
- `sapin` pour le module Plantes, `citron` pour l'Accueil et les bonnes nouvelles.


### Icon

Icônes au trait de l'app : 24 px, trait 2 px, extrémités arrondies, couleur héritée du texte.

**Props** : `name` (`home`, `calendar`, `plus`, `wallet`, `chat`, `heart`, `check`, `x`, `cart`, `meal`, `send`, `sparkle`, `clock`, `lock`, `chevron`, `minus`), `size` (`sm` = 18 px), `label` (nom accessible si l'icône est seule).

- Icône seule dans un bouton : donne un `aria-label` au bouton.
- Pas d'icône remplie, sauf l'onglet actif (remplissage à 12 %).


### LineChart

Courbe pour suivre une évolution dans le temps (épargne, solde du compte commun).

**Props** : `title`, `subtitle`, `labels` (axe du temps), `series` (`[{name, values, color?}]`), `goal` (ligne pointillée d'objectif), `emoji`, `badge`, `headline`, `fromZero`, `unit`, `summary`.

- Courbe douce de 3 px, remplissage léger dessous, gros point final avec anneau blanc. Le grand chiffre en haut donne la dernière valeur.
- L'objectif est une ligne pointillée ronde avec son étiquette noire en pilule.
- Une seule série : léger remplissage à 10 % sous la courbe. Plusieurs séries : légende et pas de remplissage.
- Survol et focus clavier affichent une ligne verticale et toutes les valeurs du mois.
- Un seul axe vertical, jamais deux échelles sur le même graphique.


### Logo

Le logo Nous deux et ses règles d'usage.

- **Zone de protection** : garde autour du symbole un espace vide au moins égal à la hauteur de la fenêtre de la maison (les quatre petits carrés), multipliée par deux.
- **Taille minimale** : 24 px de haut pour le symbole seul, 32 px pour l'icône d'app. En dessous, la fenêtre et le sourire disparaissent.
- **Couleurs autorisées** : magenta `marque` sur fond clair, blanc sur magenta, sapin, ink ou thème sombre, ink pour le noir et blanc. Aucune autre couleur.
- **À ne pas faire** : déformer, pivoter, ajouter une ombre ou un contour, séparer la maison du cœur, remplacer le sourire, poser le magenta sur un fond pastel saturé ou sur une photo chargée.
- **Avec le nom** : « Nous deux » en Figtree 800, en `ink` ou en blanc, à droite du symbole et centré sur sa hauteur, avec un écart égal à la largeur du toit divisée par deux.
- Le sourire du logo est le même que celui des mascottes : quand une mascotte accompagne le logo, elle sourit (`happy` ou `love`).


### MatchSticker

Le moment du match, en scène : deux mascottes (une par personne) qui se trouvent, un sticker magenta qui pop et un sticker citron pour le détail.

**Props** : `title` (« C'est un match ! » par défaut), `subtitle` (le plat, ou qui cuisine), `toneA`, `toneB` (couleurs des deux mascottes, `lavande` et `peche` par défaut).

- S'affiche plein écran par-dessus la pile de plats, au moment où les deux ont swipé le même plat, puis à nouveau pour le résultat du tirage « qui cuisine ».
- Le titre apparaît avec un rebond, les mascottes se balancent doucement (désactivé si l'utilisateur a réduit les animations).
- Titre en trois à cinq mots, sous-titre en minuscules et en trois à quatre mots.


### PaydayCard

Compte à rebours jusqu'à la paie, en barres verticales : une barre par jour.

**Props** : `total` (jours du cycle), `elapsed` (jours passés), `title` pour remplacer « N jours avant la paie ».

- Une seule carte de ce type, en haut de l'écran Argent.


### PiggyBank

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


### Pill

Pastille filtrable : vue, filtre ou choix rapide.

**Props** : `selected` (booléen, remplit la pastille en `ink`), `icon`, `children`, plus les attributs de `<button>`.

- Sélectionnée : fond `ink`, texte `on-ink`. Non sélectionnée : fond `surface`, bordure `line`.
- Une ligne de pastilles défile horizontalement, ne la fais jamais passer à la ligne.
- Pour un groupe exclusif, utilise `PillGroup`.


### PillGroup

Groupe de pastilles à choix unique (vue d'agenda, filtre par personne, onglets Repas / Recettes).

**Props** : `options` (`[{value, label}]`), `value` et `onChange` pour le piloter, ou `defaultValue` pour le laisser gérer son état, `label` (nom accessible du groupe).

- Premier choix = la vue « Nous deux » quand le filtre porte sur les personnes.
- Trois à cinq options maximum.


### PlantBuddy

La collection de mascottes plantes : de petits personnages feuilles qui vivent, réagissent et parlent selon l'arrosage.

**Props** : `species` (`feuille`, `pousse`, `monstera`, `cactus`), `name` (le surnom de la plante), `daysSinceWater` et `every` (l'humeur se calcule toute seule), `mood` pour la forcer (`love`, `happy`, `ok`, `thirsty`, `sad`, `sleep`), `night` (elle dort), `potTone`, `size`, `phrase` (remplace la phrase automatique), `speech={false}` pour masquer la bulle, `interactive` (on peut la toucher, elle réagit et change de phrase), `waterButton` (bouton « Arroser » intégré), `onWater`, `onPoke`.

**Comment l'humeur évolue** (jours depuis l'arrosage, par rapport au rythme `every`) :
- Arrosée aujourd'hui : `love`, yeux en cœur, gouttes qui tombent, petits cœurs. « Glou glou, je revis ! »
- Moins de 60 % du délai : `happy`, grand sourire, joues roses. « Je me sens pousser des feuilles ! »
- Avant l'échéance : `ok`, petit sourire. « Encore 2 jours et j'aurai soif. »
- Échéance passée : `thirsty`, feuillage qui jaunit, elle penche, regarde en l'air et transpire. « Psst ! C'est l'heure de l'arrosage. »
- Bien trop longtemps : `sad`, feuillage fané, elle s'affaisse, sourcils tristes, une larme. « Je commence à faner, au secours ! »
- La nuit : `sleep`, yeux fermés, petits « z ». « Chut, je fais ma nuit. »

**Animations** : balancement doux à l'arrivée, clignement des yeux, rebond quand on la touche ou qu'on l'arrose, frisson quand elle fane. Chaque animation dure moins de 5 secondes puis s'arrête, et tout est coupé si l'utilisateur a réduit les animations.

- La phrase est dans une bulle annoncée aux lecteurs d'écran (`aria-live`) ; l'état de la plante est aussi dans le nom accessible (« Fifi, a soif »).
- Couleurs `leaf`, `leaf-deep`, `leaf-dry`, `leaf-wilt` et `water`, identiques dans les deux thèmes.
- Une mascotte par plante, toujours la même espèce et le même pot pour une plante donnée. Donnez-leur un prénom : elles parlent en leur nom.


### PlantCard

Fiche d'une plante du module Plantes : sa mascotte `PlantBuddy` qui parle, qui l'arrose et le calendrier d'arrosage de la semaine.

**Props** : `name`, `species` (`feuille`, `pousse`, `monstera`, `cactus`), `potTone`, `every` (rythme d'arrosage en jours) et `daysSinceWater` (l'humeur et le sticker en découlent), `thirsty` (raccourci), `night`, `next` (prochaine action en mots), `who` (`{name, partner}`), `week` (`[{dow, day, state: 'due'|'done', today}]`), `action`, `onWater`.

- Fond `sapin`, texte `on-sapin`, bouton citron : le module Plantes a sa propre ambiance vert profond.
- Jours à arroser en `menthe`, jours arrosés en `citron` avec une coche, aujourd'hui cerclé.
- L'état de la plante s'écrit toujours en toutes lettres (sticker, phrase de la mascotte, date du prochain arrosage).
- Au clic sur « C'est arrosé », la mascotte passe en `love` (gouttes, cœurs, « Glou glou, je revis ! ») et le jour est coché.


### RankedBars

Grille de tuiles pastel, une par catégorie, pour voir où en est chaque budget.

**Props** : `title`, `subtitle`, `items` (`[{label, value, emoji?, budget?, tone?}]`), `emoji`.

- Chaque tuile : nom, emoji dans une pastille blanche, pourcentage du budget en grand, barre pilule (piste blanche, remplissage de la couleur foncée qui va avec le pastel) et « 386 € / 400 € ».
- Un dépassement colle un sticker magenta « dépassé » sur le coin de la tuile.
- La couleur de la tuile suit la catégorie (voir le brand book).
- Emoji décoratif devant chaque catégorie (masqué aux lecteurs d'écran, le nom suffit). Six catégories maximum, le reste dans « Autres ».


### RecipeRow

Ligne de la liste des recettes : vignette pastel avec l'emoji du plat, nom, temps, note et qui l'a ajoutée.

**Props** : `name`, `emoji` (sinon trouvé à partir du nom), `tone`, `time`, `rating`, `by` (`{name, partner}`), `onClick`.

- Au-dessus de la liste : un `PillGroup` pour filtrer (Tout, Petit-déj, Déjeuner, Dîner) et le bouton « Lancer un match ».


### RecipeView

Fiche recette complète, ouverte après un match ou depuis la liste des recettes.

**Props** : `recipe` (`{name, emoji?, image?, tone, matched?, by?, time, difficulty, servings, ingredients: [{name, qty, emoji?, tone?}], steps: [{title, text, timer?, timerLabel?}]}`), `favorite`, `onClose`, `onAddToList`.

- En-tête coloré avec l'emoji du plat (ou une photo), boutons ronds Fermer et Favori, sticker « votre match » si elle vient du jeu.
- Feuille arrondie qui chevauche l'en-tête : titre, qui l'a ajoutée, trois tuiles (temps, difficulté, portions).
- « Pour combien ? » : le compteur recalcule toutes les quantités.
- Onglets noirs en pilule Ingrédients / Étapes. Les ingrédients sont des `FoodItem` à cocher avec leur emoji ; l'étape en cours ressort en carte blanche, avec un minuteur si l'étape en a un.
- « Ajouter aux courses » envoie les ingrédients non cochés dans la liste commune.


### SplitBar

Barre partagée qui montre la part payée par chacun, avec le rééquilibrage à faire en toutes lettres.

**Props** : `title`, `subtitle`, `items` (`[{name, value, color?}]`, A puis B), `verdict` (remplace la phrase calculée, par exemple « Vous êtes à l'équilibre »).

- La phrase du bas (« Karim doit 100 € à Inès ») est l'information principale ; la barre la rend visible d'un coup d'oeil.
- Deux grosses pilules (couleurs `data-1` pour A et `data-2` pour B) avec l'avatar de chacun et son pourcentage en blanc, gros et gras (lisible à 3:1).
- Le verdict est dans une pilule rose avec une petite mascotte : amoureuse à l'équilibre, contente sinon.


### StatTile

Chiffre clé avec son évolution et une petite courbe de tendance.

**Props** : `tone` (fond pastel, sinon carte blanche), `label`, `value` (texte déjà formaté), `emoji` (décoratif), `delta` (`{value, up, good, vs}` : `up` donne la flèche, `good` la couleur), `trend` (6 à 12 valeurs pour la sparkline).

- La couleur de l'évolution dit si c'est une bonne nouvelle (dépenses en baisse = `success`), la flèche dit le sens, et un texte caché le lit aux lecteurs d'écran : jamais la couleur seule.
- L'évolution est dans une petite pilule blanche, lisible sur tous les fonds pastel.
- Trois tuiles maximum sur une ligne, en tête de l'écran Argent ou du bilan.


### Sticker

Mot-sticker en pilule, posé de travers : la signature du style déstructuré.

**Props** : `tone` (une couleur pastel, `citron`, `heart`, `sapin` ou `ink`), `size` (`sm`), `rotate` en degrés (-6 par défaut, entre -10 et 10), `children` (un à trois mots).

- Mots en minuscules, en Fraunces italique (style `sticker`), avec un point d'exclamation si ça s'y prête : « miam ! », « hey ! ».
- Un sticker peut chevaucher le bord d'une carte ou d'une photo.
- Jamais pour une info critique ou un statut : c'est de la décoration qui parle.


### StickerStack

Pile de stickers qui se chevauchent en zigzag, pour les écrans d'accueil de module et les états vides.

**Props** : `words` (`[{text, tone}]`, deux à quatre), `size` (`sm`).

- Lis la phrase de haut en bas : « on mange / quoi / ce soir ? ».
- Une pile par écran, en haut ou en débord d'une illustration.


### SwipeDeck

Le jeu « Qu'est-ce qu'on mange ? » : chacun swipe les plats de son côté, comme sur une app de rencontre, sans voir les choix de l'autre.

**Props** : `dishes` (`[{name, emoji?, tone, tags}]`), `partner` (`{name, partner}`), `partnerDone` (l'autre a fini), `partnerLikes` (les plats que l'autre a aimés, connus du serveur seulement), `onFinish(likes)`, `onOpenRecipe(dish)`.

**Le parcours** :
1. L'un lance un match depuis Recettes ; l'autre reçoit une notification.
2. Chacun swipe : à droite ou cœur = « miam ! », à gauche ou croix = « bof ». La carte suit le doigt et un sticker apparaît selon le sens.
3. Un cadenas rappelle « Inès ne voit pas tes choix ». On voit seulement si l'autre a fini, jamais ce qu'il a choisi.
4. Quand les deux ont fini : `MatchSticker` sur le premier plat en commun, la liste des autres matchs, puis « Voir la recette ». Pas de match : une mascotte endormie propose de rejouer.

- Clavier : la pile est focalisable, flèche droite = j'ai envie, flèche gauche = pas envie. Chaque choix est annoncé aux lecteurs d'écran.
- Les deux boutons ronds restent toujours visibles : le swipe n'est jamais le seul moyen.


### TabBar

Barre d'onglets du bas : Accueil, Agenda, Ajouter, Argent, Nous.

**Props** : `active` (`home`, `agenda`, `argent`, `nous`), `onChange`, `onAdd`.

- Le bouton central ouvre la feuille d'ajout rapide (événement, dépense, course, tâche).
- Repas, Courses et Corvées s'ouvrent depuis l'Accueil, pas depuis la barre.


### TodoItem

Tâche, article de courses ou corvée : case ronde, intitulé, note, personne assignée.

**Props** : `title`, `note`, `done` (+ `onToggle` pour le piloter), `points` (texte de la récompense pour les corvées), `assignee` (`{name, partner}`).

- La case validée se remplit en `action` et l'intitulé passe barré en `ink-muted`.
- Les corvées affichent leurs points : Facile 10, Normal 25, Difficile 50.
- Les éléments faits descendent sous un séparateur « Fait ».


### WhoDoesItGame

Le petit jeu « Qui fait quoi ? » : une roue aux couleurs de chacun tire au sort qui cuisine, qui fait la vaisselle, qui fait les courses.

**Props** : `players` (`[{name, partner}]`, A puis B), `tasks` (`[{name, emoji}]`), `otherDoesNext` (celui qui ne cuisine pas fait la tâche suivante, pour rester juste), `onDone`.

- Le bouton central « Tourner » lance la roue ; le résultat s'affiche en sticker (« Karim : cuisine ! ») et s'écrit dans la liste des tâches avec l'avatar.
- Le résultat est annoncé aux lecteurs d'écran ; si les animations sont réduites, la roue s'arrête directement sur le résultat.
- À la fin : « C'est noté » ajoute les tâches dans les corvées du jour avec leurs points.


## Logo



Le logo Nous deux : une maison posée sur un cœur qui sourit. La maison pour l'organisation du foyer, le cœur pour le couple, le sourire pour la légèreté.

- `nous-deux-icone.svg` : le fichier d'origine, symbole magenta sur carré blanc arrondi.
- `nous-deux-icone-app.svg` : icône d'application, symbole blanc sur carré magenta (`marque`). Écran d'accueil du téléphone, favicon, notifications.
- `nous-deux-symbole.svg` : symbole seul en magenta `marque`, fond transparent. Sur `canvas`, `surface` et les pastels clairs.
- `nous-deux-symbole-blanc.svg` : symbole seul en blanc. Sur `marque`, `heart`, `sapin`, `ink` et en thème sombre.
- `nous-deux-symbole-encre.svg` : symbole seul en `ink` (#1d1a23). Impression noir et blanc, tampons, cas où le magenta est impossible.

Ces fichiers sont des images à encre unique : leur couleur est fixée dans le fichier et ne suit pas le thème. Choisis la bonne version selon le fond.
