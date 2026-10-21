# Claude — site vitrine Nous deux

Lire [AGENTS.md](AGENTS.md) pour les consignes communes aux agents et
[README.md](README.md) pour l'architecture, la publication et le dépannage.

## Contexte à conserver

- Dépôt : `sabir-art/Nous-deux`, branche du site : `site-vitrine`.
- Cette branche est indépendante de `main` : ne pas fusionner avec
  l'application pour déployer la vitrine.
- GitHub conserve le code ; IONOS Hébergement Web Plus héberge le site
  sur le domaine `nousdeux-app.fr`.
- Publication automatique via GitHub Actions et SFTP, port 22,
  avec un compte limité au dossier `/nousdeux-vitrine`.
  Depuis ce compte, la destination est `/`.
- Modifier le site, vérifier, commiter et pousser vers `site-vitrine`
  lorsque la publication fait partie de la demande. Un changement local
  ou sur une autre branche ne suffit pas à mettre le site en ligne.
- Vérifier ensuite le workflow **Déployer le site sur IONOS** et le site public.
  Aucun transfert manuel récurrent dans IONOS n'est nécessaire.
- Seul `index.html` est actuellement transféré. Adapter le workflow si
  l'architecture change ; la documentation reste dans GitHub.
- Les identifiants restent dans les trois secrets Actions documentés dans
  le README. Ne jamais les mettre dans les réponses, le dépôt ou les logs.
- Le problème HTTPS observé le 21 octobre 2026 doit être revérifié :
  ne pas confondre certificat indiqué « Sécurisé » et HTTPS opérationnel.
  Ne pas déclarer cette anomalie corrigée sans preuve.
