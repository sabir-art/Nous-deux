# Notre commis gourmand

L’application fonctionne sans OpenAI avec ses 40 recettes initiales. La découverte de nouvelles recettes s’exécute exclusivement dans `house-api`, derrière l’authentification existante. Aucune clé OpenAI n’est intégrée au JavaScript public.

## Activation

1. Depuis le premier compte de la maison, ouvrir **Notre espace → Notre commis gourmand**. Saisir la clé OpenAI et le mot de passe personnel de l’application. La clé est vérifiée puis chiffrée dans **Supabase Vault** sous le nom `nous_deux_openai_key`.
2. Cette configuration s’applique aux deux comptes, sur tous leurs appareils. L’autre membre ne reçoit jamais la clé. Le même formulaire permet de remplacer une clé ; utiliser une nouvelle clé si l’ancienne a été exposée.
3. Ouvrir **À table → Le carnet**. La première recherche éligible démarre à l’ouverture ou avec **Trouver des idées**, puis continue en arrière-plan. Le statut signale séparément une clé refusée, un quota insuffisant, une limite 429 ou un autre échec. Les recettes existantes restent accessibles.

Appliquer `supabase/sql/shared-ai-vault.sql` avant de déployer cette version de `house-api`. Les deux RPC Vault sont `SECURITY INVOKER`, avec chemin de recherche vide et droits réservés à `service_role` ; `anon`, `authenticated` et `PUBLIC` ne peuvent pas les appeler. La route de configuration impose une session du premier membre, son mot de passe personnel et au plus cinq tentatives par fenêtre de quinze minutes. La clé n’entre jamais dans l’état partagé, une réponse JSON, le navigateur ou GitHub.

Le secret d’environnement `OPENAI_API_KEY` reste un repli pour les installations sans clé dans Vault. Le modèle par défaut est `gpt-5.4-mini` ; `OPENAI_RECIPE_MODEL` permet de le remplacer par un modèle compatible Responses API, recherche web et sorties structurées. La vérification de clé ne garantit pas la disponibilité du quota de génération. La configuration applicative ne recharge aucun compte et ne change pas ses limites de facturation.

## Fonctionnement et limites

- Au plus quatre nouvelles recettes par sélection, pour deux personnes, sans porc. Les ingrédients, instructions, quantités et sources sont validés côté serveur ; une liste conservatrice exclut aussi la charcuterie et la gélatine. Les plats proposés peuvent quand même nécessiter une vérification des allergies et des étiquettes par les utilisateurs.
- Le planificateur existant de Supabase, contrôlé chaque jour à 9 h à Paris, déclenche une recherche uniquement si sept jours sont écoulés depuis la dernière sélection réussie. Le bouton manuel respecte le même délai. Une tentative échouée n’est pas répétée avant 24 heures. La recherche peut être mise en pause dans le carnet. Une recherche déjà engagée peut terminer après une mise en pause.
- Une requête Responses API par tentative, `max_tool_calls:4`, au plus 6 500 jetons de sortie, délai réseau de 90 s. Photos : quatre recherches au maximum, sans boucle de reprise. Ce sont des bornes techniques de consommation, pas un plafond de facturation monétaire.
- Les titres existants et la saison sont les seuls éléments de contexte envoyés. Aucun compte, message, rendez-vous privé, photo personnelle, vote ni budget de la maison n’est envoyé à OpenAI. `store:false` est demandé.
- La recherche web utilise une liste de sites culinaires et Wikibooks. Chaque recette doit citer une source réellement retournée par la recherche. Les étapes sont reformulées, et la fiche indique explicitement « adaptée par IA » avec un lien vers la source.
- Les photos proviennent uniquement de l’API Wikimedia Commons avec métadonnées de licence vérifiées (CC BY, CC BY-SA, CC0 ou domaine public accompagné d’une URL de licence admissible). Crédit et licence sont affichés. Sans photo admissible, l’application montre un pictogramme et « Photo à venir ». Les images de sites de recettes ne sont pas récupérées sans licence.
- Les nouvelles recettes sont conservées dans l’état privé Supabase ; les votes restent privés jusqu’au match mutuel. Le carnet conserve ses références, sans supprimer les plats des anciens matchs. La découverte se met en limite de capacité après 500 ajouts pour éviter la croissance illimitée de cet état ; augmenter cette limite demande une revue du stockage.
- Les erreurs affichées utilisent uniquement des catégories contrôlées. Aucun corps de réponse du fournisseur ni secret n’est journalisé. Les commandes de découverte n’acceptent pas de prompt ni d’URL arbitraire du client.

Documentation vérifiée :

- https://developers.openai.com/api/docs/guides/tools-web-search
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/models/gpt-5.4-mini
- https://supabase.com/docs/guides/functions/background-tasks
- https://supabase.com/docs/guides/functions/secrets

