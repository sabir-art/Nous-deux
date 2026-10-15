# Consignes communes aux assistants — Nous deux

## Démarrage

1. Lire `docs/PROJECT-CONTEXT.md`, `docs/CURRENT-STATUS.md` et `docs/DEVELOPMENT.md`.
2. Vérifier le dépôt `sabir-art/Nous-deux`, la branche, les modifications locales, la dernière version de `main` et les PR ouvertes. Ne jamais écraser le travail de l'autre personne ou d'une autre session.
3. Partir d'une branche dédiée à la demande, avec la dernière version distante. Conserver les changements locaux existants ; pas de reset forcé ni de force-push sur une branche partagée.
4. Répondre en français simplement. Annoncer le travail, donner des nouvelles pendant les opérations longues, distinguer ce qui est codé, testé, fusionné et effectivement déployé.

## Produit et design

- Conserver les fonctionnalités et le design system fourni. Lire `design-system/GUIDE-IA-nous-deux.md` avant toute intervention visuelle ; réutiliser les tokens et composants existants.
- Ne pas remplacer l'application par une nouvelle maquette ou réintroduire l'ancien style vert. Garder les sources de référence de `design-system/` intactes ; adaptations via le pont d'intégration et le CSS applicatif. Inspecter `scripts/integrate-design-system.mjs` avant de régénérer les composants.
- Interface française, chaleureuse, claire, pour un couple. Employer « missions ». Icônes cohérentes, boutons lisibles, cibles tactiles d'au moins 44 px, focus visible, contrastes testés, animations réduites si demandé par le système.
- Tester les petits écrans et WebKit, pas seulement le bureau. Pas de débordement horizontal global ; les rails défilent dans leur propre conteneur. Ne pas sacrifier le zoom ou les gestes verticaux aux swipes.
- Ne pas annoncer une conformité RGAA complète sur la seule base de tests automatiques.

## Données et identité

- Le projet Supabase de production est `jvjwyalusdygvkyzmiez`. Il contient de vraies données. Ne pas le remplacer, le recréer, le vider ou réinitialiser les comptes pour tester.
- La remise à zéro demandée le 10 octobre 2026 est TERMINÉE et ne constitue aucune autorisation de la répéter. Conserver mots de passe, profils, photos et données actuelles.
- Tester avec des fixtures locales. Ne pas envoyer de vrais messages, invitations, notifications ou appels aux utilisateurs pour valider une modification sans leur demande explicite.
- Authentification personnalisée via `x-house-session`, vérifiée dans `house-api`. `verify_jwt=false` est intentionnel ; ne pas le modifier sans migration complète de l'authentification. Le navigateur ne décide jamais de l'identité de l'auteur.
- Préserver la confidentialité serveur des événements privés et des votes repas. Un simple masquage CSS/React ne suffit pas.
- Les tables `nd_*` sont réservées au serveur ; ne pas ouvrir leurs droits à `anon`/`authenticated` pour corriger une erreur d'accès. Ne pas supprimer RLS ni inventer des politiques Supabase Auth incompatibles avec les sessions actuelles.
- Préserver vérifications de propriété, numéros de version, transactions et idempotence. Toute évolution SQL doit être versionnée, additive quand possible et vérifiée sur un environnement isolé avant production.
- Ne jamais lire/exporter les mots de passe, clés ou jetons pour constituer du contexte. Aucun secret dans GitHub, les logs, les captures, les prompts ou les variables frontend. `.gitignore` ne protège pas un secret envoyé au navigateur.
- Les permissions administrateur du développeur/MCP ne sont pas les permissions d'un utilisateur de l'application. Les règles de confidentialité doivent rester appliquées par l'API.

## Collaboration et livraison

- Une demande par branche et PR, description claire et tests pertinents. Avant fusion, récupérer les changements de `main`, résoudre les conflits et refaire les contrôles concernés. Ne pas modifier une PR de l'autre personne sans coordination.
- Les changements de code frontend ne déploient pas automatiquement les Edge Functions ou les migrations SQL. Vérifier séparément chaque couche touchée.
- Publier/fusionner selon l'autorisation donnée dans la session ; ne pas confondre accès technique et autorisation d'une modification destructive, d'un abonnement ou d'un changement de visibilité.
- Après déploiement, vérifier le résultat et le lien réel. Un workflow réussi côté build ne prouve pas que l'application est publiée.
- Mettre à jour `docs/CURRENT-STATUS.md` en fin de tâche significative : date, changements, tests, publication réelle et blocages. Mettre à jour les autres guides si le comportement ou les commandes changent. Aucun contenu personnel du foyer dans ces documents.
- Les conversations entre Claude et ChatGPT ne sont pas partagées : GitHub et ces documents sont le relais. Ne jamais supposer que l'autre assistant connaît une décision non écrite.
