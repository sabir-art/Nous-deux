# Notre commis gourmand

L’application fonctionne sans OpenAI avec ses 40 recettes initiales. La découverte de nouvelles recettes s’exécute exclusivement dans `house-api`, derrière l’authentification existante. Aucune clé OpenAI n’est intégrée au JavaScript public.

## Activation

1. Révoquer la clé qui a été partagée dans la conversation et créer une nouvelle clé dans le projet OpenAI souhaité. Configurer le budget/les alertes du projet OpenAI selon les limites souhaitées.
2. Dans le projet Supabase **jvjwyalusdygvkyzmiez**, ouvrir **Edge Functions → Secrets** et ajouter `OPENAI_API_KEY` avec la nouvelle valeur. Ne pas la placer dans GitHub, les variables Vite, la conversation ou un fichier public.
3. Ouvrir **À table ! → Le carnet → Trouver des idées**. Le traitement continue en arrière-plan ; son état et les nouvelles recettes sont chargés automatiquement. En cas de configuration refusée ou quota dépassé, vérifier le secret et la facturation OpenAI. Le carnet initial reste accessible.

Le modèle par défaut est `gpt-5.4-mini`. Le secret facultatif `OPENAI_RECIPE_MODEL` peut le remplacer par un modèle compatible Responses API, recherche web et sorties structurées. Aucun appel réel à OpenAI n’a été effectué pour cette livraison, faute de nouvelle clé installée ; les parcours succès/erreur ont été testés avec réponses simulées.

## Fonctionnement et limites

- Au plus quatre nouvelles recettes par sélection, pour deux personnes, sans porc. Les ingrédients, instructions, quantités et sources sont validés côté serveur ; une liste conservatrice exclut aussi la charcuterie et la gélatine. Les plats proposés peuvent quand même nécessiter une vérification des allergies et des étiquettes par les utilisateurs.
- Le planificateur existant de Supabase, contrôlé chaque jour à 9 h à Paris, déclenche une recherche uniquement si sept jours sont écoulés depuis la dernière sélection réussie. Le bouton manuel respecte le même délai. Une tentative échouée n’est pas répétée avant 24 heures. La recherche peut être mise en pause dans le carnet. Une recherche déjà engagée peut terminer après une mise en pause.
- Une requête Responses API par tentative, `max_tool_calls:4`, au plus 6 500 jetons de sortie, délai réseau de 90 s. Photos : quatre recherches au maximum, sans boucle de reprise. Ce sont des bornes techniques de consommation, pas un plafond de facturation monétaire.
- Les titres existants et la saison sont les seuls éléments de contexte envoyés. Aucun compte, message, rendez-vous privé, photo personnelle, vote ni budget de la maison n’est envoyé à OpenAI. `store:false` est demandé.
- La recherche web utilise une liste de sites culinaires et Wikibooks. Chaque recette doit citer une source réellement retournée par la recherche. Les étapes sont reformulées, et la fiche indique explicitement « adaptée par IA » avec un lien vers la source.
- Les photos proviennent uniquement de l’API Wikimedia Commons avec métadonnées de licence vérifiées (CC BY, CC BY-SA, CC0 ou domaine public accompagné d’une URL de licence admissible). Crédit et licence sont affichés. Sans photo admissible, l’application montre un pictogramme et « Photo à venir ». Les images de sites de recettes ne sont pas récupérées sans licence.
- Les nouvelles recettes sont conservées dans l’état privé Supabase ; les votes restent privés jusqu’au match mutuel. Le carnet conserve ses références, sans supprimer les plats des anciens matchs. La découverte se met en limite de capacité après 500 ajouts pour éviter la croissance illimitée de cet état ; augmenter cette limite demande une revue du stockage.
- Les erreurs affichées sont génériques. Aucun corps de réponse du fournisseur ni secret n’est journalisé. Les commandes de découverte n’acceptent pas de prompt ni d’URL arbitraire du client.

Documentation vérifiée :

- https://developers.openai.com/api/docs/guides/tools-web-search
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/models/gpt-5.4-mini
- https://supabase.com/docs/guides/functions/background-tasks
- https://supabase.com/docs/guides/functions/secrets

Tests : `node tests/recipe-discovery.test.mjs` et `node tests/chat-api.test.mjs`.
