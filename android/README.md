# Android et Health Connect

L’APK 2.4 charge désormais le site `https://godamz.github.io/Callisthenut/`. Il ne contient plus de copie figée de l’application web. Les mises à jour du site arrivent après leur publication sur GitHub Pages, sans recompilation de l’APK. Les modifications natives Android nécessitent toujours un nouvel APK.

## Installer la mise à jour

Fichier produit : `../artifacts/Callisthenut-2.4-debug.apk` (environ 11 Mo). Installer par-dessus la version 2.3, sans la désinstaller : le certificat de signature est identique et le numéro de version augmente. Le paquet reste signé avec la clé de développement locale, sans publication Google Play.

Au premier lancement, la progression de l’ancien stockage local de l’APK est copiée vers le stockage de l’origine GitHub Pages, avant le démarrage du site. Une progression déjà présente à cette origine est conservée ; aucun mélange ni écrasement. Les données locales d’origine ne sont pas effacées. Le raccourci Brave utilise son propre stockage et n’est pas importé.

Une connexion Internet est nécessaire au premier chargement du site. Le service worker du site peut ensuite servir sa dernière copie en cache hors ligne ; si aucune copie n’est disponible, un écran permet de réessayer. L’APK demande une revalidation réseau au lancement. Après plus d’une minute en arrière-plan, il actualise aussi un accueil inactif ; il n’interrompt pas les défis, dialogues et séances. Les sessions en cours restent sur la version chargée jusqu’à une prochaine ouverture ou actualisation.

## Health Connect

Le pont natif est limité à l’origine HTTPS `godamz.github.io`, au dépôt `/Callisthenut/`, aux deux pages d’entrée du site et à la fenêtre principale. Les autres liens HTTPS s’ouvrent dans le navigateur. Les ressources externes et les traversées de chemins sont bloquées. La page de transfert de progression ne dispose pas de l’accès santé. Les seules données lues sont les pas du jour après autorisation.

Dans l’application native, ouvrir « Mes pas », puis « Connecter / synchroniser Health Connect » et autoriser les pas. Activer aussi le partage vers Health Connect dans l’application de santé source. L’agrégat du jour est lu à l’ouverture/reprise et à la demande ; aucune lecture en arrière-plan. Les erreurs sont visibles dans l’interface et Logcat, tag `CallisthenutHealth`. La déconnexion arrête les prochaines lectures ; les autorisations peuvent être révoquées dans les paramètres Health Connect.

La page de confidentialité reste embarquée pour les intentions Android de justification. Les données de progression et de santé restent stockées sur le téléphone ; les requêtes nécessaires au chargement du site transitent par GitHub Pages. Une installation du site depuis Brave ou Chrome reste une application web sans ce pont natif.

## Reconstruire et vérifier

Depuis ce dossier sous Windows : `./build-apk.ps1`. Le script compile, copie l’APK versionné dans `../artifacts/` et écrit son empreinte SHA-256. Il utilise le JDK d’Android Studio et le SDK local si les variables correspondantes ne sont pas définies. Prérequis : JDK 17 ou ultérieur compatible, SDK Android 36, Gradle 8.11.1 via le wrapper, AGP 8.10.0. Cible Android 35, minimum Android 9/API 28.

Contrôles : `./gradlew.bat :app:assembleDebug :app:testDebugUnitTest :app:lintDebug`. La compilation, les tests de restriction d’URL, lint et la signature sont vérifiés. Le paquet contient seulement la migration et la confidentialité locales. Les essais réels de transfert de données, de chargement sur téléphone et de lecture des pas restent à effectuer sur appareil compatible. Pour Google Play, déclarer l’usage de Health Connect et fournir une URL publique de politique de confidentialité.
