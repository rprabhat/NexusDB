# Graph Traversals

## Out - Outgoing Nodes

```sensibleql
QUERY GetUserFollowing(user_id: ID) =>
    following <- N<User>(user_id)::Out<Follows>
    RETURN following
```

## In - Incoming Nodes

```sensibleql
QUERY GetUserFollowers(user_id: ID) =>
    followers <- N<User>(user_id)::In<Follows>
    RETURN followers
```

## OutE - Outgoing Edges

```sensibleql
QUERY GetFollowingEdges(user_id: ID) =>
    edges <- N<User>(user_id)::OutE<Follows>
    RETURN edges
```

## InE - Incoming Edges

```sensibleql
QUERY GetFollowerEdges(user_id: ID) =>
    edges <- N<User>(user_id)::InE<Follows>
    RETURN edges
```

## Chaining

```sensibleql
QUERY GetFriendsOfFriends(user_id: ID) =>
    fof <- N<User>(user_id)::Out<Follows>::Out<Follows>
    RETURN fof
```

## Shortest Path

```sensibleql
QUERY FindPath(from_id: ID, to_id: ID) =>
    path <- N<User>(from_id)::ShortestPath<N<User>(to_id)>
    RETURN path
```

