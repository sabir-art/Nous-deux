# Appels et notifications

Notifications Web Push avec consentement explicite par appareil. Sur iOS/iPadOS, ouvrir l’application depuis son icône sur l’écran d’accueil. Choisir le bon prénom sur chaque appareil. Les catégories peuvent être désactivées séparément et le bouton de test cible uniquement l’appareil courant. Le bouton Désactiver supprime l’abonnement côté serveur avant de le désabonner dans le navigateur.

Les notifications n’exposent ni intitulés, ni montants, ni détails médicaux. Elles sont envoyées aux appareils de l’autre personne du même compte. Elles concernent les changements, pas des rappels programmés à l’échéance. Le flux d’activité conserve 90 jours et affiche les 50 derniers changements.

Variables de production : VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY (secrète), configurées via Sites. Ne pas changer la paire pour une mise à jour ordinaire : les abonnements existants dépendent de cette clé publique. Aucune clé privée dans le dépôt.

Appels audio bêta WebRTC, micro sur action explicite, signalisation authentifiée en D1 et connexion directe STUN. Un appel par maison, une seule réponse concurrente. Garder l’application ouverte ; les invitations Web Push ne sont pas une sonnerie téléphonique native. Un réseau restrictif peut empêcher la liaison : un service TURN authentifié reste nécessaire pour une couverture réseau fiable. Aucun audio n’est enregistré. Les descriptions de connexion sont effacées à la fin explicite d’un appel ; un appel abandonné expire et sera remplacé lors du prochain appel.

Vérification automatisée : `node tests/communication.test.mjs`, `node tests/api.test.mjs`, `node tests/domain.test.mjs`, `node tests/calendar.test.mjs`, `node node_modules/typescript/bin/tsc --noEmit` et build Sites. Les tests simulent le service push, sans envoyer de notification externe. Ils vérifient le chiffrement, les destinataires, les catégories, le retrait d’autorisation, l’isolation et les transitions d’appels.

Vérification manuelle restant à faire sur deux appareils réels : installer, choisir deux prénoms distincts, activer les notifications, lancer un test, créer une tâche depuis l’autre appareil, appeler/répondre, écouter dans les deux sens, couper le micro et raccrocher. Tester Wi-Fi/Wi-Fi puis Wi-Fi/mobile ; la liaison mobile n’est pas garantie sans TURN. Safari, autorisation microphone, lecture audio et réception réelle des push n’ont pas été vérifiés dans un navigateur pendant cette session.
