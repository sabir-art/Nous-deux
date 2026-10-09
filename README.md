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
