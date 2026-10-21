# Site vitrine « Nous deux »

## Rôle de cette branche

Le dépôt est [sabir-art/Nous-deux](https://github.com/sabir-art/Nous-deux).
La branche `site-vitrine` contient le site public de présentation de l'application.
Elle possède un historique indépendant de `main`, qui contient l'application.
Travailler sur le site vitrine ne nécessite pas de fusion avec `main`.

**GitHub est la source de référence du code. IONOS héberge la copie publiée.**
Le site est déployé sur l'hébergement Web Plus existant, sans WordPress, Vercel
ni abonnement IONOS Deploy Now.

## Architecture et fichiers

- `index.html` : site complet avec styles, scripts et images intégrés.
- `README.md` : fonctionnement et procédure de publication.
- `AGENTS.md` : consignes pour ChatGPT/Codex et les autres agents.
- `CLAUDE.md` : point d'entrée pour Claude.
- `.github/workflows/deploy-ionos.yml` : publication automatique par SFTP.
- `.github/workflows/check-domain.yml` : diagnostic DNS, TLS et HTTP.

Les vues Contact, Mentions légales, Confidentialité et CGU sont intégrées
dans `index.html` : `#contact`, `#mentions-legales`, `#confidentialite`, `#cgu`.
Dépendances externes : React 18.3.1 via cdnjs.cloudflare.com et polices
Figtree/Fraunces via Google Fonts.
Aucun build ni variable d'environnement côté site n'est nécessaire.

Pour voir une modification localement :

```bash
python3 -m http.server 8000
```

Ouvrir ensuite http://localhost:8000 et vérifier les vues concernées,
notamment sur mobile.

## Hébergement IONOS et domaine

| Élément | Configuration |
| --- | --- |
| Domaine | `nousdeux-app.fr`, conservé chez IONOS |
| Hébergement | IONOS Hébergement Web Plus |
| Dossier cible du domaine | `/nousdeux-vitrine` |
| Transfert | SFTP, port 22 |
| Compte de déploiement | Compte dédié, limité à ce dossier |
| Chemin visible depuis ce compte SFTP | `/` |

**Attention au chemin :** la racine `/` du compte SFTP correspond déjà au
dossier IONOS `/nousdeux-vitrine`. Ne pas créer un deuxième dossier
`nousdeux-vitrine` à l'intérieur.

## Publier une modification

1. Partir de la dernière version de `origin/site-vitrine`. Vérifier la branche
   et les changements locaux avant de modifier quoi que ce soit.
2. Modifier `index.html`, puis vérifier le rendu et les liens concernés.
3. Créer un commit avec uniquement les fichiers du travail demandé.
4. Pousser ce commit vers `site-vitrine`. Avec une branche de travail,
   intégrer d'abord les changements dans `site-vitrine`.
5. Dans [GitHub Actions](https://github.com/sabir-art/Nous-deux/actions),
   attendre le succès du workflow **Déployer le site sur IONOS** pour ce commit.
6. Vérifier le site public sur https://nousdeux-app.fr et recharger sans cache
   si nécessaire.

Exemple, depuis une copie locale déjà positionnée sur `site-vitrine` et à jour :

```bash
git status
git add index.html
git commit -m "feat: mettre à jour le site vitrine"
git push origin site-vitrine
```

Un changement uniquement local n'est pas publié. Un commit sur une autre branche
ne met pas le site à jour tant qu'il n'est pas intégré à `site-vitrine`.
Après le push, GitHub Actions effectue le transfert : **aucune copie manuelle
dans IONOS n'est nécessaire**. La publication prend le temps de l'exécution du workflow.

## Ce que fait le déploiement

Le workflow se déclenche à chaque push sur `site-vitrine`, y compris pour
un changement de documentation. Il récupère le code, installe Paramiko,
vérifie les secrets et le fichier d'entrée, puis se connecte au serveur SFTP.

La clé publique du serveur est épinglée : une clé inconnue ou différente est refusée.
Le fichier est envoyé sous un nom temporaire, son empreinte SHA-256 est vérifiée,
puis il remplace `index.html` par renommage atomique.
Les déploiements sont sérialisés pour éviter les transferts concurrents.

**Le workflow actuel publie uniquement `index.html`.** Les fichiers Markdown,
les workflows et les autres fichiers du dépôt ne sont pas transférés.
Si le site est séparé plus tard en CSS, JavaScript ou images externes,
adapter le déploiement avant de publier ces références.

Les trois secrets sont dans **Settings → Secrets and variables → Actions →
Repository secrets** :

- `IONOS_SFTP_HOST`
- `IONOS_SFTP_USERNAME`
- `IONOS_SFTP_PASSWORD`

Ne jamais mettre leurs valeurs dans le code, les fichiers Markdown ou les logs.
Une modification du mot de passe IONOS nécessite de mettre à jour le secret associé.
Si la clé du serveur change, vérifier la nouvelle clé auprès d'IONOS avant de
modifier la clé épinglée ; ne pas désactiver cette vérification.

## État constaté le 21 octobre 2026

- Premier transfert SFTP réussi, avec vérification de l'intégrité du fichier.
- Site accessible en HTTP, avec et sans `www`.
- Certificat SSL Starter Wildcard indiqué « Sécurisé » chez IONOS,
  associé au contrat d'hébergement et prévu pour une utilisation gérée par IONOS.
- À la dernière vérification de cette session, HTTPS échouait encore :
  `ERR_SSL_PROTOCOL_ERROR` dans Chrome et alerte TLS `internal error`.
  La cause exacte côté IONOS n'était pas confirmée.

Ce constat est daté : revérifier le site avant de conclure qu'un problème persiste.
Un transfert SFTP réussi ne prouve pas que le HTTPS fonctionne.

Le workflow **Vérifier le domaine et HTTPS** affiche les résultats DNS/TLS/HTTP.
Il se déclenche automatiquement quand son propre fichier est modifié ;
il ne s'exécute pas après chaque modification du site.
Il consigne les erreurs sans nécessairement faire échouer le job :
**lire ses logs, ne pas se fier uniquement à la coche verte**.
Pour répéter un diagnostic déjà exécuté, utiliser **Re-run jobs** sur son exécution.
Les workflows déclarent aussi `workflow_dispatch` ; sa disponibilité manuelle
dépend notamment de la présence du workflow sur la branche par défaut.

Si HTTP fonctionne mais HTTPS échoue, vérifier l'installation/association
du certificat chez IONOS et, au besoin, faire intervenir leur support.
Une redirection HTTP vers HTTPS ne corrige pas une négociation TLS défaillante.

## Revenir à une version précédente

Annuler le commit problématique avec `git revert`, puis pousser sur
`site-vitrine` : le workflow republiera le fichier correspondant.
Éviter les modifications manuelles sur IONOS, qui seraient remplacées
au prochain déploiement.

## Contenu encore à compléter

Le README initial signalait les points suivants ; vérifier leur état dans
`index.html` avant de les considérer comme résolus :

- Adresse `CONTACT=""` utilisée pour ouvrir la messagerie du visiteur.
- Passages jaunes `class="todo"` des mentions légales, confidentialité et CGU :
  éditeur, statut, adresse, directeur de publication, hébergeur, région des données,
  date de publication, gratuit/payant et durées de conservation.

Demander les informations manquantes plutôt que les inventer.
