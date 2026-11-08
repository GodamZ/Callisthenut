# Callisthenut

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

Seuil du niveau N : `100*(N-1) + 20*(N-1)^2`. Maximum : niveau 99. Le niveau 20 (9 120 XP) est un jalon ludique de régularité. Les repères adultes de l’OMS sont présentés séparément et sourcés dans Progression : aucun niveau ne mesure la santé.