Tests : `node tests/recipe-discovery.test.mjs`, `node tests/ai-settings.test.mjs` et `node tests/chat-api.test.mjs`.

Les photos candidates de Wikimedia Commons sont contrôlées visuellement par le modèle avant publication (plat correspondant aux ingrédients, cadrage, netteté et présentation). Une absence de choix fiable exclut la recette de cette découverte ; aucune image de façade ou de produit n’est utilisée par défaut. Ce contrôle reste probabiliste. Les photos personnelles et messages ne sont jamais envoyés à ce processus. Au plus quatre contrôles visuels, six candidates chacun, par découverte hebdomadaire.

## Importer une recette (photo, capture, lien)

Dans **À table → Ajouter ma recette**, le bloc « Importer une recette » propose deux entrées : **Une photo** (le téléphone propose l’appareil photo ou la photothèque, captures d’écran comprises) et **Un lien** (adresse https). Le résultat n’est jamais enregistré directement : il pré-remplit le formulaire, la personne relit, coche « sans porc » puis enregistre par le chemin habituel `recipe-save` (droits d’auteur, versions, photo personnelle vérifiée).

- Route `house-api?route=recipe-import` (POST, session `x-house-session` obligatoire) : `{kind:'image',data}` ou `{kind:'url',url}`. Réponse `{draft,method}` avec `method` = `structured` (données schema.org de la page) ou `ai`. Aucune écriture dans l’état du foyer.
- **Image** : JPEG compressé par l’application (2 000 px maximum, environ 1 Mo), vérifié côté serveur, envoyé à la Responses API en vision (`detail:'high'`), sortie structurée stricte, `store:false`, raisonnement bas, 3 000 jetons de sortie maximum, 60 s, sans outil web. Le modèle adapte les quantités pour 2 personnes quand le nombre de portions d’origine est lisible.
- **Lien** : récupéré par le serveur seulement en https, sans identifiants ni port spécial, sans adresse IP littérale ni nom local ; chaque saut résout le nom (A/AAAA) et refuse toute adresse privée, de bouclage, lien-local, multicast ou réservée ; 3 redirections au maximum, chacune revérifiée ; 10 s et 3 Mo au total ; HTML uniquement ; aucun cookie. Les données schema.org `Recipe` (JSON-LD) sont lues en premier, sans IA ni clé : les portions d’origine sont conservées. À défaut, seul le texte visible de la page (15 000 caractères au plus, scripts et navigation retirés) est confié au modèle avec les mêmes bornes que pour une image. Limite connue : `fetch` résout le nom une seconde fois, un changement DNS entre la vérification et la connexion ne peut pas être totalement exclu. Si `Deno.resolveDns` est indisponible, l’import par lien échoue proprement (comportement fermé) : à vérifier après déploiement.
- Le contenu lu est une donnée non fiable : les consignes du modèle interdisent d’en suivre les instructions. Tous les champs sont revalidés côté serveur (longueurs, nombre d’ingrédients/étapes, caractères de balisage retirés, catégories et difficultés connues, durées et portions bornées).
- **Sans porc** : la liste conservatrice de la découverte, complétée (charcuterie courante, gélatine, saucisses), plus l’indicateur `containsPork` du modèle. Une recette concernée est refusée avec un message clair.
- **Sources et photos** : le lien final et le nom du site (ou le livre/auteur lisible sur la photo) sont proposés dans les champs « Source » et « Lien de la source », conservés avec la recette (`sourceTitle`, `sourceUrl` https uniquement) et affichés dans la fiche. Les images des sites ne sont jamais reprises ni affichées. Après un import par photo, « Garder ma photo pour ce plat » permet de l’enregistrer comme photo personnelle, par le stockage privé habituel.
- **Limites** : 10 imports par heure et 30 par jour pour chaque membre (`nd_rate_hit`). Les erreurs sont des catégories contrôlées en français : commis non activé, clé à remplacer, quota épuisé, limite 429, page illisible, lien refusé, page trop lourde, recette introuvable, porc. Aucun corps de réponse du fournisseur ou de la page n’est journalisé.
- **Confidentialité** : seule la photo ou la page choisie par la personne est envoyée (au serveur, puis à OpenAI si nécessaire). Aucun autre contenu du foyer (comptes, messages, agenda, votes, budget, autres recettes) n’accompagne la demande.
- **Partager depuis le navigateur** : le manifeste déclare un `share_target` (GET, paramètres `share_title`, `share_text`, `share_url`). Sur Android avec l’application installée, « Partager → Nous deux » ouvre À table et lance la lecture du lien. iPhone/Safari ne prend pas en charge les cibles de partage web : copier le lien puis utiliser « Un lien ». Le partage direct d’images n’est pas proposé (il demanderait un traitement POST dans le service worker).

Tests : `node tests/recipe-import.test.mjs`, `node tests/recipe-library.test.mjs` et `node tests/chat-api.test.mjs`.
