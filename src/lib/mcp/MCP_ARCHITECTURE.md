
# MCP Knowledge Graph Architecture for Mr. X Steroid

## Overview

This document outlines the implemented Model Context Protocol (MCP) memory architecture.
The system transforms flat database records into a persistent, entity-based knowledge graph to enable "Contextual Retrieval" and "Conflict Resolution".

## 1. Entity-Relation Schema (Nodes)

We have defined the following core entities as nodes in the graph:

- **User**: The central node, linked to Supabase Auth. Supports `full_name_ar` for Arabic.
- **Steroid**: A knowledge base entity (e.g., "Testosterone Enanthate"). attributes: `half_life`, `anabolic_rating`.
- **Cycle**: Represents a user's bodybuilding protocol. attributes: `start_date`, `compounds`, `status`.
- **HealthMarker**: Lab results (e.g., "ALT", "AST"). Linked to Users and potentially to Cycles (temporal correlation).
- **Payment**: Financial transactions.
- **Observation**: A log entry or subjective feeling ("Feeling aggressive").

## 2. Graph Relations (Edges)

The system tracks relationships:

- `HAS_CYCLE`: User -> Cycle
- `USED_STEROID`: Cycle -> Steroid
- `RECORDED_MARKER`: User -> Health Marker
- `MADE_PAYMENT`: User -> Payment
- `RELATED_TO`: Observation -> (User | Cycle | Marker)

## 3. Contextual Retrieval Logic

The `KnowledgeGraphManager` implements a retrieval strategy that goes beyond keywords:

- **Neighborhood Search**: If a user asks about "Post-Cycle", the system fetches the *most recent* Cycle node and its connected Steroid nodes.
- **Temporal Association**: Health markers recorded *during* a cycle are implicitly linked to that cycle for context.

## 4. Conflict Resolution

- **Source of Truth**: The Graph persists state.
- **Resolution Strategy**: New observations can update the state of existing nodes.
  - *Example*: An observation "I stopped the cycle today" triggers a status update on the active Cycle node to `abandoned`.

## 5. Persistence & Integration

- **Supabase**: The primary data store.
- **Hydration**: The Graph is hydrated (loaded) from Supabase tables (`profiles`, `payments`) on session start.
- **Future State**: A dedicated `edges` table in Supabase would allow persistent graph connections.

## 6. Optimization

- **Lazy Loading**: Only the user's relevant subgraph is loaded into memory.
- **Token Efficiency**: By sending only the relevant *neighborhood* of nodes to the LLM (instead of the whole history), we reduce context window usage.

## 7. Arabic Support

- All entities support `_ar` fields (e.g., `name_ar` for Steroids).
- The Retrieval logic is language-agnostic but can be tuned to prefer `_ar` fields when the user's language is detected as Arabic.
