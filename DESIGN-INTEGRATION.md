# Nous deux — intégration du design system fourni

Le dossier `design-system/` contient les 53 fichiers fournis par Abdellah le 9 octobre 2026. `source-integrity.json` permet de vérifier que les originaux restent identiques. Les fichiers du guide, les tokens, le bundle et les SVG sont la référence visuelle.

L’entrée web charge uniquement `tokens/tokens.css`, `components/bundle.css` et `app/application.css`. Les cinq anciennes feuilles de style et l’ancienne tirelire ont été supprimées. Le CSS d’intégration définit le cadre de l’application, les formulaires persistants et les adaptations aux petits écrans à partir des tokens fournis. Les couleurs de personnes restent lavande pour le premier compte, pêche pour le second et rose pour les deux.

`node scripts/integrate-design-system.mjs` transforme le bundle navigateur fourni en module React local. Il conserve les dessins et ajoute uniquement des adaptations de fonctionnement : navigation et jour contrôlés, absence de division par zéro, centimes conservés et repli de l’image de recette en cas d’échec. Les démonstrations de votes et de tirage au sort du bundle ne sont pas utilisées : le serveur conserve les votes privés et fournit les vrais matchs et le cuisinier.

Les composants fournis sont utilisés directement pour la navigation, les boutons, les filtres, l’accueil, les événements, les graphiques, la tirelire, les plats, les lignes du carnet et les mascottes. Les écrans avec des actions métier plus riches (soins de plantes, courses, messagerie, formulaires) reprennent leurs classes et règles visuelles tout en conservant les opérations existantes. Le guide ne crée pas de fausses factures, de salaire, d’épargne ou de données de démonstration dans les comptes.

L’icône SVG d’application est copiée sans modification. Ses déclinaisons PNG utilisent un fond magenta opaque pour l’écran d’accueil des téléphones, sans modifier le symbole. Le manifeste et le service worker emploient la version 4 des icônes. Les polices Figtree et Fraunces SOFT 100 utilisent l’import Google Fonts du fichier fourni.

## Vérification

- Vérification TypeScript et construction Vite.
- Suites existantes : modèle Supabase, calendrier, messagerie, plantes/invitations/catalogue, repas, photos, gestes, découverte de recettes.
- Vérification de 56 associations texte/fond et focus des thèmes fournis, minimum des paires de texte testées : 5,18:1.
- Vérification des originaux, du logo, des rendus React, des raccourcis clavier et des contraintes de débordement/réduction des animations.
- Vérification de budgets vides et remplis, conservation des centimes et du vrai solde, tableau accessible des graphiques, droits de modification des plantes, votes privés et appels conservés entre les pages.

Ces contrôles ne remplacent pas un audit RGAA complet ni une recette tactile sur un iPhone réel. L’observation interactive de la session privée du navigateur n’était pas disponible pendant cette intégration. Aucune session de compte n’a été créée ou contournée pour les tests ; les rendus utilisent des données synthétiques sans accès réseau.

## Mobile refinements and personal cookbook — 9 October 2026

- Home: eight centered quick-add actions, short single-line tile badges, “Nos missions”, explicit countdown dates and an SVG suitcase mascot built from buddy tokens.
- Layout: bounded Safari date inputs and dialog descendants; the viewport cannot scroll sideways, while plant rails and narrow calendar grids retain their own scroll. Recipe images have an explicit clipped frame.
- Gestures: the recipe card owns one-finger motion, locks a slightly diagonal horizontal intent, and scrolls the workspace for a clearly vertical gesture. Keyboard arrow and button alternatives remain available; pinch zoom and reduced motion are retained.
- Chat: one-row auto-growing composer, transparent outer surface, stable round send button, visual viewport resize/scroll and keyboard dismissal cleanup.
- Calendar: visible French, Christian, Muslim and other holiday switches, distinct holiday tones, colored hero and panels. Personal event privacy is unchanged.
- Invitations: illustrated ticket, optional folded reply, affectionate playful decline, and contained secondary actions. Budget mascot is shown without inventing a budget when no goal is set.
- Recipes: authenticated `/recipes` mutations for author-owned recipes, servings, ingredients, steps, optional calories per portion, manual nutrient notes, and private compressed photos (30 MB input cap). Archived recipes remain available to existing matches and menus.
- Weekly menus: up to 14 lunch/dinner slots, one author-owned plan per week, independent named snapshots and idempotent reuse into another empty week. A partner may view and copy a menu, but cannot change its author's plan or favorite.
- Persistence: existing private `nd_state.data` contains `personalRecipes`, `mealPlans`, `mealPlanTemplates`; existing `nd_photos` stores images. No public bucket or direct anonymous table access was introduced. `house-api` continues checking the custom personal session, owner and record version before updates.

Validation: TypeScript/build, API and domain tests, photo ownership checks, menu conflict/copy tests, gesture tests, design source integrity, contrast checks and markup/layout regressions. These automated checks do not replace a Safari/iPhone touch, keyboard and visual review, or a complete RGAA audit.

## Reference-screen alignment — 9 October 2026

- The supplied ZIP remains byte-for-byte intact. The runtime bridge connects `RecipeView` to private favorites, photographs, real servings/ingredients, preparation steps and an idempotent grocery batch. Missing recipe difficulty is displayed as unspecified; authors can enter it.
- Cookbook and weekly-menu pickers combine author/source, category and accent-insensitive title/ingredient search. Changing the picker view preserves the week draft and restores keyboard focus to its meal slot.
- The wheel uses the supplied wheel, stickers and avatar styles with three equal outcomes. Draws persist on the server for both people. A matched recipe keeps its already assigned cook; daily chores have their own stable draw. No partner ballots are exposed.
- Category ceilings feed `RankedBars`; recorded bills feed `BillCard`. Expanded charts show six months of actual expenses, the daily heatmap, cumulative spending and remaining category budgets. No income or savings values are invented.
- The existing suitcase cards now count days, hours, minutes and seconds to Paris wall-clock time, including daylight-saving transitions, without a per-second screen-reader announcement.
- Native date/time controls sit inside bounded fields with a visible formatted value. Photo controls align icon and label horizontally; profile controls occupy the full row below the avatar. Calendar navigation uses a neutral background. CTA wording is shortened to fit on one line.
- AI configuration is shared through Supabase Vault; see `docs/recipes-ai.md`.

Validation includes 66 contrast pairs in light/dark themes (minimum normal text 4.65:1), immutable design-source hashes, TypeScript/build, authenticated API tests, persistent draws, combined search, DST boundaries, menu focus contracts and native field markup. Safari touch/picker behavior and full RGAA compliance still require device/manual assessment.
