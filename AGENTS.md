# Consignes agents — site vitrine Nous deux

Ces consignes concernent la branche `site-vitrine` de `sabir-art/Nous-deux`.
Lire également [README.md](README.md) avant une intervention.

## Périmètre

- `site-vitrine` porte uniquement le site public ; `main` porte l'application.
  Les historiques sont indépendants. Ne pas fusionner ces branches pour publier
  le site, ni modifier l'application dans le cadre d'une tâche sur la vitrine.
- Vérifier la branche courante, l'état de travail et la version distante avant
  les changements. Préserver les modifications des autres contributeurs.
- GitHub est la source du code. IONOS Hébergement Web Plus sert les fichiers
  publiés. Ne pas remplacer cette architecture par WordPress, Vercel ou Deploy Now
  sans demande explicite.

## Développement et publication

- Le site est actuellement un seul `index.html`, sans build.
  Tester les vues modifiées, les liens et le rendu mobile avec un serveur local.
- Le workflow `.github/workflows/deploy-ionos.yml` publie automatiquement
  après chaque push vers `site-vitrine`.
- Quand la demande inclut la mise en ligne, effectuer le commit/push ou
  l'intégration dans `site-vitrine` dans le périmètre autorisé, puis vérifier
  l'exécution Actions correspondant au commit et l'accès public.
  Ne pas déclarer « déployé » sur la seule base d'une modification locale.
- Si la demande porte seulement sur une préparation ou une revue, respecter
  cette limite. Signaler clairement ce qui reste local, commité, poussé ou publié.
- Ne pas utiliser de force-push, écraser des changements concurrents ou ajouter
  des fichiers sans rapport avec la tâche.
- Le workflow transfère uniquement `index.html`. Si des assets séparés deviennent
  nécessaires, adapter le transfert de façon explicite et limitée ; ne jamais
  publier `.git`, des secrets, des fichiers de configuration privés ou les
  instructions agents dans la racine publique.
- Un correctif ou retour arrière doit passer par GitHub ; pour annuler une
  publication, préférer un revert puis un push.

## Apparence de la vitrine

- Le thème clair est une exigence produit permanente, quel que soit le réglage
  système ou l'heure. Conserver `data-theme="light"` sur `html` dès le chargement,
  ainsi que la métadonnée et la déclaration CSS `color-scheme: only light`.
- Ne pas activer les palettes sombres selon `prefers-color-scheme`, un stockage
  local ou un changement automatique. Préserver les couleurs du design validé.
- Cette règle ne concerne pas le thème de l'application sur `main` et ne doit
  pas désactiver la préférence d'accessibilité `prefers-reduced-motion`.

## SFTP et sécurité

- Destination IONOS : `/nousdeux-vitrine`, compte SFTP dédié, port 22.
- La racine visible de ce compte est déjà `/`. Ne pas y ajouter
  `/nousdeux-vitrine`, ce qui créerait une arborescence incorrecte.
- Secrets Actions : `IONOS_SFTP_HOST`, `IONOS_SFTP_USERNAME`,
  `IONOS_SFTP_PASSWORD`. Ne jamais demander de coller un mot de passe dans
  la discussion ni enregistrer/afficher ses valeurs.
- Conserver le contrôle de la clé serveur, la vérification SHA-256 et
  le remplacement atomique. Ne pas accepter automatiquement une clé inconnue.
- Ne pas élargir l'accès SFTP aux autres sites du compte IONOS.

## Vérification et transmission du contexte

- Distinguer succès du transfert, fonctionnement du site et validité HTTPS.
- Le diagnostic `check-domain.yml` journalise ses erreurs ; une coche verte
  ne garantit pas l'absence d'erreur TLS. Lire les résultats.
- Le 21 octobre 2026, le SFTP et HTTP étaient confirmés ; le certificat était
  indiqué valide dans IONOS, mais le HTTPS échouait encore. Ce constat peut avoir
  changé : refaire une vérification avant toute conclusion.
- Ne pas modifier DNS, révoquer/réémettre un certificat ou ajouter une
  redirection pour tenter au hasard de résoudre le TLS.
- Ne pas inventer de coordonnées ou de déclarations légales pour les zones
  `CONTACT` et `todo`.
- Mettre à jour le README si le déploiement ou l'architecture évolue.
  Dans le compte rendu, préciser les fichiers changés, la branche, le commit,
  le résultat du workflow et toute vérification publique restant à faire.
