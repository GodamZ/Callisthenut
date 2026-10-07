# Callisthenut

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
