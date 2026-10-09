# Nous deux

Application privée de gestion du quotidien à deux : dépenses, remboursements, listes, calendrier et notifications.

## Hébergement indépendant

La version de production utilise **GitHub Pages** pour l'interface React et **Supabase** pour les données et l'API. Elle ne nécessite aucun compte ChatGPT ou GitHub pour ses utilisateurs.

- Interface : `https://sabir-art.github.io/Nous-deux/`
- Projet Supabase : `jvjwyalusdygvkyzmiez`
- Point d'entrée : `web/main.tsx` ; configuration : `vite.web.config.ts`
- API : `supabase/functions/house-api/`
- Schéma : `supabase/sql/schema.sql`

Les anciens fichiers Next/Vinext et D1 restent dans le dépôt pour conserver l'historique de l'application. Ils ne sont pas utilisés par le déploiement GitHub Pages.

## Déploiement

Dans Settings → Pages, sélectionner **GitHub Actions** comme source. Le workflow `.github/workflows/pages.yml` vérifie TypeScript, exécute les tests du modèle, construit puis publie l'interface à chaque modification de `main`.

```sh
pnpm install --frozen-lockfile
pnpm run check:web
node tests/supabase-model.test.mjs
pnpm run build:web
```

L'API Supabase est déployée séparément :

```sh
supabase functions deploy house-api --project-ref jvjwyalusdygvkyzmiez --no-verify-jwt
```

`verify_jwt=false` est intentionnel : cette API vérifie ses propres sessions privées. Les secrets de service restent exclusivement dans l'environnement Supabase. La clé publishable du client n'est pas un secret.

## Accès et données

Chaque personne active son compte via son propre lien à usage unique et choisit un mot de passe personnel de 12 caractères minimum. Les liens ne sont pas stockés dans GitHub. Les sessions sont associées côté serveur au membre et expirent après 90 jours. Les anciennes sessions partagées sont refusées.

Les deux comptes voient les dépenses, listes et rendez-vous. Seul l'auteur peut modifier, cocher ou supprimer son élément. Un paiement ne peut être enregistré qu'au nom du compte connecté. Les anciens paiements sont rattachés au payeur déjà enregistré ; les autres éléments anciens sans auteur restent en lecture seule. Le prénom de l'autre compte ne peut pas être modifié. Le nom de la maison et le budget restent des paramètres communs.

Le complément de schéma est conservé dans `supabase/sql/personal-accounts.sql`.

Les tables `nd_*` sont protégées par RLS et leurs droits sont retirés aux rôles publics. Seule l'API serveur peut les lire et les modifier après authentification. Les alertes informatives « RLS enabled, no policy » sont attendues : l'absence de politique refuse tout accès direct. Documentation : https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

Le dépôt ne contient ni données personnelles, ni mots de passe, ni clés privées. Les modifications concurrentes sont vérifiées par version pour éviter les écrasements silencieux.

## iPhone

Ouvrir l'application dans Safari, se connecter, puis Partager → Sur l'écran d'accueil. Réactiver les notifications depuis cette nouvelle installation : les autorisations de l'ancienne adresse ne sont pas transférables. Une connexion Internet reste nécessaire pour charger et synchroniser les données.

L'appel audio reste expérimental et dépend de la compatibilité réseau (STUN sans relais TURN).

## Calendrier personnel et partagé

Un nouvel événement est privé par défaut. L'API exclut les événements privés de la réponse du partenaire ; leur création, modification et suppression ne produisent aucune activité partagée ni notification. L'auteur peut passer un événement en partagé et reste seul autorisé à le modifier. Les événements existants sans champ de visibilité conservent leur visibilité partagée.

Les événements peuvent couvrir plusieurs jours, être répétés chaque semaine, mois ou année, et avoir une date de fin de répétition. Les modifications/suppressions portent sur toute la série. Les occurrences sont calculées à l'affichage ; le dernier jour du mois est utilisé si le jour n'existe pas (29 février → 28 février). La section À prendre et le calendrier utilisent les mêmes filtres de catégorie et de visibilité.

