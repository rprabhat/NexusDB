# AI Agent Integration Guide

SensibleDB can serve as a knowledge base and memory store for AI agents. This guide shows how to connect agents to your local SensibleDB instance.

## Why Use SensibleDB for AI Agents?

- **Local-First**: No data leaves your machine
- **Graph + Vectors**: Combine relationship reasoning with semantic search
- **Type-Safe Queries**: Catch errors at compile time
- **No External APIs**: Works completely offline

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Your AI Agent                     │
│                   (Claude, GPT, etc.)               │
└────────────────────────┬────────────────────────────┘
                         │ HTTP
                         ▼
┌─────────────────────────────────────────────────────┐
│              SensibleDB (localhost:6969)             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Graph     │  │   Vector    │  │   Query     │  │
│  │   Storage   │  │   Storage   │  │   Engine    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Setup

### 1. Start SensibleDB

```bash
nexus push dev
```

The API is now available at `http://localhost:6969`

### 2. Define Your Schema

In `db/schema.hx`:

```sensibleql
N::Memory {
    INDEX id: String,
    content: String,
    created_at: Date
}

N::Context {
    INDEX id: String,
    summary: String
}

E::RELATED_TO {
    From: Memory,
    To: Memory
}

E::PART_OF {
    From: Memory,
    To: Context
}
```

### 3. Write Query Functions

In `db/queries.hx`:

```sensibleql
QUERY storeMemory(memory_id: String, content: String) =>
    mem <- AddN<Memory>({id: memory_id, content: content, created_at: NOW()})
    RETURN mem

QUERY storeContext(context_id: String, summary: String) =>
    ctx <- AddN<Context>({id: context_id, summary: summary})
    RETURN ctx

QUERY linkMemories(from_id: String, to_id: String) =>
    edge <- AddE<RELATED_TO>({})::From(from_id)::To(to_id)
    RETURN edge

QUERY findRelatedMemories(memory_id: String) =>
    memory <- N<Memory>({id: memory_id})
    related <- TRAVERSE memory -[RELATED_TO]-> m
    RETURN related

QUERY semanticSearch(query: String, limit: U32) =>
    results <- SearchV<Memory>({vector: Embed(query), limit: limit})
    RETURN results
```

## Integration Examples

### Python Agent

```python
import requests

class SensibleDBAgent:
    def __init__(self, base_url="http://localhost:6969"):
        self.base_url = base_url
    
    def store_context(self, memory_id: str, content: str):
        response = requests.post(
            f"{self.base_url}/storeMemory",
            json={"memory_id": memory_id, "content": content}
        )
        return response.json()
    
    def retrieve_context(self, query: str, limit: int = 5):
        response = requests.post(
            f"{self.base_url}/semanticSearch",
            json={"query": query, "limit": limit}
        )
        return response.json()
    
    def find_related(self, memory_id: str):
        response = requests.post(
            f"{self.base_url}/findRelatedMemories",
            json={"memory_id": memory_id}
        )
        return response.json()

# Usage
agent = SensibleDBAgent()
agent.store_context("session-001", "User prefers dark mode UI")
results = agent.retrieve_context("user preferences")
```

### TypeScript Agent

```typescript
class SensibleDBAgent {
  private baseUrl: string;

  constructor(baseUrl = "http://localhost:6969") {
    this.baseUrl = baseUrl;
  }

  async storeMemory(memoryId: string, content: string) {
    const response = await fetch(`${this.baseUrl}/storeMemory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memory_id: memoryId, content })
    });
    return response.json();
  }

  async search(query: string, limit = 5) {
    const response = await fetch(`${this.baseUrl}/semanticSearch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit })
    });
    return response.json();
  }
}

// Usage
const agent = new SensibleDBAgent();
await agent.storeMemory("conversation-001", "User asked about pricing");
const results = await agent.search("pricing information");
```

## MCP Integration *(Coming Soon)*

The MCP (Model Context Protocol) server integration is coming soon. This will allow direct agent-to-database communication through the MCP protocol.

## Best Practices

1. **Batch writes** — Store multiple memories in one request
2. **Use indexes** — Index frequently queried fields
3. **Link related items** — Use edges for relationship tracking
4. **Semantic search** — Combine vector search with graph traversal

---

**Need Help?**
[Open an issue](https://github.com/Sensible-Analytics/SensibleDB/issues)