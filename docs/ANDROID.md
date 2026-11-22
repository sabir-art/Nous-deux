# Application Android (Capacitor) — étape 1

L'application Android emballe l'interface React actuelle avec [Capacitor](https://capacitorjs.com/) 8. Elle appelle la même API que le site (`https://jvjwyalusdygvkyzmiez.supabase.co/functions/v1/house-api`) et les mêmes comptes. Le site GitHub Pages n'est pas modifié : `pnpm run build:web` et `vite.web.config.ts` produisent exactement les mêmes fichiers qu'avant.

| Élément | Rôle |
| --- | --- |
| `capacitor.config.ts` | identifiant `fr.nousdeux.app`, nom « Nous deux », dossier web `dist-android` |
| `vite.android.config.ts` | build séparé : chemins relatifs (`./`), sans manifeste ni service worker |
| `lib/android-api-client.ts` | même client que `lib/api-client.ts`, seul `APP_BASE` vaut `/` (l'appli est servie depuis la racine) |
| `android/` | projet Android Studio généré par `cap add android` ; icônes tirées de `public/icon-512.png`, rose `#D60B52`, fond crème `#F6F3EF` |

## Prérequis

- Node ≥ 22.13 et pnpm 11.25 (`corepack pnpm …` si `pnpm` n'est pas dans le PATH).
- Android Studio avec le SDK Android 36 (ou plus).
- **Java 21** pour Gradle. Gradle 8.14 (version du modèle Capacitor) refuse le Java 25 livré avec les Android Studio récents (« Unsupported class file major version 69 »). Dans Android Studio : *Settings → Build Tools → Gradle → Gradle JDK* → un JDK 21. En ligne de commande : `JAVA_HOME` vers un JDK 21 (par exemple Temurin 21).

## Construire

```sh
pnpm install --frozen-lockfile
pnpm run build:android        # interface → dist-android/
pnpm exec cap sync android    # copie dans android/app/src/main/assets/public
# ou les deux d'un coup : pnpm run sync:android
cd android
./gradlew assembleDebug       # Windows : .\gradlew.bat assembleDebug
```

L'APK de débogage est dans `android/app/build/outputs/apk/debug/app-debug.apk`.

## Lancer

- Android Studio : ouvrir le dossier `android/`, choisir l'émulateur ou le téléphone (débogage USB activé), ▶ Run.
- Ou : `pnpm exec cap run android`, ou `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.
- Inspecter la page : Chrome → `chrome://inspect` (débogage WebView actif sur les builds de débogage).

Après chaque changement de l'interface : `pnpm run sync:android`, puis relancer.

## Ce qu'il faut savoir

- L'appli est servie depuis **`https://localhost`** : c'est l'en-tête `Origin` envoyé à `house-api`. Tant que le serveur n'autorise pas cette origine, la connexion est refusée. L'autorisation se fera dans une PR serveur séparée (`supabase/functions/house-api`), pas dans cette étape.
- Pas de notifications push : le Web Push n'existe pas dans la WebView Android (étape suivante : Firebase Cloud Messaging).
- Pas d'appels natifs pour l'instant (étape suivante).
- Aucune clé de signature (`*.jks`, `*.keystore`, `keystore.properties`) ni mot de passe dans Git : ils sont ignorés par `.gitignore`. La signature pour le Play Store sera traitée au moment de la publication.
