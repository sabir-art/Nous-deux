# TodoItem

Tâche, article de courses ou corvée : case ronde, intitulé, note, personne assignée.

**Props** : `title`, `note`, `done` (+ `onToggle` pour le piloter), `points` (texte de la récompense pour les corvées), `assignee` (`{name, partner}`).

- La case validée se remplit en `action` et l'intitulé passe barré en `ink-muted`.
- Les corvées affichent leurs points : Facile 10, Normal 25, Difficile 50.
- Les éléments faits descendent sous un séparateur « Fait ».
