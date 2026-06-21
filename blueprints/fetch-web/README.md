# Web Fetch & Synthesis Pipeline

**Cost tier:** low (~$0.05/run)  
**Best for:** Research-driven web queries with RAG caching for repeated queries.

## What it does

Deterministic web fetching pipeline that combines local RAG cache with fresh web content:

1. **RAG Checker** — Searches local RAG cache directory for previously fetched content matching the query
2. **RAG Content Scanner** — Reads relevant cached files and extracts snippets
3. **RAG Evaluator** — LLM assesses whether cached content is sufficient to answer the query
4. **Fetcher** — Only if needed: curls up to 5 URLs with timeout protection and user-agent headers
5. **Synthesizer** — LLM synthesizes RAG + fetched content to answer the research question
6. **RAG Writer** — Caches the result for future queries

This pattern optimizes for repeated queries: first run fetches from web, subsequent runs use cache when confidence is high.

## Inputs

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `urls` | ✅ | — | Comma-separated URLs to fetch (max 5). Example: `https://example.com/p1,https://example.com/p2` |
| `query` | ✅ | — | Research question to answer from content. Guides both RAG search and synthesis. |
| `rag_dir` | — | `./rag` | Local RAG cache directory. Blueprint reads and writes here. |
| `output_format` | — | `markdown` | Output format: `markdown`, `json`, or `summary` |
| `max_urls` | — | `5` | Safety limit on number of URLs to fetch in one run. |

## Example

Basic fetch and synthesis:

```bash
conductor run fetch-web \
  --urls "https://docs.anthropic.com/en/api/overview,https://github.com/anthropics/anthropic-sdk-python" \
  --query "What are the latest Claude models available in the Anthropic API?"
```

With explicit RAG cache directory:

```bash
conductor run fetch-web \
  --urls "https://example.com/architecture" \
  --query "Explain the system architecture" \
  --rag_dir "./research/cache" \
  --output_format "json"
```

With summary output:

```bash
conductor run fetch-web \
  --urls "https://news.example.com/article1,https://blog.example.com/post" \
  --query "What happened today?" \
  --output_format "summary"
```

## Agent flow

```
rag-checker (tool: find in cache dir)
         ↓
rag-content-scanner (tool: read cached files)
         ↓
rag-evaluator (agent: assess if cached content suffices)
         ↓
         ├─ If confidence > 0.8 → skip fetcher
         ├─ Otherwise → fetch (tool: curl each URL)
         ↓
synthesizer (agent: answer query from RAG + fetched content)
         ↓
rag-writer (tool: cache result for future runs)
```

## Output

The synthesizer returns output in the requested format:

### markdown (default)
```
# Answer to: What are the latest Claude models?

## Key Findings
- Opus 4.1 (strongest)
- Sonnet 4 (balanced)
- Haiku (fastest)

## Sources
- https://docs.anthropic.com/en/api/overview
- https://github.com/anthropics/anthropic-sdk-python

## Confidence
High — multiple authoritative sources confirm this information.

## Next Steps
Consider exploring pricing tiers and rate limits.
```

### json
```json
{
  "answer": "Claude models include Opus, Sonnet, and Haiku variants...",
  "sources": [
    "https://docs.anthropic.com/en/api/overview",
    "https://github.com/anthropics/anthropic-sdk-python"
  ],
  "confidence": "high",
  "next_steps": ["pricing tiers", "rate limits", "token counting"]
}
```

### summary
```
Claude API offers three model tiers: Opus (strongest), Sonnet (balanced), Haiku (fastest).
Latest info from official docs and GitHub SDK.
High confidence.
```

## Caching strategy

The RAG cache directory accumulates research results:

```
./rag/
├── query_1718000000.md  (from 3 hours ago)
├── query_1718003600.md  (from 2 hours ago)
└── query_1718007200.md  (from 1 hour ago)
```

Each cached file is timestamped and contains:
- Original query
- URLs that were fetched
- Synthesized answer
- Confidence level

**When cache is used:** RAG Evaluator checks if cached results have >80% confidence for the query. If yes, the Fetcher step is skipped entirely.

**When cache is refreshed:** New queries or low-confidence cached results trigger fresh fetches, and results are appended to RAG cache.

## Common issues

- **Fetcher returns empty content**: URLs may require authentication, have robots.txt restrictions, or be temporarily unavailable. Check URLs manually with `curl -v`.
- **RAG cache grows large**: Periodically clean old entries with `find ./rag -mtime +30 -delete` (remove files older than 30 days).
- **LLM synthesis lacks source attribution**: Synthesizer prompt can be customized to require explicit citations. File a GitHub issue for custom synthesis instructions.
- **Timeouts on slow URLs**: Increase `curl --max-time 15` in the fetcher command if your URLs are slow to respond. Max timeout: 60 seconds (hard limit).

## Permissions

- **network: true** — fetches HTTP content from provided URLs
- **filesystem: read-write** — reads RAG cache and writes new results
- **allowed_commands**: `curl`, `find`, `grep`, `head` — safe, deterministic operations

## Integration examples

### As a research step in a larger workflow

```bash
conductor run fetch-web \
  --urls "https://api.example.com/docs" \
  --query "API rate limits and quotas" \
  --rag_dir "./projects/my-integration/research"
```

Then use the synthesizer output in a downstream agent that implements rate limiting.

### Batch research with multiple queries

```bash
for query in "Architecture" "Performance" "Cost"; do
  conductor run fetch-web \
    --urls "https://docs.example.com" \
    --query "$query" \
    --rag_dir "./shared-rag"
done
```

All queries share the same RAG cache, so the second and third runs will be much faster.

### Automated nightly research

Use conductor's scheduled execution:

```bash
conductor schedule \
  --blueprint fetch-web \
  --cron "0 2 * * *" \
  --urls "https://news.example.com,https://blog.example.com" \
  --query "What's new in our industry?" \
  --rag_dir "./research/nightly"
```

## Pre-flight checklist

- [ ] At least one URL is reachable and returns HTML/text content
- [ ] Query is specific enough to guide both RAG search and synthesis (vague queries return weak answers)
- [ ] RAG cache directory exists or conductor has write permissions to create it
- [ ] Network access is available (required for first run; cached results don't need network)
- [ ] URLs do not require authentication (basic auth can be added to curl via prompt customization)

## Performance notes

- **First run:** ~18k tokens (RAG search + fresh fetch + synthesis). ~$0.05 cost.
- **Cached run:** ~8k tokens (RAG hit only, no fetch). ~$0.02 cost.
- **Worst case:** All 5 URLs fetched + synthesis. ~25k tokens. ~$0.07 cost.

Token usage is driven by:
- Number of URLs fetched (each ~2-3k tokens of content)
- Length of cached files in RAG directory
- Synthesizer output format (summary < markdown < json)

## Roadmap

- [ ] Support for authenticated URLs (Bearer token, basic auth)
- [ ] Parallel URL fetches (currently sequential)
- [ ] RAG cache smart eviction (by age/query similarity)
- [ ] Output to Markdown file directly (not just stdout)
- [ ] Integration with external RAG services (Pinecone, Weaviate)
