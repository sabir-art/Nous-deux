# Site vitrine « Nous deux »

Cette branche contient **uniquement** le site vitrine de l'app. Elle n'a aucun
historique en commun avec `main` : rien ici ne modifie l'application.

## Contenu

- `index.html` : le site complet en un seul fichier (styles, scripts et images
  intégrés). Les pages Contact, Mentions légales, Politique de confidentialité
  et CGU sont dans le même fichier, accessibles par `#contact`,
  `#mentions-legales`, `#confidentialite` et `#cgu`.

Dépendances chargées depuis Internet :
- React 18.3.1 (cdnjs.cloudflare.com)
- Polices Figtree et Fraunces (Google Fonts)

## Déployer

C'est un site statique : il suffit de servir `index.html` à la racine
(Vercel, Netlify, Cloudflare Pages, GitHub Pages, OVH, etc.). Aucune étape de
build, aucune variable d'environnement.

Test en local : `python3 -m http.server` dans ce dossier, puis
http://localhost:8000.

## À compléter avant la mise en ligne

1. **Adresse de contact** : dans `index.html`, renseigner `CONTACT=""`
   (le formulaire ouvre la messagerie du visiteur vers cette adresse).
2. **Mentions légales, confidentialité, CGU** : remplacer chaque passage
   surligné en jaune (`class="todo"`) : éditeur et statut, adresse, directeur
   de la publication, hébergeur du site, région Supabase, date de publication,
   gratuit ou payant, durées de conservation.
