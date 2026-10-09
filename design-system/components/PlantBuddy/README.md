# PlantBuddy

La collection de mascottes plantes : de petits personnages feuilles qui vivent, réagissent et parlent selon l'arrosage.

**Props** : `species` (`feuille`, `pousse`, `monstera`, `cactus`), `name` (le surnom de la plante), `daysSinceWater` et `every` (l'humeur se calcule toute seule), `mood` pour la forcer (`love`, `happy`, `ok`, `thirsty`, `sad`, `sleep`), `night` (elle dort), `potTone`, `size`, `phrase` (remplace la phrase automatique), `speech={false}` pour masquer la bulle, `interactive` (on peut la toucher, elle réagit et change de phrase), `waterButton` (bouton « Arroser » intégré), `onWater`, `onPoke`.

**Comment l'humeur évolue** (jours depuis l'arrosage, par rapport au rythme `every`) :
- Arrosée aujourd'hui : `love`, yeux en cœur, gouttes qui tombent, petits cœurs. « Glou glou, je revis ! »
- Moins de 60 % du délai : `happy`, grand sourire, joues roses. « Je me sens pousser des feuilles ! »
- Avant l'échéance : `ok`, petit sourire. « Encore 2 jours et j'aurai soif. »
- Échéance passée : `thirsty`, feuillage qui jaunit, elle penche, regarde en l'air et transpire. « Psst ! C'est l'heure de l'arrosage. »
- Bien trop longtemps : `sad`, feuillage fané, elle s'affaisse, sourcils tristes, une larme. « Je commence à faner, au secours ! »
- La nuit : `sleep`, yeux fermés, petits « z ». « Chut, je fais ma nuit. »

**Animations** : balancement doux à l'arrivée, clignement des yeux, rebond quand on la touche ou qu'on l'arrose, frisson quand elle fane. Chaque animation dure moins de 5 secondes puis s'arrête, et tout est coupé si l'utilisateur a réduit les animations.

- La phrase est dans une bulle annoncée aux lecteurs d'écran (`aria-live`) ; l'état de la plante est aussi dans le nom accessible (« Fifi, a soif »).
- Couleurs `leaf`, `leaf-deep`, `leaf-dry`, `leaf-wilt` et `water`, identiques dans les deux thèmes.
- Une mascotte par plante, toujours la même espèce et le même pot pour une plante donnée. Donnez-leur un prénom : elles parlent en leur nom.
