# Audit des flux CodeFlow Offline

## Objectif

L'écran `src/flux-audit.html` ajoute une vue d'analyse orientée flux. Il sert à repérer rapidement :

- les fichiers qui appellent un serveur extérieur ;
- les fichiers qui récupèrent des données depuis un serveur ;
- les fichiers qui écrivent sur disque ;
- les fichiers qui lisent sur disque ;
- les chemins suspects hors périmètre local, par exemple chemins absolus, `../`, variables d'environnement ou dossiers système ;
- les chaînes de connexion vers services, bases ou files de messages.

Le tout reste exécuté côté navigateur, avec une politique CSP `connect-src 'none'`. L'analyse lit uniquement les fichiers que l'utilisateur fournit localement. Aucun envoi réseau n'est nécessaire, sinon ce serait assez ironique pour mériter une malédiction.

## Utilisation

Depuis le dossier `src`, servir les fichiers statiques comme pour l'application principale :

```bash
python -m http.server 8080
```

Puis ouvrir :

```text
http://127.0.0.1:8080/flux-audit.html
```

Deux entrées sont disponibles :

- **Dossier local** : sélection d'un répertoire avec `webkitdirectory`, utile sous Chrome ou Edge ;
- **Archive ZIP** : analyse d'un dépôt compressé, avec `src/vendor/jszip.min.js`.

## Affichage

La vue présente :

- un résumé global : nombre de flux, risques élevés, flux externes, chemins hors périmètre ;
- les fichiers les plus exposés, triés par score de risque ;
- un tableau filtrable avec type de flux, fichier, ligne, cible, risque et extrait de code ;
- des filtres rapides : sorties réseau, entrées réseau, écritures disque, lectures disque, services, chemins hors périmètre et serveurs externes ;
- des exports JSON et CSV.

## Heuristiques couvertes

### Réseau

Détection indicative de :

- `fetch(...)` ;
- `axios.get/post/put/patch/delete(...)` ;
- `requests.get/post/put/patch/delete(...)` ;
- `HttpClient.Get/Post/Put/Patch/Delete...` ;
- `XMLHttpRequest.open(...)` ;
- `WebSocket(...)` ;
- `EventSource(...)` ;
- `navigator.sendBeacon(...)` ;
- commandes `curl` ;
- URLs `http`, `https`, `ws`, `wss`, `ftp` présentes dans le code.

### Services

Détection indicative de :

- chaînes `Server=`, `Data Source=`, `Host=` ;
- URI `jdbc://`, `mongodb://`, `postgres://`, `mysql://`, `redis://`, `amqp://`, `mqtt://`, `smtp://`, `imap://`, `ldap://` ;
- `SqlConnection(...)`, `PDO(...)`, `createConnection(...)`, `psycopg2.connect(...)`.

### Disque

Détection indicative de lectures et écritures dans :

- Node.js `fs.*` ;
- Python `open`, `pathlib`, `pandas.read_*`, `os.makedirs` ;
- .NET `File.*`, `Directory.*`, `StreamReader`, `StreamWriter` ;
- PowerShell `Get-Content`, `Set-Content`, `Add-Content`, `Out-File`, `Import-Csv`, `Export-Csv`.

## Limites

Cette vue repose sur de l'analyse statique par motifs. Elle ne remplace pas une analyse AST exhaustive ni une exécution instrumentée. Elle donne une carte rapide des zones à inspecter, pas un jugement divin gravé dans le basalte.

Cas volontairement prudents :

- les cibles construites dynamiquement sont signalées avec une cible non littérale ;
- les méthodes HTTP indirectes peuvent être classées par défaut en lecture ;
- certains wrappers internes peuvent nécessiter l'ajout de nouvelles règles ;
- les frameworks exotiques, parce que les humains en inventent toujours d'autres, peuvent échapper aux motifs actuels.

## Extension future

La prochaine étape logique serait d'intégrer cet audit comme onglet dans `src/index.html`, afin que le graphe principal puisse colorer les nœuds par type de flux : entrant, sortant, lecture, écriture, externe ou hors périmètre.
