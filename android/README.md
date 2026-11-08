# Android et Health Connect

Ouvrir ce dossier dans Android Studio avec JDK 17, SDK Android 35 et Gradle 8.11.1 (AGP 8.9.2). Aucun binaire ni Gradle Wrapper n’est fourni dans le dépôt. Android Studio peut installer les outils et utiliser une distribution Gradle locale. Avec Gradle installé : `gradle :app:assembleDebug` depuis ce dossier. Le build embarque automatiquement les fichiers web de la racine, sans copier les sources à la main. APK produit : `app/build/outputs/apk/debug/app-debug.apk`.

L’application utilise un WebView local avec origine HTTPS et un pont limité à cette origine et à la fenêtre principale. Les liens externes s’ouvrent dans le navigateur, hors du pont. Aucune donnée de santé n’est envoyée au réseau. Permission demandée : lecture des pas uniquement. Les intentions Android de justification affichent la politique locale `privacy.html`.

Sur un appareil compatible, activer le partage des pas de l’application de santé vers Health Connect. Dans Callisthenut, ouvrir « Mes pas et ma connexion Android », puis « Connecter / synchroniser Health Connect » et autoriser la lecture. L’agrégat du jour est lu depuis minuit dans le fuseau du téléphone, sans additionner les sources. Le total est actualisé à l’ouverture/reprise et à la demande ; aucune lecture en arrière-plan. Un refus, une révocation, une mise à jour requise ou une indisponibilité sont signalés. La déconnexion arrête les prochaines lectures ; révoquer la permission dans Health Connect pour retirer l’accès système.

Le stockage du WebView Android est distinct de celui du navigateur : le profil web existant n’est pas transféré automatiquement.

Validation appareil requise : installation et premier refus ; acceptation puis données réelles ; double synchronisation sans doublon ; révocation ; déconnexion et reprise ; passage à minuit ; appareil sans Health Connect. La compilation et ces essais nécessitent l’outillage Android et un téléphone ou émulateur compatibles. Pour Google Play, déclarer l’usage de Health Connect et fournir une URL publique de politique de confidentialité avant publication.
