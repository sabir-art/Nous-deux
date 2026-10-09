# WhoDoesItGame

Le petit jeu « Qui fait quoi ? » : une roue aux couleurs de chacun tire au sort qui cuisine, qui fait la vaisselle, qui fait les courses.

**Props** : `players` (`[{name, partner}]`, A puis B), `tasks` (`[{name, emoji}]`), `otherDoesNext` (celui qui ne cuisine pas fait la tâche suivante, pour rester juste), `onDone`.

- Le bouton central « Tourner » lance la roue ; le résultat s'affiche en sticker (« Karim : cuisine ! ») et s'écrit dans la liste des tâches avec l'avatar.
- Le résultat est annoncé aux lecteurs d'écran ; si les animations sont réduites, la roue s'arrête directement sur le résultat.
- À la fin : « C'est noté » ajoute les tâches dans les corvées du jour avec leurs points.
