# État de reprise — 15 octobre 2026

Ce document est un état daté, pas un contrôle permanent de production. Vérifier le dépôt, les déploiements et les outils disponibles au début de chaque reprise.

## Situation vérifiée

- Dépôt : `sabir-art/Nous-deux`, branche principale `main`.
- Dernier commit de code vérifié avant cette documentation : `e1438f5d408a4809893dca17fed5cc805f42a2d6` (PR #6, photo d'appel ronde), publié avec succès le 10 octobre.
- Le 15 octobre, le propriétaire a rendu le dépôt privé. L'API GitHub a ensuite renvoyé `private: true` et `has_pages: false`. L'ancien lien affiche une erreur GitHub Pages. Ce problème d'hébergement ne signifie pas que Supabase ou le code ont disparu.
- Ancien lien : https://sabir-art.github.io/Nous-deux/
- Cloudflare a été proposé pour garder le code privé et rétablir un hébergement gratuit. Aucune migration Cloudflare n'est effectuée ou validée dans cette reprise. Ne pas considérer les anciens fichiers Workers/Vinext comme une migration déjà prête.
- Ne pas repasser le dépôt public, acheter GitHub Pro ou changer d'hébergeur sans demande correspondante. Le workflow Pages reste présent et son déploiement peut échouer tant que Pages n'est pas réactivé avec une offre compatible.
- Laura a, selon le propriétaire, accepté les accès GitHub et Supabase, sélectionné ce dépôt dans Claude Code et connecté Supabase. Son rôle a été passé administrateur après un blocage de connexion en développeur ; ce témoignage ne prouve pas que tous les MCP exigent ce rôle. Vérifier les accès de la session sans afficher les secrets.

## Dernières évolutions du code

- PR #3 : édition de messages pendant 15 minutes côté serveur ; suppression personnelle/globale et préférences de chat ; améliorations budget, photos de recettes et notifications. Migration `20261010173819_chat_controls_and_preferences.sql` appliquée le 10 octobre ; dernière version de `house-api` alors déployée : v33. Vérifier la version actuelle avant un déploiement, ne pas la supposer immuable.
- PR #4 : correction des duplications du chat (clés React distinctes `chat-${active}` et `calls-${active}`), navigation par swipe et historique, gestion du retour Android dans la PWA installée.
- PR #5 : chat plein écran sans navbar, flèche vers la page précédente, photos cliquables sans barre de métadonnées, prénoms retirés des bulles, commande audio compacte.
- PR #6 : photo d'appel ronde, contour blanc, image en `object-fit: cover` remplissant le cercle. Ne pas rétablir le carré ni les bandes de `contain`.
- Les tests automatisés Chromium et WebKit ont réussi pour ces livraisons. Cela ne remplace pas une vérification tactile sur appareils réels.

- 15–18 octobre (PR #9, branche `claude/depense-100-pourcent`) : dépenses enrichies, sans migration SQL (champs facultatifs dans l'état JSON, anciennes dépenses inchangées). Partage `split` : 50/50 par défaut, `'full'` (l'autre rembourse tout) ou `'custom'` avec `owed` (centimes dus par l'autre). Chacun peut enregistrer une dépense payée par l'autre ; seul l'auteur (`owner`) la modifie. Récurrence `recurrence`/`intervalDays`/`repeatUntil` comme l'agenda : les occurrences sont calculées côté interface jusqu'à aujourd'hui (`expandEntries`, `lib/calendar.ts`), la série reste une seule entrée. Graphique « Où part notre argent ? » (dépenses du mois par catégorie) à la place de « Notre marge au fil des mois ». **`house-api` doit être redéployée** après fusion ; sinon l'ancienne API refuse une dépense payée par l'autre et ignore les nouveaux champs.

- 18 octobre (branche `claude/enfants`, construite sur la PR #9) : enfants facultatifs, sans transformer l'application de couple. Profils partagés par les deux parents (`children` dans l'état JSON, module serveur `children.ts`, sans migration SQL ; suppression réservée au parent qui a créé le profil, liens retirés des rendez-vous et dépenses). Espace « Nos enfants » : infos utiles, besoins, rendez-vous, activités (rendez-vous récurrents), affaires à renouveler avec envoi vers les courses, dépenses du mois. Pas de second calendrier : un rendez-vous peut concerner un enfant (`child`), à sa couleur, avec filtre et légende. Catégorie de dépense « Enfants » (+ enfant concerné) et encart « coût de la vie de famille » dans le budget, affichés seulement avec un profil. Rayons Bébé, Goûters, École dans le catalogue des courses, visibles seulement avec un profil. Test `tests/children.test.mjs`. **`house-api` doit être redéployée** après fusion.

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
