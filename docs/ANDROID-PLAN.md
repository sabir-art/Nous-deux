# Feuille de route Android (et iPhone ensuite)

Décidé avec Laura le 22 novembre 2026. Le travail Android se fait depuis Android Studio sur son ordinateur (agent Claude intégré). Ce document est le relais entre les sessions : le mettre à jour à chaque étape.

## Choix techniques

- **Capacitor** : l'interface React actuelle est reprise telle quelle dans une vraie appli Android (`android/`, `capacitor.config.ts`, `vite.android.config.ts`, `pnpm run build:android`). Pas d'emballage simple (TWA : pas de vrais appels), pas de réécriture en Kotlin.
- Identifiant définitif : **`fr.nousdeux.app`**, nom « Nous deux ».
- **Supabase reste le serveur** : mêmes comptes, mêmes données, même `house-api`. Android Studio ne fait que construire l'appli.
- Le site GitHub Pages et l'appli installée depuis le navigateur doivent continuer de marcher à chaque étape (`pnpm run build:web` inchangé).
- Origines acceptées par `house-api` : `https://sabir-art.github.io` (site) et `https://localhost` (appli Capacitor), liste `ORIGINS` de `supabase/functions/house-api/index.ts`.

## Étapes

1. **Appli Capacitor** (PR #31, branche `android/capacitor`) : construite, lancée sur l'émulateur. Restent : `allowBackup="false"`, plein écran bord à bord, textes de connexion adaptés à une appli publique, message d'erreur sans « Actualisez la page ».
2. **Notifications natives (Firebase Cloud Messaging)** : projet Firebase créé avec le compte Google de l'appli, `google-services.json` dans `android/app/`, plugin `@capacitor/push-notifications`. Côté serveur, `house-api` doit envoyer aussi vers FCM (en plus du Web Push du site) : compte de service Firebase stocké en secret Supabase, jamais dans Git ni dans le frontend. Les appareils Android s'enregistrent avec leur jeton FCM.
3. **Vrais appels** : sonnerie plein écran même verrouillé (notification d'appel FCM haute priorité + `CallStyle` / `ConnectionService`), décrocher/raccrocher, appel qui continue en arrière-plan (service de premier plan), permissions micro/caméra. Daily reste le transport (`docs/daily-calls.md`).
4. **Ouverture au public (plusieurs couples)** : aujourd'hui l'appli sert un seul foyer (deux comptes choisis dans une liste, un seul `nd_state`). Avant le Play Store public : inscription (e-mail + mot de passe), un foyer séparé et privé par couple, invitation de la moitié, suppression de compte depuis l'appli (exigée par Google). Les données actuelles deviennent le premier foyer, sans perte. Gros chantier serveur : migrations SQL versionnées, testées sur une base isolée avant la production.
5. **Play Store** : compte développeur **personnel** déjà validé (« Nousdeux dev. ») → test fermé obligatoire avec au moins 12 testeurs pendant 14 jours avant la production. Préparer : clé d'envoi (keystore gardé hors Git, sauvegardé), Play App Signing, fichier AAB `release`, fiche (icône, captures, description), politique de confidentialité en ligne (site `nousdeux-app.fr` à confirmer), formulaire « Sécurité des données », suppression de compte.
6. **iPhone** : même projet Capacitor (`npx cap add ios`), compte Apple Developer (99 $/an), CallKit/PushKit pour les appels.

## Règles pour le serveur (Supabase)

L'agent d'Android Studio peut modifier et déployer le serveur, en respectant `AGENTS.md` :

- Projet de production `jvjwyalusdygvkyzmiez` : vraies données, ne jamais le vider, le recréer ni réinitialiser les comptes. Tester avec des fixtures locales (`tests/`), jamais avec de vrais messages, notifications ou appels sans demande explicite.
- Connexion de la CLI : Laura lance elle-même `npx supabase login` (le jeton reste sur son ordinateur, jamais dans Git ni dans une conversation).
- Déploiement : `npx supabase functions deploy house-api --project-ref jvjwyalusdygvkyzmiez --no-verify-jwt` depuis le code fusionné ou validé. `verify_jwt` doit rester désactivé (authentification par `x-house-session`).
- Avant de déployer : noter la version en ligne pour pouvoir revenir en arrière (redéployer le code précédent), lancer les tests Node du serveur (`tests/*.test.mjs`).
- Migrations SQL : fichiers versionnés dans `supabase/migrations/`, additives, rejouables, testées sur une base isolée (PGlite dans `tests/*-database.test.mjs`) avant la production.
- Les tables `nd_*` restent fermées aux rôles `anon`/`authenticated`. Aucun secret (clé Firebase, clé VAPID, clé Daily) dans le frontend, Git ou les journaux.
- Après chaque mise en service : vérifier le résultat réel et noter dans `docs/CURRENT-STATUS.md` ce qui est fusionné, déployé et vérifié, séparément.

## État au 22 novembre 2026

- `house-api` v40 déployée avec l’origine `https://localhost` (PR #32, commit `a6f509c`). Retour arrière : redéployer `house-api` depuis `main` `82df13b` (v38).
- Appli Android : étape 1 en cours sur `android/capacitor` (PR #31, brouillon).
