# Callisthenut

Version 25 : l’onglet « Activités » devient « Défis ». La navigation web est relevée de 10 px et réserve les zones sûres du navigateur. L’APK 2.5 applique les marges des barres système et des encoches à un conteneur parent du WebView afin que les éléments CSS fixes restent au-dessus de la navigation Android. Les anciens APK ont une marge web de repli de 48 px ; les nouveaux signalent que leurs marges natives sont déjà appliquées pour éviter un double espacement. Les changements web doivent être publiés sur GitHub Pages pour apparaître dans l’application distante. La correction native nécessite d’installer l’APK 2.5 par-dessus le précédent.

L’APK Android 2.5 est produit dans `artifacts/Callisthenut-2.5-debug.apk` et charge directement `https://godamz.github.io/Callisthenut/`. Les mises à jour web deviennent disponibles après publication sur GitHub Pages, sans réinstallation de l’APK ; les changements natifs nécessitent toujours un nouvel APK. Le pont Health Connect reste limité au site autorisé. Installer par-dessus la version 2.3, sans désinstaller : la signature est identique et le transfert de progression est prévu au premier lancement, sans écraser une progression déjà présente. Compilation, tests Android et signature vérifiés ; les essais sur téléphone restent nécessaires. Pour reconstruire : `android/build-apk.ps1`, ou consulter [les instructions Android](android/README.md). Les APK générés sont exclus de Git ; GitHub Pages ne les distribue pas automatiquement. Le stockage du raccourci Brave reste distinct.

Version 23 : diagnostic de connexion Health Connect. Une installation depuis Brave, Chrome ou un autre navigateur reste une application web et ne peut pas utiliser directement le SDK Android Health Connect. Le bouton explique désormais la nécessité d’installer l’APK. Dans la version native, les demandes sont protégées contre les doubles clics, les erreurs et les réponses absentes. Un agrégat Health Connect vide est distingué d’un vrai total de zéro pour conserver les pas manuels en l’absence de données. L’initialisation Android accepte les routes `#…` et attend l’installation du récepteur JavaScript avant d’envoyer les résultats. Les autorisations, la déconnexion et les mises à jour requises donnent des messages distincts. Les tests JavaScript couvrent ces réponses ; le code Android nécessite toujours compilation et essais sur appareil. Aucun APK n’est livré automatiquement par le déploiement GitHub Pages.

Version 22 : « Bien manger » devient une validation simple, sans compteur, saisie calorique ni malus alimentaire. Le bouton « J’ai mangé sans excès : valider » coche la ligne et revient à l’accueil. En cas d’excès, la case reste vide ; une validation peut être retirée. Ce suivi ne modifie pas l’XP et ne conditionne pas le bonus des quêtes ordinaires. Les anciennes déclarations historiques et les anciens mouvements d’XP sont conservés, sans application de nouvelles pénalités. Cette version remplace le fonctionnement alimentaire de la version 20 décrit plus bas.

Version 21 : les défis libres marche, course, vélo et shadow boxing acceptent une durée déclarée ajustable avant validation, à partir du minimum propre au défi (20, 15, 30 et 15 minutes). L’estimation calorique utilise cette durée réelle ; la récompense de base augmente proportionnellement, plafonnée à 120 XP, avec au maximum 100 XP supplémentaires liés aux calories. Le total de quête est donc plafonné à 220 XP, hors bonus unique de journée. Les durées acceptées vont jusqu’à 1 440 minutes, avec une précision d’un dixième de minute. L’aperçu se recalcule à la saisie ; une durée sous le minimum bloque la validation. La durée validée et les calories sont conservées dans la quête, l’historique et les compteurs. Une seule validation par type de défi et par jour.

Version 20 : « Bien manger » est une ligne permanente ouvrant un compteur des excès déclarés du jour, des calories estimées des activités enregistrées et du malus appliqué. Aucune saisie par repas, aucun objectif calorique et aucune soustraction entre les deux compteurs. Les calories d’activité sont une estimation partielle de la dépense quotidienne, pas un bilan énergétique.

