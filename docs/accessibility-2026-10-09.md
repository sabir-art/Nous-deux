# Vérifications de l’interface — 9 octobre 2026

Cette livraison corrige les problèmes signalés sur les captures mobiles. Elle ne constitue pas une déclaration de conformité RGAA : un audit complet, sur toutes les pages et tous les états avec les technologies d’assistance, n’a pas été réalisé.

## Contrôles réalisés

- Calcul WCAG des contrastes à partir des couleurs réellement déclarées dans les CSS : 59 couples texte/fond ou contrôle/fond, dont les 18 catégories d’agenda. Tous les textes testés dépassent 4,5:1 ; le minimum mesuré est 5,54:1. Contours des champs et indicateurs de focus : au moins 3:1. Le test ne prétend pas calculer toute la cascade CSS de chaque pixel affiché.
- Remplacement des anciennes couleurs de texte trop pâles, fonds opaques derrière les légendes sur photo, solde du budget foncé sur fond pastel, bouton de remboursement avec contour, espacement et cible de 44 px minimum.
- Rendu serveur de composants réels avec données fictives : recherche et fermeture nommées, carrousel et liste de produits accessibles au clavier, contrôles semaine/mois avec état sélectionné, commandes de swipe également disponibles sous forme de boutons et avec les flèches du clavier.
- Lien d’accès au contenu, anneau de focus contrasté, retour du focus après fermeture d’une boîte de dialogue. Pas de blocage du zoom ; champs à 16 px sur mobile.
- Respect de `prefers-reduced-motion` pour les animations CSS, transitions de page et sorties de cartes.
- Conteneurs flex/grid à largeur réductible (`min-width:0`, `minmax(0,1fr)`), largeur de la page bornée, défilement propre au carrousel de plantes et aux filtres. Catalogue avec défilement vertical uniquement, une colonne à 320 px, pied fixe dans sa boîte. Le clavier mobile réduit la hauteur disponible du dialogue via `visualViewport`.
- Gestes testés : verrouillage de l’axe, glissement vertical sans vote, swipe court rapide, retour à la position initiale, commandes clavier. Synchronisation testée : actions optimistes privées, envois sérialisés, reprises après erreur, absence de faux matchs, poll ancien, changement de jour et arrêt lors du changement de compte.
- Tests existants conservés : séparation des comptes, données privées, modifications autorisées, photos de 30 Mio, agenda, courses et plantes.

## Vérifications manuelles à terminer

Le navigateur de vérification arrive à l’écran de connexion ; aucune session personnelle n’a été créée ou injectée pour contourner l’authentification. Les captures fournies ont servi au diagnostic. Les vues privées modifiées nécessitent encore une vérification sur un appareil connecté, notamment :

1. Safari/iPhone à 320, 375, 390 et 430 px : aucune translation du cadre de l’application avec 3 plantes ou plus ; seuls les rails prévus défilent horizontalement.
2. Catalogue : recherche avec clavier ouvert, noms très longs, changement de catégories, premier et dernier articles accessibles, confirmation visible.
3. VoiceOver et navigation complète au clavier : ordre de lecture, intitulés, annonces des changements, absence de piège clavier, focus visible et restauré.
4. Agrandissement du texte à 200 %, zoom à 400 %, orientation paysage et réglages d’espacement du texte ; toutes les informations et commandes restent disponibles.
5. Contrôle des contrastes calculés sur les états effectivement affichés (normal, survol, focus, sélection, erreurs) de chaque écran, et relecture de tous les critères RGAA applicables.
6. Swipes rapides et diagonaux sur appareil tactile, réseau lent/interrompu, préférences de réduction des animations. Aucun match ne doit être visible avant confirmation du serveur.

Référentiel : https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/ (RGAA 4.1.2, notamment 3.2, 3.3, 7.3, 10.4, 10.7 et 10.11).

Exécution : `node tests/accessibility.test.mjs` et `node tests/interaction.test.mjs`. Les contrôles sont aussi exécutés avant le déploiement GitHub Pages.
