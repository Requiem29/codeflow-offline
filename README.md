# Codeflow-Offline

> Version autonome et hors-ligne de CodeFlow, un visualiseur d'architecture de code exécuté entièrement dans le navigateur, sans dépendance serveur ni connexion réseau requise.

---

## 📌 Informations générales

| Élément              | Valeur                                                    |
| -------------------- | --------------------------------------------------------- |
| Domaine              | Analyse de code / Visualisation d'architecture logicielle |
| Responsable          | R                                                         |
| Équipe               | -                                                         |
| Statut               | En cours / Maintenance                                    |
| Criticité            | Moyenne                                                   |
| Environnement(s)     | Local / Offline                                           |
| Dernière mise à jour | 11 Mai 2026                                               |

---

## 📖 Description

Codeflow-Offline permet d'analyser et de visualiser la structure d'un projet directement depuis un navigateur, en environnement local.

L'application permet notamment de représenter les dépendances entre fichiers, d'explorer des graphes, d'identifier des zones sensibles du code et d'exporter des rapports sans envoyer de données vers un service externe.

Elle s'adresse principalement :

* aux développeurs souhaitant analyser un dépôt localement ;
* aux équipes soumises à des contraintes de confidentialité ;
* aux contextes sans connexion Internet ;
* aux environnements où l'installation de dépendances serveur doit être évitée.

---

## 🔐 Accès

| Accès            | Détail                                                 |
| ---------------- | ------------------------------------------------------ |
| URL              | `http://127.0.0.1:8080/index.html` en exécution locale |
| Authentification | Aucune authentification par défaut                     |
| Profils / rôles  | Utilisateur local / Développeur                        |
| Demande d'accès  | Non concerné en mode local ; accès au dépôt nécessaire |

---

## ✨ Fonctionnalités principales

* Visualisation interactive du graphe de dépendances.
* Analyse d'impact, ou « blast radius », pour un fichier sélectionné.
* Détection de motifs et d'anti-patterns, par exemple singletons ou factories.
* Score de santé du code basé sur plusieurs métriques : couplage, code mort, cycles, etc.
* Analyse locale et hors-ligne, exécutée côté navigateur.
* Export des rapports en JSON, Markdown et SVG.

---

## 🧱 Architecture / fonctionnement

Codeflow-Offline est une application front-end statique exécutée dans le navigateur. Elle repose sur des bibliothèques JavaScript et WebAssembly embarquées localement dans le dépôt.

### Composants principaux

