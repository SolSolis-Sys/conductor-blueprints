# brainstorming-premortem

**Multi-angle ideation suivie d'un pre-mortem adversarial pour tuer les mauvaises idées avant de construire.**

## Quand l'utiliser

En amont d'une décision ou d'un nouveau feature, quand vous voulez explorer plusieurs angles (nominal, alternatif, contraint, regret futur) et identifier les risques fatals pendant qu'il est encore peu couteux de pivoter.

## Agents

| Role | Type | Description |
|------|------|-------------|
| ideator-nominal | single | Genere 3-5 idees selon l'approche naturelle et evidente |
| ideator-alternative | single | Genere des idees en faisant l'inverse ou en approchant radicalement differemment |
| ideator-constrained | single | Genere des idees sous contraintes severes (moitie du temps, 10% du budget) |
| ideator-future | single | Genere des idees en partant du regret futur — que regretterez-vous dans 1 an ? |
| premortem-analyst | parallel (x5 par defaut) | Chaque analyste couvre une categorie d'echec : technical, user, platform, dependencies, scope |
| synthesizer | single | Produit top ideas, critical risks, unknowns, success criterion, MVP si scope coupe, et verdict READY_TO_PLAN / NEEDS_INVESTIGATION / STOP |

## Coût estimé

Tier: **medium** — ~55 000 tokens/run — ~$0.17/run

## Install

```bash
conductor hub install brainstorming-premortem
```
