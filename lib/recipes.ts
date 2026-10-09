export type Recipe={owner?:number;version?:number;photoId?:string|null;calories?:number|null;nutrients?:string;archived?:boolean;id:string;title:string;group:string;minutes:number;photo:string;servings:number;ingredients:string[];steps:string[];sourceUrl?:string;sourceTitle?:string;generatedAt?:string;image?:{url:string;source:string;author:string;license:string;licenseUrl:string}};
export const recipes:Recipe[]=[
 {
  "id": "shakshuka",
  "title": "Chakchouka aux œufs",
  "group": "Végétarien",
  "minutes": 30,
  "photo": "Shakshuka",
  "servings": 2,
  "ingredients": [
   "4 œufs",
   "400 g de tomates concassées",
   "1 poivron",
   "1 oignon",
   "1 gousse d’ail",
   "1 c. à café de cumin",
   "1 c. à soupe d’huile d’olive",
   "Pain, sel, poivre"
  ],
  "steps": [
   "Émincer l’oignon et le poivron, hacher l’ail.",
   "Faire revenir les légumes avec l’huile 8 min. Ajouter l’ail, le cumin et les tomates, puis laisser mijoter 10 min.",
   "Former quatre creux, casser les œufs et couvrir 5 à 8 min, jusqu’à ce que les blancs soient pris. Servir avec du pain."
  ]
 },
 {
  "id": "falafel",
  "title": "Falafels au four & sauce yaourt",
  "group": "Végétarien",
  "minutes": 45,
  "photo": "Falafel",
  "servings": 2,
  "ingredients": [
   "300 g de pois chiches cuits égouttés",
   "1 petit oignon",
   "1 gousse d’ail",
   "2 c. à soupe de farine",
   "1 c. à café de cumin",
   "Persil",
   "2 c. à soupe d’huile d’olive",
   "1 yaourt nature",
   "½ citron",
   "Salade et 2 pains pita"
  ],
  "steps": [
   "Chauffer le four à 200 °C. Bien sécher les pois chiches puis les écraser avec oignon, ail et persil hachés.",
   "Incorporer farine, cumin et une pincée de sel. Former des boulettes, huiler et cuire 25 min en retournant à mi-cuisson.",
   "Mélanger le yaourt et le jus de citron. Garnir les pains avec salade, boulettes et sauce."
  ]
 },
 {
  "id": "hummus-bowl",
  "title": "Bowl houmous & légumes croquants",
  "group": "Végétarien",
  "minutes": 15,
  "photo": "Hummus",
  "servings": 2,
  "ingredients": [
   "300 g de pois chiches cuits",
   "2 c. à soupe de tahini",
   "½ citron",
   "1 petite gousse d’ail",
   "1 c. à soupe d’huile d’olive",
   "½ concombre",
   "2 tomates",
   "2 pains pita",
   "Sel"
  ],
  "steps": [
   "Mixer pois chiches, tahini, citron, ail et 3 à 5 cuillerées d’eau jusqu’à une texture crémeuse.",
   "Couper les tomates et le concombre, saler légèrement.",
   "Répartir le houmous, les légumes et l’huile dans deux bols. Servir avec les pains tièdes."
  ]
 },
 {
  "id": "tabbouleh",
  "title": "Taboulé frais aux herbes",
  "group": "Végétarien",
  "minutes": 25,
  "photo": "Tabbouleh",
  "servings": 2,
  "ingredients": [
   "120 g de boulgour fin",
   "3 tomates",
   "½ concombre",
   "1 bouquet de persil",
   "Quelques feuilles de menthe",
   "1 citron",
   "2 c. à soupe d’huile d’olive",
   "Sel"
  ],
  "steps": [
   "Cuire ou réhydrater le boulgour selon son paquet puis laisser refroidir.",
   "Couper finement les légumes. Ciseler généreusement les herbes.",
   "Mélanger avec le boulgour, le jus de citron, l’huile et le sel. Garder au frais jusqu’au repas."
  ]
 },
 {
  "id": "couscous-vegetable",
  "title": "Couscous aux légumes & pois chiches",
  "group": "Végétarien",
  "minutes": 40,
  "photo": "Vegetable couscous",
  "servings": 2,
  "ingredients": [
   "160 g de semoule",
   "200 g de pois chiches cuits",
   "2 carottes",
   "1 courgette",
   "1 oignon",
   "300 ml de bouillon de légumes",
   "1 c. à café de ras-el-hanout",
   "1 c. à soupe d’huile",
   "Sel"
  ],
  "steps": [
   "Couper les légumes. Faire revenir l’oignon dans l’huile, puis ajouter carottes, épices et bouillon.",
   "Mijoter 15 min, ajouter courgette et pois chiches puis cuire 10 min de plus.",
   "Préparer la semoule selon le paquet. Égrainer et servir avec les légumes et leur bouillon."
  ]
 },
 {
  "id": "vegetable-tagine",
  "title": "Tajine de légumes aux abricots",
  "group": "Végétarien",
  "minutes": 45,
  "photo": "Vegetable tagine",
  "servings": 2,
  "ingredients": [
   "2 carottes",
   "1 patate douce",
   "1 oignon",
   "200 g de pois chiches cuits",
   "6 abricots secs",
   "1 c. à café de cumin",
   "½ c. à café de cannelle",
   "350 ml de bouillon de légumes",
   "1 c. à soupe d’huile",
   "120 g de semoule"
  ],
  "steps": [
   "Éplucher et couper les légumes. Faire revenir l’oignon dans l’huile.",
   "Ajouter légumes, épices et bouillon. Couvrir et cuire doucement 25 min.",
   "Ajouter pois chiches et abricots, cuire encore 10 min. Servir avec la semoule préparée selon le paquet."
  ]
 },
 {
  "id": "ratatouille",
  "title": "Ratatouille & riz",
  "group": "Végétarien",
  "minutes": 45,
  "photo": "Ratatouille",
  "servings": 2,
  "ingredients": [
   "1 aubergine",
   "1 courgette",
   "1 poivron",
   "1 oignon",
   "300 g de tomates concassées",
   "1 gousse d’ail",
   "Herbes de Provence",
   "2 c. à soupe d’huile",
   "140 g de riz",
   "Sel"
  ],
  "steps": [
   "Couper les légumes en petits morceaux. Faire revenir oignon, aubergine et poivron avec l’huile 10 min.",
   "Ajouter courgette, ail, tomates et herbes. Couvrir et mijoter 25 min en remuant.",
   "Cuire le riz selon le paquet et servir avec les légumes fondants."
  ]
 },
 {
  "id": "risotto-mushroom",
  "title": "Risotto aux champignons",
  "group": "Végétarien",
  "minutes": 35,
  "photo": "Mushroom risotto",
  "servings": 2,
  "ingredients": [
   "160 g de riz à risotto",
   "250 g de champignons",
   "1 échalote",
   "650 ml de bouillon de légumes chaud",
   "30 g de fromage râpé végétarien",
   "1 c. à soupe d’huile",
   "Poivre"
  ],
  "steps": [
   "Émincer échalote et champignons, faire revenir dans l’huile 6 min.",
   "Ajouter le riz et remuer 1 min. Verser une louche de bouillon puis remuer jusqu’à absorption.",
   "Poursuivre louche par louche environ 18 à 22 min. Ajouter le fromage et le poivre. Le riz doit être crémeux et juste tendre."
  ]
 },
 {
  "id": "pesto-pasta",
  "title": "Pâtes au pesto & tomates cerises",
  "group": "Végétarien",
  "minutes": 20,
  "photo": "Pasta pesto",
  "servings": 2,
  "ingredients": [
   "180 g de pâtes",
   "200 g de tomates cerises",
   "3 c. à soupe de pesto végétarien",
   "1 boule de mozzarella",
   "Sel, poivre"
  ],
  "steps": [
   "Cuire les pâtes selon le paquet. Réserver une petite tasse d’eau de cuisson.",
   "Couper les tomates en deux et la mozzarella en dés.",
   "Mélanger les pâtes chaudes au pesto et détendre avec un peu d’eau de cuisson. Ajouter tomates et mozzarella."
  ]
 },
 {
  "id": "tomato-pasta",
  "title": "Pâtes tomate & basilic",
  "group": "Végétarien",
  "minutes": 25,
  "photo": "Pasta tomato sauce",
  "servings": 2,
  "ingredients": [
   "180 g de pâtes",
   "400 g de tomates concassées",
   "1 gousse d’ail",
   "Basilic",
   "1 c. à soupe d’huile d’olive",
   "30 g de fromage râpé végétarien",
   "Sel, poivre"
  ],
  "steps": [
   "Chauffer l’huile, ajouter l’ail haché 30 secondes puis les tomates.",
   "Mijoter 15 min pendant la cuisson des pâtes.",
   "Égoutter, mélanger à la sauce et ajouter basilic et fromage."
  ]
 },
 {
  "id": "spinach-lasagna",
  "title": "Lasagnes épinards & ricotta",
  "group": "Végétarien",
  "minutes": 55,
  "photo": "Vegetarian lasagna",
  "servings": 2,
  "ingredients": [
   "6 feuilles de lasagnes sans précuisson",
   "300 g d’épinards",
   "200 g de ricotta",
   "400 g de sauce tomate",
   "100 g de mozzarella",
   "1 c. à soupe d’huile",
   "Sel, poivre"
  ],
  "steps": [
   "Chauffer le four à 180 °C. Faire tomber les épinards dans l’huile puis les égoutter et mélanger à la ricotta.",
   "Dans un petit plat, alterner sauce tomate, lasagnes et mélange épinards. Terminer par sauce et mozzarella.",
   "Couvrir et cuire 30 min, découvrir puis gratiner 10 min. Vérifier que les pâtes sont tendres et reposer 5 min."
  ]
 },
 {
  "id": "margherita",
  "title": "Pizza margherita maison",
  "group": "Végétarien",
  "minutes": 30,
  "photo": "Pizza Margherita",
  "servings": 2,
  "ingredients": [
   "1 pâte à pizza",
   "150 g de sauce tomate",
   "125 g de mozzarella égouttée",
   "Basilic",
   "1 c. à soupe d’huile d’olive"
  ],
  "steps": [
   "Préchauffer le four à 230 °C avec sa plaque.",
   "Étaler la pâte sur du papier cuisson. Répartir sauce et mozzarella en morceaux.",
   "Glisser sur la plaque et cuire 12 à 18 min, jusqu’à une pâte dorée. Ajouter basilic et huile à la sortie."
  ]
 },
 {
  "id": "mushroom-pizza",
  "title": "Pizza champignons & mozzarella",
  "group": "Végétarien",
  "minutes": 35,
  "photo": "Mushroom pizza",
  "servings": 2,
  "ingredients": [
   "1 pâte à pizza",
   "150 g de sauce tomate",
   "200 g de champignons",
   "125 g de mozzarella",
   "1 c. à soupe d’huile",
   "Origan"
  ],
  "steps": [
   "Préchauffer le four à 230 °C. Émincer les champignons puis les faire revenir dans l’huile 5 min.",
   "Étaler la pâte, garnir de sauce, champignons, mozzarella et origan.",
   "Cuire 12 à 18 min jusqu’à une pâte dorée et bien cuite."
  ]
 },
 {
  "id": "lentil-dal",
  "title": "Dahl de lentilles corail",
  "group": "Végétarien",
  "minutes": 30,
  "photo": "Dal lentils",
  "servings": 2,
  "ingredients": [
   "150 g de lentilles corail",
   "200 ml de lait de coco",
   "250 g de tomates concassées",
   "1 oignon",
   "1 gousse d’ail",
   "1 c. à café de curry",
   "1 c. à soupe d’huile",
   "250 ml d’eau",
   "120 g de riz"
  ],
  "steps": [
   "Rincer les lentilles. Faire revenir l’oignon émincé dans l’huile, puis ajouter ail et curry.",
   "Ajouter lentilles, tomates, eau et lait de coco. Cuire 20 min à petits bouillons en remuant et en ajoutant de l’eau si nécessaire.",
   "Cuire le riz à part. Saler le dahl lorsque les lentilles sont tendres et servir."
  ]
 },
 {
  "id": "chickpea-curry",
  "title": "Curry de pois chiches & épinards",
  "group": "Végétarien",
  "minutes": 25,
  "photo": "Chickpea curry",
  "servings": 2,
  "ingredients": [
   "300 g de pois chiches cuits",
   "150 g d’épinards",
   "200 ml de lait de coco",
   "1 oignon",
   "1 c. à café de curry",
   "1 c. à soupe d’huile",
   "120 g de riz",
   "Sel"
  ],
  "steps": [
   "Faire revenir l’oignon émincé avec l’huile et le curry 4 min.",
   "Ajouter pois chiches et lait de coco. Mijoter 10 min puis ajouter les épinards pour 3 min.",
   "Cuire le riz suivant le paquet et servir avec le curry. Ajuster l’assaisonnement."
  ]
 },
 {
  "id": "vegetable-soup",
  "title": "Velouté carotte & patate douce",
  "group": "Végétarien",
  "minutes": 35,
  "photo": "Carrot soup",
  "servings": 2,
  "ingredients": [
   "3 carottes",
   "1 patate douce",
   "1 oignon",
   "600 ml de bouillon de légumes",
   "2 c. à soupe de crème",
   "1 c. à soupe d’huile",
   "Pain"
  ],
  "steps": [
   "Éplucher et couper les légumes en dés.",
   "Faire revenir l’oignon dans l’huile puis ajouter légumes et bouillon. Cuire 25 min jusqu’à tendreté.",
   "Mixer avec la crème, ajuster la consistance avec un peu d’eau chaude et servir avec du pain."
  ]
 },
 {
  "id": "lentil-soup",
  "title": "Soupe de lentilles au cumin",
  "group": "Végétarien",
  "minutes": 40,
  "photo": "Lentil soup",
  "servings": 2,
  "ingredients": [
   "140 g de lentilles vertes",
   "2 carottes",
   "1 oignon",
   "1 c. à café de cumin",
   "800 ml de bouillon de légumes",
   "1 c. à soupe d’huile",
   "½ citron"
  ],
  "steps": [
   "Rincer les lentilles. Couper les carottes, hacher l’oignon et le faire revenir dans l’huile.",
   "Ajouter cumin, carottes, lentilles et bouillon. Mijoter 30 à 35 min jusqu’à ce que les lentilles soient tendres.",
   "Ajouter le citron. Mixer partiellement si souhaité, rectifier le sel et servir."
  ]
 },
 {
  "id": "greek-salad",
  "title": "Salade grecque & pita",
  "group": "Végétarien",
  "minutes": 15,
  "photo": "Greek salad",
  "servings": 2,
  "ingredients": [
   "3 tomates",
   "½ concombre",
   "½ oignon rouge",
   "120 g de feta",
   "10 olives",
   "2 pains pita",
   "2 c. à soupe d’huile d’olive",
   "½ citron",
   "Origan"
  ],
  "steps": [
   "Couper les tomates et le concombre en morceaux et émincer l’oignon.",
   "Mélanger huile, citron et origan. Verser sur les légumes.",
   "Ajouter feta et olives. Servir avec les pains pita tièdes."
  ]
 },
 {
  "id": "omelette",
  "title": "Omelette champignons & salade",
  "group": "Végétarien",
  "minutes": 20,
  "photo": "Mushroom omelette",
  "servings": 2,
  "ingredients": [
   "4 œufs",
   "200 g de champignons",
   "1 c. à soupe d’huile",
   "100 g de salade",
   "1 c. à soupe de vinaigrette",
   "Sel, poivre",
   "Pain"
  ],
  "steps": [
   "Émincer les champignons et cuire dans l’huile 6 à 8 min.",
   "Battre les œufs avec sel et poivre. Verser dans la poêle et cuire doucement jusqu’à la prise désirée.",
   "Replier l’omelette et servir avec salade assaisonnée et pain."
  ]
 },
 {
  "id": "potato-tortilla",
  "title": "Tortilla pommes de terre",
  "group": "Végétarien",
  "minutes": 40,
  "photo": "Spanish tortilla",
  "servings": 2,
  "ingredients": [
   "4 œufs",
   "350 g de pommes de terre",
   "1 oignon",
   "3 c. à soupe d’huile",
   "Sel, poivre",
   "Salade"
  ],
  "steps": [
   "Éplucher et trancher finement les pommes de terre. Émincer l’oignon.",
   "Cuire à feu doux dans l’huile, à couvert, 18 à 22 min jusqu’à tendreté.",
   "Mélanger aux œufs battus et remettre dans une petite poêle. Cuire 6 min puis retourner à l’aide d’une assiette et cuire encore 4 min. Servir avec salade."
  ]
 },
 {
  "id": "veggie-wrap",
  "title": "Wraps houmous & légumes",
  "group": "Végétarien",
  "minutes": 15,
  "photo": "Vegetable wrap",
  "servings": 2,
  "ingredients": [
   "2 grandes tortillas",
   "150 g de houmous",
   "1 carotte",
   "½ concombre",
   "1 tomate",
   "Quelques feuilles de salade",
   "½ citron"
  ],
  "steps": [
   "Râper la carotte, couper concombre et tomate en bâtonnets.",
   "Tartiner les tortillas de houmous et ajouter les légumes et la salade.",
   "Arroser légèrement de citron. Replier les bords et rouler bien serré."
  ]
 },
 {
  "id": "chicken-lemon",
  "title": "Poulet citron & pommes de terre",
  "group": "Poulet",
  "minutes": 50,
  "photo": "Roast chicken potatoes",
  "servings": 2,
  "ingredients": [
   "2 cuisses de poulet",
   "400 g de pommes de terre",
   "1 citron",
   "2 gousses d’ail",
   "2 c. à soupe d’huile",
   "Thym, sel, poivre"
  ],
  "steps": [
   "Chauffer le four à 200 °C. Couper les pommes de terre en quartiers et les placer avec le poulet dans un plat.",
   "Ajouter ail, jus et quartiers de citron, huile, thym, sel et poivre.",
   "Cuire environ 40 à 45 min en retournant les pommes de terre. Prolonger si nécessaire : le poulet doit être cuit à cœur. Servir chaud."
  ]
 },
 {
  "id": "chicken-tagine",
  "title": "Tajine de poulet citron & olives",
  "group": "Poulet",
  "minutes": 55,
  "photo": "Chicken tagine",
  "servings": 2,
  "ingredients": [
   "2 cuisses de poulet",
   "1 oignon",
   "½ citron confit",
   "12 olives",
   "1 c. à café de gingembre moulu",
   "½ c. à café de curcuma",
   "1 c. à soupe d’huile",
   "300 ml d’eau",
   "140 g de semoule"
  ],
  "steps": [
   "Faire dorer le poulet dans l’huile. Ajouter oignon émincé et épices.",
   "Verser l’eau, couvrir et mijoter 35 min à feu doux.",
   "Ajouter le citron confit rincé et les olives, poursuivre 10 min ou jusqu’à cuisson à cœur. Servir avec semoule."
  ]
 },
 {
  "id": "chicken-curry",
  "title": "Curry doux de poulet coco",
  "group": "Poulet",
  "minutes": 30,
  "photo": "Chicken curry",
  "servings": 2,
  "ingredients": [
   "300 g de blanc de poulet",
   "200 ml de lait de coco",
   "1 oignon",
   "1 c. à café de curry",
   "1 c. à soupe d’huile",
   "140 g de riz",
   "Sel"
  ],
  "steps": [
   "Couper le poulet en morceaux. Faire revenir l’oignon dans l’huile puis ajouter le poulet et faire dorer 5 min.",
   "Ajouter curry et lait de coco. Mijoter 12 à 15 min, jusqu’à cuisson complète du poulet.",
   "Cuire le riz à part et servir avec la sauce."
  ]
 },
 {
  "id": "chicken-tikka",
  "title": "Poulet épicé façon tikka",
  "group": "Poulet",
  "minutes": 35,
  "photo": "Chicken tikka masala",
  "servings": 2,
  "ingredients": [
   "300 g de blanc de poulet",
   "1 yaourt nature",
   "1 c. à café de paprika",
   "1 c. à café de cumin",
   "200 g de tomates concassées",
   "1 oignon",
   "1 gousse d’ail",
   "1 c. à soupe d’huile",
   "140 g de riz"
  ],
  "steps": [
   "Mélanger le poulet en cubes avec le yaourt et les épices.",
   "Faire revenir l’oignon et l’ail hachés dans l’huile. Ajouter le poulet et sa marinade puis les tomates.",
   "Mijoter environ 20 min en remuant, jusqu’à cuisson à cœur. Servir avec le riz cuit séparément."
  ]
 },
 {
  "id": "chicken-wrap",
  "title": "Wraps de poulet & sauce yaourt",
  "group": "Poulet",
  "minutes": 25,
  "photo": "Chicken wrap",
  "servings": 2,
  "ingredients": [
   "250 g de blanc de poulet",
   "2 grandes tortillas",
   "1 yaourt nature",
   "½ citron",
   "1 tomate",
   "Salade",
   "1 c. à soupe d’huile",
   "Paprika, sel"
  ],
  "steps": [
   "Couper le poulet en lanières, assaisonner de paprika et sel. Cuire dans l’huile 8 à 10 min jusqu’à cuisson complète.",
   "Mélanger yaourt et citron. Couper tomate et salade.",
   "Garnir les tortillas de sauce, légumes et poulet. Replier et servir."
  ]
 },
 {
  "id": "chicken-skewers",
  "title": "Brochettes de poulet & boulgour",
  "group": "Poulet",
  "minutes": 30,
  "photo": "Chicken skewers",
  "servings": 2,
  "ingredients": [
   "300 g de blanc de poulet",
   "1 poivron",
   "1 oignon",
   "140 g de boulgour",
   "1 c. à soupe d’huile",
   "½ citron",
   "Paprika, sel"
  ],
  "steps": [
   "Couper poulet et légumes en morceaux. Les enrober d’huile, citron et paprika.",
   "Monter sur des brochettes. Cuire au four à 210 °C environ 18 à 22 min en retournant, jusqu’à cuisson à cœur du poulet.",
   "Préparer le boulgour selon son paquet et servir."
  ]
 },
 {
  "id": "chicken-noodles",
  "title": "Nouilles sautées au poulet",
  "group": "Poulet",
  "minutes": 25,
  "photo": "Chicken noodles",
  "servings": 2,
  "ingredients": [
   "160 g de nouilles",
   "250 g de poulet",
   "1 carotte",
   "1 poivron",
   "2 c. à soupe de sauce soja",
   "1 c. à soupe d’huile",
   "1 gousse d’ail"
  ],
  "steps": [
   "Cuire les nouilles selon le paquet. Tailler légumes et poulet en fines lanières.",
   "Faire sauter le poulet dans l’huile jusqu’à cuisson complète, puis réserver. Faire sauter légumes et ail 5 min.",
   "Ajouter nouilles, poulet et sauce soja. Mélanger sur le feu 2 min."
  ]
 },
 {
  "id": "beef-bolognese",
  "title": "Spaghetti bolognaise au bœuf",
  "group": "Bœuf",
  "minutes": 35,
  "photo": "Spaghetti bolognese",
  "servings": 2,
  "ingredients": [
   "180 g de spaghetti",
   "250 g de bœuf haché",
   "400 g de tomates concassées",
   "1 oignon",
   "1 carotte",
   "1 c. à soupe d’huile",
   "Origan, sel, poivre"
  ],
  "steps": [
   "Hacher oignon et carotte puis faire revenir dans l’huile 5 min.",
   "Ajouter le bœuf, l’émietter et bien le cuire. Ajouter tomates et origan, mijoter 20 min.",
   "Cuire les pâtes et mélanger à la sauce. Utiliser uniquement du bœuf haché, sans mélange de viandes."
  ]
 },
 {
  "id": "kefta",
  "title": "Keftas de bœuf & sauce tomate",
  "group": "Bœuf",
  "minutes": 35,
  "photo": "Kofta",
  "servings": 2,
  "ingredients": [
   "300 g de bœuf haché",
   "1 oignon",
   "Persil",
   "1 c. à café de cumin",
   "400 g de tomates concassées",
   "1 c. à soupe d’huile",
   "140 g de semoule",
   "Sel"
  ],
  "steps": [
   "Mélanger bœuf, moitié de l’oignon haché, persil et cumin. Former de petites boulettes.",
   "Faire revenir le reste d’oignon dans l’huile. Ajouter tomates puis boulettes. Couvrir et mijoter 20 min en retournant.",
   "Vérifier que les boulettes sont cuites à cœur et servir avec la semoule."
  ]
 },
 {
  "id": "beef-chili",
  "title": "Chili de bœuf & haricots rouges",
  "group": "Bœuf",
  "minutes": 35,
  "photo": "Chili con carne",
  "servings": 2,
  "ingredients": [
   "200 g de bœuf haché",
   "250 g de haricots rouges cuits",
   "300 g de tomates concassées",
   "1 oignon",
   "1 poivron",
   "1 c. à café de cumin",
   "Paprika",
   "1 c. à soupe d’huile",
   "120 g de riz"
  ],
  "steps": [
   "Faire revenir oignon et poivron émincés dans l’huile 5 min. Ajouter le bœuf et bien le cuire.",
   "Ajouter épices, tomates et haricots rincés. Mijoter 20 min en remuant.",
   "Cuire le riz séparément. Servir avec le chili et ajuster le piquant à votre goût."
  ]
 },
 {
  "id": "veggie-chili",
  "title": "Chili végétarien tout doux",
  "group": "Végétarien",
  "minutes": 30,
  "photo": "Vegetarian chili",
  "servings": 2,
  "ingredients": [
   "300 g de haricots rouges cuits",
   "150 g de maïs",
   "400 g de tomates concassées",
   "1 poivron",
   "1 oignon",
   "1 c. à café de cumin",
   "1 c. à soupe d’huile",
   "120 g de riz"
  ],
  "steps": [
   "Faire revenir oignon et poivron émincés dans l’huile 5 min.",
   "Ajouter cumin, tomates, haricots rincés et maïs. Mijoter 20 min.",
   "Cuire le riz à part. Servir le chili bien chaud."
  ]
 },
 {
  "id": "beef-burger",
  "title": "Burgers de bœuf maison",
  "group": "Bœuf",
  "minutes": 25,
  "photo": "Beef burger",
  "servings": 2,
  "ingredients": [
   "2 pains burger",
   "250 g de bœuf haché",
   "2 tranches de fromage",
   "1 tomate",
   "Salade",
   "Cornichons",
   "Ketchup et moutarde",
   "1 c. à café d’huile"
  ],
  "steps": [
   "Former deux steaks de bœuf. Laver et couper les garnitures.",
   "Cuire les steaks dans une poêle huilée, jusqu’à cuisson complète à cœur. Ajouter le fromage à la fin.",
   "Réchauffer les pains et assembler avec sauces, légumes et steaks. Aucun bacon ni autre charcuterie."
  ]
 },
 {
  "id": "beef-tacos",
  "title": "Tacos au bœuf & avocat",
  "group": "Bœuf",
  "minutes": 25,
  "photo": "Beef tacos",
  "servings": 2,
  "ingredients": [
   "250 g de bœuf haché",
   "4 petites tortillas",
   "1 avocat",
   "1 tomate",
   "½ oignon",
   "½ citron vert",
   "1 c. à café de cumin",
   "1 c. à soupe d’huile",
   "Sel"
  ],
  "steps": [
   "Faire revenir l’oignon dans l’huile, ajouter le bœuf et le cumin puis bien cuire en émiettant.",
   "Couper tomate et avocat, arroser de citron.",
   "Réchauffer les tortillas et garnir de bœuf et de légumes."
  ]
 },
 {
  "id": "salmon-rice",
  "title": "Saumon au four & riz citronné",
  "group": "Poisson",
  "minutes": 30,
  "photo": "Baked salmon",
  "servings": 2,
  "ingredients": [
   "2 pavés de saumon",
   "140 g de riz",
   "1 courgette",
   "1 citron",
   "1 c. à soupe d’huile",
   "Aneth, sel, poivre"
  ],
  "steps": [
   "Préchauffer le four à 190 °C. Placer le saumon et la courgette en fines rondelles dans un plat huilé.",
   "Ajouter jus de citron et aneth. Cuire environ 15 à 20 min, jusqu’à ce que le poisson se détache facilement à la fourchette.",
   "Cuire le riz selon le paquet et servir."
  ]
 },
 {
  "id": "fish-papillote",
  "title": "Poisson blanc en papillote",
  "group": "Poisson",
  "minutes": 30,
  "photo": "Fish en papillote",
  "servings": 2,
  "ingredients": [
   "2 filets de cabillaud",
   "1 courgette",
   "1 tomate",
   "1 citron",
   "1 c. à soupe d’huile",
   "Herbes, sel, poivre",
   "140 g de semoule"
  ],
  "steps": [
   "Préchauffer le four à 190 °C. Couper les légumes en fines tranches.",
   "Sur deux grandes feuilles de papier cuisson, déposer légumes et poisson. Ajouter citron, huile et herbes. Fermer les papillotes.",
   "Cuire 18 à 22 min selon l’épaisseur, jusqu’à cuisson du poisson. Ouvrir avec précaution et servir avec semoule."
  ]
 },
 {
  "id": "tuna-pasta",
  "title": "Pâtes au thon & tomates",
  "group": "Poisson",
  "minutes": 25,
  "photo": "Tuna pasta",
  "servings": 2,
  "ingredients": [
   "180 g de pâtes",
   "140 g de thon en boîte égoutté",
   "300 g de tomates concassées",
   "1 oignon",
   "1 c. à soupe d’huile",
   "10 olives",
   "Sel, poivre"
  ],
  "steps": [
   "Faire revenir l’oignon émincé dans l’huile. Ajouter les tomates et mijoter 12 min.",
   "Cuire les pâtes selon le paquet.",
   "Ajouter thon émietté et olives à la sauce, chauffer 2 min puis mélanger aux pâtes."
  ]
 },
 {
  "id": "shrimp-rice",
  "title": "Crevettes ail-citron & riz",
  "group": "Poisson",
  "minutes": 25,
  "photo": "Garlic shrimp",
  "servings": 2,
  "ingredients": [
   "300 g de crevettes crues décortiquées",
   "140 g de riz",
   "2 gousses d’ail",
   "½ citron",
   "Persil",
   "1 c. à soupe d’huile",
   "Sel, poivre"
  ],
  "steps": [
   "Cuire le riz selon le paquet.",
   "Faire chauffer l’huile avec l’ail haché 30 secondes. Ajouter les crevettes et cuire en retournant jusqu’à ce qu’elles soient opaques, environ 4 à 6 min selon la taille.",
   "Ajouter citron et persil, saler puis servir aussitôt avec le riz."
  ]
 },
 {
  "id": "tuna-salad",
  "title": "Salade de pâtes au thon",
  "group": "Poisson",
  "minutes": 25,
  "photo": "Tuna rice salad",
  "servings": 2,
  "ingredients": [
   "160 g de petites pâtes",
   "140 g de thon en boîte égoutté",
   "2 tomates",
   "½ concombre",
   "100 g de maïs",
   "1 c. à soupe d’huile",
   "½ citron",
   "Sel, poivre"
  ],
  "steps": [
   "Cuire les pâtes, les égoutter et les refroidir rapidement sous l’eau froide.",
   "Couper les légumes puis mélanger avec pâtes, thon et maïs.",
   "Assaisonner d’huile et citron. Servir aussitôt ou conserver immédiatement au réfrigérateur."
  ]
 },
 {
  "id": "vegetable-noodles",
  "title": "Nouilles sautées aux légumes & tofu",
  "group": "Végétarien",
  "minutes": 25,
  "photo": "Vegetable noodles",
  "servings": 2,
  "ingredients": [
   "160 g de nouilles",
   "200 g de tofu ferme",
   "1 carotte",
   "1 poivron",
   "150 g de brocoli",
   "2 c. à soupe de sauce soja",
   "1 c. à soupe d’huile",
   "1 gousse d’ail"
  ],
  "steps": [
   "Cuire les nouilles selon le paquet. Couper tofu et légumes en petits morceaux.",
   "Faire dorer le tofu dans l’huile puis ajouter légumes et ail, faire sauter 7 à 10 min avec un peu d’eau si nécessaire.",
   "Ajouter nouilles et sauce soja. Mélanger 2 min et servir."
  ]
 }
];
