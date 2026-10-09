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
