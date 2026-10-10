# Appels privés avec Daily — mise en service

État au 10 octobre 2026 : intégration sur la branche `feature/daily-calls`, pas déployée en production. Aucun secret Daily n'a été obtenu. Les tests isolés ne remplacent pas un appel réel sur les deux téléphones. Aucune modification des données existantes n'est nécessaire.

## Configuration à fournir

1. Dans votre compte **Daily**, ouvrir **Developers → API keys** et copier la clé API. Ne pas l'envoyer dans une conversation et ne pas la mettre dans un fichier du dépôt.
2. Ouvrir le projet Supabase **Nous deux** (`jvjwyalusdygvkyzmiez`), puis **Edge Functions → Secrets**.
3. Ajouter le secret nommé exactement **`DAILY_API_KEY`**, avec la clé Daily comme valeur. Ce secret est commun aux deux comptes ; Laura n'a rien à saisir sur son téléphone.
4. Indiquer que le secret a été ajouté. Il reste alors à réaliser les étapes de mise en service ci-dessous ; ajouter la clé seul ne publie pas le code de cette branche.

Le navigateur de cette session affichait la connexion Daily et l'authentification n'a pas été validée. Aucun changement du dashboard, abonnement, carte bancaire ou clé n'a été effectué.

## Architecture et protection des données

- Le SDK officiel `@daily-co/daily-js` 0.93.0 transporte le son et la vidéo. Chargement à la demande, interface React personnalisée, sans Daily Prebuilt.
- `house-api` authentifie chaque requête avec la session existante de Nous deux. Le rôle déclaré par le navigateur ne décide jamais de l'identité.
- La nouvelle table `nd_daily_calls` conserve invitations et historique. Son accès direct est fermé à `anon` et `authenticated` : seule la fonction serveur, avec son rôle de service, y accède. Les appels n'effacent aucune dépense, photo, recette, discussion ni ancien événement.
- Une contrainte PostgreSQL interdit deux appels actifs. Les réponses concurrentes sont arbitrées par version ; un seul appareil prend l'appel. L'identifiant d'appareil est lié à la session authentifiée par un hachage serveur.
- Chaque appel crée une salle privée unique, limitée à deux participants et à deux heures. Les jetons d'admission expirent après trois minutes, sont liés à une salle et à une identité, et n'accordent aucun pouvoir d'administration. Ils restent en mémoire, pas dans le stockage local ni dans les notifications.
- Aucun enregistrement, transcription, partage d'écran ou module payant supplémentaire n'est activé. Un appel audio peut activer sa caméra.
- Raccrocher arrête les médias locaux puis tente l'expiration de la salle, l'expulsion des deux identités et la suppression de la salle. Les échecs de nettoyage sont conservés et retentés lors des requêtes suivantes. L'expiration absolue de la salle reste le dernier filet de sécurité. Il n'y a pas encore de tâche de nettoyage indépendante lorsque personne n'ouvre l'application.
- L'invitation sonne au maximum 90 secondes. Les battements de connexion cessant pendant quatre minutes font expirer l'état de connexion. Un plantage peut donc produire une durée approximative dans l'historique ; le compteur de facturation Daily fait foi.
- Les anciens endpoints WebRTC restent présents pour les clients déjà ouverts ; de nouveaux appels hérités sont refusés lorsque Daily est configuré. Terminer un ancien appel reste possible.

## Expérience disponible dans la PWA

Depuis la discussion : boutons audio et vidéo. Pendant l'appel : prénom/photo, durée, micro, caméra, changement de caméra, fenêtre locale, réduction de l'appel sans quitter la communication et raccrochage. Les appels refusés, manqués et interrompus restent dans l'historique.

La sonnerie locale nécessite l'autorisation audio du navigateur. Un bouton permet de l'activer si nécessaire. Les notifications push utilisent les préférences déjà existantes ; toucher une notification d'appel réveille l'interface sans recharger et couper un appel ouvert. Une ancienne notification vérifie l'état courant au lieu de recréer l'appel.

**Limites explicites :** garder l'application ouverte pour une conversation fiable. Les navigateurs peuvent suspendre une PWA en arrière-plan. Une notification web n'est pas un écran d'appel système et sa réception ne garantit pas une sonnerie prolongée, surtout téléphone verrouillé. Le navigateur laisse souvent iOS choisir entre l'écouteur interne, le haut-parleur et Bluetooth. Un sélecteur est affiché uniquement lorsque des sorties audio sélectionnables sont effectivement exposées ; il ne promet pas de forcer le haut-parleur sur iPhone.

## Mise en service, dans cet ordre

