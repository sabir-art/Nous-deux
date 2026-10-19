# Développement, tests et publication

## Préparer la session

Vérifier `git status`, la branche et les PR ouvertes. Récupérer `origin/main` avant de démarrer et créer une branche de tâche depuis cette référence si le checkout est propre. Ne pas écraser un travail local pour le synchroniser. GitHub est le relais entre les sessions ; les chemins temporaires des anciens assistants ne sont pas portables.

Prérequis du dépôt : Node >= 22.13.0 et pnpm 11.25.0 (voir `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm run check:web
pnpm run build:web
```

Pour servir l'interface Vite :

```sh
pnpm exec vite --config vite.web.config.ts --host 127.0.0.1
```

Le chemin actuellement configuré est `/Nous-deux/`. Attention : le client normal pointe vers Supabase de production, même servi localement. Pour les essais interactifs automatisés, utiliser les fixtures des tests navigateur qui remplacent l'API. Ne pas inventer un compte de test en production.

## Mode essai : tester une branche en vrai sans toucher aux données

`pnpm run build:essai` construit l'interface de la branche courante dans `dist-essai/`, avec `lib/essai-api-client.ts` à la place du client Supabase. Rien ne part vers Supabase : la maison d'essai vit dans le `localStorage` du navigateur, part de fausses données et applique les mêmes règles serveur que `house-api` (`model.ts`, repas, recettes, lieux). Une modification serveur de la branche est donc visible dans l'essai avant tout déploiement.

Un bandeau indique le mode essai, permet de changer de personne (« Je suis Abdellah / Laura ») et de recommencer avec les données de départ. Le chat texte fonctionne localement ; appels, vocaux, fichiers, notifications et IA recettes affichent « Pas disponible en mode essai ». Pas de service worker ni de manifeste, chemins relatifs : le dossier peut être servi depuis n'importe quelle adresse (artifact Claude, aperçu statique…). Ne jamais publier `dist-essai/` à la place de `dist-web/` sur l'adresse réelle.

Pour faire essayer une PR : construire le mode essai sur sa branche (ou sur une fusion locale avec la branche qui contient le mode essai, tant qu'il n'est pas dans `main`) et partager le lien de l'aperçu.

## Choisir les contrôles

La liste complète et les versions des outils de test figurent dans `.github/workflows/pages.yml`. Ne pas ajouter de dépendance de test au manifeste sans nécessité.

| Modification | Tests particulièrement concernés |
| --- | --- |
| Modèle, droits, mutations | `tests/supabase-model.test.mjs`, `tests/chat-api.test.mjs` |
| Agenda / invitations | `tests/calendar.test.mjs`, `tests/invitation-calendar.test.mjs` |
| Courses / plantes / photos | `tests/life.test.mjs`, `tests/photos.test.mjs`, `tests/browser-layout.test.mjs` |
| Repas / recettes / IA | `tests/meals.test.mjs`, `tests/recipe-library.test.mjs`, `tests/recipe-experience.test.mjs`, `tests/recipe-discovery.test.mjs`, `tests/recipe-import.test.mjs`, `tests/ai-settings.test.mjs` |
| Repas / recettes / IA | `tests/meals.test.mjs`, `tests/recipe-library.test.mjs`, `tests/recipe-experience.test.mjs`, `tests/diets.test.mjs`, `tests/recipe-discovery.test.mjs`, `tests/ai-settings.test.mjs` |
| Chat / fichiers / voix | `tests/chat-attachments.test.mjs`, `tests/voices-places.test.mjs`, `tests/chat-controls-browser.test.mjs`, `tests/chat-database.test.mjs` |
| Repas / recettes / IA | `tests/meals.test.mjs`, `tests/recipe-library.test.mjs`, `tests/recipe-experience.test.mjs`, `tests/recipe-discovery.test.mjs`, `tests/ai-settings.test.mjs` |
| Chat / fichiers / voix / cartes / stickers | `tests/chat-cards.test.mjs`, `tests/chat-attachments.test.mjs`, `tests/voices-places.test.mjs`, `tests/chat-controls-browser.test.mjs`, `tests/chat-database.test.mjs` |
| Navigation / cycle de vie React | `tests/app-navigation-browser.test.mjs`, `tests/chat-navigation-ui.test.mjs` |
| Appels | `tests/daily-calls.test.mjs`, `tests/daily-database.test.mjs`, `tests/daily-browser.test.mjs` |
| Design / accessibilité / mobile | `tests/design-system.test.mjs`, `tests/accessibility.test.mjs`, `tests/mobile-ui.test.mjs`, `tests/browser-layout.test.mjs` |

Exécuter une suite simple avec `node tests/nom.test.mjs`. Les tests navigateur utilisent Playwright et les tests SQL un PostgreSQL isolé PGlite. Installation temporaire reproductible, comme en CI :

```sh
TEST_TOOLS_DIR="$(mktemp -d)"
npm install --prefix "$TEST_TOOLS_DIR" --no-package-lock --ignore-scripts playwright@1.62.1 @electric-sql/pglite@0.3.14
node "$TEST_TOOLS_DIR/node_modules/playwright/cli.js" install --with-deps chromium webkit
export PLAYWRIGHT_MODULE="$TEST_TOOLS_DIR/node_modules/playwright"
export PGLITE_MODULE="$TEST_TOOLS_DIR/node_modules/@electric-sql/pglite"
node tests/app-navigation-browser.test.mjs
node tests/daily-browser.test.mjs
node tests/chat-database.test.mjs
```

Si les dépendances système de WebKit ne peuvent pas être installées dans l'environnement, le signaler et utiliser la CI pour cette vérification, sans prétendre l'avoir exécutée localement. Les fixtures n'envoient pas de messages ni d'appels aux comptes réels. Pour une modification documentaire seule, vérifier les liens/chemins et la cohérence ; pas de déploiement Supabase nécessaire.

## Supabase : publication séparée

Projet cible : `jvjwyalusdygvkyzmiez`. Fonction active : `house-api`. Avant modification serveur, vérifier la version déployée et l'historique des migrations pour ne pas écraser une livraison faite depuis une autre session. Vérifier les secrets par leur présence/configuration, jamais en affichant leurs valeurs.

Les scripts `supabase/sql/` sont les étapes historiques du schéma ; ce n'est pas un script de remise à zéro à rejouer sur la production. Les migrations récentes sont dans `supabase/migrations/`. Pour une nouvelle évolution, créer et conserver une migration versionnée, tester les droits et la compatibilité des anciens clients, puis appliquer uniquement les changements manquants.

Après tests, avec accès authentifié et autorisation de publier la tâche :

```sh
supabase functions deploy house-api --project-ref jvjwyalusdygvkyzmiez --no-verify-jwt
```

Ou utiliser le MCP Supabase pour appliquer la migration puis déployer la fonction avec TOUS ses fichiers dépendants. Conserver la validation personnalisée de session, pas de clé de service dans le client. Vérifier le serveur après publication. Pour une évolution additive : schéma compatible, API compatible, puis frontend ; adapter cet ordre si les dépendances de la migration l'exigent. Ne pas supprimer les données pour faire passer les tests.

## Frontend et hébergement

Historique : `.github/workflows/pages.yml` exécute les tests et construit `dist-web/`, puis déploie GitHub Pages sur `main`. Une PR teste mais ne publie pas la production. Après son passage temporaire en privé, le propriétaire a remis le dépôt public et réactivé Pages le 15 octobre ; le déploiement a été relancé et vérifié. Consulter `CURRENT-STATUS.md` et vérifier l’état réel avant toute promesse de publication.

Une future migration d'hébergement doit examiner au minimum :

- `vite.web.config.ts` (`base`), `lib/api-client.ts` (`APP_BASE`), URLs absolues et `index.html` / CSP ;
- manifeste et service worker, scope, chemins d'icônes, cache et navigation ;
- origine autorisée et liens des notifications dans `supabase/functions/house-api/index.ts`, éventuels autres liens d'origine ;
- nouvelle configuration de build/déploiement, anciens clients encore installés, autorisations de notifications liées à l'origine ;
- connexion, lecture des données, photos, notifications et appels sur la nouvelle adresse.

Chercher les occurrences de `sabir-art.github.io` et `/Nous-deux/` avant de changer de domaine. Conserver le même Supabase et les mêmes comptes ; ne pas convertir le projet en ancien runtime D1/Vinext simplement parce que des fichiers Cloudflare sont déjà présents.

## Fin de tâche

Créer une PR avec problème, résultat et vérifications. Avant fusion, contrôler que `main` n'a pas changé, résoudre les conflits, puis vérifier les tests. Une migration SQL et un déploiement Edge Function ne se déduisent pas de la fusion GitHub. Consigner séparément ce qui a été réellement publié et l'URL vérifiée. Mettre à jour `CURRENT-STATUS.md` pour la prochaine session.
