# tdd-bug-hunter

**Boucle TDD adversariale : un agent trouve le bug, un second ecrit le test qui echoue, un troisieme fixe, un quatrieme verifie — jusqu'a ce qu'il n'y ait plus rien a chasser.**

## Quand l'utiliser

Sur une codebase avec une couverture de tests incomplete, quand vous voulez systematiquement reduire la dette de bugs avant une release. Le blueprint boucle jusqu'a 2 rounds consecutifs sans nouveau bug trouve.

## Agents

| Role | Type | Description |
|------|------|-------------|
| finder | single | Identifie un bug non teste dans la cible — fichier, ligne, description, repro minimal |
| test-writer | single | Ecrit le test qui expose le bug en utilisant le framework de test du projet |
| fixer | single | Applique le fix minimal pour faire passer le test |
| verifier | single | Execute la suite de tests et confirme que tout est vert |

## Coût estimé

Tier: **medium** — ~40 000 tokens/run — ~$0.12/run

## Install

```bash
conductor hub install tdd-bug-hunter
```