| Composant                                           | Rôle                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/index.html`                                    | Point d'entrée principal de l'application front-end                      |
| `src/vendor/`                                       | Répertoire contenant les dépendances locales nécessaires au mode offline |
| `src/vendor/tree-sitter-wasms/out/`                 | Grammaires Tree-sitter au format WASM utilisées pour l'analyse de code   |
| `src/Récupérer les json pour exécution offline.ps1` | Script PowerShell de récupération des dépendances nécessaires            |

### Dépendances locales notables

Le dossier `src/vendor/` contient notamment :

* `react.production.min.js` ;
* `react-dom.production.min.js` ;
* `babel.min.js` ;
* `d3.min.js` ;
* `d3-sankey.min.js` ;
* `acorn.min.js` ;
* `jszip.min.js` ;
* `tree-sitter.js` ;
* les grammaires WASM Tree-sitter sous `tree-sitter-wasms/out/`.

### Fonctionnement général

1. L'utilisateur sert localement les fichiers statiques du dossier `src`.
2. Le navigateur charge `index.html` ainsi que les dépendances présentes dans `src/vendor/`.
3. L'analyse du code est réalisée côté client.
4. Les résultats sont affichés sous forme de graphes, heatmaps ou rapports exportables.

Aucune base de données n'est utilisée par défaut. Aucun service serveur n'est nécessaire pour l'exécution standard.

---

## ⚙️ Exploitation

| Élément     | Valeur                                                            |
| ----------- | ----------------------------------------------------------------- |
| Supervision | Non                                                               |
| Sauvegarde  | Non concerné, hors sauvegarde du dépôt et des exports générés     |
| Logs        | Console du navigateur et éventuels journaux du serveur HTTP local |
| Astreinte   | Non                                                               |

---

## 🧰 Prérequis

* Navigateur moderne avec support WASM : Chrome, Edge ou Firefox.
* Python 3, optionnel, pour démarrer un serveur HTTP local simple.
* PowerShell sous Windows, uniquement pour exécuter le script de récupération des dépendances.

---

## 🚀 Installation et exécution offline

### 1. Se placer dans le dossier `src`

```bash
cd src
```

### 2. Télécharger les dépendances si nécessaire

Si le dossier `src/vendor/` n'est pas complet, exécuter le script PowerShell depuis le dossier `src` :

```powershell
.\"Récupérer les json pour exécution offline.ps1"
```

### 3. Démarrer un serveur HTTP local

```bash
python -m http.server 8080
```

### 4. Ouvrir l'application

Depuis le navigateur :

```text
http://127.0.0.1:8080/index.html
```

Le serveur HTTP sert uniquement les fichiers statiques en local. Un autre serveur statique peut être utilisé si nécessaire.

---

## 🔒 Confidentialité

Tout le traitement est réalisé côté client, dans le navigateur.

Par défaut :

* aucun fichier analysé n'est envoyé à un service externe ;
* aucune API distante n'est nécessaire à l'exécution ;
* les bibliothèques nécessaires sont chargées depuis `src/vendor/`.

Cette approche permet une utilisation dans des environnements soumis à des contraintes de confidentialité ou dépourvus d'accès Internet.

---

## ⚠️ Points d'attention

* Vérifier que le dossier `src/vendor/` contient toutes les dépendances nécessaires avant une utilisation hors-ligne stricte.
* Vérifier que le port `8080` est disponible avant de lancer le serveur HTTP local.
* Si les chemins de `index.html` sont modifiés, adapter les références aux dépendances locales.
* Si les chemins Tree-sitter sont modifiés, adapter également le chargement dynamique des fichiers WASM.
* La licence du projet original est MIT, mais la présence d'un fichier `LICENSE` dans ce dépôt doit être vérifiée.

---

## 🛠️ Dépannage

| Problème                         | Vérification / solution                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Page blanche ou interface cassée | Ouvrir la console du navigateur et vérifier les erreurs JavaScript ou les fichiers manquants en 404            |
| Erreur de chargement WASM        | Vérifier la présence de `tree-sitter.wasm` et des fichiers `tree-sitter-<lang>.wasm` dans `src/vendor/`        |
| Dépendances manquantes           | Relancer le script PowerShell ou télécharger manuellement les fichiers à partir des URL listées dans le script |
| Port indisponible                | Utiliser un autre port, par exemple `python -m http.server 8081`                                               |

---

## 🤝 Contribuer

Ce dépôt est une adaptation offline de CodeFlow.

Les contributions peuvent porter sur :

* les corrections de bugs ;
* l'amélioration de l'analyse locale ;
* l'ajout de formats d'export ;
* la documentation développeur ;
* l'amélioration du support offline.

Projet original : [https://github.com/braedonsaunders/codeflow](https://github.com/braedonsaunders/codeflow)

---

## 📚 Documentation liée

* Projet original CodeFlow : [https://github.com/braedonsaunders/codeflow](https://github.com/braedonsaunders/codeflow)
* Documentation interne : À compléter
* Procédure d'exploitation : À compléter
* Documentation développeur : À compléter

---

## 📄 Licence

Le projet original utilise la licence MIT.

Vérifier la présence d'un fichier `LICENSE` dans ce dépôt et adapter cette section selon la licence effectivement retenue pour cette version offline.

---

## 🧾 Remarques finales

Cette version vise une utilisation simple, locale et hors-ligne.

Des compléments peuvent être ajoutés selon l'évolution du projet :

* script NPM de lancement ;
* documentation de debugging ;
* description du format des rapports JSON ;
* automatisation de la génération des exports ;
* guide de contribution plus détaillé.
