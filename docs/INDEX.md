# SensibleDB

**Embedded Graph-Vector Database for AI Applications**

SensibleDB is a unified database that makes it easy to build all the components needed for an AI application in a single platform. You no longer need a separate application DB, vector DB, graph DB, or application layers managing multiple storage locations.

Built in Rust with LMDB as its storage engine — like SQLite for knowledge graphs.

---

## Why SensibleDB?

| Before SensibleDB | With SensibleDB |
|---|---|
| PostgreSQL for app data | **One database** handles everything |
| Pinecone / Weaviate for vectors | Graph + vector + embedded in a single engine |
| Neo4j for graph relationships | Type-safe queries with compile-time validation |
| Custom auth & access layers | Secure by default — access only through compiled SensibleQL |

## Key Features

- **Built-in MCP Tools** — AI agents discover data and walk the graph instead of generating SQL
- **Built-in Embeddings** — Vectorize text directly in queries with `Embed()`
- **RAG Tooling** — Vector search, keyword search, and graph traversals out of the box
- **Secure by Default** — Private by default; access only through compiled SensibleQL queries
- **Ultra-Low Latency** — Rust + LMDB storage engine for extreme performance
- **Type-Safe Queries** — SensibleQL is 100% type-safe, catch errors at compile time
- **Embedded Mode** — Zero external dependencies, use directly in Rust applications
- **Visual Explorer** — Interactive graph visualization, natural language chat, and report generation

---

## Quick Start

### 1. Install the CLI

```bash
curl -sSL "https://install.sensibledb-db.com" | bash
```

### 2. Initialize a Project

```bash
mkdir my-project && cd my-project
sensibledb init
```

### 3. Write Your Schema & Queries

Open the generated `.hx` file and define your schema:

```sensibleql
N::User {
    INDEX name: String,
    age: U32
}

E::FRIENDS {
    from: User,
    to: User
}

QUERY getUser(user_name: String) =>
    user <- N<User>({name: user_name})
    RETURN user

QUERY getFriends(user_id: U64) =>
    user <- N<User>({id: user_id})
    friends <- TRAVERSE user -[FRIENDS]-> friend
    RETURN friend
```

### 4. Deploy

```bash
sensibledb push dev
```

### 5. Use in Your Application

**TypeScript:**

```typescript
import SensibleDB from "sensible-ts";

const client = new SensibleDB();

// Create a user
await client.query("addUser", { name: "John", age: 30 });

// Query with type safety
const user = await client.query("getUser", { user_name: "John" });
```

**Python:**

```python
from sensibledb import SensibleDB

client = SensibleDB()

# Query the database
user = client.query("getUser", user_name="John")
print(user)
```

**Rust (Embedded):**

```rust
use sensibledb_db::embedded::{Database, Node};

let db = Database::open("./my_db")?;
let mut tx = db.write_transaction()?;

tx.put_node(Node {
    id: 1,
    label: "User".into(),
})?;

tx.commit()?;
```

---

## Documentation

| Section | Description |
|---|---|
| [Getting Started](getting-started/intro.md) | Installation and setup |
| [SensibleQL](sensibleql/overview.md) | Query language reference |
| [CLI](cli/getting-started.md) | Command-line tool guide |
| [SDKs](sdks/overview.md) | TypeScript, Python, and Rust SDKs |
| [Features](features/overview.md) | Full feature overview |

---

## License

SensibleDB is licensed under the AGPL (Affero General Public License).

## Commercial Support

SensibleDB is available as a managed service for selected users. For enterprise support or managed deployment, [contact us](mailto:founders@sensibledb-db.com).
