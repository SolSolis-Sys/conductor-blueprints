# adversarial-review

**Code review that filters false positives: three independent refuters must fail to disprove a finding before it gets reported.**

## Quand l'utiliser

Avant de merger une PR sensible (sécurité, perf, logique critique) quand les reviewers classiques génèrent trop de bruit. Idéal quand vous voulez des findings actionnables uniquement, sans faux positifs qui encombrent la discussion.

## Agents

| Role | Type | Description |
|------|------|-------------|
| finder | single | Analyse la cible selon les dimensions choisies et produit la liste brute de findings |
| refuter | parallel (x3 par défaut) | Chaque refuter tente indépendamment de réfuter un finding — faux positif, déjà géré, trade-off acceptable |
| synthesizer | single | Consolide les votes de réfutation et produit le rapport final (finding confirmé si >= 2 refuters n'ont pas réfuté) |

## Coût estimé

Tier: **high** — ~80 000 tokens/run — ~$0.28/run

## Install

```bash
conductor hub install adversarial-review
```
