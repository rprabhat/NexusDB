# Vector Operations

## Vector Similarity Search

```sensibleql
QUERY searchSimilar(query_vec: [F32], limit: U32) =>
    results <- SearchV<Article>({vector: query_vec, limit: limit})
    RETURN results
```

## Automatic Embeddings

```sensibleql
QUERY searchArticles(query: String) =>
    results <- SearchV<Article>({vector: Embed(query), limit: 10})
    RETURN results
```

## Keyword Search (BM25)

```sensibleql
QUERY keywordSearch(query: String) =>
    results <- SearchBM25<Article>({fields: ["title", "content"], query: query})
    RETURN results
```

## Hybrid Search with RRF

```sensibleql
QUERY hybridSearch(query: String) =>
    vector_results <- SearchV<Article>({vector: Embed(query), limit: 20})
    keyword_results <- SearchBM25<Article>({fields: ["title"], query: query})
    combined <- vector_results::RRF(keyword_results)
    RETURN combined
```

