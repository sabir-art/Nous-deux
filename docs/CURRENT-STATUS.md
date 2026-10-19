# État de reprise — 15 octobre 2026

Ce document est un état daté, pas un contrôle permanent de production. Vérifier le dépôt, les déploiements et les outils disponibles au début de chaque reprise.

## Situation vérifiée

- Dépôt : `sabir-art/Nous-deux`, branche principale `main`.
- Dernier commit de code vérifié avant cette documentation : `e1438f5d408a4809893dca17fed5cc805f42a2d6` (PR #6, photo d'appel ronde), publié avec succès le 10 octobre.
- Le 15 octobre, le passage en privé a désactivé Pages. Le propriétaire a ensuite remis le dépôt public et choisi GitHub Actions dans Settings → Pages. Le job de publication échoué du workflow `38787893619` a été relancé avec succès ; le commit `46115740a6d3a10346e3e8b055067280841f7f4d` est publié. Vérification HTTP 200 et présence des assets de l’application après publication. Aucun changement Supabase.
- Lien actif : https://sabir-art.github.io/Nous-deux/
- Cloudflare a été proposé pour garder le code privé et rétablir un hébergement gratuit. Aucune migration Cloudflare n'est effectuée ou validée dans cette reprise. Ne pas considérer les anciens fichiers Workers/Vinext comme une migration déjà prête.
- Le dépôt est désormais public par choix explicite du propriétaire. Ne pas modifier de nouveau sa visibilité ni changer d’hébergeur sans demande. GitHub Pages gratuit nécessite ici de garder le dépôt public.
- Laura a, selon le propriétaire, accepté les accès GitHub et Supabase, sélectionné ce dépôt dans Claude Code et connecté Supabase. Son rôle a été passé administrateur après un blocage de connexion en développeur ; ce témoignage ne prouve pas que tous les MCP exigent ce rôle. Vérifier les accès de la session sans afficher les secrets.

## Dernières évolutions du code

- PR #3 : édition de messages pendant 15 minutes côté serveur ; suppression personnelle/globale et préférences de chat ; améliorations budget, photos de recettes et notifications. Migration `20261010173819_chat_controls_and_preferences.sql` appliquée le 10 octobre ; dernière version de `house-api` alors déployée : v33. Vérifier la version actuelle avant un déploiement, ne pas la supposer immuable.
- PR #4 : correction des duplications du chat (clés React distinctes `chat-${active}` et `calls-${active}`), navigation par swipe et historique, gestion du retour Android dans la PWA installée.
- PR #5 : chat plein écran sans navbar, flèche vers la page précédente, photos cliquables sans barre de métadonnées, prénoms retirés des bulles, commande audio compacte.
- PR #6 : photo d'appel ronde, contour blanc, image en `object-fit: cover` remplissant le cercle. Ne pas rétablir le carré ni les bandes de `contain`.
- Les tests automatisés Chromium et WebKit ont réussi pour ces livraisons. Cela ne remplace pas une vérification tactile sur appareils réels.

- 19 octobre (branche `claude/chat-connecte`, non fusionnée) : discussion connectée à la maison. Le trombone ouvre « Partager avec… » : photos/documents ou « Partager depuis la maison » (liste de courses de la semaine, dépense, plante, mission, rendez-vous partagé, recette, menu), avec un petit mot facultatif (280 caractères). Le message ne transporte qu’une référence typée (`card: {kind, id|weekStart}`) ; `house-api` la vérifie avec les droits de l’expéditeur (rendez-vous privé refusé, y compris le sien), stocke un instantané minimal dans `nd_state.chatCards[messageId]` (200 cartes et 600 stickers au plus, les plus anciens retombent sur le texte de secours du message) et l’ajoute à la lecture (`card`/`sticker`) seulement pour les messages visibles. Cartes et stickers ne sont pas modifiables ; la suppression pour nous deux et « Effacer mes messages » oublient l’instantané. 20 stickers originaux du couple (onglet « Nos stickers » du sélecteur d’émojis, `sticker: id`). Aucune migration SQL. Tests : `tests/chat-cards.test.mjs` + suites Node existantes ; tests navigateur non exécutés localement (téléchargement de Chromium bloqué), à vérifier en CI. **`house-api` doit être redéployée** après fusion (nouveaux modules `chat-cards.ts`, `chat-card-input.ts`) avant que le frontend ne soit publié.
  - 19 octobre, 2e série (même branche) : le petit mot d’un partage est vraiment facultatif — il est replié derrière « Ajouter un petit mot (facultatif) », le bouton Envoyer reste visible, et `house-api` accepte aussi un texte vide ou blanc avec une carte. Nouvelle carte `mot` « Un petit mot doux » : 18 messages tout prêts (`supabase/functions/house-api/sweet-notes.ts`, copie client `lib/sweet-notes.ts`), envoyés par identifiant validé contre la liste fixe ; le serveur garde le texte en instantané, une ligne perso reste facultative ; carte pastel sans bouton d’ouverture. Stickers refaits avec les mascottes de l’application (Buddy pilule lavande/fleur pêche et pot des courses, PlantBuddy, MomentBuddy resto/maison/valise/cadeau/gâteau/calendrier, chat et chien de « Nos compagnons » redessinés ici car `pet-buddy.tsx` n’est pas sur cette branche) et le mot en composant Sticker : 32 stickers, les 20 anciens identifiants conservés (les messages déjà envoyés s’affichent avec le nouveau dessin) ; « Nos stickers » s’ouvre en premier. Aucune migration SQL ; **`house-api` doit être redéployée** (nouveau module `sweet-notes.ts`). Contrôles : `check:web`, `tests/chat-cards.test.mjs` étendu, suites chat/design-system/accessibilité/mobile ; `tests/chat-database.test.mjs` non exécutable ici (`@electric-sql/pglite` absent) ; aperçu Chromium des stickers relu, pas de test sur appareil réel.

## Données réelles : ne pas réinitialiser

Le 10 octobre, à la demande explicite du propriétaire, les données de test des deux comptes ont été supprimées (courses, tâches, dépenses, événements personnels, plantes, idées, recettes personnelles, menus, favoris, messages et appels). Les deux mots de passe, photos de profil, sessions, appareils et secrets de configuration ont été conservés. Les recettes intégrées et repères calendaires n'ont pas été retirés.

Cette opération est terminée. Toute donnée ajoutée depuis doit être conservée. Les fonctions temporaires de diagnostic/nettoyage ont été neutralisées ; ne pas les réactiver comme outils de développement.

## Limites connues

- Pas d'application native publiée sur les stores. La PWA ne garantit ni sonnerie prolongée écran verrouillé, ni écran système d'appel, ni routage écouteur/haut-parleur sur iPhone. Ne pas simuler une bascule que le navigateur n'effectue pas.
- Les notifications peuvent demander la photo de l'expéditeur ; le système d'exploitation garde le contrôle de leur présentation.
- Pas de chiffrement de bout en bout du chat implémenté. Ne pas présenter « privé » ou un pictogramme cadenas comme une preuve de chiffrement de bout en bout.
- L'activation effective, les quotas et la facturation OpenAI/Daily se vérifient dans leurs services ; un fichier de configuration ou un ancien test ne prouve pas la disponibilité actuelle.
- Audit RGAA complet et recette réelle des appareils non certifiés par les tests existants.

## À mettre à jour après chaque livraison

Ajouter la date, la PR/le commit, les changements, les contrôles réalisés, l'état du frontend et de Supabase séparément, ainsi que le prochain blocage concret. Ne pas inscrire de tâches imaginées comme si elles avaient été demandées.
