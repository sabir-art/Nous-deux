# Application Android (Capacitor)

L'application Android emballe l'interface React actuelle avec [Capacitor](https://capacitorjs.com/) 8. Elle appelle la même API que le site (`https://jvjwyalusdygvkyzmiez.supabase.co/functions/v1/house-api`) et les mêmes comptes. Feuille de route : `docs/ANDROID-PLAN.md`.

Le site GitHub Pages garde son build (`pnpm run build:web`, `vite.web.config.ts`) : tout ce qui est propre à l'appli passe par `vite.android.config.ts`, `web/android.ts`, `app/android.css` et `lib/android-api-client.ts`, que le build web n'importe jamais.

| Élément | Rôle |
| --- | --- |
| `capacitor.config.ts` | identifiant `fr.nousdeux.app`, nom « Nous deux », dossier web `dist-android`, bord à bord (`SystemBars`) |
| `vite.android.config.ts` | build séparé : chemins relatifs (`./`), sans manifeste ni service worker, injecte `web/android.ts` ; le build échoue si le client du site (`lib/api-client.ts`) entre dans l'appli autrement que par `lib/android-api-client.ts` ; `--mode essai` pour les tests locaux, écrit dans `dist-android-essai/` |
| `lib/android-api-client.ts` | même client que `lib/api-client.ts`, avec `APP_BASE='/'` (appli servie depuis la racine) et `NATIVE_APP=true` |
| `web/android.ts` | classe `native-app`, icônes des barres système selon le thème, bouton Retour d'Android (`@capacitor/app`, même ordre que l'appli web grâce à `app/back-layers.ts`) |
| `app/android.css` | marges de sécurité (barre d'état, barre de navigation), fenêtres, écran de connexion pleine largeur sur téléphone |
| `android/` | projet Android Studio ; icônes tirées de `public/icon-512.png`, rose `#D60B52`, démarrage crème `#F6F3EF`, `allowBackup="false"` |

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

### Tester sans les vraies données

`pnpm run sync:android:essai` : l'appli embarque le mode essai (`lib/essai-api-client.ts`, fausse maison dans le stockage de la WebView, rien n'est envoyé à Supabase). Pratique pour vérifier l'accueil, la discussion ou les fenêtres sans compte.

Garde-fous : le build d'essai va dans `dist-android-essai/`, jamais dans `dist-android/`, et seul `sync:android:essai` le copie dans le projet Android (`scripts/cap-sync-essai.mjs`, variable `NOUS_DEUX_ESSAI=1` lue par `capacitor.config.ts`). Un simple `pnpm exec cap sync android` reprend toujours la vraie appli. L'essai contient `ESSAI-NE-PAS-PUBLIER.txt` : Gradle refuse alors toute build `release`. **Toujours revenir avec `pnpm run sync:android` ensuite** : ne jamais publier un APK d'essai.

## Lancer

- Android Studio : ouvrir le dossier `android/`, choisir l'émulateur ou le téléphone (débogage USB activé), ▶ Run.
- Ou : `pnpm exec cap run android`, ou `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.
- Inspecter la page : Chrome → `chrome://inspect` (débogage WebView actif sur les builds de débogage).
- Largeur de téléphone 360 px sur l'émulateur 1080 px : `adb shell wm density 480` (`adb shell wm density reset` pour revenir).

Après chaque changement de l'interface : `pnpm run sync:android`, puis relancer.

## Comportement de l'appli

- Origine envoyée à `house-api` : **`https://localhost`** (autorisée depuis `house-api` v40, liste `ORIGINS`).
- Bord à bord : la page passe sous la barre d'état et la barre de navigation ; `env(safe-area-inset-*)` donne leurs tailles. Les icônes des barres suivent le thème clair/sombre de l'appli.
- Bouton Retour : ferme d'abord la fenêtre ou le panneau d'émojis ouvert, puis revient à la page précédente, puis met l'appli en arrière-plan (l'état est conservé).
- Serveur injoignable à la connexion : message et bouton « Réessayer » (le site garde « Actualisez la page »).
- Pas de sauvegarde Android des données de l'appli (`allowBackup="false"`, règles d'extraction Android 12+) : la session ne part pas dans le cloud ni vers un autre téléphone.

## Pas encore

- Notifications push : le Web Push n'existe pas dans la WebView Android (étape 2 : Firebase Cloud Messaging).
- Appels natifs (étape 3).
- Aucune clé de signature (`*.jks`, `*.keystore`, `keystore.properties`) ni mot de passe dans Git : ils sont ignorés par `.gitignore`. La signature pour le Play Store sera traitée au moment de la publication.
