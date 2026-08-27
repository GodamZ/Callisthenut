# Callisthenut

Webapp mobile de callisthénie quotidienne : séances guidées de 15 ou 20 minutes, planning sur sept jours, minuteur, objectifs et suivi local.

Version en ligne : <https://godamz.github.io/Callisthenut/>

## Lancer l’application

Depuis ce dossier, lancer un petit serveur web :

```powershell
py -m http.server 8080
```

Puis ouvrir `http://localhost:8080` dans un navigateur. Sur mobile, ouvrir l’adresse réseau de l’ordinateur depuis le même Wi-Fi. L’installation sur l’écran d’accueil est proposée par les navigateurs compatibles une fois le site servi en HTTPS (ou via `localhost`).

Les réglages, objectifs et séances terminées sont enregistrés dans le navigateur. Les notifications web ne peuvent déclencher un rappel programmé que tant que l’application reste ouverte ; un service de notifications distant sera nécessaire pour des rappels totalement autonomes.

Chaque push sur `main` déclenche automatiquement le déploiement GitHub Pages défini dans `.github/workflows/pages.yml`.
