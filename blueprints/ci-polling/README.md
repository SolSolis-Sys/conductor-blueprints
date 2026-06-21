# ci-polling

**Surveille votre CI en boucle, extrait les logs d'echec, applique un fix minimal et re-pousse — jusqu'au vert ou a l'escalade humaine.**

## Quand l'utiliser

Quand vous avez une branche dont le CI echoue de facon repetable et que vous voulez deleguer les tentatives de fix (lint, tests unitaires cassants, erreurs de typage) sans rester colle a la console. Le blueprint s'arrete seul et vous alerte si les tentatives automatiques sont epuisees.

## Agents

| Role | Type | Description |
|------|------|-------------|
| watcher | single | Verifie le statut CI courant via `gh run list` et retourne status + conclusion + run_id |
| log-extractor | conditional (si failure) | Extrait les logs d'echec via `gh run view --log-failed` et identifie les fichiers impactes |
| fixer | conditional (si failure) | Applique le fix minimal, commit et push sur la branche cible |

## Coût estimé

Tier: **low** — ~15 000 tokens/run — ~$0.05/run

## Install

```bash
conductor hub install ci-polling
```
