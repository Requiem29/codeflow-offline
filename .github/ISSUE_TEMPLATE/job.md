## 🕰️ Job / Batch / Pipeline

## 🧭 Contexte

> Quel traitement ? Pourquoi ce ticket existe-t-il ?
> Nouveau job, modification, incident sur un batch existant ?

## 🎯 Objectif

> Résultat attendu : artefacts produits, fichiers générés, écritures en base, envois, mises à jour…

## 🧵 Chaîne de traitement

> Décrire la séquence globale.

- Entrées :
- Étapes :
- Sorties :

## 🧾 Entrées

- Source(s) : `dossier / SFTP / API / DB / mail / GED / autre`
- Format : `ZIP / XML / CSV / XLSX / PDF / JSON / autre`
- Volume attendu :
- Contraintes sur les données :

## 📦 Sorties

- Destination(s) : `GED / CFC / DB / SFTP / mail / dossier / autre`
- Format(s) :
- Nommage attendu :

## ⏱️ Planification

- Fréquence : `ponctuel / quotidien / hebdo / mensuel / à la demande`
- Fenêtre horaire :
- Timeouts / SLA :

## 🔎 Observabilité

- Logs attendus :
- Métriques / alerting :
- Points de contrôle :

## 🔙 Reprise / idempotence

- Relance possible : `oui / non`
- Stratégie : `rejouable / reprise partielle / nettoyage préalable`

## 🔐 Sécurité & conformité

- Données sensibles manipulées : `oui / non`
- Anonymisation requise : `oui / non`
- Risques identifiés :
  - .

## 📐 Hypothèses & contraintes

> Dépendances, fenêtres horaires bloquantes, quotas, SLA amont/aval.

## ⚠️ Risques

- Sur les données :
- Sur la production :

## 🧪 Validation

- [ ] Traitement nominal OK
- [ ] Cas d'erreur géré (fichier absent, format invalide, volume inattendu…)
- [ ] Non-régression vérifiée
- [ ] Idempotence testée

## 📄 Documentation

- [ ] Runbook (si job en production)
- [ ] Schéma de flux
- [ ] ADR (si décision structurante)

## 🏗️ Composants impactés

> Labels `03-component` concernés.

## 🚧 Dépendances / blocages

> Infra, accès SFTP, partenaires, habilitations, autre.

## 📝 Notes complémentaires

> Tout ce qui ne rentre pas ailleurs.

/label ~"02-type:task" ~"01-status:todo" ~"00-priority:P3" ~"03-component:backend" ~"09-tempo:recurrent"
