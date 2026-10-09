# PlantCard

Fiche d'une plante du module Plantes : sa mascotte `PlantBuddy` qui parle, qui l'arrose et le calendrier d'arrosage de la semaine.

**Props** : `name`, `species` (`feuille`, `pousse`, `monstera`, `cactus`), `potTone`, `every` (rythme d'arrosage en jours) et `daysSinceWater` (l'humeur et le sticker en découlent), `thirsty` (raccourci), `night`, `next` (prochaine action en mots), `who` (`{name, partner}`), `week` (`[{dow, day, state: 'due'|'done', today}]`), `action`, `onWater`.

- Fond `sapin`, texte `on-sapin`, bouton citron : le module Plantes a sa propre ambiance vert profond.
- Jours à arroser en `menthe`, jours arrosés en `citron` avec une coche, aujourd'hui cerclé.
- L'état de la plante s'écrit toujours en toutes lettres (sticker, phrase de la mascotte, date du prochain arrosage).
- Au clic sur « C'est arrosé », la mascotte passe en `love` (gouttes, cœurs, « Glou glou, je revis ! ») et le jour est coché.
