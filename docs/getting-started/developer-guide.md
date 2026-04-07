# Developer Quick Start Guide

This guide walks you through setting up SensibleDB for building AI applications.

## Prerequisites

- macOS, Linux, or Windows
- Rust 1.75+ (for building from source)
- Basic familiarity with terminal/command line

## Step 1: Install the CLI

```bash
# Clone the repository
git clone https://github.com/Sensible-Analytics/SensibleDB.git
cd SensibleDB

# Build and install the CLI
cargo install --path sensibledb-cli
```

Verify installation:
```bash
nexus --version
```

## Step 2: Initialize a Project

```bash
mkdir my-app && cd my-app
nexus init
```

This creates:
```
my-app/
├── sensibledb.toml    # Project config
└── db/
    ├── schema.hx      # Define your data schema
    └── queries.hx    # Write your queries
```

## Step 3: Define Your Schema

Open `db/schema.hx` and define your data model:

```sensibleql
N::User {
    INDEX name: String,
    email: String
}

N::Document {
    INDEX title: String,
    content: String
}

E::OWNS {
    From: User,
    To: Document
}
```

## Step 4: Write Queries

Open `db/queries.hx`:

```sensibleql
QUERY addUser(name: String, email: String) =>
    user <- AddN<User>({name: name, email: email})
    RETURN user

QUERY getUser(name: String) =>
    user <- N<User>({name: name})
    RETURN user

QUERY addDocument(title: String, content: String) =>
    doc <- AddN<Document>({title: title, content: content})
    RETURN doc
```

## Step 5: Deploy Locally

```bash
nexus check        # Validate schema & queries
nexus push dev     # Deploy to local instance
```

Your API is now running at `http://localhost:6969`

## Step 6: Query from Your App

Use HTTP directly (SDKs coming soon):

```typescript
// TypeScript
const response = await fetch("http://localhost:6969/addUser", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "John", email: "john@example.com" })
});
const result = await response.json();
```

```python
# Python
import requests
response = requests.post(
    "http://localhost:6969/getUser",
    json={"name": "John"}
)
print(response.json())
```

## Next Steps

- Learn [SensibleQL syntax](../sensibleql/overview.md)
- Explore [graph traversals](../sensibleql/traversals.md)
- Add [vector search](../sensibleql/vector-operations.md) for semantic queries

---

**Need Help?**
[Open an issue](https://github.com/Sensible-Analytics/SensibleDB/issues)