# Nous deux, design system

- `GUIDE-IA-nous-deux.md` : tout le design system dans un seul fichier. À donner à ChatGPT, Claude, Gemini, Cursor, v0, Lovable…
- `demo.html` : tous les composants en vrai, avec bouton clair / sombre. À ouvrir avec un petit serveur local (par exemple l'extension Live Server de VS Code), ou à déposer sur Netlify, Vercel, Webflow.
- `tokens/tokens.css` : variables CSS (couleurs clair et sombre, espacements, rayons, polices, styles de texte). À coller dans n'importe quel site ou dans le code personnalisé Webflow.
- `tokens/tokens.json` : les tokens bruts.
- `tokens/figma-tokens-studio.json` : à importer dans Figma avec le plugin Tokens Studio (jeux Clair, Sombre et Global).
- `tokens/tailwind.config.js` : à fusionner dans la config Tailwind d'un projet, avec tokens.css.
- `components/` : composants React (`bundle.js`, `bundle.css`, `index.d.ts`) et la fiche de chaque composant.
- `logos/` : le logo en SVG, en cinq versions.