`lib/holidays.ts` contient 80 repères datés pour 2026–2027 avec leurs sources : jours fériés nationaux français (API gouvernementale et Service Public), principales fêtes catholiques (AELF), repères musulmans (Grande Mosquée de Paris, Islamic Relief et calendrier islamic.app pour le Mawlid 2027), fêtes familiales (La Poste). Les repères lunaires prévisionnels sont signalés comme tels, avec une fourchette dans le titre lorsque nécessaire. Ces références sont consultables, masquables, non modifiables et ne produisent pas de notifications. Les fêtes chrétiennes correspondent au calendrier catholique occidental ; ce catalogue ne prétend pas couvrir toutes les fêtes locales, confessions ni saints du jour.

Les tests `tests/calendar.test.mjs` et `tests/supabase-model.test.mjs` couvrent récurrence, plages de dates, confidentialité et droits d'auteur.

### Interface et courses hebdomadaires (octobre 2026)

- Nouvelle identité blanche et bleue, pictogramme vectoriel original, icônes PWA et navigation mobile à cinq entrées : accueil, agenda, courses, budget, discussion. Les tâches, appels, notifications et réglages restent accessibles par des boutons nommés en haut.
- Les courses sont regroupées du lundi au dimanche. Les achats cochés restent visibles dans « Acheté », avec la personne et la date de l’achat. Les articles non achetés des semaines précédentes restent accessibles ; ils ne sont ni effacés ni déplacés automatiquement.
- Chaque membre peut acheter un article ajouté par l’autre. Le serveur détermine `purchasedBy` depuis la session, indépendamment du propriétaire de l’article. Seul l’acheteur peut annuler sa coche ; seul l’auteur de l’article peut modifier son intitulé ou le supprimer. Les anciennes coches restent sans attribution inventée.
- Les listes types, partagées, recopient titres et quantités dans la semaine choisie avec de nouveaux identifiants et des cases non cochées. Limites : 50 modèles, 200 articles par modèle. Le créateur peut supprimer son modèle sans supprimer les courses copiées. Une clé d’opération rend les nouvelles tentatives d’une même copie idempotentes.
- Discussion texte privée dans `nd_messages`, réservée aux deux sessions personnelles. Messages de 2 000 caractères maximum, historique paginé, modification/suppression par l’auteur uniquement, contrôles de version contre les écrasements concurrents. Actualisation toutes les trois secondes lorsque l’écran de discussion est visible. Aucun message de test n’est envoyé aux comptes réels. Cette version n’envoie pas de notification push pour le chat et n’annonce pas de chiffrement de bout en bout.
- Appliquer `supabase/sql/shopping-chat.sql` puis déployer `house-api` avant le frontend. La migration ajoute la table de messages et affecte les courses existantes à la semaine en cours sans modifier les auteurs ni les coches. `nd_messages` est volontairement sans politique RLS : les rôles publics n’y accèdent pas, seul le service de la fonction authentifiée y accède.
- Vérifications : `pnpm run check:web`, `node tests/supabase-model.test.mjs`, `node tests/calendar.test.mjs`, `node tests/chat-api.test.mjs`, `pnpm run build:web`.

### Catalogue, invitations et plantes