Un total déclaré positif retire 10 XP au maximum par jour, indépendamment du nombre de kcal, des activités et du nombre de modifications. Le total remplace la saisie précédente. Une déclaration à 0 coche la ligne sans bonus. Sans déclaration, aucun malus automatique. Une correction d’un total positif à 0 rend uniquement les XP effectivement retirés, sans dépasser le niveau maximum. Les données et les sept dernières déclarations sont conservées localement. Cette règle de jeu ne mesure pas la qualité de l’alimentation. Source de contexte : [OMS, alimentation saine](https://www.who.int/news-room/fact-sheets/detail/healthy-diet).

Version 19 : « Se coucher tôt » est un défi permanent, visible même sans sélection et indépendant du bonus des quêtes ordinaires. Conseil calculé depuis l’heure de réveil et 7, 8 ou 9 heures réservées au sommeil (par défaut 7 h / 8 h, donc coucher conseillé à 23 h). L’OMS conseille la régularité des horaires, sans heure adulte universelle dans les conseils utilisés ; le repère de durée vient des NIH. Les deux sources sont liées dans la fiche du défi.

Le coucher est déclaré avec sa date réelle et le soir concerné (aujourd’hui ou hier ; intervalle de nuit de midi au lendemain avant midi). Une déclaration définitive par nuit : +40 XP si le conseil est respecté, 0 XP si le coucher est plus tardif mais au plus tard à minuit inclus, −10 XP seulement après minuit (sans passer sous zéro). Une absence de saisie ne retire rien, y compris au règlement automatique du lendemain. La pénalité de sommeil est distincte des pénalités des quêtes sportives. Aucun supplément calorique ni validation du bonus quotidien pour le sommeil. Le temps réservé au lit n’est pas une mesure du sommeil réel.

Version 17 : chaque écran de récompense anime le remplissage de la barre d’XP pendant environ une seconde. Au passage d’un niveau, la barre atteint 100 %, un effet doré annonce le niveau suivant, puis le surplus remplit le nouveau palier. Cela couvre les défis, séances guidées, activités libres et récompenses de pas. Fermer l’écran termine l’affichage sans modifier les gains enregistrés. La préférence système de réduction des animations affiche directement le résultat final.

La progression demande désormais `500*(N-1) + 50*(N-1)^2` XP cumulés : 550 XP pour le niveau 2, 8 550 XP pour le niveau 10 et 27 550 XP pour le niveau 20. À 180–200 XP par journée réussie, le premier passage prend environ 3 à 4 journées. Chaque palier coûte 100 XP de plus que le précédent. Les gains et l’XP déjà enregistrés sont conservés ; le niveau est recalculé avec cette courbe, ce qui peut réduire le niveau affiché d’un ancien profil.

La version 16 sépare l’interface en écrans : accueil avec les seuls défis choisis, catalogue des activités, fiche de défi, pas et santé, saisie libre, planning, progression et profil. Une ligne de défi ouvre sa fiche sans la valider. Les défis sportifs guidés ouvrent leur séance dans cette fiche ; la marche, la course, le vélo et l’hydratation se confirment après réalisation. Une réussite affiche l’XP au-dessus de l’accueil, dont la ligne est désormais cochée. Les liens `#challenge/walk`, par exemple, permettent de retrouver une fiche ; le bouton Retour du navigateur suit les changements d’écran. Le thème commun noir et doré est dans `theme.css`, également inclus au cache hors ligne et dans le paquet Android.

Validation : `node --test tests/workout.test.cjs` couvre aussi l’ouverture sans validation, la confirmation, le retour à l’accueil, les lignes cochées, l’accès aux séances guidées, les liens directs et la séparation des écrans.

La version 15 ajoute la saisie d’activités libres (nom, durée, intensité, calories facultatives), un journal de pas par jour, un objectif ajustable et les récompenses d’exploration. Les activités libres rapportent au maximum 200 XP par jour, avec un plafond de 160 XP par activité. Les pas rapportent 10 XP par tranche de 1 000, plafonnés à 60 XP par jour, indépendamment de l’objectif choisi. Les pas n’ajoutent pas de calories pour éviter de les additionner aux activités déjà enregistrées.

Dans le navigateur, les pas sont saisis manuellement : aucune lecture automatique du podomètre n’est simulée. Le total saisi remplace l’observation précédente. Le projet [Android](android/README.md) embarque le site et implémente la lecture des pas du jour via Health Connect après autorisation. Les lectures sont agrégées pour éviter les doublons entre sources ; chaque synchronisation remplace le dernier total. La version Android n’est pas compilée ni distribuée depuis ce dépôt. Elle nécessite Android Studio/JDK 17 et une validation sur appareil. Son stockage local est distinct de celui du navigateur. Voir aussi la [politique des données](privacy.html).

Références techniques : [Health Connect](https://developer.android.com/health-and-fitness/health-connect/get-started), [lecture et agrégats](https://developer.android.com/health-and-fitness/health-connect/read-data), [contenu local WebView](https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader).

Webapp mobile de callisthénie quotidienne : séances guidées de 15 ou 20 minutes, planning sur sept jours, minuteur, objectifs et suivi local.

Le planning choisit deux thèmes par date, sans reprendre ceux de la veille, y compris aux changements de semaine. Le tirage est propre à l’appareil et conservé lors des rechargements. Chaque séance contient six blocs : échauffement des deux thèmes, renforcement des deux thèmes, puis étirements associés. Les exercices peuvent solliciter plusieurs groupes musculaires ; l’alternance porte sur les thèmes programmés.

Chaque mouvement dure 40 secondes. La respiration dure 10 secondes entre deux mouvements d’un bloc ; une transition de 30 secondes la remplace entre deux blocs. Avec les 10 secondes initiales de préparation, 16 passages donnent exactement 15 minutes et 22 donnent exactement 20 minutes. Les variantes unilatérales sont programmées par paires. La pause et la navigation manuelle peuvent modifier le temps réellement passé, qui est enregistré dans l’historique.

Le détail du jour est consultable sur l’accueil. La bibliothèque filtrable se trouve dans Planning : 115 fiches avec consignes, dont 105 illustrées par les captures fournies. Les vignettes sont affichées par cadrage SVG des images originales, sans modifier les fichiers. Les 10 autres mouvements conservent leurs schémas. Voir [l’inventaire et les correspondances](EXERCICES.md).

Les modes CINDY et kettlebell restent des circuits AMRAP distincts du programme guidé : 15 à 20 minutes, préparation incluse.

Vérification du catalogue, de l’alternance, des durées, du minuteur et du cache hors ligne : `node --test tests/workout.test.cjs`.

Version en ligne : <https://godamz.github.io/Callisthenut/>

## Lancer l’application

Depuis ce dossier, lancer un petit serveur web :

```powershell
py -m http.server 8080
```

Puis ouvrir `http://localhost:8080` dans un navigateur. Sur mobile, ouvrir l’adresse réseau de l’ordinateur depuis le même Wi-Fi. L’installation sur l’écran d’accueil est proposée par les navigateurs compatibles une fois le site servi en HTTPS (ou via `localhost`).

Les réglages, objectifs et séances terminées sont enregistrés dans le navigateur. Les notifications web ne peuvent déclencher un rappel programmé que tant que l’application reste ouverte ; un service de notifications distant sera nécessaire pour des rappels totalement autonomes.

Chaque push sur `main` déclenche automatiquement le déploiement GitHub Pages défini dans `.github/workflows/pages.yml`.

## Aventure RPG (version 14)

Six quêtes : calisthénie, marche, course, vélo, kettlebell et hydratation. Les séances guidées restent accessibles dans le dojo. Le niveau RPG est distinct de la difficulté des exercices. Le profil et l’historique sont conservés ; l’aventure démarre au niveau 1.

Chaque quête est récompensée une fois par date locale : base de 40 à 60 XP + 1 XP pour 5 kcal estimées, supplément plafonné à 100 XP. L’hydratation ne dépense aucune calorie. Les validations manuelles correspondent aux durées affichées ; les séances guidées utilisent leur durée enregistrée. Les quêtes choisies sont verrouillées après la première validation. Toutes les terminer donne un bonus unique de 80 XP.

Chaque quête choisie manquée retire 10 XP le lendemain : maximum 30 XP par journée planifiée, sans descendre sous zéro. Les jours sans plan sont libres. La sauvegarde locale évite les doubles récompenses et pénalités.

Seuil du niveau N : `500*(N-1) + 50*(N-1)^2`. Maximum : niveau 99. Le niveau 20 (27 550 XP) est un jalon ludique de régularité. Les repères adultes de l’OMS sont présentés séparément et sourcés dans Progression : aucun niveau ne mesure la santé.