1. Vérifier la branche et les tests automatisés. La CI de cette branche construit une version de test mais **ne déploie pas GitHub Pages**.
2. Ajouter `DAILY_API_KEY` dans les secrets Supabase, sans l'afficher ni le committer.
3. Appliquer uniquement la migration additive `supabase/migrations/20261010001105_daily_private_calls.sql` et déployer `house-api` avec ses fichiers existants et les deux nouveaux modules Daily. L'authentification personnalisée existante doit rester en place ; ne pas activer une validation JWT Supabase incompatible avec elle.
4. Vérifier côté Daily avec une salle temporaire : propriété privée, limite de deux, absence d'enregistrement, refus sans jeton, durée d'admission et terminaison effective par l'API. Supprimer la salle de test. Ne pas appeler ni notifier l'autre personne à son insu.
5. Servir la branche en prévisualisation HTTPS et effectuer un appel consenti entre les deux comptes : iPhone Safari/PWA et Samsung Chrome/PWA, puis ordinateur. Tester audio seul, vidéo, photo/prénom, muet, retour caméra, caméra arrière, refus, sans réponse, deux appareils qui répondent, raccrochage des deux côtés, perte/rétablissement réseau, changement de vue, écran verrouillé et retour dans l'app. Vérifier sur le dashboard qu'aucun participant ne reste connecté après raccrochage.
6. Contrôler les logs sans journaliser de clés ni de jetons, et comparer l'historique au dashboard. Une fois ces essais réels réussis, fusionner la branche pour publier GitHub Pages.

Retour arrière : remettre la version précédente du frontend et de `house-api`, retirer le secret Daily si nécessaire. Garder la table d'historique ; ne pas supprimer les données du foyer. Les salles restantes expirent au plus tard à leur limite de deux heures, et peuvent être arrêtées depuis Daily.

## Consommation

Le tarif public consulté prévoit 10 000 minutes-participants gratuites par mois, puis 0,004 USD par minute-participant audio/vidéo, ou 0,00099 USD en audio seul. À deux, une heure représente 120 minutes-participants. Les conditions du compte Daily et son compteur priment.

L'application affiche une estimation prudente qui compte les deux personnes dès la création de la salle, et un avertissement à 8 000 minutes. Ce n'est **pas un plafond de dépenses**, ni une mesure exacte de la facture, notamment en cas de session interrompue ou d'autres applications utilisant le même compte. Aucun abonnement ni moyen de paiement n'a été ajouté.

## Évolution native iPhone et Android

`app/daily-engine.ts` sépare le transport média de l'interface. Cette frontière peut accueillir un adaptateur natif, mais un simple emballage Capacitor ne rend pas les appels fiables en arrière-plan.

| Couche | iPhone | Android |
| --- | --- | --- |
| Média | SDK Daily iOS dans un module natif Capacitor | SDK Daily Android dans un module natif Capacitor |
| Appel système | CallKit, état et réponse/raccrochage natifs | Core-Telecom et gestion des appels système |
| Réveil entrant | PushKit, envoi APNs VoIP serveur et signalement immédiat à CallKit | FCM avec notification d'appel adaptée et service de premier plan autorisé |
| Audio | AVAudioSession, écouteur/haut-parleur/Bluetooth, interruptions | Routage audio et interruptions gérés par les API télécom |
| Projet nécessaire | Identifiant d'application, compte développeur Apple, certificats/profils et clé APNs sécurisée | Projet Android/Firebase, signature et configuration des services/permissions |

Phases : créer les projets natifs et identités ; adapter le moteur sans dupliquer l'historique ; ajouter l'enregistrement sécurisé des appareils et l'envoi VoIP ; relier CallKit/Core-Telecom à la même acceptation atomique serveur ; tester vrais appareils verrouillés, batterie faible, réseau mobile/Wi-Fi, Bluetooth et appels cellulaires concurrents. Le système doit signaler immédiatement l'appel entrant natif, puis authentifier/rejoindre Daily. Aucun de ces modules natifs n'est livré dans cette branche.

## Références officielles

- https://docs.daily.co/reference/rest-api/rooms/create-room
- https://docs.daily.co/reference/rest-api/meeting-tokens/create-meeting-token
- https://docs.daily.co/reference/rest-api/rooms/session/eject
- https://docs.daily.co/docs/guides/privacy-and-security/content-security-policy
- https://www.daily.co/pricing/video-sdk/
- https://supabase.com/docs/guides/functions/secrets
- https://developer.apple.com/documentation/pushkit/responding-to-voip-notifications-from-pushkit
- https://developer.android.com/develop/connectivity/telecom/voip-app/telecom
