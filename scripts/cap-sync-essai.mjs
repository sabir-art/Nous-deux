// `pnpm run sync:android:essai`: copies the trial build (dist-android-essai/, fake house) into the Android project.
// Only this script sets NOUS_DEUX_ESSAI=1, read by capacitor.config.ts; a plain `cap sync` keeps the real app.
// The trial carries ESSAI-NE-PAS-PUBLIER.txt: Gradle refuses a release build until `pnpm run sync:android`.
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
if(!existsSync('dist-android-essai/ESSAI-NE-PAS-PUBLIER.txt')){console.error('Lancer d’abord « pnpm run build:android:essai ».');process.exit(1);}
const result=spawnSync('cap',['sync','android'],{stdio:'inherit',shell:true,env:{...process.env,NOUS_DEUX_ESSAI:'1'}});
process.exit(result.status??1);
