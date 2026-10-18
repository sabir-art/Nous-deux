# Contexte de Nous deux

## But et utilisateurs

Application française d'organisation du quotidien pour Abdellah et Laura : comptes distincts, espace partagé et contenus privés. L'utilisateur veut une application simple à ouvrir depuis l'écran d'accueil, sans connexion GitHub/ChatGPT pour l'utiliser. Le code doit pouvoir être maintenu alternativement par leurs assistants et leurs comptes de développement.

GitHub conserve le code et son historique. Supabase conserve les données et sert l'API. L'hébergeur distribue l'interface web. Daily transporte les appels. OpenAI est une intégration serveur facultative pour découvrir des recettes. Changer d'hébergeur n'implique pas de déplacer la base de données.

## Architecture active

| Élément | Chemin / rôle |
| --- | --- |
| Entrée React 19 | `web/main.tsx`, `index.html` |
| Build de l'interface Vite | `vite.web.config.ts` → `dist-web/` |
| Application et formulaires | `app/house-app.tsx` |
| Navigation et historique | `app/use-house-navigation.ts`, `app/navigation-bar.tsx` |
| Styles | `design-system/tokens/tokens.css`, `design-system/components/bundle.css`, `app/application.css` |
| Client HTTP / session | `lib/api-client.ts` |
| API active | `supabase/functions/house-api/index.ts` et modules voisins |
| Projet Supabase | `jvjwyalusdygvkyzmiez` |
| Auth / configuration | `supabase/config.toml`, `supabase/sql/personal-accounts.sql` |
| Schéma initial et compléments historiques | `supabase/sql/` |
| Migrations récentes | `supabase/migrations/` |
| Installation / notifications web | `public/manifest.webmanifest`, `public/sw.js` |

Les fichiers Next/Vinext, `app/api/`, D1/Drizzle et certains scripts Sites sont des vestiges de l'hébergement initial. Ils ne servent pas l'API de l'interface Vite actuellement livrée. Ne pas choisir `pnpm dev` ou `pnpm build` par réflexe : consulter le guide de développement.

Les requêtes partent vers `/functions/v1/house-api?route=…` avec une clé publishable et `x-house-session`. L'identité est vérifiée sur le serveur. Les sessions ne sont pas des JWT Supabase Auth. Les tables `nd_*` restent inaccessibles directement aux rôles publics.

`nd_state` contient l'état JSON du foyer avec une version pour gérer la concurrence. Messages, vocaux, pièces jointes, appels et préférences ont des tables dédiées. Les photos de profil/courses/recettes sont dans `nd_photos` ; les fichiers du chat et vocaux sont dans les buckets privés `nous-deux-chat` et `nous-deux-voices`. Ne pas remplacer un objet d'état complet par un exemple vide lors d'une évolution.

## Fonctionnalités et invariants

- **Accueil** : accès aux courses, missions, jardin et idées ; ajouts rapides ; comptes à rebours. Mascottes adaptées au type de moment (restaurant, sortie, maison, escapade, surprise), pas une valise pour tout.
- **Navigation** : cinq onglets Accueil, Agenda, Repas, Argent et Nous, pilule flottante avec bouton +. Dans le chat, la navbar est cachée et la flèche revient à la page précédente. Préserver le démontage du chat et la continuité d'un appel lorsqu'on change de page.
- **Argent** : dépenses partagées 50/50 et remboursements, calculs en centimes, budgets, graphiques visibles et tirelire réactive. Ne pas inventer revenus, épargne ou solde bancaire à partir des seules dépenses.
- **Courses** : semaines lundi–dimanche, catalogue/recherche/ajout rapide, quantités libres, notes/photos et modèles réutilisables. Chacun peut acheter un article de l'autre ; l'acheteur peut annuler sa coche ; l'auteur garde les droits d'édition/suppression. Les anciens achats sans acheteur ont un traitement de compatibilité spécifique dans le code.
- **Agenda** : privé par défaut, partagé sur choix de l'auteur ; catégories et filtres, dates/heures, plages, répétitions semaine/mois/année ou tous les X jours. Les fêtes intégrées 2026–2027 sont des repères distincts, avec sources et réserves sur les dates lunaires. Dates du foyer en `Europe/Paris`.
- **Idées / lieux** : propositions restaurant, sortie, maison, escapade, surprise ; adresse facultative et favoris. L'auteur est partant, seul le partenaire répond. Une acceptation avec date crée un événement partagé sans doublon ; une modification demande un nouvel accord.
- **Plantes / missions** : suivi partagé et responsabilités identifiées. Les mascottes donnent un retour ludique, pas un diagnostic botanique. Les rappels doivent respecter les préférences, sans doublons.
- **Repas** : recettes sans porc, bibliothèque, recettes personnelles avec photo, filtres auteur/catégorie/recherche, menus et modèles. Votes du partenaire invisibles jusqu'au match. Tirage équitable entre les deux personnes et ensemble, décidé/persisté serveur. Aucune préférence cachée pour faire cuisiner Laura.
- **Chat** : texte, emoji, images, documents et vocaux ; auteur courant à droite, partenaire à gauche. Image visible directement, actions détaillées dans la visionneuse. Édition limitée à 15 minutes côté serveur. Suppression pour soi distincte de celle pour tous ; suppression globale et vidage global limités aux messages envoyés par l'acteur. Ne pas élargir les droits sous prétexte de reproduire Telegram.
- **Appels** : `app/house-calls.tsx`, `app/daily-engine.ts`, `app/call-audio-output.tsx`, modules serveur `daily-*`. Salles privées, admission authentifiée, pas d'enregistrement. Voir `docs/daily-calls.md` pour les détails et les limites web.
- **Famille (facultatif, décidé le 18 octobre 2026)** : l'application reste celle d'un couple qui peut s'agrandir, pas une application de gestion parentale. Un profil par enfant (infos utiles, besoins, rendez-vous, activités, affaires à renouveler), partagé par les deux parents. Pas de second calendrier : les rendez-vous d'un enfant rejoignent l'agenda commun à sa couleur. Dépenses : catégorie « Enfants » dans le même budget. Courses : rayons Bébé, Goûters, École. Ces éléments n'apparaissent qu'une fois un profil créé.
- **IA recettes** : clé partagée sécurisée côté serveur/Vault, jamais dans le frontend ; sources et licences des images, contrôle de correspondance photo/plat. Aucun contenu privé du foyer transmis comme contexte IA. Voir `docs/recipes-ai.md`.

## Références visuelles

Le design system fourni par l'utilisateur est dans le dépôt : `design-system/GUIDE-IA-nous-deux.md`, `design-system/LISEZ-MOI.md`, README de composants et assets. `DESIGN-INTEGRATION.md` documente son adaptation. Les sources originales ont un contrôle d'intégrité ; les préserver.

Respecter les typographies, couleurs, espacements, ombres, logo et mascottes fournis. L'ambiance est chaleureuse, ludique, pastel et lisible ; les éléments décoratifs peuvent être décalés, mais les champs, boutons et textes restent bien alignés. Boutons sur une ligne via des libellés courts, sans provoquer de débordement ni couper l'information.

Les guides historiques peuvent décrire une étape ancienne : pour l'état livré, commencer par `CURRENT-STATUS.md` puis vérifier le code. Une nouvelle demande explicite de l'utilisateur peut faire évoluer le produit ; documenter cette décision.
