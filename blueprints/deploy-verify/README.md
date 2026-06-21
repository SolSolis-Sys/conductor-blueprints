# deploy-verify

**Apres un deploy, polle les endpoints de sante et execute des smoke tests en boucle jusqu'a la stabilite confirmee ou le declenchement du rollback.**

## Quand l'utiliser

Immediatement apres un deploy en production ou staging, quand vous voulez une confirmation objective que le service repond correctement avant de fermer la PR ou de passer la main. Configure un rollback automatique si le seuil d'echecs est depasse.

## Agents

| Role | Type | Description |
|------|------|-------------|
| health-checker | single (loope) | Appelle l'endpoint de sante via curl et retourne status (up/down/degraded), http_code, response_time_ms |
| smoke-runner | conditional (si up ET smoke_tests definis) | Execute les smoke tests specifies et retourne all_passed + liste des echecs |
| rollback-trigger | conditional (si max_attempts atteint ET rollback_command defini) | Declenche le rollback via la commande configuree et notifie l'humain |

## Coût estimé

Tier: **low** — ~8 000 tokens/run — ~$0.03/run

## Install

```bash
conductor hub install deploy-verify
```
