# RAG — Multi-Agent Orchestration & Nested Subagents (2026-06-21)

## Sources vérifiées
- github.com/zircote/claude-team-orchestration
- github.com/ethanhq/cc-fleet
- github.com/NousResearch/hermes-agent (v0.14.0 mai 2026)
- github.com/ask-sol/openagent
- gist.github.com/wincent/2752d8d97727577050c043e4ff9e386e (Coding Agent Sandboxes)
- github.com/anthropics/claude-code/issues/47134 (worktree bug)

## Nested subagents CC (juin 2026)
- Depth max : 5 niveaux
- Workaround depth>5 : `claude -p headless` (process isolé = main agent complet)
- Worktree : Read+Bash OK · Edit/Write BLOQUÉS (policy .claude/** deny)
- BUG connu v2.1.121+ : .claude/worktrees/ dans son propre deny path

## Multi-provider existant
- cc-fleet : route session entière vers provider (semantic slots : default/strong/fast)
- OpenAgent : 12+ providers CLI (Claude, GPT-5, Gemini, DeepSeek, Groq, Mistral)
- Hermes v0.14.0 : Anthropic + OpenAI + AWS Bedrock + NVIDIA NIM + Google Gemini CLI
- OmniRoute : traducteur API format auto-détecté

## Patterns canoniques orchestration
- Parallel Specialists · Pipeline · Swarm · Research+Implement · Plan Approval
- Meilleure pratique : contexte explicite à chaque agent, task lists structurées
- Ownership matrix : 1 fichier = 1 agent propriétaire

## Isolation modes
- worktree : rapide, read+bash, bloque edit (bug v2.1.121+)
- none : édition checkout principal (race conditions)
- sandbox : seatbelt/bubblewrap, -84% prompts permission

## Différenciateur conductor vs cc-fleet
- cc-fleet route la SESSION vers un provider
- conductor peut router chaque AGENT vers un provider différent dans un blueprint
- Hub/catalog = unique (aucun concurrent n'a de marketplace)