- Catalogue local de 234 articles, classés par rayon, avec pictogrammes emoji, recherche par préfixe, alias et petites fautes de frappe. Aucune requête externe à chaque frappe. Les quantités suggérées dépendent de l’article ; article et quantité restent libres.
- Chaque course peut contenir une note (500 caractères) et une photo de référence. Le navigateur réduit la photo en JPEG (1 000 px maximum, métadonnées supprimées par réencodage). `nd_photos` conserve les images privées, hors de GitHub. Seules les sessions personnelles peuvent les demander ; la moitié peut voir une photo uniquement si elle est jointe à un article partagé. Un brouillon non joint reste privé. Les identifiants de photo sont immuables, limités à 1 000 par auteur ; les photos détachées ne sont pas exposées au partenaire.
- « Nos idées » : invitations de restaurant, sortie, soirée maison, escapade ou surprise. L’auteur est déjà partant ; seul le destinataire peut accepter ou décliner. Une modification par l’auteur relance une demande d’accord. Une carte animée apparaît à l’ouverture pour les propositions en attente ; « Plus tard » la masque pour la session. Les accords ne créent pas automatiquement un événement d’agenda.
- « Nos plantes » : nom, espèce, emplacement, instructions, intervalles d’arrosage, de vérification de lumière et d’engrais. Chacun peut noter un soin sous sa propre identité ; seul l’auteur modifie ou supprime la fiche. L’historique conserve les 100 derniers soins, sans possibilité de les attribuer à l’autre. Une mascotte SVG évolue avec les retards et réagit aux soins ; ce n’est pas un diagnostic de santé de la plante. Les animations respectent la réduction des mouvements.
- Rappels de plantes : travail Supabase Cron `nous-deux-plant-reminders` à 09:00 Europe/Paris, avec nouvelle tentative à 09:30 en cas d’échec. Un rappel groupé au maximum par appareil et par jour lorsque des soins sont dus. Le créateur choisit de prévenir uniquement lui-même ou les deux membres ; les préférences et autorisations push de chaque appareil sont respectées. Le secret d’appel est généré dans Vault ; seul son hash entre dans la configuration serveur. La route refuse toute session utilisateur à la place du secret du planificateur. Aucun secret ne figure dans les sources.
- Avant de publier : appliquer `supabase/sql/photos-and-plant-reminders.sql`, déployer tous les fichiers `house-api`, puis publier le frontend. Les tableaux `ideas` et `plants` sont initialisés sans remplacer l’état existant. Ajouter `node tests/life.test.mjs` aux contrôles ; les tests API couvrent aussi les photos privées et l’interdiction d’appeler le planificateur sans son secret.

### Photos, jeu des repas et interface chaleureuse (octobre 2026)

- Les photos de courses et de profil restent dans `nd_photos`, en privé dans Supabase. Les originaux jusqu’à 30 Mio sont décodés localement par URL `data:` (compatible avec la CSP), puis réduits progressivement en JPEG à moins de 350 000 caractères avant envoi. Le fichier original n’est pas téléversé. Un format que le navigateur ne sait pas décoder affiche une consigne JPEG/PNG explicite. Les photos HEIC nécessitent un navigateur qui sait les lire.
- Une photo n’est accessible qu’à son propriétaire ou, pour sa moitié, lorsqu’elle est liée à un article partagé ou au profil. Chaque compte ne peut affecter que sa propre photo à son propre profil. Retirer le lien supprime l’accès de la moitié, sans effacer une éventuelle copie déjà consultée.
- Le catalogue courses reste ouvert après chaque ajout. Les quantités et références se modifient ensuite dans l’article. L’acheteur peut remettre son achat à acheter ; les anciens achats sans auteur peuvent également être décochés.
- « Tous les soins du jour sont faits » enregistre uniquement les soins activés et arrivés à échéance, avec la date de Paris et le vrai compte connecté ; les soins futurs ne sont pas anticipés.
- 40 recettes originales sans porc, pour deux, avec photos d’illustration Wikimedia Commons et crédits/licences dans chaque fiche. Les images distantes ne reçoivent pas de référent ; elles peuvent être indisponibles si le service d’images est hors ligne. Aucun compte ni API d’IA n’est nécessaire.
- `mealRounds[date]` contient les votes privés de chaque compte. L’API ne renvoie que `myVotes` du compte connecté et les matchs réciproques du jour : aucun vote du partenaire, nombre de votes, activité ou notification individuelle. Les bulletins sont définitifs pour une journée ; les nouvelles parties suivent la date de Paris. L’historique demeure en base sans être exposé au partenaire hors des matchs du jour.
- Chaque match déclenche une seule attribution côté serveur entre les deux personnes et « ensemble », à probabilités égales par tirage cryptographique sans biais modulo. Le résultat est enregistré avec la transaction CAS, sans bouton permettant de relancer le tirage.
- L’accueil affiche les échéances des plantes et les décomptes des prochains voyages, vacances, anniversaires, sorties et événements familiaux saisis dans le calendrier. Les événements privés ne sont transmis qu’à leur auteur.
- La discussion utilise toute la hauteur disponible, avec un en-tête compact, un fil défilant et la zone de saisie accessible au-dessus de la navigation. Les photos de profil s’affichent aussi dans la discussion.

Vérification : `node tests/meals.test.mjs` (confidentialité, tirages, identités, soins), `node tests/photos.test.mjs` (30 Mio, compression adaptative, CSP et erreurs), en plus des quatre suites existantes. Aucune clé privée d’IA n’est intégrée au navigateur ni au dépôt.
