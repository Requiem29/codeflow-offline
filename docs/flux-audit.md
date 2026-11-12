# Audit des flux CodeFlow Offline

## Objectif

L'écran `src/flux.html` ajoute une vue d'analyse orientée flux. Il sert à repérer rapidement :

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
http://127.0.0.1:8080/flux.html
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

## Sécurité export CSV (formules tableur)

L'export CSV neutralise désormais les cellules textuelles qui pourraient être interprétées comme formule tableur.

Politique appliquée :

- détection sur texte après suppression d'un préfixe initial d'espaces et de contrôles (`\\u0000-\\u001F`, `\\u007F`, espaces, tabulations, CR/LF) ;
- si le premier caractère significatif est `=`, `+`, `-` ou `@`, préfixage de la cellule par une apostrophe `'` ;
- conservation du format CSV existant : séparateur `;`, guillemets doublés, retours à la ligne, Unicode, en-têtes et ordre des colonnes.

Limites connues :

- la protection est faite au moment de l'export CSV et ne modifie pas les données d'analyse en mémoire ni l'export JSON ;
- selon le tableur et les options d'import/export, une cellule préfixée peut être réécrite différemment lors d'une sauvegarde/réouverture.

## Validation reproductible

Commande reproductible (sans dépendance externe) :

```bash
node /home/runner/work/codeflow-offline/codeflow-offline/scripts/test-flux-csv-export.mjs
```

Ce test couvre une matrice synthétique :

- texte ordinaire ;
- préfixes `=`, `+`, `-`, `@` ;
- préfixes avec espaces, tabulation, CR/LF ;
- guillemets, séparateurs, retours à la ligne, Unicode ;
- vérification d'en-tête/ordre des colonnes CSV ;
- non-régression JSON/données source : objets de `findings` inchangés après sérialisation CSV.

Résultats constatés :

- script `node` : OK (tous les contrôles passent) ;
- vérification Excel ouverture/sauvegarde/réouverture : non exécutée dans cet environnement (Excel indisponible) ;
- téléchargement navigateur : à vérifier manuellement dans un navigateur local (bouton **Exporter CSV**).

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
